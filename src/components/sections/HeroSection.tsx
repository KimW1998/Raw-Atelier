import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/i18n/context";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { FadeIn } from "@/components/animations/FadeIn";

export function HeroSection() {
  const t = useTranslations("home");
  const tBrand = useTranslations("brand");
  const tCta = useTranslations("cta");

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <PatternBackground variant="hero" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-offwhite/30 via-transparent to-brand-offwhite" />

      <Container className="relative z-10 pt-28 pb-16 md:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <FadeIn delay={0.1}>
              <p className="mb-4 font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
                {tBrand("name")}
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="font-heading text-4xl leading-[1.1] text-brand-black sm:text-5xl md:text-6xl lg:text-7xl">
                {t("hero.headline")}
              </h1>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-brand-black/70">
                {t("hero.intro")}
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href="/contact" variant="primary" size="large">
                  {tCta("workWithMe")}
                </Button>
                <Button href="/portfolio" variant="outline" size="large">
                  {tCta("viewPortfolio")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3} direction="left">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl shadow-brand-pink/20">
              <PremiumImage
                src="/images/hero-main.jpg"
                alt={`Machine embroidery at ${tBrand("name")} studio`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/20 to-transparent" />
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
