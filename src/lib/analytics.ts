import analyticsConfig from "@/data/analytics.json";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

export const GA_MEASUREMENT_ID = (
  import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ||
  analyticsConfig.googleAnalyticsId.trim()
);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function ensureGtag() {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  if (location.pathname.startsWith("/studio")) return;

  window.dataLayer = window.dataLayer ?? [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });
    window.gtag("js", new Date());
  }

  if (!document.getElementById("ga-gtag")) {
    const script = document.createElement("script");
    script.id = "ga-gtag";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
    window.gtag("config", GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: false,
    });
  }
}

export function bootGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return;
  ensureGtag();
  syncAnalyticsConsent();
}

export function syncAnalyticsConsent() {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  ensureGtag();

  if (hasAnalyticsConsent()) {
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }

  window.gtag?.("consent", "update", { analytics_storage: "denied" });
}

export function trackPageview(path: string) {
  if (!GA_MEASUREMENT_ID || !hasAnalyticsConsent() || !window.gtag) return;
  if (path.startsWith("/studio")) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
