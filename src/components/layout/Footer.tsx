import { useTranslations } from "@/i18n/context";
import { Link } from "@/i18n/routing";
import { Instagram, Mail } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { BRAND } from "@/lib/constants";
import { getPublicNavRoutes } from "@/lib/shop-visibility";
import { openCookieSettings } from "@/lib/cookie-consent";

export function Footer() {
  const t = useTranslations("footer");
  const tBrand = useTranslations("brand");
  const tNav = useTranslations("nav");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-brand-black text-white">
      <PatternBackground variant="section" opacity={0.06} />
      <Container className="relative py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-white/70">
              {t("description")}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-brand-pink hover:bg-brand-pink/10"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-brand-pink hover:bg-brand-pink/10"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-body text-sm font-semibold uppercase tracking-wider text-brand-pink">
              {t("navigate")}
            </h3>
            <ul className="space-y-3">
              {getPublicNavRoutes().map((route) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className="font-body text-sm text-white/70 transition-colors hover:text-brand-pink"
                  >
                    {tNav(route.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-body text-sm font-semibold uppercase tracking-wider text-brand-pink">
              {t("getInTouch")}
            </h3>
            <ul className="space-y-3 font-body text-sm text-white/70">
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="transition-colors hover:text-brand-pink"
                >
                  {BRAND.email}
                </a>
              </li>
              <li>
                <a
                  href={BRAND.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-brand-pink"
                >
                  @{BRAND.instagramHandle}
                </a>
              </li>
              <li>{t("location")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="font-body text-xs text-white/50">
            &copy; {currentYear} {tBrand("name")}. {t("rights")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/legal/terms"
              className="font-body text-xs text-white/50 transition-colors hover:text-brand-pink"
            >
              {t("terms")}
            </Link>
            <Link
              href="/legal/shipping"
              className="font-body text-xs text-white/50 transition-colors hover:text-brand-pink"
            >
              {t("shipping")}
            </Link>
            <Link
              href="/legal/privacy"
              className="font-body text-xs text-white/50 transition-colors hover:text-brand-pink"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/legal/disclaimer"
              className="font-body text-xs text-white/50 transition-colors hover:text-brand-pink"
            >
              {t("disclaimer")}
            </Link>
            <Link
              href="/legal/cookies"
              className="font-body text-xs text-white/50 transition-colors hover:text-brand-pink"
            >
              {t("cookies")}
            </Link>
            <button
              type="button"
              onClick={() => openCookieSettings()}
              className="font-body text-xs text-white/50 transition-colors hover:text-brand-pink"
            >
              {t("cookieSettings")}
            </button>
            <p className="font-body text-xs text-white/50">{t("handcrafted")}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
