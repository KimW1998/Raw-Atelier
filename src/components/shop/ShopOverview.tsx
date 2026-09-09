import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/i18n/context";
import { FadeIn } from "@/components/animations/FadeIn";
import { PremiumImage } from "@/components/ui/PremiumImage";
import {
  getPrimaryTabCoverImages,
  type ShopCatalogProduct,
  type ShopPrimaryTabId,
} from "@/lib/shop";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/images/portfolio/gifts-rainbow-heart-keychain-display.jpg";

const FEATURED: ShopPrimaryTabId[] = ["babyGifts", "digitalPatterns"];
const SECONDARY: ShopPrimaryTabId[] = ["keychains", "pouches", "patches"];

function titleFor(tabId: ShopPrimaryTabId, tShop: (key: string) => string) {
  if (tabId === "digitalPatterns") return tShop("digitalPatterns.title");
  if (tabId === "madeToOrder") return tShop("madeToOrder.title");
  return tShop(`sections.${tabId}.title`);
}

function OverlayTile({
  tabId,
  products,
  onOpen,
  size,
}: {
  tabId: ShopPrimaryTabId;
  products: ShopCatalogProduct[];
  onOpen: (tab: ShopPrimaryTabId) => void;
  size: "featured" | "standard" | "wide";
}) {
  const t = useTranslations("shopPage");
  const tShop = useTranslations("shop");
  const cover = getPrimaryTabCoverImages(tabId, products)[0];

  return (
    <button
      type="button"
      onClick={() => onOpen(tabId)}
      className={cn(
        "group relative isolate overflow-hidden rounded-2xl text-left shadow-sm ring-1 ring-brand-pink-light/70 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-pink/10",
        size === "wide" && "md:col-span-2 lg:col-span-3",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          size === "featured" && "aspect-[4/3] md:aspect-[16/10]",
          size === "standard" && "aspect-[4/3]",
          size === "wide" && "aspect-[4/3] md:aspect-[21/8]",
        )}
      >
        {cover ? (
          <PremiumImage
            src={cover}
            alt=""
            fill
            sizes={size === "wide" ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
            className="transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-pink-light" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/70 via-brand-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 md:p-6">
          <h3
            className={cn(
              "font-heading text-white",
              size === "standard" ? "text-base sm:text-xl" : "text-lg sm:text-xl md:text-2xl",
            )}
          >
            {titleFor(tabId, tShop)}
          </h3>
          <span className="mt-1 hidden items-center gap-1 font-body text-sm font-semibold text-white sm:mt-2 sm:inline-flex">
            {t("home.cta")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </button>
  );
}

export function ShopIntro() {
  const t = useTranslations("shopPage");

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
      <div>
        <FadeIn>
          <p className="mb-3 font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
            {t("hero.eyebrow")}
          </p>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h1 className="font-heading text-3xl text-brand-black md:text-4xl lg:text-5xl">
            {t("hero.title")}
          </h1>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="mt-4 max-w-lg font-body text-base leading-relaxed text-brand-black/70 md:text-lg">
            {t("hero.description")}
          </p>
        </FadeIn>
        <FadeIn delay={0.22}>
          <ul className="mt-5 flex flex-wrap gap-2">
            <li className="rounded-full bg-white px-3 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-brand-black/70 ring-1 ring-brand-pink-light">
              {t("home.pointDigital")}
            </li>
            <li className="rounded-full bg-white px-3 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-brand-black/70 ring-1 ring-brand-pink-light">
              {t("home.pointPhysical")}
            </li>
            <li className="rounded-full bg-white px-3 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-brand-black/70 ring-1 ring-brand-pink-light">
              {t("home.pointCustom")}
            </li>
          </ul>
        </FadeIn>
      </div>
      <FadeIn delay={0.12} direction="left">
        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-sm sm:aspect-[4/3]">
          <PremiumImage
            src={HERO_IMAGE}
            alt={t("hero.title")}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-[center_42%]"
          />
        </div>
      </FadeIn>
    </div>
  );
}

export function ShopOverview({
  products,
  onOpen,
  banner,
}: {
  products: ShopCatalogProduct[];
  onOpen: (tab: ShopPrimaryTabId) => void;
  banner?: ReactNode;
}) {
  const t = useTranslations("shopPage");

  return (
    <div>
      {banner ? <div className="mb-8">{banner}</div> : null}

      <div id="shop-categories">
        <h2 className="mb-4 font-heading text-2xl text-brand-black md:mb-5 md:text-4xl">
          {t("home.spotlight")}
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {FEATURED.map((tabId) => (
            <OverlayTile
              key={tabId}
              tabId={tabId}
              products={products}
              onOpen={onOpen}
              size="featured"
            />
          ))}
        </div>

        <h2 className="mb-4 mt-10 font-heading text-2xl text-brand-black md:mb-5 md:mt-12 md:text-4xl">
          {t("home.more")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {SECONDARY.map((tabId) => (
            <OverlayTile
              key={tabId}
              tabId={tabId}
              products={products}
              onOpen={onOpen}
              size="standard"
            />
          ))}
        </div>

        <div className="mt-5 grid">
          <OverlayTile
            tabId="madeToOrder"
            products={products}
            onOpen={onOpen}
            size="wide"
          />
        </div>
      </div>
    </div>
  );
}
