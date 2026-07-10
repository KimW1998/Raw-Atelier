import { SEO } from "@/components/SEO";
import { ServicesHero, ServiceDetail } from "@/components/sections/ServiceDetail";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { SERVICES_DATA } from "@/lib/constants";
import { useLocale, useTranslations } from "@/i18n/context";

export default function ServicesPage() {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");

  return (
    <>
      <SEO
        title={tMeta("services.title")}
        description={tMeta("services.description")}
        locale={locale}
        path="/services"
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
      />
      <ServicesHero />
      {SERVICES_DATA.map((service, index) => (
        <ServiceDetail key={service.id} service={service} index={index} />
      ))}
      <ContactCTASection />
    </>
  );
}
