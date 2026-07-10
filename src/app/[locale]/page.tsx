import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesOverviewSection } from "@/components/sections/ServicesOverviewSection";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { AboutPreviewSection } from "@/components/sections/AboutPreviewSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { createMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tBrand = await getTranslations({ locale, namespace: "brand" });

  return {
    ...createMetadata({
      title: t("home.title"),
      description: t("home.description"),
      locale,
      path: "/",
      brandName: tBrand("name"),
      tagline: tBrand("tagline"),
      keywords: t("keywords"),
    }),
    icons: { icon: "/favicon.svg" },
  };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PatternBackground variant="divider" opacity={0.06} />
      <ServicesOverviewSection />
      <FeaturedWorkSection />
      <AboutPreviewSection />
      <TestimonialsSection />
      <ProcessSection />
      <ContactCTASection />
    </>
  );
}
