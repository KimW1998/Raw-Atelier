import catalog from "@/data/shop-catalog.json";
import { useStudioPreview } from "@/lib/studio-preview";
import { overlayLiveStock, useLiveStockMap } from "@/lib/live-stock";
import type { Locale } from "@/i18n/context";
import {
  availableStockFor,
  catalogStockNumber,
  fabricOptionWithStock,
  formatSelectionLines,
  getListedPrice,
  getProductOptions,
  getProductUnitPriceCents,
  lineStockUnits,
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
  catalogStockNumber,
  catalogStockTracks,
  choiceIsSoldOut,
  choiceLabel,
  countBillableLetters,
  extraCharactersFor,
  fabricOptionWithStock,
  firstAvailableFabricId,
  formatSelectionLines,
  getBundleOption,
  getFabricOptions,
  getLettersOption,
  getListedPrice,
  getProductOptions,
  getProductUnitPriceCents,
  getSizeOption,
  letterPriceCents,
  lineStockUnits,
  optionIsRevealed,
  optionLabel,
  productHasFabricStock,
  productHasOptions,
  sanitizeSelections,
  selectedBundleChoice,
  stockCapsForSelection,
  validateSelections,
  variantStockKey,
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
  "embroideryPatterns",
  "sewingPatterns",
  "madeToOrder",
] as const;

export type ShopTabId = (typeof SHOP_TAB_ORDER)[number];

export const SHOP_PRIMARY_TABS = [
  "babyGifts",
  "keychains",
  "patches",
  "pouches",
  "digitalPatterns",
  "madeToOrder",
] as const;

export type ShopPrimaryTabId = (typeof SHOP_PRIMARY_TABS)[number];

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
  /** Product-only sale percent. If set, this overrides the site-wide sale. */
  salePercent?: number;
  /** Skip the site-wide sale for this product. */
  saleSkip?: boolean;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  options?: ProductOption[];
}

export const MADE_TO_ORDER_IDS = [
  "embroideryDesigns",
  "sewingProduction",
  "customPouches",
  "personalGifts",
] as const;

export type MadeToOrderId = (typeof MADE_TO_ORDER_IDS)[number];

export function isShopTabId(value: string | null | undefined): value is ShopTabId {
  return SHOP_TAB_ORDER.includes(value as ShopTabId);
}

export function resolveShopTab(value: string | null | undefined): ShopTabId | null {
  if (!value) return null;
  if (value === "digitalPatterns") return "embroideryPatterns";
  if (isShopTabId(value)) return value;
  return null;
}

export function getShopTabHref(tab: ShopTabId | "digitalPatterns"): string {
  const resolved = resolveShopTab(tab === "digitalPatterns" ? "embroideryPatterns" : tab);
  if (!resolved) return "/shop";
  return `/shop?${SHOP_TAB_PARAM}=${resolved}`;
}

export function getPrimaryTabCoverImages(
  tab: ShopPrimaryTabId,
  products: ShopCatalogProduct[],
): string[] {
  if (tab === "digitalPatterns") {
    const embroidery = products.find((product) => product.section === "embroideryPatterns");
    const sewing = products.find((product) => product.section === "sewingPatterns");
    return [embroidery?.image, sewing?.image].filter((src): src is string => Boolean(src));
  }
  if (tab === "madeToOrder") {
    return [
      "/images/services/digitizing.jpg",
      "/images/services/fashion.jpg",
      "/images/services/gifts.jpg",
    ];
  }
  return productsForTab(products, tab)
    .slice(0, 3)
    .map((product) => product.image)
    .filter(Boolean);
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
  const fabrics = getProductOptions(product).flatMap((option) =>
    option.type === "fabric" ? (option.choices ?? []) : [],
  );
  const trackedFabrics = fabrics.filter((choice) => catalogStockNumber(choice.stock) !== null);
  if (trackedFabrics.length > 0) {
    const hasOpenFabric = fabrics.some((choice) => catalogStockNumber(choice.stock) === null);
    if (hasOpenFabric) return availableStock(product) === 0;
    if (trackedFabrics.every((choice) => catalogStockNumber(choice.stock) === 0)) return true;
  }
  return availableStock(product) === 0;
}

export function remainingStockForSelection(
  product: ShopCatalogProduct,
  selections: ProductSelections,
  cartItems: { productId: string; selections: ProductSelections; quantity: number; lineId?: string }[],
  exceptLineId?: string,
): number {
  let leftover = Number.POSITIVE_INFINITY;
  const productStock = availableStock(product);
  if (productStock !== null) {
    const used = cartItems
      .filter((item) => item.productId === product.id && item.lineId !== exceptLineId)
      .reduce(
        (sum, item) => sum + lineStockUnits(product, item.selections, item.quantity),
        0,
      );
    leftover = Math.min(leftover, Math.max(0, productStock - used));
  }
  const fabric = fabricOptionWithStock(product, selections);
  if (fabric) {
    const used = cartItems
      .filter(
        (item) =>
          item.productId === product.id &&
          item.lineId !== exceptLineId &&
          item.selections[fabric.option.id] === fabric.choice.id,
      )
      .reduce(
        (sum, item) => sum + lineStockUnits(product, item.selections, item.quantity),
        0,
      );
    leftover = Math.min(
      leftover,
      Math.max(0, (catalogStockNumber(fabric.choice.stock) ?? 0) - used),
    );
  }
  return leftover;
}

export function maxOrderQuantity(
  product: ShopCatalogProduct,
  alreadyInCart = 0,
  selections: ProductSelections = {},
): number {
  const stock = availableStockFor(
    { ...product, id: product.id },
    selections,
  );
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
    image: unique[0] || "",
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
  return listed.salePercent > 0 ? amount : product.priceLabel || amount;
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

export function cartLineOriginalCents(
  product: ShopCatalogProduct,
  selections: ProductSelections = {},
): number {
  return getProductUnitPriceCents(product, selections, false);
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
