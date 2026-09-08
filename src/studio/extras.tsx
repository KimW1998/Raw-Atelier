import { useEffect, useState } from "react";
import type { PortfolioItem } from "@/lib/portfolio";
import { clampSalePercent, type SaleSettings } from "@/lib/sale";
import type { ShopCatalogProduct } from "@/lib/shop";
import type { VacationSettings } from "@/lib/vacation";
import { PORTFOLIO_CATEGORIES } from "@/lib/constants";
import { overlayLiveStock, useLiveStockMap } from "@/lib/live-stock";
import { SHOP_SECTION_ORDER, getProductImages, isDigitalPatternSection, withProductImages } from "@/lib/shop";
import { cn } from "@/lib/utils";
import { AutoGrowField, BilingualPair } from "./fields";
import { StudioImageField, StudioImageList } from "./media";
import { OrderButtons, moveItem } from "./order";
import { ShopProductOptionsEditor } from "./shop-options";

const SECTION_LABELS: Record<string, string> = {
  babyGifts: "Baby cadeaus",
  keychains: "Keychains",
  patches: "Patches",
  pouches: "Tassen",
  embroideryPatterns: "Borduurpatronen (PDF)",
  sewingPatterns: "Naaitpatronen (PDF)",
};

export function PortfolioItemsEditor({
  items,
  onChange,
}: {
  items: PortfolioItem[];
  onChange: (items: PortfolioItem[]) => void;
}) {
  const update = (index: number, patch: Partial<PortfolioItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const add = () => {
    onChange([
      {
        id: `project-${Date.now()}`,
        category: "gifts",
        aspect: "square",
        featured: false,
        image: "/images/portfolio/gifts-balloon.jpg",
        title: { nl: "Nieuw project", en: "New project" },
      },
      ...items,
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg text-brand-black">Foto's</h2>
        <button
          type="button"
          onClick={add}
          className="rounded-full bg-brand-pink-accent px-3 py-1.5 font-body text-xs font-semibold text-white"
        >
          + Foto
        </button>
      </div>
      {items.map((item, index) => (
        <article key={item.id} className="space-y-3 rounded-2xl border border-brand-pink-light bg-white p-4">
          <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3">
            <StudioImageField
              value={item.image}
              folder="portfolio"
              label="Foto"
              onChange={(image) => update(index, { image })}
            />
            <div className="min-w-0 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="rounded-xl border border-brand-pink-light px-2 py-2 font-body text-sm"
                  value={item.category}
                  onChange={(event) =>
                    update(index, { category: event.target.value as PortfolioItem["category"] })
                  }
                >
                  {PORTFOLIO_CATEGORIES.filter((key) => key !== "all").map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 font-body text-sm">
                  <input
                    type="checkbox"
                    checked={item.featured}
                    onChange={(event) => update(index, { featured: event.target.checked })}
                  />
                  Homepage
                </label>
              </div>
              <p className="font-body text-xs leading-relaxed text-brand-black/45">
                Eén foto per item. Omhoog/omlaag is de volgorde op de site.
              </p>
            </div>
          </div>
          <BilingualPair
            nl={item.title.nl}
            en={item.title.en}
            tone="title"
            onChange={(locale, value) =>
              update(index, { title: { ...item.title, [locale]: value } })
            }
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <OrderButtons
              index={index}
              total={items.length}
              onMove={(direction) => onChange(moveItem(items, index, direction))}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="font-body text-xs text-brand-rose hover:underline"
            >
              Verwijder
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ShopProductsEditor({
  products,
  onChange,
}: {
  products: ShopCatalogProduct[];
  onChange: (products: ShopCatalogProduct[]) => void;
}) {
  const live = useLiveStockMap();
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? "");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!products.some((product) => product.id === selectedId)) {
      setSelectedId(products[0]?.id ?? "");
    }
  }, [products, selectedId]);

  const update = (index: number, patch: Partial<ShopCatalogProduct>) => {
    onChange(products.map((product, i) => (i === index ? { ...product, ...patch } : product)));
  };

  const add = () => {
    const id = `product-${Date.now()}`;
    const section =
      sectionFilter !== "all" &&
      SHOP_SECTION_ORDER.includes(sectionFilter as ShopCatalogProduct["section"])
        ? (sectionFilter as ShopCatalogProduct["section"])
        : "babyGifts";
    onChange([
      {
        id,
        type: isDigitalPatternSection(section) ? "digital" : "physical",
        section,
        image: "/images/portfolio/gifts-balloon.jpg",
        priceCents: 2500,
        priceLabel: "€ 25,00",
        personalization: true,
        digitalFile: "",
        name: { nl: "Nieuw product", en: "New product" },
        description: { nl: "", en: "" },
        options: [],
        images: [],
      },
      ...products,
    ]);
    setSelectedId(id);
    setQuery("");
  };

  const needle = query.trim().toLowerCase();
  const visible = products.filter((product) => {
    if (sectionFilter !== "all" && product.section !== sectionFilter) return false;
    if (!needle) return true;
    return (
      product.name.nl.toLowerCase().includes(needle) ||
      product.name.en.toLowerCase().includes(needle) ||
      product.id.toLowerCase().includes(needle)
    );
  });
  const selectedIndex = products.findIndex((product) => product.id === selectedId);
  const selected = selectedIndex >= 0 ? products[selectedIndex] : undefined;
  const groups = SHOP_SECTION_ORDER.filter((section) =>
    visible.some((product) => product.section === section),
  );

  return (
    <div className="space-y-4">
      <StockOverview products={products} onSelect={setSelectedId} />
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg text-brand-black">Producten</h2>
        <button
          type="button"
          onClick={add}
          className="rounded-full bg-brand-pink-accent px-3 py-1.5 font-body text-xs font-semibold text-white"
        >
          + Product
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Zoek op naam…"
          className="w-full rounded-2xl border border-brand-pink-light bg-white px-3.5 py-2.5 font-body text-sm text-brand-black outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
        />
        <select
          className="rounded-xl border border-brand-pink-light bg-white px-2 py-2 font-body text-sm"
          value={sectionFilter}
          onChange={(event) => setSectionFilter(event.target.value)}
        >
          <option value="all">Alle categorieën</option>
          {SHOP_SECTION_ORDER.map((section) => (
            <option key={section} value={section}>
              {SECTION_LABELS[section]}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-brand-pink-light bg-white">
        {visible.length === 0 ? (
          <p className="px-4 py-6 font-body text-sm text-brand-black/55">
            Geen producten in deze selectie.
          </p>
        ) : (
          groups.map((section) => (
            <div key={section} className="border-b border-brand-pink-light last:border-b-0">
              <p className="bg-brand-pink-light/50 px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-black/50">
                {SECTION_LABELS[section]}
              </p>
              <ul>
                {visible
                  .filter((product) => product.section === section)
                  .map((product) => {
                    const remaining = liveRemaining(product, live);
                    const active = product.id === selectedId;
                    return (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(product.id)}
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-2.5 text-left font-body text-sm",
                            active ? "bg-brand-pink-light" : "hover:bg-brand-offwhite",
                          )}
                        >
                          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-brand-pink-light">
                            {product.image ? (
                              <img src={product.image} alt="" className="h-full w-full object-cover" />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold text-brand-black">
                              {product.name.nl || product.id}
                            </span>
                            <span className="block truncate text-xs text-brand-black/50">
                              {product.type === "digital" ? "Digitaal" : "Fysiek"}
                              {remaining != null
                                ? remaining === 0
                                  ? " · uitverkocht"
                                  : ` · ${remaining} stuks`
                                : ""}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))
        )}
      </div>
      {selected ? (
        <article className="space-y-3 rounded-2xl border border-brand-pink-light bg-white p-4">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-brand-black/45">
            Bewerken
          </p>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="rounded-xl border border-brand-pink-light px-2 py-2 font-body text-sm"
              value={selected.section}
              onChange={(event) =>
                update(selectedIndex, {
                  section: event.target.value as ShopCatalogProduct["section"],
                  type: isDigitalPatternSection(event.target.value)
                    ? "digital"
                    : selected.type,
                })
              }
            >
              {SHOP_SECTION_ORDER.map((section) => (
                <option key={section} value={section}>
                  {SECTION_LABELS[section]}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-brand-pink-light px-2 py-2 font-body text-sm"
              value={selected.type}
              onChange={(event) =>
                update(selectedIndex, { type: event.target.value as ShopCatalogProduct["type"] })
              }
            >
              <option value="physical">Fysiek (NL)</option>
              <option value="digital">Digitaal</option>
            </select>
          </div>
          <StudioImageList
            folder="shop"
            images={getProductImages(selected)}
            onChange={(images) =>
              onChange(
                products.map((item, i) =>
                  i === selectedIndex ? withProductImages(item, images) : item,
                ),
              )
            }
          />
          <BilingualPair
            nl={selected.name.nl}
            en={selected.name.en}
            tone="title"
            onChange={(locale, value) =>
              update(selectedIndex, { name: { ...selected.name, [locale]: value } })
            }
          />
          <BilingualPair
            nl={selected.description.nl}
            en={selected.description.en}
            tone="body"
            onChange={(locale, value) =>
              update(selectedIndex, {
                description: { ...selected.description, [locale]: value },
              })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block min-w-0">
              <span className="mb-1.5 block font-body text-xs text-brand-black/50">Prijs op de site</span>
              <AutoGrowField
                value={selected.priceLabel}
                onChange={(value) => update(selectedIndex, { priceLabel: value })}
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block font-body text-xs text-brand-black/50">Prijs in centen</span>
              <input
                type="number"
                className="w-full rounded-2xl border border-brand-pink-light bg-white px-3.5 py-3 font-body text-sm text-brand-black outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
                value={selected.priceCents}
                onChange={(event) => update(selectedIndex, { priceCents: Number(event.target.value) })}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block min-w-0">
              <span className="mb-1.5 block font-body text-xs text-brand-black/50">
                Sale % (alleen dit product)
              </span>
              <input
                type="number"
                min={0}
                max={90}
                className="w-full rounded-2xl border border-brand-pink-light bg-white px-3.5 py-3 font-body text-sm text-brand-black outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
                value={selected.salePercent ?? 0}
                onChange={(event) => {
                  const percent = clampSalePercent(Number(event.target.value));
                  update(selectedIndex, {
                    salePercent: percent > 0 ? percent : undefined,
                    saleSkip: percent > 0 ? undefined : selected.saleSkip,
                  });
                }}
              />
            </label>
            <label className="flex items-end gap-2 pb-3 font-body text-sm">
              <input
                type="checkbox"
                checked={Boolean(selected.saleSkip) && !(selected.salePercent && selected.salePercent > 0)}
                disabled={Boolean(selected.salePercent && selected.salePercent > 0)}
                onChange={(event) =>
                  update(selectedIndex, { saleSkip: event.target.checked || undefined })
                }
              />
              <span>Niet meedoen met site-sale</span>
            </label>
          </div>
          <p className="font-body text-xs leading-relaxed text-brand-black/50">
            Eigen sale-% wint van de site-sale. 0 = meedoen met de site-sale (tenzij je
            hiernaast uitzet).
          </p>
          <label className="flex items-center gap-2 font-body text-sm">
            <input
              type="checkbox"
              checked={selected.personalization}
              onChange={(event) =>
                update(selectedIndex, { personalization: event.target.checked })
              }
            />
            Personalisatie
          </label>
          {selected.type === "digital" ? (
            <label className="block min-w-0">
              <span className="mb-1.5 block font-body text-xs text-brand-black/50">
                Downloadlink (PDF)
              </span>
              <input
                type="url"
                className="w-full rounded-2xl border border-brand-pink-light bg-white px-3.5 py-3 font-body text-sm text-brand-black outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
                placeholder="https://…"
                value={selected.digitalFile ?? ""}
                onChange={(event) =>
                  update(selectedIndex, { digitalFile: event.target.value.trim() })
                }
              />
              <p className="mt-1.5 font-body text-xs leading-relaxed text-brand-black/50">
                Zet hier de link naar het patroonbestand. Na betaling krijgt de koper die link in
                de mail. De link komt niet op de shoppagina. Gebruik een deel-link (Google Drive of
                Dropbox: “iedereen met de link”). Zonder link moet jij het bestand zelf nasturen.
              </p>
            </label>
          ) : null}
          <div className="space-y-2 rounded-2xl bg-brand-pink-light/40 p-3">
            <label className="flex items-center gap-2 font-body text-sm">
              <input
                type="checkbox"
                checked={typeof selected.stock === "number"}
                onChange={(event) =>
                  update(selectedIndex, {
                    stock: event.target.checked ? Math.max(1, selected.stock ?? 1) : undefined,
                  })
                }
              />
              Voorraad bijhouden
            </label>
            {typeof selected.stock === "number" ? (
              <label className="block min-w-0">
                <span className="mb-1.5 block font-body text-xs text-brand-black/50">
                  Aantal op voorraad
                </span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-2xl border border-brand-pink-light bg-white px-3.5 py-3 font-body text-sm text-brand-black outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
                  value={selected.stock}
                  onChange={(event) =>
                    update(selectedIndex, { stock: Math.max(0, Number(event.target.value) || 0) })
                  }
                />
                <LiveStockHint product={selected} />
              </label>
            ) : null}
            <p className="font-body text-xs leading-relaxed text-brand-black/50">
              PDF-patronen laat je meestal onbeperkt. Bij fysieke stukken: zet het aantal, of 0 voor
              uitverkocht. Na een betaalde bestelling gaat het aantal vanzelf omlaag. Wil je
              bijvullen, zet hier het nieuwe aantal en push/deploy de site.
            </p>
          </div>
          <ShopProductOptionsEditor
            product={selected}
            onChange={(next) =>
              onChange(products.map((item, i) => (i === selectedIndex ? next : item)))
            }
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <OrderButtons
              index={selectedIndex}
              total={products.length}
              onMove={(direction) => onChange(moveItem(products, selectedIndex, direction))}
            />
            <button
              type="button"
              onClick={() => onChange(products.filter((_, i) => i !== selectedIndex))}
              className="font-body text-xs text-brand-rose hover:underline"
            >
              Verwijder
            </button>
          </div>
        </article>
      ) : null}
    </div>
  );
}

function liveRemaining(product: ShopCatalogProduct, live: Record<string, number>): number | null {
  if (typeof product.stock !== "number") return null;
  return overlayLiveStock(product, live).stock ?? product.stock;
}

function StockOverview({
  products,
  onSelect,
}: {
  products: ShopCatalogProduct[];
  onSelect: (productId: string) => void;
}) {
  const live = useLiveStockMap();
  const tracked = products.filter((product) => typeof product.stock === "number");

  return (
    <div className="space-y-2 rounded-2xl border border-brand-pink-light bg-white p-4">
      <h2 className="font-heading text-lg text-brand-black">Voorraad nu</h2>
      {tracked.length === 0 ? (
        <p className="font-body text-xs leading-relaxed text-brand-black/55">
          Je houdt nog geen aantallen bij. Zet bij een fysiek product <strong>Voorraad bijhouden</strong>{" "}
          en vul het aantal stuks in. PDF-patronen laat je meestal onbeperkt.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {tracked.map((product) => {
            const remaining = liveRemaining(product, live) ?? 0;
            return (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => onSelect(product.id)}
                  className="flex w-full items-baseline justify-between gap-3 py-0.5 text-left font-body text-sm text-brand-black hover:text-brand-pink-accent"
                >
                  <span className="min-w-0 truncate">{product.name.nl}</span>
                  <span className={remaining === 0 ? "shrink-0 font-semibold text-brand-rose" : "shrink-0"}>
                    {remaining === 0 ? "Uitverkocht" : `${remaining} stuks`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function LiveStockHint({ product }: { product: ShopCatalogProduct }) {
  const live = useLiveStockMap();
  const remaining = liveRemaining(product, live);
  if (remaining == null || remaining === product.stock) return null;
  return (
    <p className="mt-1.5 font-body text-xs text-brand-black/55">
      In de shop nu: {remaining} stuks. Het veld hierboven is je ingestelde aantal. Als je dat
      wijzigt en opslaat, wordt de shop-voorraad daarnaar gezet.
    </p>
  );
}

export function SaleSettingsEditor({
  settings,
  onChange,
}: {
  settings: SaleSettings;
  onChange: (settings: SaleSettings) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-brand-pink-light bg-white p-4">
      <h2 className="font-heading text-lg text-brand-black">Sale</h2>
      <p className="font-body text-xs leading-relaxed text-brand-black/55">
        Zet een korting op de hele shop, of alleen op losse producten (veld bij het product).
        De Stripe-prijs volgt dezelfde korting. Bannertekst staat bij Menu & footer.
      </p>
      <label className="flex items-center gap-2 font-body text-sm">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(event) => onChange({ ...settings, enabled: event.target.checked })}
        />
        Site-sale aan
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block min-w-0">
          <span className="mb-1.5 block font-body text-xs text-brand-black/50">Korting %</span>
          <input
            type="number"
            min={0}
            max={90}
            className="w-full rounded-2xl border border-brand-pink-light bg-white px-3.5 py-3 font-body text-sm text-brand-black outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
            value={settings.percentOff}
            onChange={(event) =>
              onChange({ ...settings, percentOff: clampSalePercent(Number(event.target.value)) })
            }
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-1.5 block font-body text-xs text-brand-black/50">
            Tot en met (optioneel)
          </span>
          <input
            type="date"
            className="w-full rounded-2xl border border-brand-pink-light bg-white px-3.5 py-3 font-body text-sm text-brand-black outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
            value={settings.endsOn}
            onChange={(event) => onChange({ ...settings, endsOn: event.target.value })}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 font-body text-sm">
        <input
          type="checkbox"
          checked={settings.showSiteBanner}
          onChange={(event) => onChange({ ...settings, showSiteBanner: event.target.checked })}
        />
        Roze balk bovenaan de hele site
      </label>
      <label className="flex items-center gap-2 font-body text-sm">
        <input
          type="checkbox"
          checked={settings.showShopBanner}
          onChange={(event) => onChange({ ...settings, showShopBanner: event.target.checked })}
        />
        Extra strook op de shoppagina
      </label>
      <label className="flex items-center gap-2 font-body text-sm">
        <input
          type="checkbox"
          checked={settings.showBadges}
          onChange={(event) => onChange({ ...settings, showBadges: event.target.checked })}
        />
        −% badge op producten
      </label>
    </div>
  );
}

export function VacationSettingsEditor({
  settings,
  onChange,
}: {
  settings: VacationSettings;
  onChange: (settings: VacationSettings) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-brand-pink-light bg-white p-4">
      <h2 className="font-heading text-lg text-brand-black">Vakantie</h2>
      <p className="font-body text-xs leading-relaxed text-brand-black/55">
        Laat de shop open met een banner. Digitale patronen blijven verkoopbaar. Zet fysieke
        bestellingen alleen extra uit als je echt niets wilt maken of versturen.
      </p>
      <label className="flex items-center gap-2 font-body text-sm">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(event) => onChange({ ...settings, enabled: event.target.checked })}
        />
        Banner tonen
      </label>
      <label className="flex items-center gap-2 font-body text-sm">
        <input
          type="checkbox"
          checked={settings.pausePhysical}
          disabled={!settings.enabled}
          onChange={(event) => onChange({ ...settings, pausePhysical: event.target.checked })}
        />
        Fysieke producten niet bestelbaar
      </label>
      <p className="font-body text-xs leading-relaxed text-brand-black/45">
        Tekst van de banner staat hieronder (NL en EN). Na opslaan: git push / deploy om live te
        zetten.
      </p>
    </div>
  );
}
