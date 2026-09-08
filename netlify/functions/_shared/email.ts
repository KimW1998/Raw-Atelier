import { Resend } from "resend";
import {
  formatSelectionLines,
  type ProductSelections,
  type ShopLocale,
} from "../../../src/lib/product-options";
import type { CatalogProduct } from "./catalog";

const SITE_URL = "https://www.rawatelier.nl";
const PINK = "#E7A7C7";
const PINK_LIGHT = "#F6DCE8";
const PINK_ACCENT = "#D98AB5";
const BLACK = "#111111";
const OFFWHITE = "#FAF8F6";

export function getEnv(name: string): string | undefined {
  let fromNetlify: string | undefined;
  try {
    fromNetlify = Netlify.env.get(name);
  } catch {
    fromNetlify = undefined;
  }
  const value = (fromNetlify || process.env[name] || "").trim();
  return value || undefined;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const apiKey = getEnv("RESEND_API_KEY");
  const from = getEnv("ORDER_FROM_EMAIL") || "Raw Atelier <info@rawluxury.nl>";

  if (!apiKey) {
    console.error(
      "[order-email] RESEND_API_KEY ontbreekt in de function. Geen call naar Resend.",
      options.subject,
      "→",
      options.to,
    );
    throw new Error("RESEND_API_KEY ontbreekt in de Netlify function (niet alleen in Builds).");
  }

  console.log("[order-email] sending", options.subject, "→", options.to, "from", from);

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [options.to],
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  if (error) {
    console.error("[order-email] Resend weigerde de mail", error);
    throw new Error(`Email failed: ${error.message}`);
  }

  console.log("[order-email] sent", data?.id);
}

export function orderNotifyAddress(): string {
  return getEnv("ORDER_NOTIFY_EMAIL") || "info@rawluxury.nl";
}

