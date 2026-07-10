import { SEO } from "@/components/SEO";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/animations/FadeIn";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { BRAND, SHOP_PRODUCT_IDS, SHOP_PRODUCT_IMAGES } from "@/lib/constants";
import { useLocale, useTranslations } from "@/i18n/context";
import { ExternalLink, ShoppingBag } from "lucide-react";

export default function ShopPage() {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");
  const t = useTranslations("shopPage");
  const tShop = useTranslations("shop");
  const tCta = useTranslations("cta");

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
      <section className="relative flex min-h-[50vh] items-center overflow-hidden pt-24">
        <PatternBackground variant="hero" opacity={0.1} />
        <Container className="relative z-10 py-16 text-center">
          <FadeIn>
            <p className="mb-4 font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
              {t("hero.eyebrow")}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-brand-black">
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

      <Section>
        <Container>
          <SectionHeading
            eyebrow={t("featured.eyebrow")}
            title={t("featured.title")}
            description={t("featured.description")}
          />

          <StaggerChildren className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SHOP_PRODUCT_IDS.map((id) => (
              <StaggerItem key={id}>
                <div className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-pink/10">
                  <div className="relative aspect-square overflow-hidden">
                    <PremiumImage
                      src={SHOP_PRODUCT_IMAGES[id]}
                      alt={tShop(`products.${id}.name`)}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-lg text-brand-black">
                      {tShop(`products.${id}.name`)}
                    </h3>
                    <p className="mt-1 font-body text-sm font-semibold text-brand-pink-accent">
                      {tShop(`products.${id}.price`)}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </Container>
      </Section>

      <Section background="pink">
        <Container size="narrow" className="text-center">
          <FadeIn>
            <ShoppingBag className="mx-auto h-12 w-12 text-brand-pink-accent" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="mt-6 font-heading text-3xl md:text-4xl text-brand-black">
              {t("visit.title")}
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mx-auto mt-4 max-w-lg font-body text-base leading-relaxed text-brand-black/70">
              {t("visit.description")}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href={BRAND.shopUrl} variant="primary" size="large" external>
                {tCta("shopNow")}
              </Button>
              <Button href="/contact" variant="outline" size="large">
                {tCta("customOrder")}
              </Button>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="mt-6 flex items-center justify-center gap-2 font-body text-xs text-brand-black/50">
              <ExternalLink className="h-3 w-3" />
              {t("visit.externalNote")}
            </p>
          </FadeIn>
        </Container>
      </Section>

      <ContactCTASection />
    </>
  );
}
