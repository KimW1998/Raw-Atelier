import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { FAQSection } from "@/components/sections/FAQSection";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { FadeIn } from "@/components/animations/FadeIn";
import { createMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tBrand = await getTranslations({ locale, namespace: "brand" });

  return createMetadata({
    title: t("about.title"),
    description: t("about.description"),
    locale,
    path: "/about",
    brandName: tBrand("name"),
    tagline: tBrand("tagline"),
    keywords: t("keywords"),
  });
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const tNav = await getTranslations("nav");
  const tBrand = await getTranslations("brand");

  const whyItems = ["quality", "story", "connection"] as const;
  const studioImages = [
    "/images/about-studio-1.jpg",
    "/images/about-studio-2.jpg",
    "/images/about-studio-3.jpg",
  ];

  return (
    <>
      <section className="relative flex min-h-[50vh] items-center overflow-hidden pt-24">
        <PatternBackground variant="hero" opacity={0.1} />
        <Container className="relative z-10 py-16 text-center">
          <FadeIn>
            <p className="mb-4 font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
              {tNav("about")}
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
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                eyebrow={t("story.eyebrow")}
                title={t("story.title")}
                align="left"
              />
              <FadeIn>
                <p className="font-body text-base leading-relaxed text-brand-black/70">
                  {t("story.paragraph1")}
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="mt-4 font-body text-base leading-relaxed text-brand-black/70">
                  {t("story.paragraph2")}
                </p>
              </FadeIn>
            </div>
            <FadeIn direction="left">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <PremiumImage
                  src="/images/about-story.jpg"
                  alt={t("story.title")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>

      <Section background="pink">
        <Container size="narrow">
          <SectionHeading
            eyebrow={t("philosophy.eyebrow")}
            title={t("philosophy.title")}
            description={t("philosophy.description")}
          />
          <FadeIn>
            <blockquote className="text-center">
              <p className="font-heading text-2xl md:text-3xl italic leading-relaxed text-brand-black">
                &ldquo;{t("philosophy.quote")}&rdquo;
              </p>
            </blockquote>
          </FadeIn>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow={t("why.eyebrow")}
            title={t("why.title")}
          />
          <div className="grid gap-8 md:grid-cols-3">
            {whyItems.map((key, i) => (
              <FadeIn key={key} delay={i * 0.1}>
                <div className="rounded-2xl bg-white p-8 shadow-sm">
                  <h3 className="font-heading text-xl text-brand-black">
                    {t(`why.items.${key}.title`)}
                  </h3>
                  <p className="mt-4 font-body text-sm leading-relaxed text-brand-black/70">
                    {t(`why.items.${key}.description`)}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="pink">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <FadeIn direction="right">
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <PremiumImage
                  src="/images/about-needle.jpg"
                  alt={t("needle.title")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>
            <div>
              <SectionHeading
                eyebrow={t("needle.eyebrow")}
                title={t("needle.title")}
                align="left"
              />
              <FadeIn>
                <p className="font-body text-base leading-relaxed text-brand-black/70">
                  {t("needle.paragraph1")}
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="mt-4 font-body text-base leading-relaxed text-brand-black/70">
                  {t("needle.paragraph2")}
                </p>
              </FadeIn>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studioImages.map((src, i) => (
              <FadeIn key={src} delay={i * 0.1}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <PremiumImage
                    src={src}
                    alt={`${tBrand("name")} ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="pink">
        <Container size="narrow">
          <SectionHeading
            eyebrow={t("faq.eyebrow")}
            title={t("faq.title")}
            description={t("faq.description")}
          />
          <FAQSection />
        </Container>
      </Section>

      <ContactCTASection />
    </>
  );
}
