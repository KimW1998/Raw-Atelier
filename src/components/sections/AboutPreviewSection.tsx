import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/i18n/context";
import { Link } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { FadeIn } from "@/components/animations/FadeIn";

export function AboutPreviewSection() {
  const t = useTranslations("home");
  const tBrand = useTranslations("brand");
  const tCta = useTranslations("cta");

  return (
    <Section spacing="compact">
      <PatternBackground variant="section" opacity={0.05} />
      <Container className="relative">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <FadeIn direction="right">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <PremiumImage
                src="/images/about-studio.jpg"
                alt={`Machine embroidery at ${tBrand("name")} studio`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </FadeIn>

          <div>
            <FadeIn>
              <p className="mb-3 font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
                {t("about.eyebrow")}
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-heading text-2xl text-brand-black md:text-3xl">
                {t("about.title")}
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-4 font-body text-base leading-relaxed text-brand-black/70">
                {t("about.paragraph1")}
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="mt-3 font-body text-sm leading-relaxed text-brand-black/70">
                {t("about.paragraph2")}
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <Link
                href="/about"
                className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-brand-black transition-colors hover:text-brand-pink-accent"
              >
                {tCta("readMyStory")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </Container>
    </Section>
  );
}
