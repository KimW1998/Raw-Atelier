import { useLocale, useTranslations } from "@/i18n/context";
import { formatEuro, getListedPrice, type ShopCatalogProduct } from "@/lib/shop";
import { salePercentForProduct, useSale } from "@/lib/sale";
import { cn } from "@/lib/utils";

export function SaleBadge({
  product,
  className,
}: {
  product: ShopCatalogProduct;
  className?: string;
}) {
  const t = useTranslations("shop");
  const { showBadges } = useSale();
  const percent = salePercentForProduct(product);
  if (!showBadges || percent <= 0) return null;

  return (
    <span
      className={cn(
        "rounded-full bg-brand-pink-accent px-3 py-1 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white",
        className,
      )}
    >
      {t("sale.badge", { percent: String(percent) })}
    </span>
  );
}

export function SalePrice({
  cents,
  originalCents,
  salePercent,
  className,
  size = "card",
}: {
  cents: number;
  originalCents?: number;
  salePercent?: number;
  className?: string;
  size?: "card" | "page";
}) {
  const locale = useLocale();
  const onSale = (salePercent ?? 0) > 0 && (originalCents ?? cents) > cents;
  const priceClass = size === "page" ? "font-heading text-2xl" : "font-body text-sm font-semibold";

  return (
    <p className={cn("text-brand-pink-accent", className)}>
      {onSale && originalCents != null ? (
        <span className="mr-2 font-body text-sm font-normal text-brand-black/40 line-through">
          {formatEuro(originalCents, locale)}
        </span>
      ) : null}
      <span className={priceClass}>{formatEuro(cents, locale)}</span>
    </p>
  );
}

export function ListedSalePrice({
  product,
  className,
  size = "card",
}: {
  product: ShopCatalogProduct;
  className?: string;
  size?: "card" | "page";
}) {
  const t = useTranslations("shop");
  const listed = getListedPrice(product);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      {listed.from ? (
        <span className="font-body text-xs font-semibold text-brand-black/45">{t("sale.from")}</span>
      ) : null}
      <SalePrice
        cents={listed.cents}
        originalCents={listed.originalCents}
        salePercent={listed.salePercent}
        size={size}
      />
    </div>
  );
}