function formatEuroCents(cents: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nl2br(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

type OrderLine = {
  product: CatalogProduct;
  quantity: number;
  selections?: ProductSelections;
};

type MailContent = {
  to?: string;
  subject: string;
  text: string;
  html: string;
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

function orderItemsHtml(items: OrderLine[], locale: ShopLocale): string {
  return items
    .map(({ product, quantity, selections }) => {
      const extra = formatSelectionLines(product, selections ?? {}, locale);
      const details = extra
        .map(
          (line) =>
            `<div style="margin-top:4px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.45;color:#6b5d66;">${escapeHtml(line)}</div>`,
        )
        .join("");
      return `<tr>
        <td style="padding:14px 0;border-bottom:1px solid ${PINK_LIGHT};">
          <div style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${PINK_ACCENT};">${quantity}×</div>
          <div style="margin-top:4px;font-family:'Playfair Display',Georgia,serif;font-size:18px;line-height:1.35;color:${BLACK};">${escapeHtml(productName(product, locale))}</div>
          ${details}
        </td>
      </tr>`;
    })
    .join("");
}

function brandedHtml(options: {
  preview: string;
  eyebrow: string;
  title: string;
  body: string;
  footer: string;
}): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(options.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${OFFWHITE};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${OFFWHITE};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="padding:0 8px 20px;text-align:center;">
              <a href="${SITE_URL}" style="font-family:'Playfair Display',Georgia,serif;font-size:28px;letter-spacing:0.04em;color:${BLACK};text-decoration:none;">Raw Atelier</a>
              <div style="margin-top:6px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${PINK_ACCENT};">Machineborduurwerk uit Nederland</div>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(17,17,17,0.06);">
              <div style="height:6px;background:${PINK};"></div>
              <div style="padding:36px 32px 40px;">
                <div style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${PINK_ACCENT};">${escapeHtml(options.eyebrow)}</div>
                <h1 style="margin:10px 0 20px;font-family:'Playfair Display',Georgia,serif;font-size:30px;line-height:1.25;font-weight:500;color:${BLACK};">${escapeHtml(options.title)}</h1>
                ${options.body}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 8px 0;text-align:center;font-family:Inter,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#7a6a71;">
              ${options.footer}
              <div style="margin-top:12px;"><a href="${SITE_URL}" style="color:${PINK_ACCENT};text-decoration:none;">www.rawatelier.nl</a>
              · <a href="https://www.instagram.com/raw_luxury_atelier/" style="color:${PINK_ACCENT};text-decoration:none;">@raw_luxury_atelier</a></div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:${BLACK};">${nl2br(text)}</p>`;
}

function noteBox(html: string): string {
  return `<div style="margin:8px 0 20px;padding:16px 18px;background:${PINK_LIGHT};border-radius:16px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:${BLACK};">${html}</div>`;
}

function sectionLabel(label: string): string {
  return `<div style="margin:24px 0 8px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${PINK_ACCENT};">${escapeHtml(label)}</div>`;
}

function formatCustomerEmail(options: {
  email: string;
  name?: string;
  address?: string;
  products: OrderLine[];
  personalization?: string;
  locale: ShopLocale;
  amountCents?: number;
}): MailContent | undefined {
  const to = options.email.trim();
  if (!to) return undefined;

  const isNl = options.locale !== "en";
  const physical = options.products.filter((item) => item.product.type === "physical");
  const digital = options.products.filter((item) => item.product.type === "digital");
  const greeting = options.name
    ? isNl
      ? `Hoi ${options.name},`
      : `Hi ${options.name},`
    : isNl
      ? "Hoi,"
      : "Hi,";
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

  const downloadHtml = digital
    .map(({ product }) => {
      const name = escapeHtml(productName(product, options.locale));
      if (product.digitalFile) {
        const href = escapeHtml(product.digitalFile);
        return `<div style="margin:0 0 8px;"><a href="${href}" style="color:${PINK_ACCENT};">${name}</a></div>`;
      }
      return `<div style="margin:0 0 8px;">${name} — ${
        isNl
          ? "ik stuur het bestand zo snel mogelijk naar dit e-mailadres."
          : "I will send the file to this email address as soon as I can."
      }</div>`;
    })
    .join("");

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

  const body = [
    paragraph(greeting),
    paragraph(
      isNl
        ? "Wat fijn dat je bij Raw Atelier hebt besteld. Je betaling is gelukt. Dit heb je gekozen:"
        : "Thank you for ordering with Raw Atelier. Your payment went through. Here is what you chose:",
    ),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${orderItemsHtml(options.products, options.locale)}</table>`,
    options.amountCents != null
      ? `<p style="margin:18px 0 0;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${PINK_ACCENT};">${escapeHtml(formatEuroCents(options.amountCents))}</p>`
      : "",
    options.personalization
      ? noteBox(
          `<strong>${isNl ? "Personalisatie" : "Personalisation"}</strong><br>${nl2br(options.personalization)}`,
        )
      : "",
    physical.length > 0
      ? paragraph(
          isNl
            ? "Ik maak je stuk(ken) met zorg. Bij gepersonaliseerd werk neem ik contact op over stof, kleur en details. Verzending binnen Nederland, meestal binnen 3–7 werkdagen nadat het klaar is."
            : "I make your piece(s) with care. For personalised work I will contact you about fabric, colour and details. Shipping within the Netherlands, usually 3–7 business days after it is ready.",
        )
      : "",
    physical.length > 0 && options.address
      ? `${sectionLabel(isNl ? "Verzendadres" : "Shipping address")}${noteBox(nl2br(options.address))}`
      : "",
    digital.length > 0
      ? `${sectionLabel(isNl ? "Digitale producten" : "Digital products")}${noteBox(downloadHtml)}`
      : "",
    paragraph(isNl ? "Liefs,\nKim" : "Love,\nKim"),
  ].join("");

  return {
    to,
    subject: isNl ? "Bedankt voor je bestelling bij Raw Atelier" : "Thank you for your order from Raw Atelier",
    text,
    html: brandedHtml({
      preview: isNl
        ? "Je betaling is gelukt. Ik ga voor je aan de slag."
        : "Your payment went through. I will start making your order.",
      eyebrow: isNl ? "Bestelling bevestigd" : "Order confirmed",
      title: isNl ? "Bedankt voor je bestelling" : "Thank you for your order",
      body,
      footer: isNl
        ? "Vragen? Antwoord gerust op deze mail of schrijf naar info@rawluxury.nl."
        : "Questions? Just reply to this email or write to info@rawluxury.nl.",
    }),
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
}): { owner: MailContent; customer?: MailContent } {
  const locale: ShopLocale = options.locale === "en" ? "en" : "nl";
  const physical = options.products.filter((item) => item.product.type === "physical");
  const digital = options.products.filter((item) => item.product.type === "digital");
  const summary = options.products.map((item) => `${item.quantity}× ${item.product.name.nl}`).join(", ");

  const text = [
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

  const body = [
    paragraph(`Klant: ${options.name || "onbekend"}`),
    `<p style="margin:0 0 16px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;"><a href="mailto:${escapeHtml(options.email)}" style="color:${PINK_ACCENT};">${escapeHtml(options.email)}</a></p>`,
    options.amountCents != null
      ? `<p style="margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${PINK_ACCENT};">${escapeHtml(formatEuroCents(options.amountCents))}</p>`
      : "",
    physical.length > 0 ? sectionLabel("Te verzenden (post, NL)") : paragraph("Niets om te posten (alleen digitaal)."),
    physical.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${orderItemsHtml(physical, "nl")}</table>`
      : "",
    physical.length > 0
      ? options.address
        ? `${sectionLabel("Verzendadres")}${noteBox(nl2br(options.address))}`
        : noteBox("Let op: geen verzendadres in Stripe.")
      : "",
    options.personalization
      ? noteBox(`<strong>Personalisatie</strong><br>${nl2br(options.personalization)}`)
      : "",
    digital.length > 0 ? sectionLabel("Digitaal — niet posten, PDF naar de klant") : "",
    digital.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${orderItemsHtml(digital, "nl")}</table>`
      : "",
    digital.length > 0
      ? paragraph("Als er geen downloadlink in de klantmail staat, stuur jij de PDF naar het e-mailadres hierboven.")
      : "",
    `<p style="margin:24px 0 0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:12px;color:#8a7a80;">Stripe: ${escapeHtml(options.sessionId)}</p>`,
  ].join("");

  return {
    owner: {
      subject: summary ? `Nieuwe bestelling — ${summary}` : `Nieuwe bestelling ${options.sessionId}`,
      text,
      html: brandedHtml({
        preview: `Nieuwe bestelling van ${options.name || options.email}`,
        eyebrow: "Studio",
        title: "Nieuwe bestelling",
        body,
        footer: "Deze mail is alleen voor jou, zodat je weet wat je moet maken en versturen.",
      }),
    },
    customer: formatCustomerEmail({ ...options, locale, products: options.products }),
  };
}
