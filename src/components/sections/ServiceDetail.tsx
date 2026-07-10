import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { FadeIn } from "@/components/animations/FadeIn";
import { Check } from "lucide-react";
import { SERVICES_DATA } from "@/lib/constants";

type Service = (typeof SERVICES_DATA)[number];

interface ServiceDetailProps {
  service: Service;
  index: number;
}

export async function ServiceDetail({ service, index }: ServiceDetailProps) {
  const tServices = await getTranslations("services");
  const tPage = await getTranslations("servicesPage");
  const tCta = await getTranslations("cta");
  const isReversed = index % 2 !== 0;

  const title = tServices(`${service.id}.title`);
  const benefits = tServices.raw(`${service.id}.benefits`) as string[];
  const processSteps = tServices.raw(`${service.id}.process`) as string[];

  return (
    <Section
      id={service.id}
      background={index % 2 === 0 ? "default" : "pink"}
    >
      <Container>
        <div
          className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${
            isReversed ? "lg:[direction:rtl]" : ""
          }`}
        >
          <FadeIn direction={isReversed ? "left" : "right"}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:[direction:ltr]">
              <PremiumImage
                src={service.image}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </FadeIn>

          <div className="lg:[direction:ltr]">
            <FadeIn>
              <p className="mb-3 font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
                {tPage("serviceLabel")}
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-heading text-3xl md:text-4xl text-brand-black">
                {title}
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-6 font-body text-base leading-relaxed text-brand-black/70">
                {tServices(`${service.id}.description`)}
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h3 className="mt-8 font-heading text-xl text-brand-black">
                {tPage("benefits")}
              </h3>
              <ul className="mt-4 space-y-3">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 font-body text-sm text-brand-black/70"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink-accent" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.4}>
              <h3 className="mt-8 font-heading text-xl text-brand-black">
                {tPage("process")}
              </h3>
              <ol className="mt-4 space-y-3">
                {processSteps.map((step, i) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 font-body text-sm text-brand-black/70"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-pink-light font-body text-xs font-semibold text-brand-pink-accent">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </FadeIn>

            <FadeIn delay={0.5}>
              <Button href="/contact" variant="primary" className="mt-8">
                {tCta("enquireAbout", { service: title })}
              </Button>
            </FadeIn>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export async function ServicesHero() {
  const t = await getTranslations("servicesPage");

  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden pt-24">
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
  );
}
