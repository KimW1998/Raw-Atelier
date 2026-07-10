import { SEO } from "@/components/SEO";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { ShopCatalog } from "@/components/sections/ShopCatalog";
import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/ui/Container";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { useLocale, useTranslations } from "@/i18n/context";

export default function ShopPage() {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");
  const t = useTranslations("shopPage");

  return (
    <>
      <SEO
        title={tMeta("shop.title")}
        description={tMeta("shop.description")}
        locale={locale}
        path="/shop"
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
      />
      <section className="relative flex min-h-[45vh] items-center overflow-hidden pt-24">
        <PatternBackground variant="hero" />
        <Container className="relative z-10 py-12 text-center">
          <FadeIn>
            <p className="mb-4 font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
              {t("hero.eyebrow")}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-heading text-4xl text-brand-black md:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg leading-relaxed text-brand-black/70">
              {t("hero.description")}
            </p>
          </FadeIn>
        </Container>
      </section>

      <ShopCatalog />
      <ContactCTASection />
    </>
  );
}
