import { applySaleCents, salePercentForProduct } from "./sale-pricing";

export type ShopLocale = "nl" | "en";

export type ProductOptionType =
  | "fabric"
  | "hardware"
  | "size"
  | "addon"
  | "name"
  | "note"
  | "letters"
  | "bundle";

export interface ProductOptionChoice {
  id: string;
  label: Record<ShopLocale, string>;
  image?: string;
  color?: string;
  /** Items in a bundle pack. */
  quantity?: number;
  /** Total pack price in cents. */
  priceCents?: number;
  /** Remaining units for this choice (typically a fabric). Omit for unlimited. 0 = sold out. */
  stock?: number;
}

export interface LetterExtraCharacter {
  id: string;
  char: string;
  label: Record<ShopLocale, string>;
}

export interface ProductOption {
  id: string;
  type: ProductOptionType;
  required: boolean;
  label: Record<ShopLocale, string>;
  choices?: ProductOptionChoice[];
  pricePerLetterCents?: number;
  minLetters?: number;
  maxLetters?: number;
  extraCharacters?: LetterExtraCharacter[];
  letterPricesCents?: Record<string, number>;
  /** Show this field only when another option has this choice selected. */
  revealWhen?: { optionId: string; choiceId: string };
}

export const BANNER_EXTRA_CHARACTERS: LetterExtraCharacter[] = [
  { id: "heart", char: "♥", label: { nl: "Hart", en: "Heart" } },
  { id: "ampersand", char: "&", label: { nl: "&", en: "&" } },
  { id: "moon", char: "☾", label: { nl: "Maan", en: "Moon" } },
];

const EXTRA_ALIASES: Record<string, string[]> = {
  "♥": ["♥", "❤", "♡"],
  "&": ["&"],
  "☾": ["☾", "☽", "🌙"],
};

export type ProductSelections = Record<string, string>;

export interface OptionedProduct {
  id?: string;
  priceCents: number;
  stock?: number;
  options?: ProductOption[];
  salePercent?: number;
  saleSkip?: boolean;
}

export function variantStockKey(productId: string, optionId: string, choiceId: string): string {
  return `${productId}::${optionId}::${choiceId}`;
}

export function catalogStockNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.floor(value));
}

export function choiceIsSoldOut(choice: ProductOptionChoice): boolean {
  return catalogStockNumber(choice.stock) === 0;
}

export function fabricOptionWithStock(
  product: OptionedProduct,
  selections: ProductSelections = {},
): { option: ProductOption; choice: ProductOptionChoice } | null {
  for (const option of getProductOptions(product)) {
    if (option.type !== "fabric") continue;
    const selected = selections[option.id];
    const choice = option.choices?.find((item) => item.id === selected);
    if (choice && catalogStockNumber(choice.stock) !== null) {
      return { option, choice };
    }
  }
  return null;
}

export function catalogStockTracks(
  product: OptionedProduct & { id: string },
): { key: string; catalogStock: number }[] {
  const rows: { key: string; catalogStock: number }[] = [];
  const productStock = catalogStockNumber(product.stock);
  if (productStock !== null) {
    rows.push({ key: product.id, catalogStock: productStock });
  }
  for (const option of getProductOptions(product)) {
    if (option.type !== "fabric") continue;
    for (const choice of option.choices ?? []) {
      const stock = catalogStockNumber(choice.stock);
      if (stock === null) continue;
      rows.push({
        key: variantStockKey(product.id, option.id, choice.id),
        catalogStock: stock,
      });
    }
  }
  return rows;
}

export function stockCapsForSelection(
  product: OptionedProduct & { id: string },
  selections: ProductSelections = {},
): { key: string; remaining: number }[] {
  const caps: { key: string; remaining: number }[] = [];
  const productStock = catalogStockNumber(product.stock);
  if (productStock !== null) {
    caps.push({ key: product.id, remaining: productStock });
  }
  const fabric = fabricOptionWithStock(product, selections);
  if (fabric) {
    caps.push({
      key: variantStockKey(product.id, fabric.option.id, fabric.choice.id),
      remaining: catalogStockNumber(fabric.choice.stock) ?? 0,
    });
  }
  return caps;
}

export function availableStockFor(
  product: OptionedProduct & { id: string },
  selections: ProductSelections = {},
): number | null {
  const caps = stockCapsForSelection(product, selections);
  if (caps.length === 0) return null;
  return Math.min(...caps.map((cap) => cap.remaining));
}

export function productHasFabricStock(product: OptionedProduct): boolean {
  return getProductOptions(product).some(
    (option) =>
      option.type === "fabric" &&
      (option.choices ?? []).some((choice) => catalogStockNumber(choice.stock) !== null),
  );
}

export function firstAvailableFabricId(option: ProductOption): string | undefined {
  const choices = option.choices ?? [];
  const available = choices.find((choice) => !choiceIsSoldOut(choice));
  return (available ?? choices[0])?.id;
}

