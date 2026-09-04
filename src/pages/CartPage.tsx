import { SEO } from "@/components/SEO";
import { FadeIn } from "@/components/animations/FadeIn";
import { CartLines } from "@/components/shop/CartLines";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { useLocale, useTranslations } from "@/i18n/context";
import { getCartProducts, useCart } from "@/lib/cart";
import { useCheckout } from "@/lib/checkout";
import {
  cartHasPhysical,
  cartSubtotalCents,
  formatEuro,
} from "@/lib/shop";
import { useVacation } from "@/lib/vacation";

export default function CartPage() {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");
  const t = useTranslations("shop");
  const { items, clear } = useCart();
  const { checkout, status, error } = useCheckout();
  const lines = getCartProducts(items);
  const subtotal = cartSubtotalCents(lines);
  const hasPhysical = cartHasPhysical(lines);
  const { pausePhysical } = useVacation();
  const checkoutBlocked = pausePhysical && hasPhysical;

  return (
    <>
      <SEO
        title={t("cart.pageTitle")}
        description={tMeta("shop.description")}
        locale={locale}
        path="/shop/cart"
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
      />

      <section className="relative overflow-hidden pt-28 md:pt-32">
        <PatternBackground variant="hero" />
        <Container className="relative z-10 pb-6">
          <FadeIn>
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
              {t("cart.eyebrow")}
            </p>
            <h1 className="mt-3 font-heading text-4xl text-brand-black md:text-5xl">
              {t("cart.pageTitle")}
            </h1>
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20 pt-6 md:pb-28">
        <Container>
          {lines.length === 0 ? (
            <FadeIn>
              <div className="rounded-3xl bg-white px-8 py-16 text-center shadow-sm">
                <p className="font-body text-base text-brand-black/70">
                  {t("cart.empty")}
                </p>
                <Button href="/shop" variant="primary" className="mt-8">
                  {t("cart.continue")}
                </Button>
              </div>
            </FadeIn>
          ) : (
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:gap-14">
              <FadeIn>
                <CartLines size="page" />
              </FadeIn>
              <FadeIn delay={0.1}>
                <aside className="rounded-3xl bg-white p-6 shadow-sm md:p-8 lg:sticky lg:top-28">
                  <h2 className="font-heading text-2xl text-brand-black">
                    {t("cart.summary")}
                  </h2>
                  <div className="mt-6 flex items-center justify-between font-body text-base">
                    <span className="text-brand-black/70">{t("cart.subtotal")}</span>
                    <span className="font-semibold text-brand-black">
                      {formatEuro(subtotal, locale)}
                    </span>
                  </div>
                  <p className="mt-4 font-body text-sm leading-relaxed text-brand-black/60">
                    {checkoutBlocked
                      ? t("physicalPausedNote")
                      : hasPhysical
                        ? t("cart.shippingNote")
                        : t("cart.digitalOnlyNote")}
                  </p>
                  {error && (
                    <p className="mt-4 font-body text-sm text-red-700">{error}</p>
                  )}
                  <Button
                    variant="primary"
                    size="large"
                    className="mt-6 w-full"
                    disabled={status === "loading" || checkoutBlocked}
                    onClick={() => {
                      void checkout();
                    }}
                  >
                    {status === "loading" ? t("cart.redirecting") : t("cart.checkout")}
                  </Button>
                  <Button href="/shop" variant="outline" className="mt-3 w-full">
                    {t("cart.continue")}
                  </Button>
                  <button
                    type="button"
                    className="mt-4 w-full font-body text-sm text-brand-black/50 hover:text-brand-black"
                    onClick={clear}
                  >
                    {t("cart.clear")}
                  </button>
                </aside>
              </FadeIn>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
