import { useEffect } from "react";
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

const JSON_LD_ID = "raw-atelier-json-ld";

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string
) {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    if (hreflang) {
      element.setAttribute("hreflang", hreflang);
    }
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

function upsertJsonLd(data: object) {
  let element = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;

  if (!element) {
    element = document.createElement("script");
    element.id = JSON_LD_ID;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
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

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: brandName,
      description: tagline,
      url: SITE_URL,
      slogan: tagline,
    };

    document.documentElement.lang = locale;
    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", keywords);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:locale", locale === "nl" ? "nl_NL" : "en_NL");
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", brandName);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);

    upsertLink("canonical", url);
    upsertLink("alternate", `${SITE_URL}/en${path === "/" ? "" : path}`, "en");
    upsertLink("alternate", `${SITE_URL}/nl${path === "/" ? "" : path}`, "nl");

    upsertJsonLd(schema);
  }, [brandName, description, fullTitle, keywords, locale, path, tagline, url]);

  return null;
}
