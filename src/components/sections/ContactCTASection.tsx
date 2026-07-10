import { useTranslations } from "@/i18n/context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animations/FadeIn";

export function ContactCTASection() {
  const t = useTranslations("cta");

  return (
    <Section background="dark">
      <PatternBackground variant="section" opacity={0.08} />
      <Container className="relative text-center">
        <FadeIn>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white">
            {t("readyTitle")}
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl font-body text-base md:text-lg leading-relaxed text-white/70">
            {t("readyDescription")}
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/contact" variant="secondary" size="large">
              {t("getInTouch")}
            </Button>
            <Button
              href="/services"
              variant="outline"
              size="large"
              className="border-white text-white hover:bg-white hover:text-brand-black"
            >
              {t("exploreServices")}
            </Button>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
