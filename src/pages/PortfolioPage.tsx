import { SEO } from "@/components/SEO";
import { PortfolioGallery } from "@/components/sections/PortfolioGallery";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { useLocale, useTranslations } from "@/i18n/context";

export default function PortfolioPage() {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");

  return (
    <>
      <SEO
        title={tMeta("portfolio.title")}
        description={tMeta("portfolio.description")}
        locale={locale}
        path="/portfolio"
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
      />
      <PortfolioGallery />
      <ContactCTASection />
    </>
  );
}
