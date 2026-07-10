import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/constants";

interface SEOProps {
  title: string;
  description: string;
  locale: string;
  path?: string;
  brandName: string;
  tagline: string;
  keywords: string;
}

export function SEO({
  title,
  description,
  locale,
  path = "/",
  brandName,
  tagline,
  keywords,
}: SEOProps) {
  const localePath = path === "/" ? `/${locale}` : `/${locale}${path}`;
  const url = `${SITE_URL}${localePath}`;
  const isHome = path === "/";
  const fullTitle = isHome ? `${brandName} | ${tagline}` : `${title} | ${brandName}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: brandName,
    description: tagline,
    url: SITE_URL,
    slogan: tagline,
  };

  return (
    <Helmet>
      <html lang={locale} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en${path === "/" ? "" : path}`} />
      <link rel="alternate" hrefLang="nl" href={`${SITE_URL}/nl${path === "/" ? "" : path}`} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={locale === "nl" ? "nl_NL" : "en_NL"} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={brandName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
