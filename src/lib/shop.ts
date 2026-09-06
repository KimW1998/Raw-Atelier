import catalog from "@/data/shop-catalog.json";
import { useStudioPreview } from "@/lib/studio-preview";
import { overlayLiveStock, useLiveStockMap } from "@/lib/live-stock";
import type { Locale } from "@/i18n/context";
import {
  formatSelectionLines,
  getListedPrice,
  getProductUnitPriceCents,
  type ProductOption,
  type ProductSelections,
} from "@/lib/product-options";

export type {
  LetterExtraCharacter,
  ProductOption,
  ProductOptionChoice,
  ProductOptionType,
  ProductSelections,
  SelectionError,
} from "@/lib/product-options";

export {
  BANNER_EXTRA_CHARACTERS,
  billedLetterCount,
  bundleSize,
  choiceLabel,
  countBillableLetters,
  extraCharactersFor,
  formatSelectionLines,
  getBundleOption,
  getLettersOption,
  getListedPrice,
  getProductOptions,
  getProductUnitPriceCents,
  letterPriceCents,
  lineStockUnits,
  optionLabel,
  productHasOptions,
  sanitizeSelections,
  selectedBundleChoice,
  validateSelections,
} from "@/lib/product-options";

export const SHOP_SECTION_ORDER = [
  "babyGifts",
  "keychains",
  "patches",
  "pouches",
  "embroideryPatterns",
  "sewingPatterns",
] as const;

export type ShopSectionId = (typeof SHOP_SECTION_ORDER)[number];

export const DIGITAL_PATTERN_SECTIONS = ["embroideryPatterns", "sewingPatterns"] as const;

export type DigitalPatternSectionId = (typeof DIGITAL_PATTERN_SECTIONS)[number];

export const SHOP_TAB_ORDER = [
  "babyGifts",
  "keychains",
  "patches",
  "pouches",
  "digitalPatterns",
  "madeToOrder",
] as const;

export type ShopTabId = (typeof SHOP_TAB_ORDER)[number];

export const SHOP_TAB_PARAM = "tab";

export type ShopProductType = "physical" | "digital";

export interface ShopCatalogProduct {
  id: string;
  type: ShopProductType;
  section: ShopSectionId;
  image: string;
  images?: string[];
  priceCents: number;
  priceLabel: string;
  personalization: boolean;
  digitalFile?: string;
  /** Remaining units. Omit or leave unset for unlimited (typical for PDFs). 0 = sold out. */
  stock?: number;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  options?: ProductOption[];
}

export const MADE_TO_ORDER_IDS = ["ereaderCases", "customPouches"] as const;

export type MadeToOrderId = (typeof MADE_TO_ORDER_IDS)[number];

export function isShopTabId(value: string | null | undefined): value is ShopTabId {
  return SHOP_TAB_ORDER.includes(value as ShopTabId);
}

export function isDigitalPatternSection(
  section: string | undefined,
): section is DigitalPatternSectionId {
  return DIGITAL_PATTERN_SECTIONS.includes(section as DigitalPatternSectionId);
}

export function availableStock(product: ShopCatalogProduct): number | null {
  if (typeof product.stock !== "number" || !Number.isFinite(product.stock)) return null;
  return Math.max(0, Math.floor(product.stock));
}

export function isSoldOut(product: ShopCatalogProduct): boolean {
  return availableStock(product) === 0;
}

export function maxOrderQuantity(product: ShopCatalogProduct, alreadyInCart = 0): number {
  const stock = availableStock(product);
  if (stock === null) return Number.POSITIVE_INFINITY;
  return Math.max(0, stock - alreadyInCart);
}

export function isShopSectionId(value: string | undefined): value is ShopSectionId {
  return SHOP_SECTION_ORDER.includes(value as ShopSectionId);
}

