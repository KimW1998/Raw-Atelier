import type { Config } from "@netlify/functions";
import Stripe from "stripe";
import { getCatalogProduct } from "./_shared/catalog";
import { applyPaidOrder } from "./_shared/stock";
import { formatOrderEmail, getEnv, orderNotifyAddress, sendEmail } from "./_shared/email";
import { formatSelectionLines, type ProductSelections } from "../../src/lib/product-options";

function formatSelectionsFromMetadata(
  raw: string,
  product: NonNullable<ReturnType<typeof getCatalogProduct>>,
): string | undefined {
  try {
    const parsed = JSON.parse(raw) as ProductSelections;
    const lines = formatSelectionLines(product, parsed, "nl");
    return lines.length > 0 ? lines.join(" · ") : undefined;
  } catch {
    return raw || undefined;
  }
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

  const session = event.data.object as Stripe.Checkout.Session;
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
    return [
      {
        product: catalogProduct,
        quantity: Number.isInteger(stockQty) && stockQty > 0 ? stockQty : (item.quantity ?? 1),
        selectionsText: metadata?.selections
          ? formatSelectionsFromMetadata(metadata.selections, catalogProduct)
          : undefined,
      },
    ];
  });

  const address = session.shipping_details?.address;
  const addressText = address
    ? [
        session.shipping_details?.name,
        address.line1,
        address.line2,
        `${address.postal_code || ""} ${address.city || ""}`.trim(),
        address.country,
      ]
        .filter(Boolean)
        .join("\n")
    : undefined;

  const personalization = session.custom_fields?.find(
    (field) => field.key === "personalization",
  )?.text?.value;

  const emails = formatOrderEmail({
    sessionId: session.id,
    email: session.customer_details?.email || session.customer_email || "",
    name: session.customer_details?.name || session.shipping_details?.name || undefined,
    address: addressText,
    products,
    personalization: personalization || undefined,
    locale: session.metadata?.locale || "nl",
  });

  try {
    await applyPaidOrder(
      session.id,
      products.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    );
  } catch (error) {
    console.error("[stripe-webhook] stock", error);
  }

  await sendEmail({
    to: orderNotifyAddress(),
    subject: `Nieuwe bestelling ${session.id}`,
    text: emails.owner,
  });

  if (emails.customer?.to) {
    await sendEmail(emails.customer);
  }

  return new Response("ok");
};

export const config: Config = {
  path: "/api/stripe-webhook",
};