export function getFabricOptions(product: OptionedProduct): ProductOption[] {
  return getProductOptions(product).filter((option) => option.type === "fabric");
}

export type SelectionErrorReason = "required" | "invalid" | "minLetters" | "maxLetters";

export interface SelectionError {
  optionId: string;
  reason: SelectionErrorReason;
}

export function getProductOptions(product: OptionedProduct): ProductOption[] {
  return Array.isArray(product.options) ? product.options : [];
}

export function getLettersOption(product: OptionedProduct): ProductOption | undefined {
  return getProductOptions(product).find((option) => option.type === "letters");
}

export function getBundleOption(product: OptionedProduct): ProductOption | undefined {
  return getProductOptions(product).find((option) => option.type === "bundle");
}

export function getSizeOption(product: OptionedProduct): ProductOption | undefined {
  return getProductOptions(product).find((option) => option.type === "size");
}

export function selectedSizeChoice(
  product: OptionedProduct,
  selections: ProductSelections = {},
): ProductOptionChoice | undefined {
  const option = getSizeOption(product);
  if (!option) return undefined;
  const value = selections[option.id]?.trim();
  if (!value) return undefined;
  return option.choices?.find((choice) => choice.id === value);
}

export function sizePriceCents(choice: ProductOptionChoice | undefined, fallback: number): number {
  if (typeof choice?.priceCents === "number" && Number.isFinite(choice.priceCents) && choice.priceCents > 0) {
    return Math.round(choice.priceCents);
  }
  return fallback;
}

export function optionIsRevealed(
  option: ProductOption,
  selections: ProductSelections = {},
): boolean {
  const rule = option.revealWhen;
  if (!rule?.optionId || !rule.choiceId) return true;
  return selections[rule.optionId] === rule.choiceId;
}

export function addonExtraCents(
  product: OptionedProduct,
  selections: ProductSelections = {},
): number {
  let extra = 0;
  for (const option of getProductOptions(product)) {
    if (option.type !== "addon") continue;
    const value = selections[option.id]?.trim();
    const choice = option.choices?.find((item) => item.id === value);
    if (typeof choice?.priceCents === "number" && Number.isFinite(choice.priceCents) && choice.priceCents > 0) {
      extra += Math.round(choice.priceCents);
    }
  }
  return extra;
}

export function selectedBundleChoice(
  product: OptionedProduct,
  selections: ProductSelections = {},
): ProductOptionChoice | undefined {
  const option = getBundleOption(product);
  if (!option) return undefined;
  const value = selections[option.id]?.trim();
  if (!value) return undefined;
  return option.choices?.find((choice) => choice.id === value);
}

export function bundleSize(
  product: OptionedProduct,
  selections: ProductSelections = {},
): number {
  const choice = selectedBundleChoice(product, selections);
  const size = choice?.quantity;
  if (typeof size === "number" && Number.isFinite(size) && size >= 1) {
    return Math.floor(size);
  }
  return 1;
}

export function lineStockUnits(
  product: OptionedProduct,
  selections: ProductSelections = {},
  quantity = 1,
): number {
  return Math.max(1, Math.floor(quantity)) * bundleSize(product, selections);
}

export function productHasOptions(product: OptionedProduct): boolean {
  return getProductOptions(product).length > 0;
}

export function extraCharactersFor(option?: ProductOption): LetterExtraCharacter[] {
  return Array.isArray(option?.extraCharacters) ? option.extraCharacters : [];
}

export function normalizeLetterText(text: string, option?: ProductOption): string {
  let next = text.replace(/\uFE0F/g, "");
  for (const extra of extraCharactersFor(option)) {
    for (const alias of EXTRA_ALIASES[extra.char] ?? [extra.char]) {
      if (alias !== extra.char) next = next.split(alias).join(extra.char);
    }
  }
  return next;
}

export function countBillableLetters(text: string, option?: ProductOption): number {
  const extras = new Set(extraCharactersFor(option).map((item) => item.char));
  return [...normalizeLetterText(text, option)].filter(
    (character) => /\p{L}/u.test(character) || extras.has(character),
  ).length;
}

export function billedLetterCount(text: string, option: ProductOption): number {
  return countBillableLetters(text, option);
}

export function letterPriceCents(option: ProductOption, count: number): number {
  const table = option.letterPricesCents;
  if (table && Object.keys(table).length > 0) {
    const min = Math.max(1, option.minLetters ?? 1);
    const max = option.maxLetters ?? 0;
    let n = Math.max(min, count);
    if (max > 0) n = Math.min(n, max);
    const exact = table[String(n)];
    if (typeof exact === "number") return exact;
    const perLetter = option.pricePerLetterCents ?? 0;
    return n * perLetter;
  }
  const perLetter = option.pricePerLetterCents ?? 0;
  return Math.max(count, 0) * perLetter;
}

