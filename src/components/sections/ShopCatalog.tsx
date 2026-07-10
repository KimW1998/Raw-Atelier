import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTranslations } from "@/i18n/context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { cn } from "@/lib/utils";
import {
  MADE_TO_ORDER_IDS,
  SHOP_TAB_ORDER,
  SHOP_TAB_PARAM,
  getDefaultShopTab,
  getShopProductsBySection,
  isShopTabId,
  type MadeToOrderId,
  type ShopProduct,
  type ShopSectionId,
  type ShopTabId,
} from "@/lib/shop";
import { BRAND } from "@/lib/constants";

function ProductCard({ product }: { product: ShopProduct }) {
  const t = useTranslations("shop");

  return (
    <a
      href={product.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-pink/10"
    >
      <div className="relative aspect-square overflow-hidden">
        <PremiumImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-body text-xs font-semibold uppercase tracking-[0.12em] text-brand-black">
          {t(`badges.${product.badge}`)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg text-brand-black">{product.name}</h3>
        <p className="mt-1 font-body text-sm font-semibold text-brand-pink-accent">
          {product.priceLabel}
        </p>
        <p className="mt-3 font-body text-sm leading-relaxed text-brand-black/60">
          {t("productNote")}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 font-body text-sm font-semibold text-brand-black transition-colors group-hover:text-brand-pink-accent">
          {product.actionLabel}
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </a>
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

  return tShop(`sections.${tabId}.eyebrow`);
}

function getTabHeading(tabId: ShopTabId, tShop: ReturnType<typeof useTranslations>) {
  if (tabId === "madeToOrder") {
    return {
      eyebrow: tShop("madeToOrder.eyebrow"),
      title: tShop("madeToOrder.title"),
      description: tShop("madeToOrder.description"),
    };
  }

  return {
    eyebrow: tShop(`sections.${tabId}.eyebrow`),
    title: tShop(`sections.${tabId}.title`),
    description: tShop(`sections.${tabId}.description`),
  };
}

function isProductTab(tabId: ShopTabId): tabId is ShopSectionId {
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

function TabPanelHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
      <p className="mb-3 font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
        {eyebrow}
      </p>
      <h2 className="font-heading text-3xl leading-tight text-brand-black md:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 font-body text-base leading-relaxed text-brand-black/70 md:text-lg">
        {description}
      </p>
    </div>
  );
}

export function ShopCatalog() {
  const t = useTranslations("shopPage");
  const tShop = useTranslations("shop");
  const { activeTab, setActiveTab } = useShopTab();
  const heading = getTabHeading(activeTab, tShop);
  const products = isProductTab(activeTab) ? getShopProductsBySection(activeTab) : [];

  return (
    <>
      <Section>
        <Container size="narrow" className="text-center">
          <p className="font-body text-base leading-relaxed text-brand-black/70">
            {t("trust.description")}
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div
            role="tablist"
            aria-label={tShop("tabsLabel")}
            className="mb-10 flex gap-2 overflow-x-auto pb-2 md:mb-12 md:justify-center"
          >
            {SHOP_TAB_ORDER.map((tabId) => {
              const isActive = activeTab === tabId;
              const productCount = isProductTab(tabId)
                ? getShopProductsBySection(tabId).length
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
                      : "bg-white text-brand-black/70 ring-1 ring-brand-pink-light hover:bg-brand-pink-light hover:text-brand-black"
                  )}
                >
                  <span>{getTabLabel(tabId, tShop)}</span>
                  <span
                    className={cn(
                      "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
                      isActive ? "bg-white/15 text-white" : "bg-brand-pink-light text-brand-black/60"
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
                <TabPanelHeading
                  eyebrow={heading.eyebrow}
                  title={heading.title}
                  description={heading.description}
                />

                {activeTab === "madeToOrder" ? (
                  <div className="grid gap-8 md:grid-cols-3">
                    {MADE_TO_ORDER_IDS.map((id) => (
                      <MadeToOrderCard key={id} id={id} />
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center font-body text-base text-brand-black/60">
                    {tShop("emptyCategory")}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Container>
      </Section>

      <Section background="pink">
        <Container size="narrow" className="text-center">
          <h2 className="font-heading text-3xl text-brand-black md:text-4xl">
            {t("visit.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-base leading-relaxed text-brand-black/70">
            {t("visit.description")}
          </p>
          <div className="mt-8">
            <Button href={`${BRAND.shopUrl}/custom-creations/`} variant="primary" size="large" external>
              {tShop("viewFullShop")}
            </Button>
          </div>
          <p className="mt-6 font-body text-xs text-brand-black/50">
            {t("visit.externalNote")}
          </p>
        </Container>
      </Section>
    </>
  );
}
