import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/i18n/context";
import { Link } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { StaggerChildren, StaggerItem } from "@/components/animations/FadeIn";
import { PORTFOLIO_ITEMS } from "@/lib/constants";

export function FeaturedWorkSection() {
  const t = useTranslations("home");
  const tPortfolio = useTranslations("portfolio");
  const tCta = useTranslations("cta");
  const featured = PORTFOLIO_ITEMS.slice(0, 3);

  return (
    <Section background="pink" spacing="compact">
      <Container>
        <SectionHeading
          eyebrow={t("featured.eyebrow")}
          title={t("featured.title")}
          description={t("featured.description")}
          spacing="compact"
          size="compact"
        />

        <StaggerChildren className="grid gap-4 sm:grid-cols-3">
          {featured.map((item) => (
            <StaggerItem key={item.id}>
              <Link
                href="/portfolio"
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <PremiumImage
                  src={item.image}
                  alt={tPortfolio(`items.${item.id}.title`)}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="font-body text-xs font-semibold uppercase tracking-wider text-brand-pink">
                    {tPortfolio(`categories.${item.category}`)}
                  </span>
                  <h3 className="mt-1 font-heading text-xl text-white">
                    {tPortfolio(`items.${item.id}.title`)}
                  </h3>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <div className="mt-8 text-center">
          <Button href="/portfolio" variant="outline">
            {tCta("viewFullPortfolio")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Container>
    </Section>
  );
}
