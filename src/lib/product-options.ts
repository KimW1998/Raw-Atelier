export type ShopLocale = "nl" | "en";

export type ProductOptionType = "fabric" | "hardware" | "name" | "note" | "letters";

export interface ProductOptionChoice {
  id: string;
  label: Record<ShopLocale, string>;
  image?: string;
  color?: string;
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
  priceCents: number;
  options?: ProductOption[];
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
): number {
  const letters = getLettersOption(product);
  if (!letters) return product.priceCents;

  const text = selections[letters.id] ?? "";
  const count = countBillableLetters(text, letters);
  if (count === 0) {
    return letterPriceCents(letters, Math.max(1, letters.minLetters ?? 1));
  }
  return letterPriceCents(letters, count);
}

export function getListedPrice(product: OptionedProduct): { cents: number; from: boolean } {
  const letters = getLettersOption(product);
  if (letters) {
    const min = Math.max(1, letters.minLetters ?? 1);
    return { cents: letterPriceCents(letters, min), from: true };
  }
  return { cents: product.priceCents, from: false };
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
    const value = selections[option.id]?.trim() ?? "";

    if (option.type === "fabric" || option.type === "hardware") {
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
    const value = selections[option.id];
    if (typeof value === "string" && value.trim()) {
      next[option.id] = value.trim();
    }
  }
  return next;
}
