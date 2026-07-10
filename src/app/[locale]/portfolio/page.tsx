import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PortfolioGallery } from "@/components/sections/PortfolioGallery";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { createMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tBrand = await getTranslations({ locale, namespace: "brand" });

  return createMetadata({
    title: t("portfolio.title"),
    description: t("portfolio.description"),
    locale,
    path: "/portfolio",
    brandName: tBrand("name"),
    tagline: tBrand("tagline"),
    keywords: t("keywords"),
  });
}

export default function PortfolioPage() {
  return (
    <>
      <PortfolioGallery />
      <ContactCTASection />
    </>
  );
}
