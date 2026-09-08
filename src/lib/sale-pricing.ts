import saleFile from "../data/sale.json";

export interface SaleSettings {
  enabled: boolean;
  percentOff: number;
  endsOn: string;
  showSiteBanner: boolean;
  showShopBanner: boolean;
  showBadges: boolean;
}

let saleSettingsOverride: SaleSettings | null = null;

export function setSaleSettingsOverride(settings: SaleSettings | null) {
  saleSettingsOverride = settings;
}

export function clampSalePercent(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(90, Math.max(0, Math.round(n)));
}

export function applySaleCents(cents: number, percent: number): number {
  const amount = Math.max(0, Math.round(cents));
  const p = clampSalePercent(percent);
  if (p <= 0) return amount;
  return Math.max(0, Math.round((amount * (100 - p)) / 100));
}

export function isSaleWindowEnded(endsOn: string, now = new Date()): boolean {
  const raw = endsOn.trim();
  if (!raw) return false;
  const end = new Date(`${raw}T23:59:59`);
  return Number.isFinite(end.getTime()) && now.getTime() > end.getTime();
}

export function normalizeSaleSettings(raw: Partial<SaleSettings> | null | undefined): SaleSettings {
  return {
    enabled: Boolean(raw?.enabled),
    percentOff: clampSalePercent(raw?.percentOff ?? 0),
    endsOn: typeof raw?.endsOn === "string" ? raw.endsOn : "",
    showSiteBanner: raw?.showSiteBanner !== false,
    showShopBanner: raw?.showShopBanner !== false,
    showBadges: raw?.showBadges !== false,
  };
}

export function getSaleSettings(): SaleSettings {
  return normalizeSaleSettings(saleSettingsOverride ?? saleFile);
}

export function isSiteSaleActive(settings = getSaleSettings()): boolean {
  return settings.enabled && settings.percentOff > 0 && !isSaleWindowEnded(settings.endsOn);
}

export function salePercentForProduct(
  product: { salePercent?: number; saleSkip?: boolean },
  sale = getSaleSettings(),
): number {
  const own = clampSalePercent(product.salePercent);
  if (own > 0) return own;
  if (product.saleSkip) return 0;
  if (!isSiteSaleActive(sale)) return 0;
  return sale.percentOff;
}
