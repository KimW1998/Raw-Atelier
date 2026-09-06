import type {
  ProductOption,
  ProductOptionChoice,
  ProductOptionType,
  ShopCatalogProduct,
} from "@/lib/shop";
import { BANNER_EXTRA_CHARACTERS, extraCharactersFor, getLettersOption, letterPriceCents } from "@/lib/shop";
import { BilingualPair } from "./fields";
import { StudioImageField } from "./media";
import { OrderButtons, moveItem } from "./order";

const OPTION_TYPES: { type: ProductOptionType; label: string }[] = [
  { type: "fabric", label: "Stof (fotovakjes)" },
  { type: "hardware", label: "Hardware (kleurvakjes)" },
  { type: "name", label: "Naamveld" },
  { type: "note", label: "Extra notitie" },
  { type: "letters", label: "Prijs per letter" },
  { type: "bundle", label: "Bundelkorting" },
];

const DEFAULT_LABELS: Record<ProductOptionType, { nl: string; en: string }> = {
  fabric: { nl: "Stof", en: "Fabric" },
  hardware: { nl: "Hardware", en: "Hardware" },
  name: { nl: "Naam", en: "Name" },
  note: { nl: "Extra notitie", en: "Extra note" },
  letters: { nl: "Naam op het product", en: "Name on the product" },
  bundle: { nl: "Bundel", en: "Bundle" },
};

