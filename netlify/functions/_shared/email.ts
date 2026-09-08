import {
  formatSelectionLines,
  type ProductSelections,
  type ShopLocale,
} from "../../../src/lib/product-options";
import type { CatalogProduct } from "./catalog";

export function getEnv(name: string): string | undefined {
  let fromNetlify: string | undefined;
  try {
    fromNetlify = Netlify.env.get(name);
  } catch {
    fromNetlify = undefined;
  }
  const value = (process.env[name] || fromNetlify || "").trim();
  return value || undefined;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const apiKey = getEnv("RESEND_API_KEY");
  const from = getEnv("ORDER_FROM_EMAIL") || "Raw Atelier <info@rawluxury.nl>";

  if (!apiKey) {
    console.error(
      "[order-email] RESEND_API_KEY ontbreekt in de function. Mail niet verstuurd:",
      options.subject,
      "→",
      options.to,
    );
    return;
  }

  console.log("[order-email] sending", options.subject, "→", options.to, "from", from);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [options.to],
      subject: options.subject,
      text: options.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[order-email] Resend weigerde de mail", response.status, detail);
    throw new Error(`Email failed: ${response.status} ${detail}`);
  }
}

export function orderNotifyAddress(): string {
  return getEnv("ORDER_NOTIFY_EMAIL") || "info@rawluxury.nl";
}

function formatEuroCents(cents: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);
}

type OrderLine = {
  product: CatalogProduct;
  quantity: number;
  selections?: ProductSelections;
};

function productName(product: CatalogProduct, locale: ShopLocale): string {
  return product.name[locale] || product.name.nl;
}

function formatOrderLines(items: OrderLine[], locale: ShopLocale): string {
  return items
    .map(({ product, quantity, selections }) => {
      const extra = formatSelectionLines(product, selections ?? {}, locale);
      const extraBlock = extra.length
        ? `\n${extra.map((line) => `  ${line}`).join("\n")}`
        : "";
      return `- ${quantity}× ${productName(product, locale)}${extraBlock}`;
    })
    .join("\n");
}

function formatCustomerEmail(options: {
  email: string;
  name?: string;
  address?: string;
  products: OrderLine[];
  personalization?: string;
  locale: ShopLocale;
  amountCents?: number;
}): { to: string; subject: string; text: string } | undefined {
  const to = options.email.trim();
  if (!to) return undefined;

  const isNl = options.locale !== "en";
  const physical = options.products.filter((item) => item.product.type === "physical");
  const digital = options.products.filter((item) => item.product.type === "digital");
  const greeting = options.name ? (isNl ? `Hoi ${options.name},` : `Hi ${options.name},`) : isNl ? "Hoi," : "Hi,";
  const paid =
    options.amountCents != null
      ? isNl
        ? `Betaald: ${formatEuroCents(options.amountCents)}`
        : `Paid: ${formatEuroCents(options.amountCents)}`
      : "";

  const downloadLines = digital
    .map(({ product }) => {
      const name = productName(product, options.locale);
      if (product.digitalFile) return `- ${name}: ${product.digitalFile}`;
      return isNl
        ? `- ${name}: ik stuur het bestand zo snel mogelijk naar dit e-mailadres.`
        : `- ${name}: I will send the file to this email address as soon as I can.`;
    })
    .join("\n");

  const text = isNl
    ? [
        greeting,
        "",
        "Je betaling is gelukt. Dit heb je besteld:",
        formatOrderLines(options.products, "nl"),
        paid,
        options.personalization ? `Personalisatie: ${options.personalization}` : "",
        physical.length > 0
          ? "Ik maak je stuk(ken) met zorg. Bij gepersonaliseerd werk neem ik contact op over stof, kleur en details. Verzending binnen Nederland, meestal binnen 3–7 werkdagen nadat het klaar is."
          : "",
        physical.length > 0 && options.address ? `Verzendadres:\n${options.address}` : "",
        digital.length > 0 ? `Je digitale producten:\n${downloadLines}` : "",
        "",
        "Liefs,",
        "Kim",
        "Raw Atelier",
      ]
        .filter((line) => line !== "")
        .join("\n")
    : [
        greeting,
        "",
        "Your payment went through. Here is what you ordered:",
        formatOrderLines(options.products, "en"),
        paid,
        options.personalization ? `Personalisation: ${options.personalization}` : "",
        physical.length > 0
          ? "I make your piece(s) with care. For personalised work I will contact you about fabric, colour and details. Shipping within the Netherlands, usually 3–7 business days after it is ready."
          : "",
        physical.length > 0 && options.address ? `Shipping address:\n${options.address}` : "",
        digital.length > 0 ? `Your digital products:\n${downloadLines}` : "",
        "",
        "Love,",
        "Kim",
        "Raw Atelier",
      ]
        .filter((line) => line !== "")
        .join("\n");

  return {
    to,
    subject: isNl ? "Bedankt voor je bestelling bij Raw Atelier" : "Thank you for your order from Raw Atelier",
    text,
  };
}

export function formatOrderEmail(options: {
  sessionId: string;
  email: string;
  name?: string;
  address?: string;
  products: OrderLine[];
  personalization?: string;
  locale: string;
  amountCents?: number;
}): { owner: string; customer?: { to: string; subject: string; text: string } } {
  const locale: ShopLocale = options.locale === "en" ? "en" : "nl";
  const physical = options.products.filter((item) => item.product.type === "physical");
  const digital = options.products.filter((item) => item.product.type === "digital");

  const owner = [
    "Nieuwe bestelling via de shop",
    `Klant: ${options.name || "onbekend"} <${options.email}>`,
    options.amountCents != null ? `Betaald: ${formatEuroCents(options.amountCents)}` : "",
    `Stripe: ${options.sessionId}`,
    "",
    physical.length > 0 ? "TE VERZENDEN (post, NL):" : "",
    physical.length > 0 ? formatOrderLines(physical, "nl") : "",
    physical.length > 0
      ? options.address
        ? `Verzendadres:\n${options.address}`
        : "Let op: geen verzendadres in Stripe."
      : "Niets om te posten (alleen digitaal).",
    options.personalization ? `Personalisatie: ${options.personalization}` : "",
    digital.length > 0 ? "DIGITAAL (niet posten, PDF naar de klant):" : "",
    digital.length > 0 ? formatOrderLines(digital, "nl") : "",
    digital.length > 0
      ? "Als er geen downloadlink in de klantmail staat, stuur jij de PDF naar het e-mailadres hierboven."
      : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return {
    owner,
    customer: formatCustomerEmail({ ...options, locale, products: options.products }),
  };
}
