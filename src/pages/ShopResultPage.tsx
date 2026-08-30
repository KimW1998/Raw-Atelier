import { SEO } from "@/components/SEO";
import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { useCart } from "@/lib/cart";
import { useEffect } from "react";
import { useLocale, useTranslations } from "@/i18n/context";

export default function ShopResultPage({
  variant,
}: {
  variant: "success" | "cancel";
}) {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");
  const t = useTranslations("shop");
  const { clear } = useCart();

  useEffect(() => {
    if (variant === "success") clear();
  }, [variant, clear]);

  const isSuccess = variant === "success";

  return (
    <>
      <SEO
        title={isSuccess ? t("result.successTitle") : t("result.cancelTitle")}
        description={tMeta("shop.description")}
        locale={locale}
        path={isSuccess ? "/shop/success" : "/shop/cancel"}
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
      />
      <section className="relative flex min-h-[50vh] items-center overflow-hidden pt-24">
        <PatternBackground variant="hero" />
        <Container className="relative z-10 py-16 text-center">
          <FadeIn>
            <h1 className="font-heading text-4xl text-brand-black md:text-5xl">
              {isSuccess ? t("result.successTitle") : t("result.cancelTitle")}
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl font-body text-lg leading-relaxed text-brand-black/70">
              {isSuccess
                ? t("result.successDescription")
                : t("result.cancelDescription")}
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/shop" variant="primary">
                {t("result.backToShop")}
              </Button>
              {isSuccess && (
                <Button href="/contact" variant="outline">
                  {t("result.contact")}
                </Button>
              )}
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
