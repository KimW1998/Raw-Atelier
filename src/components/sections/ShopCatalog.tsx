import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useLocale, useTranslations } from "@/i18n/context";
import { Container } from "@/components/ui/Container";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { Button } from "@/components/ui/Button";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { ListedSalePrice, SaleBadge } from "@/components/shop/SalePrice";
import { ShopOverview, ShopIntro } from "@/components/shop/ShopOverview";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useCart } from "@/lib/cart";
import { useSale } from "@/lib/sale";
import { useVacation } from "@/lib/vacation";
import {
  DIGITAL_PATTERN_SECTIONS,
  MADE_TO_ORDER_IDS,
  SHOP_PRIMARY_TABS,
  SHOP_TAB_PARAM,
  getProductBadge,
  getProductDescription,
  getProductHref,
  getProductName,
  isDigitalPatternSection,
  isSoldOut,
  lineStockUnits,
  maxOrderQuantity,
  productHasOptions,
  productsForTab,
  resolveShopTab,
  useShopProducts,
  type DigitalPatternSectionId,
  type MadeToOrderId,
  type ShopCatalogProduct,
  type ShopPrimaryTabId,
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
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-black sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-xs">
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
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <Link href={getProductHref(product.id)}>
          <h3 className="line-clamp-2 font-heading text-base leading-snug text-brand-black hover:text-brand-pink-accent sm:text-lg">
            {getProductName(product, locale)}
          </h3>
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <ListedSalePrice product={product} />
          <SaleBadge product={product} />
        </div>
        <p className="mt-2 hidden flex-1 font-body text-sm leading-relaxed text-brand-black/60 sm:mt-3 sm:line-clamp-3 sm:block">
          {getProductDescription(product, locale)}
        </p>
        <div className="mt-auto pt-3">
        {soldOut ? (
          <Button variant="outline" className="w-full" disabled>
            {t("soldOut")}
          </Button>
        ) : physicalPaused ? (
          <Button variant="outline" className="w-full" disabled>
            {t("physicalPaused")}
          </Button>
        ) : needsOptions ? (
          <Button href={getProductHref(product.id)} variant="primary" className="w-full">
            {t("cart.chooseOptions")}
          </Button>
        ) : (
          <Button
            variant="primary"
            className="w-full"
            disabled={!canAdd}
            onClick={() => addItem(product.id)}
          >
            {t("cart.add")}
          </Button>
        )}
        </div>
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

function getPrimaryTabLabel(tabId: ShopPrimaryTabId, tShop: ReturnType<typeof useTranslations>) {
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
  if (tabId === "embroideryPatterns") {
    return tShop("digitalPatterns.embroideryDescription");
  }
  if (tabId === "sewingPatterns") {
    return tShop("digitalPatterns.sewingDescription");
  }

  return tShop(`sections.${tabId}.description`);
}

function isPrimaryTabActive(primary: ShopPrimaryTabId, activeTab: ShopTabId) {
  if (primary === "digitalPatterns") {
    return isDigitalPatternSection(activeTab);
  }
  return activeTab === primary;
}

function primaryToShopTab(primary: ShopPrimaryTabId, current: ShopTabId): ShopTabId {
  if (primary === "digitalPatterns") {
    return isDigitalPatternSection(current) ? current : "embroideryPatterns";
  }
  return primary;
}

function primaryTabCount(
  primary: ShopPrimaryTabId,
  allProducts: ShopCatalogProduct[],
): number {
  if (primary === "madeToOrder") return MADE_TO_ORDER_IDS.length;
  if (primary === "digitalPatterns") {
    return DIGITAL_PATTERN_SECTIONS.reduce(
      (sum, section) => sum + productsForTab(allProducts, section).length,
      0,
    );
  }
  return productsForTab(allProducts, primary).length;
}

function useShopTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get(SHOP_TAB_PARAM);
  const activeTab = resolveShopTab(tabParam);

  const setActiveTab = (tabId: ShopTabId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(SHOP_TAB_PARAM, tabId);
    setSearchParams(nextParams, { replace: true });
  };

  const goHome = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(SHOP_TAB_PARAM);
    setSearchParams(nextParams, { replace: true });
  };

  return { activeTab, setActiveTab, goHome };
}

