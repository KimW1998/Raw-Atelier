export const SITE_URL = "https://www.rawatelier.nl";

export const CONTACT_FORM_NAME = "contact";

export const BRAND = {
  email: "info@rawluxury.nl",
  instagram: "https://www.instagram.com/raw_luxury_atelier/",
  instagramHandle: "raw_luxury_atelier",
} as const;

export const NAV_ROUTES = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/shop", key: "shop" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

export const SERVICE_IDS = [
  "live-events",
  "corporate",
  "gifts",
  "digitizing",
  "fashion",
] as const;

export const SERVICE_ICONS: Record<(typeof SERVICE_IDS)[number], string> = {
  "live-events": "/images/icons/personalized-gifts.png",
  corporate: "/images/icons/live-embroidery.png",
  gifts: "/images/icons/special-occasions.png",
  digitizing: "/images/icons/embroidery-hoop.png",
  fashion: "/images/icons/measuring-tape.png",
};

export const BRAND_CARD_ICONS = [
  { src: "/images/icons/embroidery-hoop.png", key: "embroidery" },
  { src: "/images/icons/measuring-tape.png", key: "sewing" },
  { src: "/images/icons/live-embroidery.png", key: "live" },
  { src: "/images/icons/personalized-gifts.png", key: "gifts" },
  { src: "/images/icons/special-occasions.png", key: "occasions" },
] as const;

const DEFAULT_SERVICE_ICON_CLASSES = {
  card: "mb-4 h-10 w-10",
  detail: "h-14 w-14 shrink-0",
} as const;

const SERVICE_ICON_CLASS_OVERRIDES: Partial<
  Record<(typeof SERVICE_IDS)[number], { card: string; detail: string }>
> = {
  corporate: {
    card: "mb-4 h-12 w-16",
    detail: "h-16 w-20 shrink-0",
  },
  gifts: {
    card: "mb-4 h-11 w-20",
    detail: "h-14 w-24 shrink-0",
  },
};

export const SERVICES_DATA = SERVICE_IDS.map((id) => ({
  id,
  image: `/images/services/${id === "fashion" ? "fashion" : id}.jpg`,
  icon: SERVICE_ICONS[id],
  iconClassName: SERVICE_ICON_CLASS_OVERRIDES[id] ?? DEFAULT_SERVICE_ICON_CLASSES,
}));

export const PORTFOLIO_CATEGORIES = [
  "all",
  "events",
  "corporate",
  "gifts",
  "fashion",
  "digitizing",
] as const;

export type PortfolioCategoryKey = (typeof PORTFOLIO_CATEGORIES)[number];

export const TESTIMONIAL_IDS = ["1", "2", "3"] as const;
export const PROCESS_IDS = ["1", "2", "3", "4"] as const;
export const FAQ_IDS = ["1", "2", "3", "4", "5"] as const;

export const CONTACT_SERVICE_IDS = [
  "live-events",
  "corporate",
  "gifts",
  "digitizing",
  "fashion",
  "general",
] as const;
