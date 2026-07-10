import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesOverviewSection } from "@/components/sections/ServicesOverviewSection";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { AboutPreviewSection } from "@/components/sections/AboutPreviewSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { useLocale, useTranslations } from "@/i18n/context";

export default function HomePage() {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");

  return (
    <>
      <SEO
        title={tMeta("home.title")}
        description={tMeta("home.description")}
        locale={locale}
        path="/"
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
      />
      <HeroSection />
      <PatternBackground variant="divider" />
      <ServicesOverviewSection />
      <FeaturedWorkSection />
      <AboutPreviewSection />
      <TestimonialsSection />
      <ProcessSection />
      <ContactCTASection />
    </>
  );
}