export function productsForTab(
  products: ShopCatalogProduct[],
  tab: ShopTabId,
): ShopCatalogProduct[] {
  if (tab === "madeToOrder") return [];
  if (tab === "digitalPatterns") {
    return products.filter((product) => isDigitalPatternSection(product.section));
  }
  if (!isShopSectionId(tab)) return [];
  return products.filter((product) => product.section === tab);
}

export function getDefaultShopTab(): ShopTabId {
  return SHOP_TAB_ORDER[0];
}

export function getShopProducts(): ShopCatalogProduct[] {
  return catalog.products as ShopCatalogProduct[];
}

export function getShopProduct(id: string): ShopCatalogProduct | undefined {
  const product = getShopProducts().find((item) => item.id === id);
  return product ? overlayLiveStock(product) : undefined;
}

export function getShopProductsBySection(section: ShopSectionId): ShopCatalogProduct[] {
  return getShopProducts().filter((product) => product.section === section);
}

export function getProductName(product: ShopCatalogProduct, locale: Locale): string {
  return product.name[locale] || product.name.nl;
}

export function getProductDescription(
  product: ShopCatalogProduct,
  locale: Locale,
): string {
  return product.description[locale] || product.description.nl;
}

export function useShopProducts(): ShopCatalogProduct[] {
  const studio = useStudioPreview();
  const live = useLiveStockMap();
  const products = studio?.shopProducts ?? getShopProducts();
  return products.map((product) => overlayLiveStock(product, live));
}

export function useShopProduct(id: string): ShopCatalogProduct | undefined {
  return useShopProducts().find((product) => product.id === id);
}

export function useShopProductsBySection(section: ShopSectionId): ShopCatalogProduct[] {
  return useShopProducts().filter((product) => product.section === section);
}

export function getProductBadge(product: ShopCatalogProduct): "handmade" | "digital" {
  return product.type === "digital" ? "digital" : "handmade";
}

export function getProductImages(product: ShopCatalogProduct): string[] {
  const extras = Array.isArray(product.images) ? product.images : [];
  return [...new Set([product.image, ...extras].filter(Boolean))];
}

export function withProductImages(
  product: ShopCatalogProduct,
  images: string[],
): ShopCatalogProduct {
  const unique = [...new Set(images.filter(Boolean))];
  return {
    ...product,
    image: unique[0] || product.image || "",
    images: unique.slice(1),
  };
}

export function formatEuro(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatListedPrice(product: ShopCatalogProduct, locale: Locale): string {
  const listed = getListedPrice(product);
  const amount = formatEuro(listed.cents, locale);
  if (listed.from) {
    return locale === "nl" ? `vanaf ${amount}` : `from ${amount}`;
  }
  return product.priceLabel || amount;
}

export function getProductHref(id: string): string {
  return `/shop/${id}`;
}

export function getRelatedProducts(
  product: ShopCatalogProduct,
  limit = 3,
): ShopCatalogProduct[] {
  return getShopProducts()
    .filter((item) => {
      if (item.id === product.id) return false;
      if (isDigitalPatternSection(product.section)) {
        return isDigitalPatternSection(item.section);
      }
      return item.section === product.section;
    })
    .slice(0, limit);
}

export function cartLineUnitCents(
  product: ShopCatalogProduct,
  selections: ProductSelections = {},
): number {
  return getProductUnitPriceCents(product, selections);
}

export function cartSubtotalCents(
  lines: {
    item: { quantity: number; selections?: ProductSelections };
    product: ShopCatalogProduct;
  }[],
): number {
  return lines.reduce(
    (sum, line) =>
      sum + cartLineUnitCents(line.product, line.item.selections) * line.item.quantity,
    0,
  );
}

export function cartHasPhysical(
  lines: { product: ShopCatalogProduct }[],
): boolean {
  return lines.some((line) => line.product.type === "physical");
}

export function cartLineSummary(
  product: ShopCatalogProduct,
  selections: ProductSelections,
  locale: Locale,
): string[] {
  return formatSelectionLines(product, selections, locale);
}
