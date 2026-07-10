import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const LOCALES = ["en", "nl"];

const FILES = [
  "global.yaml",
  "home.yaml",
  "about.yaml",
  "services.yaml",
  "portfolio.yaml",
  "shop.yaml",
  "contact.yaml",
  "shared.yaml",
] ;

function splitContent(locale) {
  const jsonPath = path.join(process.cwd(), "messages", `${locale}.json`);
  const content = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const splits = {
    "global.yaml": {
      metadata: content.metadata,
      brand: content.brand,
      nav: content.nav,
      language: content.language,
      footer: content.footer,
      cta: content.cta,
      contactServices: content.contactServices,
      schema: content.schema,
      notFound: content.notFound,
    },
    "home.yaml": { home: content.home },
    "about.yaml": { about: content.about },
    "services.yaml": {
      servicesPage: content.servicesPage,
      services: content.services,
    },
    "portfolio.yaml": { portfolioPage: content.portfolioPage, portfolio: content.portfolio },
    "shop.yaml": { shopPage: content.shopPage, shop: content.shop },
    "contact.yaml": { contactPage: content.contactPage },
    "shared.yaml": {
      testimonials: content.testimonials,
      process: content.process,
      faq: content.faq,
    },
  };

  const localeDir = path.join(process.cwd(), "content", locale);
  fs.mkdirSync(localeDir, { recursive: true });

  for (const file of FILES) {
    const filePath = path.join(localeDir, file);
    fs.writeFileSync(filePath, yaml.dump(splits[file], { lineWidth: 120, noRefs: true }));
    console.log(`Created ${filePath}`);
  }
}

for (const locale of LOCALES) {
  splitContent(locale);
}

console.log("Content migration complete.");
