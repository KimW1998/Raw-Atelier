import yaml from "js-yaml";
import type { Locale } from "@/i18n/context";
import type { PortfolioItem } from "@/lib/portfolio";
import type { ShopCatalogProduct } from "@/lib/shop";
import { deepMerge } from "@/lib/utils";
import catalog from "@/data/shop-catalog.json";

const yamlModules = import.meta.glob("../../content/*/*.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
});

const portfolioModule = import.meta.glob("../../content/portfolio-items.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
});

export type FileBundle = Record<string, Record<string, unknown>>;

export interface StudioDraft {
  files: Record<Locale, FileBundle>;
  portfolioItems: PortfolioItem[];
  shopProducts: ShopCatalogProduct[];
}

export type FieldType = "text" | "multiline" | "stringList" | "group";
export type FieldTone = "short" | "title" | "body";

export interface FieldSpec {
  type: FieldType;
  path: string;
  label: string;
  tone?: FieldTone;
  children?: FieldSpec[];
}

const LABELS: Record<string, string> = {
  home: "Home",
  hero: "Bovenkant",
  headline: "Kopregel",
  intro: "Intro",
  services: "Diensten",
  eyebrow: "Klein label",
  title: "Titel",
  description: "Tekst",
  featured: "Uitgelicht werk",
  about: "Over mij",
  paragraph1: "Alinea 1",
  paragraph2: "Alinea 2",
  paragraph3: "Alinea 3",
  testimonials: "Reviews",
  process: "Werkwijze",
  instagram: "Instagram",
  profileHint: "Hint",
  viewOnInstagram: "Knop Instagram",
  quote: "Quote",
  author: "Naam",
  role: "Rol",
  company: "Bedrijf",
  story: "Verhaal",
  philosophy: "Aanpak",
  why: "Waarom Raw Atelier",
  items: "Onderdelen",
  quality: "Kwaliteit",
  connection: "Contact",
  atEvents: "Live events",
  faq: "Veelgestelde vragen",
  question: "Vraag",
  answer: "Antwoord",
  servicesPage: "Diensten-pagina",
  serviceLabel: "Label dienst",
  benefits: "Voordelen",
  perfectFor: "Perfect voor",
  shortDescription: "Korte tekst",
  benefitsHeading: "Kop voordelen",
  "live-events": "Live events",
  corporate: "Zakelijk",
  gifts: "Cadeaus",
  digitizing: "Digitizen",
  fashion: "Naaiwerk",
  portfolioPage: "Portfolio-pagina",
  portfolio: "Portfolio",
  categories: "Categorieën",
  all: "Alles",
  events: "Events",
  shopPage: "Shop-pagina",
  shippingNote: "Verzendinfo",
  trust: "Vertrouwen",
  shop: "Shop",
  tabsLabel: "Tabbladen",
  emptyCategory: "Lege categorie",
  productNote: "Productnotitie",
  badges: "Labels",
  handmade: "Handgemaakt",
  digital: "Digitaal",
  madeToOrder: "Op bestelling",
  cart: "Winkelwagen",
  close: "Sluiten",
  empty: "Leeg",
  add: "Toevoegen",
  checkout: "Afrekenen",
  redirecting: "Doorverwijzen",
  checkoutError: "Foutmelding",
  increase: "Meer",
  decrease: "Minder",
  remove: "Verwijderen",
  clear: "Legen",
  result: "Na betaling",
  successTitle: "Gelukt: titel",
  successDescription: "Gelukt: tekst",
  cancelTitle: "Afgebroken: titel",
  cancelDescription: "Afgebroken: tekst",
  backToShop: "Terug naar shop",
  contact: "Contact",
  product: "Productpagina",
  related: "Ook leuk",
  shippingDigital: "Verzendinfo digitaal",
  shippingPhysical: "Verzendinfo fysiek",
  personalization: "Personalisatie-tekst",
  fromPrice: "Vanaf-prijs",
  photos: "Foto's",
  photoOf: "Foto-nummer",
  options: "Shop-opties",
  optional: "Optioneel",
  lettersHint: "Hint letters",
  maxLetters: "Max letters",
  letterCount: "Lettertelling",
  lettersNeedMore: "Nog tekens nodig",
  symbolsHint: "Hint tekens",
  errorRequired: "Fout verplicht",
  errorInvalid: "Fout ongeldig",
  errorMinLetters: "Fout te kort",
  errorMaxLetters: "Fout te lang",
  pageTitle: "Paginatitel winkelwagen",
  summary: "Overzicht",
  subtotal: "Subtotaal",
  continue: "Verder winkelen",
  viewFull: "Winkelwagen-knop",
  chooseOptions: "Kies opties",
  digitalOnlyNote: "Alleen digitaal",
  sections: "Categorieën",
  babyGifts: "Baby cadeaus",
  keychains: "Keychains",
  patches: "Patches",
  pouches: "Tassen",
  embroideryPatterns: "Borduurpatronen",
  sewingPatterns: "Naaitpatronen",
  digitalPatterns: "Digitale patronen",
  patterns: "Patronen",
  emptyNote: "Lege-categorie tekst",
  stock: "Voorraad",
  soldOut: "Uitverkocht",
  cta: "Knoppen",
  ereaderCases: "E-reader hoezen",
  customPouches: "Maatwerk pouches",
  name: "Naam",
  contactPage: "Contactpagina",
  faqPage: "FAQ-pagina",
  info: "Info",
  email: "E-mail",
  form: "Formulier",
  companyPlaceholder: "Placeholder bedrijf",
  service: "Dienst",
  servicePlaceholder: "Placeholder dienst",
  message: "Bericht",
  messagePlaceholder: "Placeholder bericht",
  required: "Verplicht",
  namePlaceholder: "Placeholder naam",
  emailPlaceholder: "Placeholder e-mail",
  sending: "Bezig met versturen",
  send: "Verstuur",
  thankYouTitle: "Bedankt: titel",
  thankYouDescription: "Bedankt: tekst",
  followInstagram: "Volg Instagram",
  errorTitle: "Fout: titel",
  errorDescription: "Fout: tekst",
  brand: "Merk",
  tagline: "Tagline",
  nav: "Menu",
  workWithMe: "Plan een project",
  openMenu: "Menu openen",
  closeMenu: "Menu sluiten",
  mainNavigation: "Hoofdnavigatie",
  language: "Taal",
  label: "Label",
  footer: "Footer",
  navigate: "Navigatie",
  getInTouch: "Contact",
  location: "Locatie",
  handcrafted: "Handgemaakt-regel",
  rights: "Rechten",
  terms: "Voorwaarden",
  shipping: "Verzending",
  privacy: "Privacy",
  viewPortfolio: "Bekijk werk",
  learnMore: "Meer info",
  viewFullPortfolio: "Volledig portfolio",
  readMyStory: "Meer over mij",
  exploreServices: "Ontdek diensten",
  readyTitle: "Afronding: titel",
  readyDescription: "Afronding: tekst",
  shopNow: "Naar de shop",
  customOrder: "Maatwerk",
  backToHome: "Terug naar home",
  enquireAbout: "Informeer",
  contactServices: "Diensten in het formulier",
  general: "Algemene vraag",
  schema: "Schema",
  notFound: "404",
  metadata: "SEO (tabbladtitel)",
  keywords: "Zoekwoorden",
  legal: "Voorwaarden",
  termsTitle: "Voorwaarden: titel",
  shippingTitle: "Verzending: titel",
  privacyTitle: "Privacy: titel",
  disclaimerTitle: "Disclaimer: titel",
  cookiesTitle: "Cookies: titel",
  disclaimer: "Disclaimer",
  cookies: "Cookies",
};

