import { useMemo } from "react";
import type { PortfolioItem } from "@/lib/portfolio";
import type { ShopCatalogProduct } from "@/lib/shop";
import { PORTFOLIO_CATEGORIES } from "@/lib/constants";
import { SHOP_SECTION_ORDER, getProductImages, withProductImages } from "@/lib/shop";
import { AutoGrowField, BilingualPair } from "./fields";
import { StudioImageField, StudioImageList } from "./media";
import { ShopProductOptionsEditor } from "./shop-options";

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
                Eén foto per portfolio-item. Klik of sleep om te vervangen.
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
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className="font-body text-xs text-brand-rose hover:underline"
          >
            Verwijder
          </button>
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
  const sectionLabels = useMemo(
    () => ({
      babyGifts: "Baby cadeaus",
      keychains: "Keychains",
      patches: "Patches",
      pouches: "Tassen",
      patterns: "Patronen",
    }),
    [],
  );

  const update = (index: number, patch: Partial<ShopCatalogProduct>) => {
    onChange(products.map((product, i) => (i === index ? { ...product, ...patch } : product)));
  };

  const add = () => {
    onChange([
      {
        id: `product-${Date.now()}`,
        type: "physical",
        section: "babyGifts",
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
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg text-brand-black">Producten</h2>
        <button
          type="button"
          onClick={add}
          className="rounded-full bg-brand-pink-accent px-3 py-1.5 font-body text-xs font-semibold text-white"
        >
          + Product
        </button>
      </div>
      {products.map((product, index) => (
        <article key={product.id} className="space-y-3 rounded-2xl border border-brand-pink-light bg-white p-4">
          <div className="grid grid-cols-2 gap-2">
            <select
              className="rounded-xl border border-brand-pink-light px-2 py-2 font-body text-sm"
              value={product.section}
              onChange={(event) =>
                update(index, {
                  section: event.target.value as ShopCatalogProduct["section"],
                })
              }
            >
              {SHOP_SECTION_ORDER.map((section) => (
                <option key={section} value={section}>
                  {sectionLabels[section]}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-brand-pink-light px-2 py-2 font-body text-sm"
              value={product.type}
              onChange={(event) =>
                update(index, { type: event.target.value as ShopCatalogProduct["type"] })
              }
            >
              <option value="physical">Fysiek (NL)</option>
              <option value="digital">Digitaal</option>
            </select>
          </div>
          <StudioImageList
            folder="shop"
            images={getProductImages(product)}
            onChange={(images) =>
              onChange(products.map((item, i) => (i === index ? withProductImages(item, images) : item)))
            }
          />
          <BilingualPair
            nl={product.name.nl}
            en={product.name.en}
            tone="title"
            onChange={(locale, value) =>
              update(index, { name: { ...product.name, [locale]: value } })
            }
          />
          <BilingualPair
            nl={product.description.nl}
            en={product.description.en}
            tone="body"
            onChange={(locale, value) =>
              update(index, {
                description: { ...product.description, [locale]: value },
              })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block min-w-0">
              <span className="mb-1.5 block font-body text-xs text-brand-black/50">Prijs op de site</span>
              <AutoGrowField
                value={product.priceLabel}
                onChange={(value) => update(index, { priceLabel: value })}
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block font-body text-xs text-brand-black/50">Prijs in centen</span>
              <input
                type="number"
                className="w-full rounded-2xl border border-brand-pink-light bg-white px-3.5 py-3 font-body text-sm text-brand-black outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
                value={product.priceCents}
                onChange={(event) => update(index, { priceCents: Number(event.target.value) })}
              />
            </label>
          </div>
          <label className="flex items-center gap-2 font-body text-sm">
            <input
              type="checkbox"
              checked={product.personalization}
              onChange={(event) => update(index, { personalization: event.target.checked })}
            />
            Personalisatie
          </label>
          <ShopProductOptionsEditor
            product={product}
            onChange={(next) =>
              onChange(products.map((item, i) => (i === index ? next : item)))
            }
          />
          <button
            type="button"
            onClick={() => onChange(products.filter((_, i) => i !== index))}
            className="font-body text-xs text-brand-rose hover:underline"
          >
            Verwijder
          </button>
        </article>
      ))}
    </div>
  );
}
