import type { Metadata } from "next";
import { BRAND, SITE_URL } from "./constants";

interface PageSEO {
  title: string;
  description: string;
  locale: string;
  path?: string;
  image?: string;
  brandName: string;
  tagline: string;
  keywords: string;
}

export function createMetadata({
  title,
  description,
  locale,
  path = "",
  image = "/images/og-image.jpg",
  brandName,
  tagline,
  keywords,
}: PageSEO): Metadata {
  const localePath = path === "" || path === "/" ? `/${locale}` : `/${locale}${path}`;
  const url = `${SITE_URL}${localePath}`;
  const isHome = path === "" || path === "/";
  const fullTitle = isHome ? `${brandName} | ${tagline}` : `${title} | ${brandName}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.split(", "),
    authors: [{ name: brandName }],
    creator: brandName,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en${path === "/" ? "" : path}`,
        nl: `${SITE_URL}/nl${path === "/" ? "" : path}`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "nl" ? "nl_NL" : "en_NL",
      url,
      siteName: brandName,
      title: fullTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${brandName} - ${tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function createLocalBusinessSchema(
  brandName: string,
  tagline: string,
  description: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: brandName,
    description,
    url: SITE_URL,
    image: `${SITE_URL}/images/og-image.jpg`,
    slogan: tagline,
    email: BRAND.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: "NL",
    },
    sameAs: [BRAND.instagram],
    priceRange: "€€",
    knowsAbout: [
      "Custom Embroidery",
      "Live Embroidery Events",
      "Corporate Embroidery",
      "Embroidery Workshops",
      "Personalised Gifts",
    ],
  };
}
