import { SEO } from "@/components/SEO";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { ShopCatalog } from "@/components/sections/ShopCatalog";
import { useLocale, useTranslations } from "@/i18n/context";

export default function ShopPage() {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");

  return (
    <>
      <SEO
        title={tMeta("shop.title")}
        description={tMeta("shop.description")}
        locale={locale}
        path="/shop"
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
      />
      <ShopCatalog />
      <ContactCTASection />
    </>
  );
}