function fileNameFromPath(path: string) {
  return path.split("/").pop()?.replace(".yaml", "") ?? "";
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function loadStudioDraft(): StudioDraft {
  const files: Record<Locale, FileBundle> = { nl: {}, en: {} };

  for (const [path, raw] of Object.entries(yamlModules)) {
    const locale: Locale = path.includes("/content/nl/") ? "nl" : "en";
    const name = fileNameFromPath(path);
    const parsed = yaml.load(raw as string) as Record<string, unknown> | null;
    if (parsed) files[locale][name] = parsed;
  }

  const portfolioRaw = Object.values(portfolioModule)[0];
  const portfolioParsed =
    typeof portfolioRaw === "string"
      ? (yaml.load(portfolioRaw) as { items?: PortfolioItem[] } | null)
      : null;

  return {
    files,
    portfolioItems: clone(portfolioParsed?.items ?? []),
    shopProducts: clone(catalog.products as ShopCatalogProduct[]),
  };
}

export function messagesFromFiles(bundle: FileBundle): Record<string, unknown> {
  let messages: Record<string, unknown> = {};
  for (const doc of Object.values(bundle)) {
    messages = deepMerge(messages, doc);
  }
  return messages;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function labelFor(path: string): string {
  const parts = path.split(".");
  const last = parts[parts.length - 1];
  if (LABELS[last]) return LABELS[last];
  if (/^\d+$/.test(last)) {
    const parent = parts[parts.length - 2];
    return `${LABELS[parent] || parent} ${last}`;
  }
  return last.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

const TITLE_KEYS = new Set([
  "title",
  "headline",
  "name",
  "readyTitle",
  "thankYouTitle",
  "successTitle",
  "cancelTitle",
  "errorTitle",
  "termsTitle",
  "shippingTitle",
  "privacyTitle",
  "disclaimerTitle",
  "cookiesTitle",
]);

const BODY_KEYS = new Set([
  "description",
  "intro",
  "quote",
  "answer",
  "paragraph1",
  "paragraph2",
  "paragraph3",
  "shippingNote",
  "readyDescription",
  "thankYouDescription",
  "successDescription",
  "cancelDescription",
  "errorDescription",
  "shortDescription",
  "messagePlaceholder",
  "terms",
  "shipping",
  "privacy",
  "disclaimer",
  "keywords",
]);

function fieldTone(path: string, sample: string): FieldTone {
  const last = path.split(".").pop() ?? "";
  if (TITLE_KEYS.has(last)) return "title";
  if (BODY_KEYS.has(last) || sample.includes("\n") || sample.length > 48) return "body";
  return "short";
}

export function collectFields(
  nlNode: unknown,
  enNode: unknown,
  path = "",
): FieldSpec[] {
  const nlObj = isPlainObject(nlNode) ? nlNode : {};
  const enObj = isPlainObject(enNode) ? enNode : {};
  const keys = [...new Set([...Object.keys(nlObj), ...Object.keys(enObj)])];
  const fields: FieldSpec[] = [];

  for (const key of keys) {
    const nextPath = path ? `${path}.${key}` : key;
    const nlValue = nlObj[key];
    const enValue = enObj[key];

    if (typeof nlValue === "string" || typeof enValue === "string") {
      const sample = String(nlValue ?? enValue ?? "");
      const tone = fieldTone(nextPath, sample);
      fields.push({
        type: tone === "short" ? "text" : "multiline",
        path: nextPath,
        label: labelFor(nextPath),
        tone,
      });
      continue;
    }

    const nlList = Array.isArray(nlValue) ? nlValue : Array.isArray(enValue) ? enValue : null;
    if (nlList && nlList.every((item) => typeof item === "string")) {
      fields.push({
        type: "stringList",
        path: nextPath,
        label: labelFor(nextPath),
      });
      continue;
    }

    if (isPlainObject(nlValue) || isPlainObject(enValue)) {
      fields.push({
        type: "group",
        path: nextPath,
        label: labelFor(nextPath),
        children: collectFields(nlValue, enValue, nextPath),
      });
    }
  }

  return fields;
}

export function getAt(doc: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as object)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, doc);
}

export function setAt(
  doc: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const next = clone(doc);
  const parts = path.split(".");
  let cursor: Record<string, unknown> = next;

  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    const existing = cursor[part];
    if (!isPlainObject(existing) && !Array.isArray(existing)) {
      cursor[part] = {};
    } else {
      cursor[part] = Array.isArray(existing) ? [...existing] : { ...existing };
    }
    cursor = cursor[part] as Record<string, unknown>;
  }

  cursor[parts[parts.length - 1]] = value;
  return next;
}

export function fileForPath(bundle: FileBundle, path: string): string | null {
  const root = path.split(".")[0];
  for (const [file, doc] of Object.entries(bundle)) {
    if (isPlainObject(doc) && root in doc) return file;
  }
  return null;
}

export function dumpYaml(doc: Record<string, unknown>): string {
  return yaml.dump(doc, {
    lineWidth: 100,
    noRefs: true,
    quotingType: '"',
  });
}

export function pickRoots(
  doc: Record<string, unknown> | undefined,
  roots?: string[],
): Record<string, unknown> {
  if (!doc) return {};
  if (!roots) return doc;
  const picked: Record<string, unknown> = {};
  for (const root of roots) {
    if (root in doc) picked[root] = doc[root];
  }
  return picked;
}
