import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/i18n/context";
import {
  billedLetterCount,
  choiceLabel,
  countBillableLetters,
  extraCharactersFor,
  formatEuro,
  getProductOptions,
  getProductUnitPriceCents,
  optionLabel,
  type ProductOption,
  type ProductOptionChoice,
  type ProductSelections,
  type ShopCatalogProduct,
} from "@/lib/shop";

function ChoiceBox({
  choice,
  selected,
  onSelect,
  kind,
}: {
  choice: ProductOptionChoice;
  selected: boolean;
  onSelect: () => void;
  kind: "fabric" | "hardware";
}) {
  const locale = useLocale();
  const label = choiceLabel(choice, locale);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-white text-left ring-1 transition-all",
        selected
          ? "ring-2 ring-brand-pink-accent ring-offset-2 ring-offset-brand-offwhite"
          : "ring-brand-pink-light hover:ring-brand-pink",
      )}
    >
      <span
        className={cn(
          "relative block overflow-hidden",
          kind === "fabric" ? "aspect-square" : "aspect-square",
        )}
        style={
          !choice.image && choice.color
            ? { backgroundColor: choice.color }
            : undefined
        }
      >
        {choice.image ? (
          <img src={choice.image} alt="" className="h-full w-full object-cover" />
        ) : !choice.color ? (
          <span className="flex h-full items-center justify-center bg-brand-pink-light font-body text-xs text-brand-black/50">
            {label}
          </span>
        ) : null}
      </span>
      <span className="px-2 py-2 font-body text-xs font-semibold text-brand-black">
        {label}
      </span>
    </button>
  );
}

