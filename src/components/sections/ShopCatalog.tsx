import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useLocale, useTranslations } from "@/i18n/context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useCart } from "@/lib/cart";
import { useVacation } from "@/lib/vacation";
import {
  MADE_TO_ORDER_IDS,
  SHOP_TAB_ORDER,
  SHOP_TAB_PARAM,
  formatListedPrice,
  getDefaultShopTab,
  getProductBadge,
  getProductDescription,
  getProductHref,
  getProductName,
  isShopTabId,
  isSoldOut,
  lineStockUnits,
  maxOrderQuantity,
  productHasOptions,
  productsForTab,
  useShopProducts,
  type MadeToOrderId,
  type ShopCatalogProduct,
  type ShopTabId,
} from "@/lib/shop";

function ProductCard({ product }: { product: ShopCatalogProduct }) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const { addItem, items } = useCart();
  const badge = getProductBadge(product);
  const needsOptions = productHasOptions(product);
  const soldOut = isSoldOut(product);
  const { pausePhysical } = useVacation();
  const physicalPaused = pausePhysical && product.type === "physical";
  const alreadyInCart = items
    .filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + lineStockUnits(product, item.selections, item.quantity), 0);
  const canAdd = !soldOut && !physicalPaused && maxOrderQuantity(product, alreadyInCart) > 0;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <Link href={getProductHref(product.id)} className="relative aspect-square overflow-hidden">
        <PremiumImage
          src={product.image}
          alt={getProductName(product, locale)}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-body text-xs font-semibold uppercase tracking-[0.12em] text-brand-black">
          {t(`badges.${badge}`)}
        </span>
        {product.type === "digital" && (
          <span className="absolute right-4 top-4 rounded-full bg-brand-black/85 px-3 py-1 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white">
            PDF
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-x-4 bottom-4 rounded-full bg-brand-black/85 px-3 py-2 text-center font-body text-xs font-semibold uppercase tracking-[0.12em] text-white">
            {t("soldOut")}
          </span>
        )}
        {physicalPaused && !soldOut && (
          <span className="absolute inset-x-4 bottom-4 rounded-full bg-brand-black/85 px-3 py-2 text-center font-body text-xs font-semibold uppercase tracking-[0.12em] text-white">
            {t("physicalPaused")}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link href={getProductHref(product.id)}>
          <h3 className="font-heading text-lg text-brand-black hover:text-brand-pink-accent">
            {getProductName(product, locale)}
          </h3>
        </Link>
        <p className="mt-1 font-body text-sm font-semibold text-brand-pink-accent">
          {formatListedPrice(product, locale)}
        </p>
        <p className="mt-3 line-clamp-4 flex-1 font-body text-sm leading-relaxed text-brand-black/60">
          {getProductDescription(product, locale)}
        </p>
        {soldOut ? (
          <Button variant="outline" className="mt-4 w-full" disabled>
            {t("soldOut")}
          </Button>
        ) : physicalPaused ? (
          <Button variant="outline" className="mt-4 w-full" disabled>
            {t("physicalPaused")}
          </Button>
        ) : needsOptions ? (
          <Button href={getProductHref(product.id)} variant="primary" className="mt-4 w-full">
            {t("cart.chooseOptions")}
          </Button>
        ) : (
          <Button
            variant="primary"
            className="mt-4 w-full"
            disabled={!canAdd}
            onClick={() => addItem(product.id)}
          >
            {t("cart.add")}
          </Button>
        )}
      </div>
    </article>
  );
}

function MadeToOrderCard({ id }: { id: MadeToOrderId }) {
  const t = useTranslations("shop");

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-pink/30 bg-white/80 p-6 shadow-sm">
      <span className="inline-flex w-fit rounded-full bg-brand-pink-light px-3 py-1 font-body text-xs font-semibold uppercase tracking-[0.12em] text-brand-rose">
        {t("badges.madeToOrder")}
      </span>
      <h3 className="mt-4 font-heading text-xl text-brand-black">
        {t(`madeToOrder.items.${id}.name`)}
      </h3>
      <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-brand-black/70">
        {t(`madeToOrder.items.${id}.description`)}
      </p>
      <Button href="/contact" variant="outline" className="mt-6 w-full">
        {t("madeToOrder.cta")}
      </Button>
    </div>
  );
}

function getTabLabel(tabId: ShopTabId, tShop: ReturnType<typeof useTranslations>) {
  if (tabId === "madeToOrder") {
    return tShop("madeToOrder.eyebrow");
  }
  if (tabId === "digitalPatterns") {
    return tShop("digitalPatterns.eyebrow");
  }

  return tShop(`sections.${tabId}.eyebrow`);
}

function getTabDescription(tabId: ShopTabId, tShop: ReturnType<typeof useTranslations>) {
  if (tabId === "madeToOrder") {
    return tShop("madeToOrder.description");
  }
  if (tabId === "digitalPatterns") {
    return tShop("digitalPatterns.description");
  }

  return tShop(`sections.${tabId}.description`);
}

function isProductTab(tabId: ShopTabId): boolean {
  return tabId !== "madeToOrder";
}

function useShopTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get(SHOP_TAB_PARAM);
  const activeTab = isShopTabId(tabParam) ? tabParam : getDefaultShopTab();

  const setActiveTab = (tabId: ShopTabId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(SHOP_TAB_PARAM, tabId);
    setSearchParams(nextParams, { replace: true });
  };

  return { activeTab, setActiveTab };
}

