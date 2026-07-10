import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerChildren, StaggerItem } from "@/components/animations/FadeIn";
import { TESTIMONIAL_IDS } from "@/lib/constants";

export async function TestimonialsSection() {
  const t = await getTranslations("home");
  const tTestimonials = await getTranslations("testimonials");

  return (
    <Section background="pink">
      <Container>
        <SectionHeading
          eyebrow={t("testimonials.eyebrow")}
          title={t("testimonials.title")}
          description={t("testimonials.description")}
        />

        <StaggerChildren className="grid gap-8 md:grid-cols-3">
          {TESTIMONIAL_IDS.map((id) => {
            const company = tTestimonials(`${id}.company`);
            return (
              <StaggerItem key={id}>
                <blockquote className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-sm">
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
