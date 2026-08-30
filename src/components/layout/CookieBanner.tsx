import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "@/i18n/context";
import { useStudioPreview } from "@/lib/studio-preview";
import {
  COOKIE_SETTINGS_EVENT,
  readConsent,
  writeConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";
import { Button } from "@/components/ui/Button";

export function CookieBanner() {
  const t = useTranslations("cookies");
  const studio = useStudioPreview();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (studio) return;
    setOpen(!readConsent());
    const reopen = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setSettings(true);
      setOpen(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen);
  }, [studio]);

  if (studio || !open) return null;

  const save = (consent: CookieConsent) => {
    writeConsent(consent);
    setOpen(false);
    setSettings(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-brand-pink-light md:p-6">
        <p className="font-heading text-xl text-brand-black">{t("title")}</p>
        <p className="mt-2 font-body text-sm leading-relaxed text-brand-black/70">
          {t("text")}{" "}
          <Link href="/legal/cookies" className="font-semibold text-brand-rose hover:underline">
            {t("policy")}
          </Link>
        </p>

        {settings && (
          <div className="mt-4 space-y-3 rounded-2xl bg-brand-offwhite p-4">
            <label className="flex items-start gap-3 font-body text-sm text-brand-black">
              <input type="checkbox" checked disabled className="mt-1" />
              <span>
                <span className="font-semibold">{t("necessary")}</span>
                <span className="mt-0.5 block text-brand-black/60">{t("necessaryHelp")}</span>
              </span>
            </label>
            <label className="flex items-start gap-3 font-body text-sm text-brand-black">
              <input
                type="checkbox"
                className="mt-1"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
              <span>
                <span className="font-semibold">{t("analytics")}</span>
                <span className="mt-0.5 block text-brand-black/60">{t("analyticsHelp")}</span>
              </span>
            </label>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => save({ necessary: true, analytics: true })}>
            {t("acceptAll")}
          </Button>
          <Button
            variant="outline"
            onClick={() => save({ necessary: true, analytics: settings ? analytics : false })}
          >
            {settings ? t("save") : t("necessaryOnly")}
          </Button>
          {!settings && (
            <button
              type="button"
              className="px-3 py-2 font-body text-sm text-brand-black/60 hover:text-brand-black"
              onClick={() => setSettings(true)}
            >
              {t("customize")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