function ShopPrimaryNav({
  activeTab,
  products,
  onSelect,
  onHome,
}: {
  activeTab: ShopTabId | null;
  products: ShopCatalogProduct[];
  onSelect: (tab: ShopTabId) => void;
  onHome: () => void;
}) {
  const tShop = useTranslations("shop");
  const overviewActive = activeTab === null;

  return (
    <div
      role="tablist"
      aria-label={tShop("tabsLabel")}
      className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
    >
      <button
        type="button"
        onClick={onHome}
        className={cn(
          "shrink-0 rounded-full px-3.5 py-2 font-body text-xs font-semibold transition-all duration-300 sm:px-5 sm:py-2.5 sm:text-sm",
          overviewActive
            ? "bg-brand-black text-white shadow-md shadow-brand-black/10"
            : "bg-white text-brand-black/70 ring-1 ring-brand-pink-light hover:bg-brand-pink-light hover:text-brand-black",
        )}
      >
        {tShop("overview")}
      </button>
      {SHOP_PRIMARY_TABS.map((tabId) => {
        const isActive = activeTab ? isPrimaryTabActive(tabId, activeTab) : false;
        const productCount = primaryTabCount(tabId, products);

        return (
          <button
            key={tabId}
            type="button"
            role="tab"
            id={`shop-tab-${tabId}`}
            aria-selected={isActive}
            onClick={() => onSelect(primaryToShopTab(tabId, activeTab ?? "embroideryPatterns"))}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 font-body text-xs font-semibold transition-all duration-300 sm:px-5 sm:py-2.5 sm:text-sm",
              isActive
                ? "bg-brand-black text-white shadow-md shadow-brand-black/10"
                : "bg-white text-brand-black/70 ring-1 ring-brand-pink-light hover:bg-brand-pink-light hover:text-brand-black",
            )}
          >
            <span>{getPrimaryTabLabel(tabId, tShop)}</span>
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
  );
}

function getEmptyCategoryMessage(
  tabId: ShopTabId,
  tShop: ReturnType<typeof useTranslations>,
) {
  if (tabId === "embroideryPatterns") {
    return tShop("digitalPatterns.embroideryEmpty");
  }
  if (tabId === "sewingPatterns") {
    return tShop("digitalPatterns.sewingEmpty");
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

function DigitalPatternIntro({ tabId }: { tabId: "embroideryPatterns" | "sewingPatterns" }) {
  const tShop = useTranslations("shop");
  const title =
    tabId === "embroideryPatterns"
      ? tShop("digitalPatterns.embroideryTitle")
      : tShop("digitalPatterns.sewingTitle");
  const description =
    tabId === "embroideryPatterns"
      ? tShop("digitalPatterns.embroideryDescription")
      : tShop("digitalPatterns.sewingDescription");

  return (
    <div className="mx-auto mb-8 max-w-2xl rounded-3xl bg-white px-6 py-8 text-center shadow-sm ring-1 ring-brand-pink-light md:mb-10 md:px-10">
      <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
        PDF
      </p>
      <h2 className="mt-3 font-heading text-2xl text-brand-black md:text-3xl">{title}</h2>
      <p className="mt-4 font-body text-sm leading-relaxed text-brand-black/70 md:text-base">
        {description}
      </p>
      <p className="mt-3 font-body text-sm leading-relaxed text-brand-black/60">
        {tShop("digitalPatterns.intro")}
      </p>
      <ul className="mt-6 flex flex-wrap justify-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.12em] text-brand-black/60">
        <li className="rounded-full bg-brand-pink-light px-3 py-1.5">{tShop("digitalPatterns.pointEmail")}</li>
        <li className="rounded-full bg-brand-pink-light px-3 py-1.5">{tShop("digitalPatterns.pointWorldwide")}</li>
        <li className="rounded-full bg-brand-pink-light px-3 py-1.5">{tShop("digitalPatterns.pointNoShipping")}</li>
      </ul>
    </div>
  );
}

function ProductGrid({ products }: { products: ShopCatalogProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function ShopCatalog() {
  const t = useTranslations("shopPage");
  const tShop = useTranslations("shop");
  const { showShopBanner, shopBanner, percentOff } = useSale();
  const { activeTab, setActiveTab, goHome } = useShopTab();
  const allProducts = useShopProducts();

  const saleBanner = showShopBanner ? (
    <div className="mb-8 rounded-2xl bg-brand-pink-accent px-5 py-4 text-center text-white">
      <p className="font-body text-sm font-semibold">
        {shopBanner}
        {percentOff > 0 ? ` · −${percentOff}%` : ""}
      </p>
    </div>
  ) : null;

  const products = activeTab ? productsForTab(allProducts, activeTab) : [];
  const description = activeTab ? getTabDescription(activeTab, tShop) : "";

  return (
    <section className="relative bg-brand-offwhite pb-10 pt-36 md:pb-12 md:pt-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-screen overflow-hidden" aria-hidden>
        <PatternBackground variant="hero" />
      </div>
      <Container className="relative">
        <ShopIntro />

        <div className="mt-10 mb-8 md:mt-12 md:mb-10">
          <ShopPrimaryNav
            activeTab={activeTab}
            products={allProducts}
            onSelect={setActiveTab}
            onHome={goHome}
          />
        </div>

        {saleBanner}

        {activeTab && isDigitalPatternSection(activeTab) ? (
          <div className="mb-8 md:mb-10">
            <p className="mb-3 text-center font-body text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
              {tShop("digitalPatterns.chooseKind")}
            </p>
            <div
              role="tablist"
              aria-label={tShop("digitalPatterns.chooseKind")}
              className="mx-auto flex max-w-lg overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-brand-pink-light"
            >
              {DIGITAL_PATTERN_SECTIONS.map((tabId: DigitalPatternSectionId) => {
                const isActive = activeTab === tabId;
                const productCount = productsForTab(allProducts, tabId).length;
                const label =
                  tabId === "embroideryPatterns"
                    ? tShop("digitalPatterns.embroideryTab")
                    : tShop("digitalPatterns.sewingTab");

                return (
                  <button
                    key={tabId}
                    type="button"
                    role="tab"
                    id={`shop-digital-tab-${tabId}`}
                    aria-selected={isActive}
                    aria-controls={`shop-panel-${tabId}`}
                    onClick={() => setActiveTab(tabId)}
                    className={cn(
                      "flex-1 px-4 py-3 font-body text-sm font-semibold transition-colors duration-300",
                      isActive
                        ? "bg-brand-pink-light text-brand-black"
                        : "text-brand-black/55 hover:bg-brand-offwhite hover:text-brand-black",
                    )}
                  >
                    {label}
                    <span className="mt-0.5 block font-body text-xs font-medium text-brand-black/40">
                      {productCount === 1 ? t("home.countOne") : t("home.count", { count: String(productCount) })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div role="tabpanel" id={`shop-panel-${activeTab ?? "overview"}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab ?? "overview"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {!activeTab ? (
                <ShopOverview
                  products={allProducts}
                  banner={null}
                  onOpen={(tabId) => setActiveTab(primaryToShopTab(tabId, "embroideryPatterns"))}
                />
              ) : (
                <>
                  {isDigitalPatternSection(activeTab) ? (
                    <DigitalPatternIntro tabId={activeTab} />
                  ) : (
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
                  ) : products.length > 0 ? (
                    <ProductGrid products={products} />
                  ) : (
                    <p className="text-center font-body text-base text-brand-black/60">
                      {getEmptyCategoryMessage(activeTab, tShop)}
                    </p>
                  )}

                  {isDigitalPatternSection(activeTab) ? null : (
                    <p className="mx-auto mt-10 max-w-xl text-center font-body text-sm leading-relaxed text-brand-black/60 md:mt-12">
                      {t("trust.description")}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
