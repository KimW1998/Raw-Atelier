const STORAGE_KEY = "raw-atelier-cookie-consent";
export const COOKIE_SETTINGS_EVENT = "raw-atelier-open-cookies";
export const COOKIE_UPDATED_EVENT = "raw-atelier-cookie-updated";

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
}

export function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (typeof parsed.analytics !== "boolean") return null;
    return { necessary: true, analytics: parsed.analytics };
  } catch {
    return null;
  }
}

export function writeConsent(consent: CookieConsent) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new Event(COOKIE_UPDATED_EVENT));
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}

export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === true;
}
