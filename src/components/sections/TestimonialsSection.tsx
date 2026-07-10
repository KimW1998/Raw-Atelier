import { useTranslations } from "@/i18n/context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerChildren, StaggerItem } from "@/components/animations/FadeIn";
import { TESTIMONIAL_IDS } from "@/lib/constants";

export function TestimonialsSection() {
  const t = useTranslations("home");
  const tTestimonials = useTranslations("testimonials");

  return (
    <Section background="pink" spacing="compact" className="pb-10 md:pb-12">
      <Container>
        <SectionHeading
          eyebrow={t("testimonials.eyebrow")}
          title={t("testimonials.title")}
          description={t("testimonials.description")}
          spacing="compact"
          size="compact"
        />

        <StaggerChildren className="grid gap-6 md:grid-cols-3">
          {TESTIMONIAL_IDS.map((id) => {
            const company = tTestimonials(`${id}.company`);
            return (
              <StaggerItem key={id}>
                <blockquote className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm">
                  <p className="flex-1 font-body text-base leading-relaxed text-brand-black/80">
                    &ldquo;{tTestimonials(`${id}.quote`)}&rdquo;
                  </p>
                  <footer className="mt-6 border-t border-brand-pink-light pt-6">
                    <cite className="not-italic">
                      <span className="font-body text-sm font-semibold text-brand-black">
                        {tTestimonials(`${id}.author`)}
                      </span>
                      <span className="mt-1 block font-body text-xs text-brand-black/50">
                        {tTestimonials(`${id}.role`)}
                        {company && ` · ${company}`}
                      </span>
                    </cite>
                  </footer>
                </blockquote>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </Container>
    </Section>
  );
}
