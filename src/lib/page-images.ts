import stored from "@/data/page-images.json";
import { SERVICE_IDS, SERVICES_DATA, type ServiceId } from "@/lib/constants";
import { useStudioPreview } from "@/lib/studio-preview";

export const SHOP_OVERVIEW_SLOTS = [
  "babyGifts",
  "digitalPatterns",
  "keychains",
  "pouches",
  "patches",
  "madeToOrder",
] as const;

export type ShopOverviewSlotId = (typeof SHOP_OVERVIEW_SLOTS)[number];

export interface PageImages {
  homeHero: string;
  shopHero: string;
  aboutPortrait: string;
  aboutEvent: string;
  aboutGallery: string[];
  services: Record<ServiceId, string>;
  shopOverview: Record<ShopOverviewSlotId, string>;
}

const FALLBACK_SERVICES = Object.fromEntries(
  SERVICES_DATA.map((service) => [service.id, service.image]),
) as Record<ServiceId, string>;

export const DEFAULT_PAGE_IMAGES: PageImages = {
  homeHero: "/images/hero-main.jpg",
  shopHero: "/images/portfolio/gifts-rainbow-heart-keychain-display.jpg",
  aboutPortrait: "/images/about/kim-portrait.jpg",
  aboutEvent: "/images/about/kim-at-event.jpg",
  aboutGallery: [
    "/images/portfolio/fashion-butterfly-wings.jpg",
    "/images/portfolio/gifts-baby-wrap.jpg",
    "/images/portfolio/fashion-upcycle-blazer.jpg",
  ],
  services: FALLBACK_SERVICES,
  shopOverview: {
    babyGifts: "/images/shop/balloon/balloon-1.jpg",
    digitalPatterns: "/images/shop/apple-bag-tag/tag-1.jpg",
    keychains: "/images/shop/keychain/keychain-1.jpg",
    pouches: "/images/uploads/shop/boxy-pouch-flower-3-sizes-1788954883564.jpg",
    patches: "/images/portfolio/fashion-battery-embroidery.jpg",
    madeToOrder: "/images/services/digitizing.jpg",
  },
};

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function normalizePageImages(value: unknown): PageImages {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const servicesRaw =
    raw.services && typeof raw.services === "object"
      ? (raw.services as Record<string, unknown>)
      : {};
  const gallery = Array.isArray(raw.aboutGallery)
    ? raw.aboutGallery.filter((item): item is string => typeof item === "string" && Boolean(item))
    : [];
  const overviewRaw =
    raw.shopOverview && typeof raw.shopOverview === "object"
      ? (raw.shopOverview as Record<string, unknown>)
      : {};

  return {
    homeHero: asString(raw.homeHero, DEFAULT_PAGE_IMAGES.homeHero),
    shopHero: asString(raw.shopHero, DEFAULT_PAGE_IMAGES.shopHero),
    aboutPortrait: asString(raw.aboutPortrait, DEFAULT_PAGE_IMAGES.aboutPortrait),
    aboutEvent: asString(raw.aboutEvent, DEFAULT_PAGE_IMAGES.aboutEvent),
    aboutGallery: DEFAULT_PAGE_IMAGES.aboutGallery.map((fallback, index) => gallery[index] ?? fallback),
    services: Object.fromEntries(
      SERVICE_IDS.map((id) => [id, asString(servicesRaw[id], FALLBACK_SERVICES[id])]),
    ) as Record<ServiceId, string>,
    shopOverview: Object.fromEntries(
      SHOP_OVERVIEW_SLOTS.map((id) => [
        id,
        asString(overviewRaw[id], DEFAULT_PAGE_IMAGES.shopOverview[id]),
      ]),
    ) as Record<ShopOverviewSlotId, string>,
  };
}

export const PAGE_IMAGES = normalizePageImages(stored);

export function getPageImages(): PageImages {
  return PAGE_IMAGES;
}

export function usePageImages(): PageImages {
  const studio = useStudioPreview();
  return studio?.pageImages ?? PAGE_IMAGES;
}

export function useServices() {
  const images = usePageImages();
  return SERVICES_DATA.map((service) => ({
    ...service,
    image: images.services[service.id] || service.image,
  }));
}
