import type { Config } from "@netlify/functions";
import Stripe from "stripe";
import {
  formatSelectionLines,
  type ProductSelections,
} from "../../src/lib/product-options";
import { getCatalogProduct } from "./_shared/catalog";
import { getEnv } from "./_shared/email";
import {
  orderNumberFromSession,
  type OrderReceipt,
  type OrderReceiptItem,
} from "../../src/lib/order-confirmation";

type ShippingLike = {
  name?: string | null;
  address?: Stripe.Address | null;
} | null;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function parseSelections(raw: string | undefined): ProductSelections {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ProductSelections;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function countryLabel(code: string | null | undefined, locale: string): string | undefined {
  if (!code) return undefined;
  if (code === "NL") return locale === "en" ? "Netherlands" : "Nederland";
  return code;
}

function formatAddressBlock(
  details: ShippingLike,
  locale: string,
  phone?: string | null,
): string[] {
  const address = details?.address;
  const cityLine = [address?.postal_code, address?.city].filter(Boolean).join(" ").trim();
  return [
    details?.name,
    address?.line1,
    address?.line2,
    cityLine,
    address?.state,
    countryLabel(address?.country, locale),
    phone,
  ].filter((line): line is string => Boolean(line && line.trim()));
}

function addressLinesFromSession(session: Stripe.Checkout.Session, locale: string): string[] {
  const collected = formatAddressBlock(session.collected_information?.shipping_details, locale);
  if (collected.length > 0) return collected;
  const legacy = formatAddressBlock(
    (session as Stripe.Checkout.Session & { shipping_details?: ShippingLike }).shipping_details,
    locale,
  );
  if (legacy.length > 0) return legacy;
  return formatAddressBlock(
    {
      name: session.customer_details?.name,
      address: session.customer_details?.address,
    },
    locale,
    session.customer_details?.phone,
  );
}

function isCheckoutSessionId(value: string): boolean {
  return /^cs_(test_|live_)[A-Za-z0-9]+$/.test(value);
}

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const secret = getEnv("STRIPE_SECRET_KEY");
  if (!secret) {
    return json({ error: "Checkout is not configured" }, 503);
  }

  const sessionId = new URL(req.url).searchParams.get("session_id")?.trim() || "";
  if (!isCheckoutSessionId(sessionId)) {
    return json({ error: "Unknown order" }, 400);
  }

  const stripe = new Stripe(secret);
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return json({ error: "Unknown order" }, 404);
  }

  if (session.mode !== "payment" || session.status === "expired") {
    return json({ error: "Unknown order" }, 404);
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });
  const locale = session.metadata?.locale === "en" ? "en" : "nl";

  const items: OrderReceiptItem[] = lineItems.data.flatMap((item) => {
    if (item.amount_total === 0 && item.description?.toLowerCase().includes("verzend")) {
      return [];
    }
    const productObject = item.price?.product;
    const metadata =
      productObject && typeof productObject !== "string"
        ? productObject.metadata
        : undefined;
    const productId = metadata?.id || "";
    const catalog = productId ? getCatalogProduct(productId) : undefined;
    if (!catalog && item.price?.type === "recurring") return [];
    const selections = parseSelections(metadata?.selections);
    const name =
      (locale === "en" ? catalog?.name.en : catalog?.name.nl) ||
      catalog?.name.nl ||
      item.description ||
      "Product";
    const digitalFile = (catalog?.digitalFile || metadata?.digitalFile || "").trim();
    const type = catalog?.type === "digital" ? "digital" : "physical";
    const isShippingLine =
      !productId &&
      (item.description?.toLowerCase().includes("verzending") ||
        item.description?.toLowerCase().includes("shipping"));
    if (isShippingLine) return [];

    return [
      {
        productId,
        name,
        image: catalog?.image || "",
        quantity: item.quantity ?? 1,
        amountCents: item.amount_total ?? 0,
        details: catalog
          ? formatSelectionLines(catalog, selections, locale).map((line) =>
              line.replace(/\n{3,}/g, "\n\n").trim(),
            )
          : [],
        type,
        downloadUrl: type === "digital" && digitalFile.startsWith("http") ? digitalFile : undefined,
      },
    ];
  });

  const receipt: OrderReceipt = {
    sessionId: session.id,
    orderNumber: orderNumberFromSession(session.id),
    paid: session.payment_status === "paid" || session.payment_status === "no_payment_required",
    email: session.customer_details?.email || session.customer_email || "",
    name: session.customer_details?.name || session.collected_information?.shipping_details?.name || "",
    addressLines: addressLinesFromSession(session, locale),
    hasPhysical: items.some((item) => item.type === "physical"),
    hasDigital: items.some((item) => item.type === "digital"),
    subtotalCents:
      session.shipping_cost?.amount_total &&
      session.amount_subtotal === session.amount_total
        ? Math.max(0, (session.amount_total ?? 0) - session.shipping_cost.amount_total)
        : (session.amount_subtotal ?? items.reduce((sum, item) => sum + item.amountCents, 0)),
    shippingCents: session.shipping_cost?.amount_total ?? 0,
    totalCents: session.amount_total ?? 0,
    items,
  };

  return json({ order: receipt });
};

export const config: Config = {
  path: "/api/order-session",
};