function slugId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).slice(-4)}`;
}

function emptyChoice(kind: "fabric" | "hardware"): ProductOptionChoice {
  return {
    id: slugId(kind === "fabric" ? "stof" : "kleur"),
    label: {
      nl: kind === "fabric" ? "Nieuwe stof" : "Nieuwe kleur",
      en: kind === "fabric" ? "New fabric" : "New colour",
    },
    image: "",
    color: kind === "hardware" ? "#C5A572" : "",
  };
}

function emptyBundleChoice(product: ShopCatalogProduct, quantity = 4): ProductOptionChoice {
  const qty = Math.max(2, quantity);
  const full = product.priceCents * qty;
  const discounted = Math.max(product.priceCents, Math.round((full * 0.9) / 5) * 5);
  return {
    id: slugId("bundel"),
    label: {
      nl: `${qty} stuks`,
      en: `${qty} pieces`,
    },
    quantity: qty,
    priceCents: discounted,
  };
}

function emptyOption(type: ProductOptionType, product: ShopCatalogProduct): ProductOption {
  const option: ProductOption = {
    id: type,
    type,
    required: type !== "note" && type !== "bundle",
    label: { ...DEFAULT_LABELS[type] },
  };
  if (type === "fabric" || type === "hardware") {
    option.choices = [emptyChoice(type)];
  }
  if (type === "letters") {
    option.pricePerLetterCents = 400;
    option.minLetters = 3;
    option.maxLetters = 12;
    option.extraCharacters = BANNER_EXTRA_CHARACTERS.map((item) => ({ ...item, label: { ...item.label } }));
  }
  if (type === "bundle") {
    option.choices = [emptyBundleChoice(product, 4), emptyBundleChoice(product, 6)];
  }
  return option;
}

function syncLetterPrice(product: ShopCatalogProduct): ShopCatalogProduct {
  const letters = getLettersOption(product);
  if (!letters) return product;
  const cents = letterPriceCents(letters, Math.max(1, letters.minLetters ?? 1));
  const euros = (cents / 100).toFixed(2).replace(".", ",");
  return {
    ...product,
    priceCents: cents,
    priceLabel: `vanaf € ${euros}`,
    personalization: true,
  };
}

export function ShopProductOptionsEditor({
  product,
  onChange,
}: {
  product: ShopCatalogProduct;
  onChange: (product: ShopCatalogProduct) => void;
}) {
  const options = product.options ?? [];

  const setOptions = (nextOptions: ProductOption[]) => {
    onChange(
      syncLetterPrice({
        ...product,
        options: nextOptions,
        personalization: nextOptions.length > 0 ? true : product.personalization,
      }),
    );
  };

  const updateOption = (index: number, patch: Partial<ProductOption>) => {
    setOptions(options.map((option, i) => (i === index ? { ...option, ...patch } : option)));
  };

  const addOption = (type: ProductOptionType) => {
    const used = new Set(options.map((option) => option.id));
    const created = emptyOption(type, product);
    if (used.has(created.id)) created.id = slugId(type);
    setOptions([...options, created]);
  };

  return (
    <div className="space-y-3 rounded-2xl bg-brand-pink-light/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-brand-black/50">
          Shop-opties
        </p>
        <div className="flex flex-wrap gap-1">
          {OPTION_TYPES.map(({ type, label }) => {
            const once = type === "bundle" || type === "letters";
            const exists = once && options.some((option) => option.type === type);
            return (
              <button
                key={type}
                type="button"
                disabled={exists}
                onClick={() => addOption(type)}
                className="rounded-full bg-white px-2.5 py-1 font-body text-[11px] font-semibold text-brand-black ring-1 ring-brand-pink-light hover:bg-brand-pink-light disabled:cursor-not-allowed disabled:opacity-40"
              >
                + {label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="font-body text-xs leading-relaxed text-brand-black/50">
        Stoffen worden klikbare fotovakjes. Hardware wordt kleurvakjes (goud/zilver). Prijs per
        letter overschrijft de vaste prijs. Bundelkorting: 4 of 6 stuks voor een lagere totaalprijs. Met omhoog/omlaag
        zet je de volgorde zoals die op de productpagina verschijnt.
      </p>
      {options.map((option, index) => (
        <article key={option.id} className="space-y-3 rounded-2xl bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-body text-sm font-semibold text-brand-black">
              {OPTION_TYPES.find((item) => item.type === option.type)?.label || option.type}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <OrderButtons
                index={index}
                total={options.length}
                onMove={(direction) => setOptions(moveItem(options, index, direction))}
              />
              <button
                type="button"
                onClick={() => setOptions(options.filter((_, i) => i !== index))}
                className="font-body text-xs text-brand-rose hover:underline"
              >
                Verwijder optie
              </button>
            </div>
          </div>
          <BilingualPair
            nl={option.label.nl}
            en={option.label.en}
            tone="short"
            onChange={(locale, value) =>
              updateOption(index, { label: { ...option.label, [locale]: value } })
            }
          />
          <label className="flex items-center gap-2 font-body text-sm">
            <input
              type="checkbox"
              checked={option.required}
              onChange={(event) => updateOption(index, { required: event.target.checked })}
            />
            Verplicht
          </label>

          {option.type === "letters" && (
            <div className="grid grid-cols-3 gap-2">
              <label className="block min-w-0">
                <span className="mb-1 block font-body text-xs text-brand-black/50">
                  Prijs per letter (€)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="w-full rounded-2xl border border-brand-pink-light bg-white px-3 py-2 font-body text-sm outline-none focus:border-brand-pink"
                  value={((option.pricePerLetterCents ?? 0) / 100).toString()}
                  onChange={(event) =>
                    updateOption(index, {
                      pricePerLetterCents: Math.round(Number(event.target.value) * 100),
                    })
                  }
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block font-body text-xs text-brand-black/50">Vanaf letters</span>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-2xl border border-brand-pink-light bg-white px-3 py-2 font-body text-sm outline-none focus:border-brand-pink"
                  value={option.minLetters ?? 3}
                  onChange={(event) =>
                    updateOption(index, { minLetters: Number(event.target.value) })
                  }
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block font-body text-xs text-brand-black/50">Max letters</span>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-2xl border border-brand-pink-light bg-white px-3 py-2 font-body text-sm outline-none focus:border-brand-pink"
                  value={option.maxLetters ?? 12}
                  onChange={(event) =>
                    updateOption(index, { maxLetters: Number(event.target.value) })
                  }
                />
              </label>
            </div>
          )}

          {option.type === "letters" && (
            <div className="space-y-2">
              <p className="font-body text-xs text-brand-black/50">Bijzondere tekens in het naamveld</p>
              <div className="flex flex-wrap gap-3">
                {BANNER_EXTRA_CHARACTERS.map((symbol) => {
                  const checked = extraCharactersFor(option).some((item) => item.id === symbol.id);
                  return (
                    <label key={symbol.id} className="flex items-center gap-2 font-body text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const current = extraCharactersFor(option);
                          updateOption(index, {
                            extraCharacters: event.target.checked
                              ? [...current, { ...symbol, label: { ...symbol.label } }]
                              : current.filter((item) => item.id !== symbol.id),
                          });
                        }}
                      />
                      <span className="text-brand-pink-accent">{symbol.char}</span>
                      {symbol.label.nl}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {(option.type === "fabric" || option.type === "hardware") && (
            <div className="space-y-3">
              {(option.choices ?? []).map((choice, choiceIndex) => (
                <div key={choice.id} className="space-y-2 rounded-xl bg-brand-offwhite p-3">
                  <div className="flex justify-end">
                    <OrderButtons
                      index={choiceIndex}
                      total={(option.choices ?? []).length}
                      onMove={(direction) =>
                        updateOption(index, {
                          choices: moveItem(option.choices ?? [], choiceIndex, direction),
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-3">
                    <StudioImageField
                      className="w-24 shrink-0"
                      folder="fabrics"
                      label={option.type === "fabric" ? "Stof" : "Foto"}
                      optional={option.type === "hardware"}
                      value={choice.image ?? ""}
                      onChange={(image) =>
                        updateOption(index, {
                          choices: (option.choices ?? []).map((item, i) =>
                            i === choiceIndex ? { ...item, image } : item,
                          ),
                        })
                      }
                    />
                    {option.type === "hardware" ? (
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="color"
                            className="h-10 w-12 cursor-pointer rounded-lg border border-brand-pink-light bg-white"
                            value={choice.color || "#C5A572"}
                            onChange={(event) =>
                              updateOption(index, {
                                choices: (option.choices ?? []).map((item, i) =>
                                  i === choiceIndex ? { ...item, color: event.target.value } : item,
                                ),
                              })
                            }
                            aria-label="Kleur"
                          />
                          <input
                            className="min-w-0 flex-1 rounded-2xl border border-brand-pink-light bg-white px-3 py-2 font-body text-sm outline-none focus:border-brand-pink"
                            value={choice.color ?? ""}
                            onChange={(event) =>
                              updateOption(index, {
                                choices: (option.choices ?? []).map((item, i) =>
                                  i === choiceIndex ? { ...item, color: event.target.value } : item,
                                ),
                              })
                            }
                            placeholder="#C5A572"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1 font-body text-xs text-brand-black/45">
                        Klik of sleep een stofoto in het vakje.
                      </div>
                    )}
                  </div>
                  <BilingualPair
                    nl={choice.label.nl}
                    en={choice.label.en}
                    tone="short"
                    onChange={(locale, value) =>
                      updateOption(index, {
                        choices: (option.choices ?? []).map((item, i) =>
                          i === choiceIndex
                            ? { ...item, label: { ...item.label, [locale]: value } }
                            : item,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateOption(index, {
                        choices: (option.choices ?? []).filter((_, i) => i !== choiceIndex),
                      })
                    }
                    className="font-body text-xs text-brand-rose hover:underline"
                  >
                    Verwijder keuze
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const kind = option.type as "fabric" | "hardware";
                  updateOption(index, {
                    choices: [...(option.choices ?? []), emptyChoice(kind)],
                  });
                }}
                className="rounded-full bg-brand-pink-light px-3 py-1.5 font-body text-xs font-semibold text-brand-black"
              >
                {option.type === "fabric" ? "+ Stof" : "+ Kleur"}
              </button>
            </div>
          )}

          {option.type === "bundle" && (
            <div className="space-y-3">
              <p className="font-body text-xs leading-relaxed text-brand-black/50">
                1 stuk blijft de normale prijs. Elke bundel is een aantal stuks voor een totaalprijs die
                lager is dan los.
              </p>
              {(option.choices ?? []).map((choice, choiceIndex) => (
                <div key={choice.id} className="space-y-2 rounded-xl bg-brand-offwhite p-3">
                  <div className="flex justify-end">
                    <OrderButtons
                      index={choiceIndex}
                      total={(option.choices ?? []).length}
                      onMove={(direction) =>
                        updateOption(index, {
                          choices: moveItem(option.choices ?? [], choiceIndex, direction),
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block min-w-0">
                      <span className="mb-1 block font-body text-xs text-brand-black/50">Aantal stuks</span>
                      <input
                        type="number"
                        min={2}
                        className="w-full rounded-2xl border border-brand-pink-light bg-white px-3 py-2 font-body text-sm outline-none focus:border-brand-pink"
                        value={choice.quantity ?? 4}
                        onChange={(event) => {
                          const quantity = Math.max(2, Number(event.target.value) || 2);
                          updateOption(index, {
                            choices: (option.choices ?? []).map((item, i) =>
                              i === choiceIndex
                                ? {
                                    ...item,
                                    quantity,
                                    label: {
                                      nl: `${quantity} stuks`,
                                      en: `${quantity} pieces`,
                                    },
                                  }
                                : item,
                            ),
                          });
                        }}
                      />
                    </label>
                    <label className="block min-w-0">
                      <span className="mb-1 block font-body text-xs text-brand-black/50">
                        Totaalprijs bundel (€)
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-full rounded-2xl border border-brand-pink-light bg-white px-3 py-2 font-body text-sm outline-none focus:border-brand-pink"
                        value={((choice.priceCents ?? 0) / 100).toString()}
                        onChange={(event) =>
                          updateOption(index, {
                            choices: (option.choices ?? []).map((item, i) =>
                              i === choiceIndex
                                ? {
                                    ...item,
                                    priceCents: Math.max(
                                      0,
                                      Math.round(Number(event.target.value) * 100),
                                    ),
                                  }
                                : item,
                            ),
                          })
                        }
                      />
                    </label>
                  </div>
                  <BilingualPair
                    nl={choice.label.nl}
                    en={choice.label.en}
                    tone="short"
                    onChange={(locale, value) =>
                      updateOption(index, {
                        choices: (option.choices ?? []).map((item, i) =>
                          i === choiceIndex
                            ? { ...item, label: { ...item.label, [locale]: value } }
                            : item,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateOption(index, {
                        choices: (option.choices ?? []).filter((_, i) => i !== choiceIndex),
                      })
                    }
                    className="font-body text-xs text-brand-rose hover:underline"
                  >
                    Verwijder bundel
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateOption(index, {
                    choices: [...(option.choices ?? []), emptyBundleChoice(product, 4)],
                  })
                }
                className="rounded-full bg-brand-pink-light px-3 py-1.5 font-body text-xs font-semibold text-brand-black"
              >
                + Bundel
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
