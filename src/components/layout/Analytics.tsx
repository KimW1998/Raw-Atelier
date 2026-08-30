import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStudioPreview } from "@/lib/studio-preview";
import { COOKIE_UPDATED_EVENT } from "@/lib/cookie-consent";
import {
  syncAnalyticsConsent,
  trackPageview,
} from "@/lib/analytics";

export function Analytics() {
  const { pathname, search } = useLocation();
  const studio = useStudioPreview();

  useEffect(() => {
    if (studio) return;

    const send = () => {
      syncAnalyticsConsent();
      trackPageview(`${pathname}${search}`);
    };

    send();
    window.addEventListener(COOKIE_UPDATED_EVENT, send);
    return () => window.removeEventListener(COOKIE_UPDATED_EVENT, send);
  }, [pathname, search, studio]);

  return null;
}
