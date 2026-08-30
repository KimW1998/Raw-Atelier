import type { CatalogProduct } from "./catalog";

export function getEnv(name: string): string | undefined {
  try {
    return Netlify.env.get(name) ?? process.env[name];
  } catch {
    return process.env[name];
  }
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const apiKey = getEnv("RESEND_API_KEY");
  const from = getEnv("ORDER_FROM_EMAIL") || "Raw Atelier <info@rawluxury.nl>";

  if (!apiKey) {
    console.log("[order-email]", options.subject, options.to, options.text);
    return;
  }

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
    throw new Error(`Email failed: ${response.status} ${detail}`);
  }
}

export function orderNotifyAddress(): string {
  return getEnv("ORDER_NOTIFY_EMAIL") || "info@rawluxury.nl";
}

export function formatOrderEmail(options: {
  sessionId: string;
  email: string;
  name?: string;
  address?: string;
  products: { product: CatalogProduct; quantity: number; selectionsText?: string }[];
  personalization?: string;
  locale: string;
}): { owner: string; customer?: { to: string; subject: string; text: string } } {
  const lines = options.products
    .map(({ product, quantity, selectionsText }) => {
      const base = `- ${product.name.nl} (${product.type}) x${quantity} — ${product.priceLabel}`;
      return selectionsText ? `${base}\n  ${selectionsText}` : base;
    })
    .join("\n");

  const owner = [
    "Nieuwe bestelling via Stripe Checkout",
    `Sessie: ${options.sessionId}`,
    `Klant: ${options.name || "onbekend"} <${options.email}>`,
    options.address ? `Adres:\n${options.address}` : "Geen verzendadres (alleen digitaal)",
    options.personalization ? `Personalisatie: ${options.personalization}` : "",
    "",
    "Producten:",
    lines,
    "",
    options.products.some((item) => item.product.type === "digital")
      ? "Digitale producten: stuur de PDF naar het e-mailadres van de klant als er geen downloadbestand is ingesteld."
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const digital = options.products.filter((item) => item.product.type === "digital");
  if (digital.length === 0) {
    return { owner };
  }

  const downloadLines = digital
    .map(({ product }) => {
      if (product.digitalFile) {
        return `- ${product.name.nl}: ${product.digitalFile}`;
      }
      return `- ${product.name.nl}: ik stuur het bestand zo snel mogelijk naar dit e-mailadres.`;
    })
    .join("\n");

  const isNl = options.locale !== "en";
  return {
    owner,
    customer: {
      to: options.email,
      subject: isNl ? "Je digitale bestelling bij Raw Atelier" : "Your digital order from Raw Atelier",
      text: isNl
        ? `Bedankt voor je bestelling.\n\nDit zijn je digitale producten:\n${downloadLines}\n\nKim\nRaw Atelier`
        : `Thank you for your order.\n\nYour digital products:\n${downloadLines}\n\nKim\nRaw Atelier`,
    },
  };
}