export function getProductUnitPriceCents(
  product: OptionedProduct,
  selections: ProductSelections = {},
  applySale = true,
): number {
  const letters = getLettersOption(product);
  let piece = sizePriceCents(selectedSizeChoice(product, selections), product.priceCents);
  if (letters) {
    const text = selections[letters.id] ?? "";
    const count = countBillableLetters(text, letters);
    piece =
      count === 0
        ? letterPriceCents(letters, Math.max(1, letters.minLetters ?? 1))
        : letterPriceCents(letters, count);
  }

  const pack = selectedBundleChoice(product, selections);
  const extras = addonExtraCents(product, selections) * bundleSize(product, selections);
  const unsold = pack
    ? Math.max(
        0,
        (typeof pack.priceCents === "number" && pack.priceCents > 0
          ? pack.priceCents
          : piece * bundleSize(product, selections)) +
          (piece - product.priceCents) * bundleSize(product, selections),
      ) + extras
    : piece + extras;
  return applySale ? applySaleCents(unsold, salePercentForProduct(product)) : unsold;
}

export function getListedPrice(product: OptionedProduct): {
  cents: number;
  originalCents: number;
  from: boolean;
  salePercent: number;
} {
  const letters = getLettersOption(product);
  const sizes = getSizeOption(product)?.choices ?? [];
  const sizePrices = sizes
    .map((choice) => sizePriceCents(choice, 0))
    .filter((cents) => cents > 0);
  const single = letters
    ? letterPriceCents(letters, Math.max(1, letters.minLetters ?? 1))
    : sizePrices.length > 0
      ? Math.min(...sizePrices)
      : product.priceCents;
  const bundles = getBundleOption(product)?.choices ?? [];
  let original = single;
  let from = Boolean(letters) || sizePrices.length > 1;
  if (bundles.length > 0) {
    let min = single;
    for (const choice of bundles) {
      const size =
        typeof choice.quantity === "number" && choice.quantity >= 1
          ? Math.floor(choice.quantity)
          : 1;
      const total =
        typeof choice.priceCents === "number" && choice.priceCents > 0
          ? choice.priceCents
          : single * size;
      const per = Math.round(total / Math.max(1, size));
      if (per < min) min = per;
    }
    original = min;
    from = min < single || Boolean(letters);
  }
  const salePercent = salePercentForProduct(product);
  return {
    originalCents: original,
    cents: applySaleCents(original, salePercent),
    from,
    salePercent,
  };
}

export function optionLabel(option: ProductOption, locale: ShopLocale): string {
  return option.label[locale] || option.label.nl;
}

export function choiceLabel(choice: ProductOptionChoice, locale: ShopLocale): string {
  return choice.label[locale] || choice.label.nl;
}

export function formatSelectionLines(
  product: OptionedProduct,
  selections: ProductSelections,
  locale: ShopLocale,
): string[] {
  return getProductOptions(product).flatMap((option) => {
    if (!optionIsRevealed(option, selections)) return [];
    const value = selections[option.id]?.trim();
    if (!value) return [];
    const label = optionLabel(option, locale);
    if (option.choices?.length) {
      const choice = option.choices.find((item) => item.id === value);
      return [`${label}: ${choice ? choiceLabel(choice, locale) : value}`];
    }
    return [`${label}: ${value}`];
  });
}

export function validateSelections(
  product: OptionedProduct,
  selections: ProductSelections,
): SelectionError | null {
  for (const option of getProductOptions(product)) {
    if (!optionIsRevealed(option, selections)) continue;
    const value = selections[option.id]?.trim() ?? "";

    if (
      option.type === "fabric" ||
      option.type === "hardware" ||
      option.type === "size" ||
      option.type === "addon" ||
      option.type === "bundle"
    ) {
      if (!value) {
        if (option.required) return { optionId: option.id, reason: "required" };
        continue;
      }
      const valid = option.choices?.some((choice) => choice.id === value);
      if (!valid) return { optionId: option.id, reason: "invalid" };
      continue;
    }

    if (option.type === "letters") {
      if (!value) {
        if (option.required) return { optionId: option.id, reason: "required" };
        continue;
      }
      const count = countBillableLetters(value, option);
      if (count < 1) return { optionId: option.id, reason: "required" };
      const min = option.minLetters ?? 0;
      if (min > 0 && count < min) return { optionId: option.id, reason: "minLetters" };
      const max = option.maxLetters ?? 0;
      if (max > 0 && count > max) return { optionId: option.id, reason: "maxLetters" };
      continue;
    }

    if (option.required && !value) {
      return { optionId: option.id, reason: "required" };
    }
  }

  return null;
}

export function sanitizeSelections(
  product: OptionedProduct,
  selections: ProductSelections | undefined,
): ProductSelections {
  const next: ProductSelections = {};
  if (!selections || typeof selections !== "object") return next;

  for (const option of getProductOptions(product)) {
    if (!optionIsRevealed(option, selections)) continue;
    const value = selections[option.id];
    if (typeof value === "string" && value.trim()) {
      next[option.id] = value.trim();
    }
  }
  return next;
}
