import { SEO } from "@/components/SEO";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { useLocale, useTranslations } from "@/i18n/context";

function faqItems(raw: unknown): { question: string; answer: string }[] {
  if (!raw || typeof raw !== "object") return [];
  return Object.entries(raw as Record<string, { question?: unknown; answer?: unknown }>)
    .sort(([a], [b]) => Number(a) - Number(b))
    .flatMap(([, item]) => {
      if (typeof item?.question !== "string" || typeof item?.answer !== "string") return [];
      return [{ question: item.question, answer: item.answer }];
    });
}

export default function FaqPage() {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");
  const t = useTranslations("faqPage");
  const items = faqItems(t.raw("items"));

  return (
    <>
      <SEO
        title={tMeta("faq.title")}
        description={tMeta("faq.description")}
        locale={locale}
        path="/faq"
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
      />
      <section className="relative flex min-h-[36vh] items-center overflow-hidden pt-24">
        <PatternBackground variant="hero" />
        <Container className="relative z-10 py-12 text-center md:py-16">
          <FadeIn>
            <p className="mb-4 font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
              {t("eyebrow")}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-heading text-4xl text-brand-black md:text-5xl">
              {t("title")}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg leading-relaxed text-brand-black/70">
              {t("description")}
            </p>
          </FadeIn>
        </Container>
      </section>

      <Section spacing="compact">
        <Container size="narrow">
          <FAQSection items={items} />
        </Container>
      </Section>

      <ContactCTASection />
    </>
  );
}