function getEmptyCategoryMessage(
  tabId: ShopTabId,
  tShop: ReturnType<typeof useTranslations>,
) {
  if (tabId === "digitalPatterns") {
    return tShop("digitalPatterns.emptyNote");
  }
  if (tabId === "madeToOrder") {
    return tShop("emptyCategory");
  }
  const sectionNote = tShop.raw(`sections.${tabId}.emptyNote`);
  if (typeof sectionNote === "string" && sectionNote.length > 0) {
    return sectionNote;
  }

  return tShop("emptyCategory");
}

function ProductGrid({ products }: { products: ShopCatalogProduct[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function DigitalPatternsPanel({
  products,
}: {
  products: ShopCatalogProduct[];
}) {
  const tShop = useTranslations("shop");
  const embroidery = products.filter((product) => product.section === "embroideryPatterns");
  const sewing = products.filter((product) => product.section === "sewingPatterns");

  return (
    <div className="space-y-12">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white px-6 py-8 text-center shadow-sm ring-1 ring-brand-pink-light md:px-10">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
          PDF
        </p>
        <h2 className="mt-3 font-heading text-2xl text-brand-black md:text-3xl">
          {tShop("digitalPatterns.title")}
        </h2>
        <p className="mt-4 font-body text-sm leading-relaxed text-brand-black/70 md:text-base">
          {tShop("digitalPatterns.intro")}
        </p>
        <ul className="mt-6 flex flex-wrap justify-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.12em] text-brand-black/60">
          <li className="rounded-full bg-brand-pink-light px-3 py-1.5">{tShop("digitalPatterns.pointEmail")}</li>
          <li className="rounded-full bg-brand-pink-light px-3 py-1.5">{tShop("digitalPatterns.pointWorldwide")}</li>
          <li className="rounded-full bg-brand-pink-light px-3 py-1.5">{tShop("digitalPatterns.pointNoShipping")}</li>
        </ul>
      </div>

      <div>
        <h3 className="font-heading text-xl text-brand-black md:text-2xl">
          {tShop("digitalPatterns.embroideryTitle")}
        </h3>
        <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-brand-black/65">
          {tShop("digitalPatterns.embroideryDescription")}
        </p>
        <div className="mt-6">
          {embroidery.length > 0 ? (
            <ProductGrid products={embroidery} />
          ) : (
            <p className="rounded-2xl bg-white px-5 py-8 text-center font-body text-sm text-brand-black/60 shadow-sm">
              {tShop("digitalPatterns.embroideryEmpty")}
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-xl text-brand-black md:text-2xl">
          {tShop("digitalPatterns.sewingTitle")}
        </h3>
        <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-brand-black/65">
          {tShop("digitalPatterns.sewingDescription")}
        </p>
        <div className="mt-6">
          {sewing.length > 0 ? (
            <ProductGrid products={sewing} />
          ) : (
            <p className="rounded-2xl bg-white px-5 py-8 text-center font-body text-sm text-brand-black/60 shadow-sm">
              {tShop("digitalPatterns.sewingEmpty")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ShopCatalog() {
  const t = useTranslations("shopPage");
  const tShop = useTranslations("shop");
  const { activeTab, setActiveTab } = useShopTab();
  const description = getTabDescription(activeTab, tShop);
  const allProducts = useShopProducts();
  const products = productsForTab(allProducts, activeTab);

  return (
    <Section spacing="tight">
      <Container>
        {activeTab !== "digitalPatterns" && (
          <p className="mx-auto mb-6 max-w-2xl text-center font-body text-sm leading-relaxed text-brand-black/70 md:mb-8">
            {t("shippingNote")}
          </p>
        )}
        <div
          role="tablist"
          aria-label={tShop("tabsLabel")}
          className="mb-6 flex gap-2 overflow-x-auto pb-2 md:mb-8 md:justify-center"
        >
          {SHOP_TAB_ORDER.map((tabId) => {
            const isActive = activeTab === tabId;
            const productCount = isProductTab(tabId)
              ? productsForTab(allProducts, tabId).length
              : MADE_TO_ORDER_IDS.length;

            return (
              <button
                key={tabId}
                type="button"
                role="tab"
                id={`shop-tab-${tabId}`}
                aria-selected={isActive}
                aria-controls={`shop-panel-${tabId}`}
                onClick={() => setActiveTab(tabId)}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2.5 font-body text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-brand-black text-white shadow-md shadow-brand-black/10"
                    : "bg-white text-brand-black/70 ring-1 ring-brand-pink-light hover:bg-brand-pink-light hover:text-brand-black",
                )}
              >
                <span>{getTabLabel(tabId, tShop)}</span>
                <span
                  className={cn(
                    "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-brand-pink-light text-brand-black/60",
                  )}
                >
                  {productCount}
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`shop-panel-${activeTab}`}
          aria-labelledby={`shop-tab-${activeTab}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab !== "digitalPatterns" && (
                <p className="mx-auto mb-6 max-w-2xl text-center font-body text-sm leading-relaxed text-brand-black/70 md:mb-8">
                  {description}
                </p>
              )}

              {activeTab === "madeToOrder" ? (
                <div className="grid gap-8 md:grid-cols-3">
                  {MADE_TO_ORDER_IDS.map((id) => (
                    <MadeToOrderCard key={id} id={id} />
                  ))}
                </div>
              ) : activeTab === "digitalPatterns" ? (
                <DigitalPatternsPanel products={products} />
              ) : products.length > 0 ? (
                <ProductGrid products={products} />
              ) : (
                <p className="text-center font-body text-base text-brand-black/60">
                  {getEmptyCategoryMessage(activeTab, tShop)}
                </p>
              )}

              {activeTab !== "digitalPatterns" && (
                <p className="mx-auto mt-10 max-w-xl text-center font-body text-sm leading-relaxed text-brand-black/60 md:mt-12">
                  {t("trust.description")}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </Section>
  );
}
