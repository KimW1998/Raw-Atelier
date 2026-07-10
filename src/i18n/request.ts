import { getRequestConfig } from "next-intl/server";
import { loadContent } from "@/lib/content";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "nl")) {
    locale = routing.defaultLocale;
  }

  const messages = await loadContent(locale);

  return {
    locale,
    messages,
  };
});