function OptionField({
  option,
  value,
  onChange,
  product,
  selections,
}: {
  option: ProductOption;
  value: string;
  onChange: (value: string) => void;
  product: ShopCatalogProduct;
  selections: ProductSelections;
}) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const label = optionLabel(option, locale);
  const letters = option.type === "letters" ? option : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<number | null>(null);
  const symbols = letters ? extraCharactersFor(letters) : [];
  const letterCount = letters ? countBillableLetters(value, letters) : 0;
  const minLetters = letters?.minLetters ?? 0;

  useLayoutEffect(() => {
    const input = inputRef.current;
    const caret = caretRef.current;
    if (!input || caret == null) return;
    input.focus();
    input.setSelectionRange(caret, caret);
    caretRef.current = null;
  }, [value]);

  const insertSymbol = (char: string) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    const next = `${value.slice(0, start)}${char}${value.slice(end)}`;
    if (letters?.maxLetters && countBillableLetters(next, letters) > letters.maxLetters) {
      return;
    }
    caretRef.current = start + char.length;
    onChange(next);
  };

  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 font-body text-sm font-semibold text-brand-black">
        {label}
        {option.required ? (
          <span className="ml-1 text-brand-pink-accent" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-2 font-normal text-brand-black/45">
            {t("options.optional")}
          </span>
        )}
      </legend>

      {(option.type === "fabric" || option.type === "hardware") && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(option.choices ?? []).map((choice) => (
            <ChoiceBox
              key={choice.id}
              choice={choice}
              kind={option.type === "hardware" ? "hardware" : "fabric"}
              selected={value === choice.id}
              onSelect={() => onChange(choice.id)}
            />
          ))}
        </div>
      )}

      {option.type === "bundle" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onChange("")}
            aria-pressed={!value}
            className={cn(
              "rounded-2xl bg-white px-4 py-3 text-left ring-1 transition-all",
              !value
                ? "ring-2 ring-brand-pink-accent ring-offset-2 ring-offset-brand-offwhite"
                : "ring-brand-pink-light hover:ring-brand-pink",
            )}
          >
            <span className="block font-body text-sm font-semibold text-brand-black">
              {t("options.singlePiece")}
            </span>
            <span className="mt-1 block font-body text-sm text-brand-pink-accent">
              {formatEuro(
                getProductUnitPriceCents(product, { ...selections, [option.id]: "" }),
                locale,
              )}
            </span>
          </button>
          {(option.choices ?? []).map((choice) => {
            const size = Math.max(1, Math.floor(choice.quantity ?? 1));
            const total =
              typeof choice.priceCents === "number" && choice.priceCents > 0
                ? choice.priceCents
                : product.priceCents * size;
            const full = product.priceCents * size;
            const save = full - total;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => onChange(choice.id)}
                aria-pressed={value === choice.id}
                className={cn(
                  "rounded-2xl bg-white px-4 py-3 text-left ring-1 transition-all",
                  value === choice.id
                    ? "ring-2 ring-brand-pink-accent ring-offset-2 ring-offset-brand-offwhite"
                    : "ring-brand-pink-light hover:ring-brand-pink",
                )}
              >
                <span className="block font-body text-sm font-semibold text-brand-black">
                  {choiceLabel(choice, locale)}
                </span>
                <span className="mt-1 block font-body text-sm text-brand-pink-accent">
                  {formatEuro(total, locale)}
                </span>
                <span className="mt-1 block font-body text-xs text-brand-black/55">
                  {t("options.bundleEach", { price: formatEuro(Math.round(total / size), locale) })}
                  {save > 0
                    ? ` · ${t("options.bundleSave", { amount: formatEuro(save, locale) })}`
                    : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {option.type === "name" && (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-brand-pink-light bg-white px-4 py-3 font-body text-sm text-brand-black outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
          autoComplete="off"
        />
      )}

      {option.type === "note" && (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="w-full resize-y rounded-2xl border border-brand-pink-light bg-white px-4 py-3 font-body text-sm leading-relaxed text-brand-black outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
        />
      )}

      {letters && (
        <>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-2xl border border-brand-pink-light bg-white px-4 py-3 font-heading text-lg text-brand-black outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
            autoComplete="off"
            spellCheck={false}
            maxLength={Math.max((letters.maxLetters ?? 20) * 2, 24)}
          />
          {symbols.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 font-body text-xs text-brand-black/50">{t("options.symbolsHint")}</p>
              <div className="flex flex-wrap gap-2">
                {symbols.map((symbol) => (
                  <button
                    key={symbol.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertSymbol(symbol.char)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-brand-pink-light transition-all hover:ring-brand-pink"
                    aria-label={symbol.label[locale] || symbol.label.nl}
                  >
                    <span className="font-heading text-xl leading-none text-brand-pink-accent">
                      {symbol.char}
                    </span>
                    <span className="font-body text-xs font-semibold text-brand-black">
                      {symbol.label[locale] || symbol.label.nl}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="mt-2 font-body text-sm text-brand-black/60">
            {t("options.lettersHint", {
              perLetter: formatEuro(letters.pricePerLetterCents ?? 0, locale),
              min: String(minLetters || 1),
            })}
            {letters.maxLetters
              ? ` ${t("options.maxLetters", { max: String(letters.maxLetters) })}`
              : ""}
          </p>
          {value.trim() ? (
            <p className="mt-1 font-body text-sm font-semibold text-brand-pink-accent">
              {t("options.letterCount", {
                count: String(letterCount),
                billed: String(billedLetterCount(value, letters)),
                price: formatEuro(getProductUnitPriceCents(product, selections), locale),
              })}
              {minLetters > 0 && letterCount < minLetters
                ? ` ${t("options.lettersNeedMore", {
                    needed: String(minLetters - letterCount),
                    min: String(minLetters),
                  })}`
                : ""}
            </p>
          ) : null}
        </>
      )}
    </fieldset>
  );
}

export function ProductOptionsForm({
  product,
  selections,
  onChange,
}: {
  product: ShopCatalogProduct;
  selections: ProductSelections;
  onChange: (selections: ProductSelections) => void;
}) {
  const options = getProductOptions(product);
  if (options.length === 0) return null;

  return (
    <div className="mt-8 space-y-7">
      {options.map((option) => (
        <OptionField
          key={option.id}
          option={option}
          product={product}
          selections={selections}
          value={selections[option.id] ?? ""}
          onChange={(value) => onChange({ ...selections, [option.id]: value })}
        />
      ))}
    </div>
  );
}
