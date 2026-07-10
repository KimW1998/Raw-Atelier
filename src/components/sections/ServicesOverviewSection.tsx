import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/i18n/context";
import { Link } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { StaggerChildren, StaggerItem } from "@/components/animations/FadeIn";
import { SERVICES_DATA } from "@/lib/constants";

export function ServicesOverviewSection() {
  const t = useTranslations("home");
  const tServices = useTranslations("services");
  const tCta = useTranslations("cta");

  return (
    <Section id="services" spacing="compact">
      <Container>
        <SectionHeading
          eyebrow={t("services.eyebrow")}
          title={t("services.title")}
          description={t("services.description")}
          spacing="compact"
          size="compact"
        />

        <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES_DATA.map((service) => (
            <StaggerItem key={service.id}>
              <Link
                href={`/services#${service.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-pink/10"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <PremiumImage
                    src={service.image}
                    alt={tServices(`${service.id}.title`)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <BrandIcon
                    src={service.icon}
                    alt=""
                    size="sm"
                    className={service.iconClassName.card}
                  />
                  <h3 className="font-heading text-xl text-brand-black">
                    {tServices(`${service.id}.title`)}
                  </h3>
                  <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-brand-black/60">
                    {tServices(`${service.id}.shortDescription`)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 font-body text-sm font-semibold text-brand-pink-accent transition-colors group-hover:text-brand-black">
                    {tCta("learnMore")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </Container>
    </Section>
  );
}
