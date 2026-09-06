import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "@/i18n/context";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { getCartProducts, useCart } from "@/lib/cart";
import {
  bundleSize,
  cartLineSummary,
  cartLineUnitCents,
  formatEuro,
  getProductHref,
  getProductName,
} from "@/lib/shop";
import { cn } from "@/lib/utils";

export function CartLines({ size = "compact" }: { size?: "compact" | "page" }) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const { items, setQuantity, removeItem } = useCart();
  const lines = getCartProducts(items);
  const isPage = size === "page";

  if (lines.length === 0) {
    return (
      <p className="font-body text-sm text-brand-black/60 md:text-base">
        {t("cart.empty")}
      </p>
    );
  }

  return (
    <ul className={cn("space-y-4", isPage && "space-y-5")}>
      {lines.map(({ item, product }) => {
        const unit = cartLineUnitCents(product, item.selections);
        const summary = cartLineSummary(product, item.selections, locale);
        const pack = bundleSize(product, item.selections);

        return (
          <li
            key={item.lineId}
            className={cn(
              "flex gap-3 rounded-2xl bg-white p-3 shadow-sm",
              isPage && "gap-5 p-4 md:p-5",
            )}
          >
            <Link
              href={getProductHref(product.id)}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-xl",
                isPage ? "h-28 w-28 md:h-32 md:w-32" : "h-20 w-20",
              )}
            >
              <PremiumImage
                src={product.image}
                alt={getProductName(product, locale)}
                fill
                sizes={isPage ? "128px" : "80px"}
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={getProductHref(product.id)}>
                <p
                  className={cn(
                    "font-heading text-brand-black",
                    isPage ? "text-xl" : "text-base",
                  )}
                >
                  {getProductName(product, locale)}
                </p>
              </Link>
              <p className="font-body text-sm font-semibold text-brand-pink-accent">
                {formatEuro(unit, locale)}
              </p>
              {summary.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {summary.map((line) => (
                    <li key={line} className="font-body text-xs leading-relaxed text-brand-black/55">
                      {line}
                    </li>
                  ))}
                </ul>
              )}
              {isPage && (
                <p className="mt-1 font-body text-sm text-brand-black/50">
                  {formatEuro(unit * item.quantity, locale)}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-pink-light"
                  onClick={() => setQuantity(item.lineId, item.quantity - 1)}
                  aria-label={t("cart.decrease")}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-6 text-center font-body text-sm font-semibold">
                  {pack > 1 ? `${item.quantity} × ${pack}` : item.quantity}
                </span>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-pink-light"
                  onClick={() => setQuantity(item.lineId, item.quantity + 1)}
                  aria-label={t("cart.increase")}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="ml-auto text-brand-black/50 hover:text-brand-black"
                  onClick={() => removeItem(item.lineId)}
                  aria-label={t("cart.remove")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
