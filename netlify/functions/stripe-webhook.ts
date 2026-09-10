import type { Config } from "@netlify/functions";
import Stripe from "stripe";
import { getCatalogProduct } from "./_shared/catalog";
import { applyPaidOrder } from "./_shared/stock";
import { formatOrderEmail, getEnv, orderNotifyAddress, sendEmail } from "./_shared/email";
import { type ProductSelections } from "../../src/lib/product-options";

function parseSelections(raw: string | undefined): ProductSelections | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as ProductSelections;
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

type ShippingLike = {
  name?: string | null;
  address?: Stripe.Address | null;
} | null;

function formatAddressBlock(
  details: ShippingLike,
  phone?: string | null,
): string | undefined {
  const address = details?.address;
  const cityLine = [address?.postal_code, address?.city].filter(Boolean).join(" ").trim();
  const lines = [
    details?.name,
    address?.line1,
    address?.line2,
    cityLine,
    address?.state,
    address?.country,
    phone,
  ].filter((line): line is string => Boolean(line && line.trim()));
  return lines.length > 0 ? lines.join("\n") : undefined;
}

function shippingAddressFromSession(session: Stripe.Checkout.Session): string | undefined {
  const collected = session.collected_information?.shipping_details;
  const legacy = (session as Stripe.Checkout.Session & { shipping_details?: ShippingLike })
    .shipping_details;
  return (
    formatAddressBlock(collected) ||
    formatAddressBlock(legacy) ||
    formatAddressBlock(
      {
        name: session.customer_details?.name,
        address: session.customer_details?.address,
      },
      session.customer_details?.phone,
    )
  );
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = getEnv("STRIPE_SECRET_KEY");
  const webhookSecret = getEnv("STRIPE_WEBHOOK_SECRET");
  if (!secret || !webhookSecret) {
    return new Response("Webhook is not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const stripe = new Stripe(secret);
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid payload";
    return new Response(message, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("ok");
  }

  const session = await stripe.checkout.sessions.retrieve(
    (event.data.object as Stripe.Checkout.Session).id,
  );
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });

  const products = lineItems.data.flatMap((item) => {
    const productObject = item.price?.product;
    const metadata =
      productObject && typeof productObject !== "string"
        ? productObject.metadata
        : undefined;
    const id = metadata?.id;
    const catalogProduct = id ? getCatalogProduct(id) : undefined;
    if (!catalogProduct) return [];
    const stockQty = Number(metadata?.stockQty);
    const digitalFile = (catalogProduct.digitalFile || metadata?.digitalFile || "").trim();
    return [
      {
        product: { ...catalogProduct, digitalFile },
        quantity: Number.isInteger(stockQty) && stockQty > 0 ? stockQty : (item.quantity ?? 1),
        selections: parseSelections(metadata?.selections),
      },
    ];
  });

  const addressText = shippingAddressFromSession(session);
  const shippingName =
    session.collected_information?.shipping_details?.name ||
    (session as Stripe.Checkout.Session & { shipping_details?: { name?: string | null } })
      .shipping_details?.name;

  const personalization = session.custom_fields?.find(
    (field) => field.key === "personalization",
  )?.text?.value;

  const emails = formatOrderEmail({
    sessionId: session.id,
    email: session.customer_details?.email || session.customer_email || "",
    name: session.customer_details?.name || shippingName || undefined,
    address: addressText,
    products,
    personalization: personalization || undefined,
    locale: session.metadata?.locale || "nl",
    amountCents: typeof session.amount_total === "number" ? session.amount_total : undefined,
  });

  try {
    await applyPaidOrder(
      session.id,
      products.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        selections: item.selections,
      })),
    );
  } catch (error) {
    console.error("[stripe-webhook] stock", error);
  }

  console.log("[stripe-webhook] paid session", session.id, {
    hasResendKey: Boolean(getEnv("RESEND_API_KEY")),
    notify: orderNotifyAddress(),
    customer: Boolean(emails.customer?.to),
  });

  try {
    await sendEmail({
      to: orderNotifyAddress(),
      subject: emails.owner.subject,
      text: emails.owner.text,
      html: emails.owner.html,
    });
    if (emails.customer?.to) {
      await sendEmail({
        to: emails.customer.to,
        subject: emails.customer.subject,
        text: emails.customer.text,
        html: emails.customer.html,
      });
    }
  } catch (error) {
    console.error("[stripe-webhook] email", error);
    return new Response("Email failed", { status: 500 });
  }

  return new Response("ok");
};

export const config: Config = {
  path: "/api/stripe-webhook",
};
