import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { ContactForm, ContactInfo } from "@/components/sections/ContactForm";
import { FadeIn } from "@/components/animations/FadeIn";
import { createMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tBrand = await getTranslations({ locale, namespace: "brand" });

  return createMetadata({
    title: t("contact.title"),
    description: t("contact.description"),
    locale,
    path: "/contact",
    brandName: tBrand("name"),
    tagline: tBrand("tagline"),
    keywords: t("keywords"),
  });
}

export default async function ContactPage() {
  const t = await getTranslations("contactPage");

  return (
    <>
      <section className="relative flex min-h-[40vh] items-center overflow-hidden pt-24">
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
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
            <FadeIn>
              <ContactForm />
            </FadeIn>
            <ContactInfo />
          </div>
        </Container>
      </Section>
    </>
  );
}
