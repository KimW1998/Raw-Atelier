import { ShoppingBag, X, Minus, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "@/i18n/context";
import { Button } from "@/components/ui/Button";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { getCartProducts, useCart } from "@/lib/cart";
import { useCheckout } from "@/lib/checkout";
import {
  cartHasPhysical,
  cartLineSummary,
  cartLineUnitCents,
  formatEuro,
  getProductName,
} from "@/lib/shop";
import { useVacation } from "@/lib/vacation";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const t = useTranslations("shop");
  const { count, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full text-brand-black transition-colors hover:text-brand-pink-accent",
        className,
      )}
      aria-label={t("cart.title")}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-pink-accent px-1 font-body text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

export function CartDrawer() {
  const t = useTranslations("shop");
  const locale = useLocale();
  const { items, isOpen, closeCart, setQuantity, removeItem, clear } = useCart();
  const { checkout, status, error } = useCheckout();
  const lines = getCartProducts(items);
  const { pausePhysical } = useVacation();
  const checkoutBlocked = pausePhysical && cartHasPhysical(lines);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label={t("cart.close")}
            className="fixed inset-0 z-[60] bg-brand-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-brand-offwhite shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-brand-pink-light px-5 py-4">
              <h2 id="cart-title" className="font-heading text-2xl text-brand-black">
                {t("cart.title")}
              </h2>
              <button
                type="button"
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-brand-pink-light"
                aria-label={t("cart.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <p className="font-body text-sm text-brand-black/60">{t("cart.empty")}</p>
              ) : (
                <ul className="space-y-4">
                  {lines.map(({ item, product }) => {
                    const summary = cartLineSummary(product, item.selections, locale);
                    return (
                      <li key={item.lineId} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                          <PremiumImage
                            src={product.image}
                            alt={getProductName(product, locale)}
                            fill
                            sizes="80px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-heading text-base text-brand-black">
                            {getProductName(product, locale)}
                          </p>
                          <p className="font-body text-sm text-brand-pink-accent">
                            {formatEuro(cartLineUnitCents(product, item.selections), locale)}
                          </p>
                          {summary.length > 0 && (
                            <ul className="mt-1 space-y-0.5">
                              {summary.map((line) => (
                                <li
                                  key={line}
                                  className="truncate font-body text-[11px] text-brand-black/50"
                                >
                                  {line}
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-pink-light"
                              onClick={() => setQuantity(item.lineId, item.quantity - 1)}
                              aria-label={t("cart.decrease")}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-6 text-center font-body text-sm">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-pink-light"
                              onClick={() => setQuantity(item.lineId, item.quantity + 1)}
                              aria-label={t("cart.increase")}
                            >
                              <Plus className="h-3 w-3" />
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
              )}
            </div>

            <div className="border-t border-brand-pink-light px-5 py-5">
              {checkoutBlocked && (
                <p className="mb-3 font-body text-sm text-brand-rose">{t("physicalPausedNote")}</p>
              )}
              {error && (
                <p className="mb-3 font-body text-sm text-red-700">{error}</p>
              )}
              <Button
                variant="primary"
                size="large"
                className="w-full"
                disabled={lines.length === 0 || status === "loading" || checkoutBlocked}
                onClick={() => {
                  void checkout();
                }}
              >
                {status === "loading" ? t("cart.redirecting") : t("cart.checkout")}
              </Button>
              {lines.length > 0 && (
                <button
                  type="button"
                  className="mt-3 w-full font-body text-sm text-brand-black/60 hover:text-brand-black"
                  onClick={clear}
                >
                  {t("cart.clear")}
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
