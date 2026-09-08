import { useLocale, useTranslations } from "@/i18n/context";
import {
  getSaleSettings,
  isSiteSaleActive,
  type SaleSettings,
} from "./sale-pricing";

export type { SaleSettings } from "./sale-pricing";
export {
  applySaleCents,
  clampSalePercent,
  getSaleSettings,
  isSaleWindowEnded,
  isSiteSaleActive,
  normalizeSaleSettings,
  salePercentForProduct,
  setSaleSettingsOverride,
} from "./sale-pricing";

function formatSaleEndDate(endsOn: string, locale: "nl" | "en"): string {
  const raw = endsOn.trim();
  if (!raw) return "";
  const date = new Date(`${raw}T12:00:00`);
  if (!Number.isFinite(date.getTime())) return raw;
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function useSale() {
  const t = useTranslations("sale");
  const locale = useLocale();
  const settings: SaleSettings = getSaleSettings();
  const active = isSiteSaleActive(settings);
  const date = formatSaleEndDate(settings.endsOn, locale);
  const untilTemplate = t("until").trim();
  const until = untilTemplate.includes("{date}")
    ? date
      ? untilTemplate.replace("{date}", date)
      : ""
    : untilTemplate || date;

  return {
    ...settings,
    active,
    title: t("title"),
    message: t("message"),
    until,
    shopBanner: t("shopBanner"),
    showSiteBanner: active && settings.showSiteBanner,
    showShopBanner: active && settings.showShopBanner,
  };
}
