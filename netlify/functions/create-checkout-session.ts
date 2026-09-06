import type { Config } from "@netlify/functions";
import Stripe from "stripe";
import { getCatalogProduct } from "./_shared/catalog";
import { readLiveStock } from "./_shared/stock";
import { getEnv } from "./_shared/email";
import vacation from "../../src/data/vacation.json";
import {
  formatSelectionLines,
  getProductUnitPriceCents,
  lineStockUnits,
  productHasOptions,
  sanitizeSelections,
  validateSelections,
  type ProductSelections,
} from "../../src/lib/product-options";

const SITE_URL = "https://www.rawatelier.nl";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const shopLive =
    getEnv("VITE_SHOP_ENABLED") === "true" || getEnv("SHOP_ENABLED") === "true";
  const localDev = getEnv("NETLIFY_DEV") === "true";
  if (!shopLive && !localDev && getEnv("CONTEXT") === "production") {
    return json({ error: "Shop is nog niet geopend." }, 403);
  }

  const secret = getEnv("STRIPE_SECRET_KEY");
  if (!secret) {
    return json(
      {
        error:
          "Checkout is nog niet gekoppeld. Voeg STRIPE_SECRET_KEY toe in Netlify.",
      },
      503,
    );
  }

  let payload: {
    items?: {
      productId?: string;
      quantity?: number;
      selections?: ProductSelections;
    }[];
    locale?: string;
  };

  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const locale = payload.locale === "en" ? "en" : "nl";
  const requested = payload.items ?? [];
  if (requested.length === 0) {
    return json({ error: "Cart is empty" }, 400);
  }

  let liveStock: Record<string, number> = {};
  try {
    liveStock = await readLiveStock();
  } catch (error) {
    console.error("[checkout] stock", error);
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let hasPhysical = false;
  let needsLegacyPersonalization = false;
  const productIds: string[] = [];
  const orderNotes: string[] = [];
  const requestedQtyByProduct = new Map<string, number>();
  for (const item of requested) {
    const quantity = Number(item.quantity);
    if (!item.productId || !Number.isInteger(quantity) || quantity < 1) continue;
    const product = getCatalogProduct(item.productId);
    if (!product) continue;
    const selections = sanitizeSelections(product, item.selections);
    requestedQtyByProduct.set(
      item.productId,
      (requestedQtyByProduct.get(item.productId) ?? 0) +
        lineStockUnits(product, selections, quantity),
    );
  }

  for (const item of requested) {
    const quantity = Number(item.quantity);
    if (!item.productId || !Number.isInteger(quantity) || quantity < 1) {
      return json({ error: "Invalid cart item" }, 400);
    }
    const product = getCatalogProduct(item.productId);
    if (!product) {
      return json({ error: "Unknown product" }, 400);
    }

    const selections = sanitizeSelections(product, item.selections);
    const invalid = validateSelections(product, selections);
    if (invalid) {
      return json(
        {
          error:
            locale === "nl"
              ? "Vul nog de verplichte opties in."
              : "Please fill in the required options.",
        },
        400,
      );
    }

    if (product.type === "physical") hasPhysical = true;
    if (vacation.enabled && vacation.pausePhysical && product.type === "physical") {
      return json(
        {
          error:
            locale === "nl"
              ? "Fysieke producten zijn tijdelijk niet te bestellen."
              : "Physical products cannot be ordered right now.",
        },
        403,
      );
    }
    const liveRemaining =
      item.productId in liveStock
        ? liveStock[item.productId]
        : typeof (product as { stock?: unknown }).stock === "number"
          ? Math.max(0, Math.floor((product as { stock: number }).stock))
          : null;
    const stockQty = lineStockUnits(product, selections, quantity);
    const needed = requestedQtyByProduct.get(item.productId) ?? stockQty;
    if (liveRemaining !== null && needed > liveRemaining) {
      return json(
        {
          error:
            locale === "nl"
              ? "Dit product is niet meer zo op voorraad."
              : "This product does not have enough stock.",
        },
        409,
      );
    }
    if (product.personalization && !productHasOptions(product)) {
      needsLegacyPersonalization = true;
    }
    productIds.push(`${product.id}x${stockQty}`);

    const origin = getEnv("URL") || SITE_URL;
    const image = product.image.startsWith("http")
      ? product.image
      : `${origin}${product.image}`;
    const unitAmount = getProductUnitPriceCents(product, selections);
    const selectionLines = formatSelectionLines(product, selections, locale);
    const selectionText = selectionLines.join(" · ");
    const description = [product.description[locale] || product.description.nl, selectionText]
      .filter(Boolean)
      .join(" — ")
      .slice(0, 390);

    if (selectionText) {
      orderNotes.push(`${product.name.nl} x${stockQty}: ${selectionText}`);
    }

    lineItems.push({
      quantity,
      price_data: {
        currency: "eur",
        unit_amount: unitAmount,
        product_data: {
          name: product.name[locale] || product.name.nl,
          description: description || undefined,
          images: [image],
          metadata: {
            id: product.id,
            type: product.type,
            digitalFile: product.digitalFile || "",
            stockQty: String(stockQty),
            selections: JSON.stringify(selections).slice(0, 490),
          },
        },
      },
    });
  }

  const shippingCents = Number(getEnv("STRIPE_SHIPPING_AMOUNT_CENTS") || "695");
  const origin = getEnv("URL") || SITE_URL;
  const stripe = new Stripe(secret);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale,
    currency: "eur",
    payment_method_types: ["ideal", "card"],
    line_items: lineItems,
    success_url: `${origin}/${locale}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${locale}/shop/cancel`,
    metadata: {
      locale,
      productIds: productIds.join(","),
      orderNotes: orderNotes.join(" | ").slice(0, 490),
    },
    custom_fields: needsLegacyPersonalization
      ? [
          {
            key: "personalization",
            type: "text",
            optional: true,
            label: {
              type: "custom",
              custom:
                locale === "nl"
                  ? "Naam of tekst voor borduurwerk"
                  : "Name or text for embroidery",
            },
          },
        ]
      : undefined,
    shipping_address_collection: hasPhysical
      ? { allowed_countries: ["NL"] }
      : undefined,
    shipping_options: hasPhysical
      ? [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name:
                locale === "nl"
                  ? "Verzending binnen Nederland"
                  : "Shipping within the Netherlands",
              fixed_amount: { amount: shippingCents, currency: "eur" },
              delivery_estimate: {
                minimum: { unit: "business_day", value: 3 },
                maximum: { unit: "business_day", value: 7 },
              },
            },
          },
        ]
      : undefined,
  });

  return json({ url: session.url });
};

export const config: Config = {
  path: "/api/create-checkout-session",
};
