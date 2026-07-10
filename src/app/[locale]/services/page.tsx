import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ServicesHero, ServiceDetail } from "@/components/sections/ServiceDetail";
import { ContactCTASection } from "@/components/sections/ContactCTASection";
import { SERVICES_DATA } from "@/lib/constants";
import { createMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tBrand = await getTranslations({ locale, namespace: "brand" });

  return createMetadata({
    title: t("services.title"),
    description: t("services.description"),
    locale,
    path: "/services",
    brandName: tBrand("name"),
    tagline: tBrand("tagline"),
    keywords: t("keywords"),
  });
}

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      {SERVICES_DATA.map((service, index) => (
        <ServiceDetail key={service.id} service={service} index={index} />
      ))}
      <ContactCTASection />
    </>
  );
}
