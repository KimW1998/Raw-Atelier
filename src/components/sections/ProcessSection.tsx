import { useTranslations } from "@/i18n/context";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerChildren, StaggerItem } from "@/components/animations/FadeIn";
import { PROCESS_IDS } from "@/lib/constants";

export function ProcessSection() {
  const t = useTranslations("home");
  const tProcess = useTranslations("process");

  return (
    <Section>
      <PatternBackground variant="seamless" />
      <Container className="relative">
        <SectionHeading
          eyebrow={t("process.eyebrow")}
          title={t("process.title")}
          description={t("process.description")}
        />

        <StaggerChildren className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_IDS.map((id) => (
            <StaggerItem key={id}>
              <div className="relative">
                <span className="font-heading text-5xl text-brand-pink-light">
                  {id}
                </span>
                <h3 className="mt-2 font-heading text-xl text-brand-black">
                  {tProcess(`${id}.title`)}
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-brand-black/60">
                  {tProcess(`${id}.description`)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </Container>
    </Section>
  );
}
