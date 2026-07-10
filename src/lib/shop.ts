import shopData from "@/data/shop-products.json";

export const SHOP_SECTION_ORDER = [
  "babyGifts",
  "keychains",
  "pouches",
  "patterns",
] as const;

export type ShopSectionId = (typeof SHOP_SECTION_ORDER)[number];

export const SHOP_TAB_ORDER = [
  ...SHOP_SECTION_ORDER,
  "madeToOrder",
] as const;

export type ShopTabId = (typeof SHOP_TAB_ORDER)[number];

export const SHOP_TAB_PARAM = "tab";

export function isShopTabId(value: string | null | undefined): value is ShopTabId {
  return SHOP_TAB_ORDER.includes(value as ShopTabId);
}

export function getDefaultShopTab(): ShopTabId {
  return SHOP_TAB_ORDER[0];
}

export type ShopProductBadge = "handmade" | "digital";

export interface ShopProduct {
  id: number;
  slug: string;
  name: string;
  permalink: string;
  image: string;
  priceLabel: string;
  section: ShopSectionId | "gifts";
  badge: ShopProductBadge;
  actionLabel: string;
}

export const MADE_TO_ORDER_IDS = [
  "patches",
  "ereaderCases",
  "customPouches",
] as const;

export type MadeToOrderId = (typeof MADE_TO_ORDER_IDS)[number];

export function getShopProducts(): ShopProduct[] {
  return shopData.products as ShopProduct[];
}

export function getShopProductsBySection(section: ShopSectionId): ShopProduct[] {
  return getShopProducts().filter((product) => product.section === section);
}

export function getShopSyncDate(): string | null {
  return shopData.syncedAt ?? null;
}
