export const SITE_URL = "https://raw-atelier.netlify.app";

export const CONTACT_FORM_NAME = "contact";

export const BRAND = {
  email: "hello@rawatelier.com",
  instagram: "https://www.instagram.com/rawatelier",
  shopUrl: "https://www.rawluxurystitches.com",
} as const;

export const NAV_ROUTES = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/shop", key: "shop" },
  { href: "/contact", key: "contact" },
] as const;

export const SERVICE_IDS = [
  "live-events",
  "corporate",
  "gifts",
  "workshops",
  "fashion",
] as const;

export const SERVICES_DATA = SERVICE_IDS.map((id) => ({
  id,
  image: `/images/services/${id === "fashion" ? "fashion" : id}.jpg`,
}));

export const PORTFOLIO_CATEGORIES = [
  "all",
  "events",
  "corporate",
  "gifts",
  "fashion",
  "workshops",
] as const;

export type PortfolioCategoryKey = (typeof PORTFOLIO_CATEGORIES)[number];

export const PORTFOLIO_ITEMS = [
  { id: "1", category: "events" as const, image: "/images/portfolio/events-1.jpg", aspect: "tall" as const },
  { id: "2", category: "events" as const, image: "/images/portfolio/events-2.jpg", aspect: "wide" as const },
  { id: "3", category: "corporate" as const, image: "/images/portfolio/corporate-1.jpg", aspect: "square" as const },
  { id: "4", category: "corporate" as const, image: "/images/portfolio/corporate-2.jpg", aspect: "tall" as const },
  { id: "5", category: "gifts" as const, image: "/images/portfolio/gifts-1.jpg", aspect: "wide" as const },
  { id: "6", category: "gifts" as const, image: "/images/portfolio/gifts-2.jpg", aspect: "square" as const },
  { id: "7", category: "fashion" as const, image: "/images/portfolio/fashion-1.jpg", aspect: "tall" as const },
  { id: "8", category: "fashion" as const, image: "/images/portfolio/fashion-2.jpg", aspect: "wide" as const },
  { id: "9", category: "workshops" as const, image: "/images/portfolio/workshops-1.jpg", aspect: "square" as const },
  { id: "10", category: "workshops" as const, image: "/images/portfolio/workshops-2.jpg", aspect: "tall" as const },
  { id: "11", category: "events" as const, image: "/images/portfolio/events-3.jpg", aspect: "square" as const },
  { id: "12", category: "gifts" as const, image: "/images/portfolio/gifts-3.jpg", aspect: "wide" as const },
] as const;

export const TESTIMONIAL_IDS = ["1", "2", "3"] as const;
export const PROCESS_IDS = ["1", "2", "3", "4"] as const;
export const FAQ_IDS = ["1", "2", "3", "4", "5"] as const;
export const SHOP_PRODUCT_IDS = ["1", "2", "3", "4"] as const;

export const CONTACT_SERVICE_IDS = [
  "live-events",
  "corporate",
  "gifts",
  "workshops",
  "fashion",
  "general",
] as const;

export const SHOP_PRODUCT_IMAGES: Record<string, string> = {
  "1": "/images/shop/product-1.jpg",
  "2": "/images/shop/product-2.jpg",
  "3": "/images/shop/product-3.jpg",
  "4": "/images/shop/product-4.jpg",
};
