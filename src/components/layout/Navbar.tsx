"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { NAV_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const t = useTranslations("nav");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-brand-offwhite/95 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        )}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8"
          aria-label={t("mainNavigation")}
        >
          <Logo />

          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_ROUTES.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className={cn(
                    "relative font-body text-sm font-medium transition-colors duration-300 hover:text-brand-pink-accent",
                    pathname === route.href
                      ? "text-brand-pink-accent"
                      : "text-brand-black"
                  )}
                >
                  {t(route.key)}
                  {pathname === route.href && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 h-0.5 w-full bg-brand-pink-accent"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-4 lg:flex">
            <LanguageSwitcher />
            <Button href="/contact" variant="primary" size="default">
              {t("workWithMe")}
            </Button>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label={isMobileOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? (
                <X className="h-6 w-6 text-brand-black" />
              ) : (
                <Menu className="h-6 w-6 text-brand-black" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-brand-offwhite lg:hidden"
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              {NAV_ROUTES.map((route, i) => (
                <motion.div
                  key={route.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    href={route.href}
                    className={cn(
                      "font-heading text-3xl transition-colors",
                      pathname === route.href
                        ? "text-brand-pink-accent"
                        : "text-brand-black"
                    )}
                  >
                    {t(route.key)}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button href="/contact" variant="primary" size="large">
                  {t("workWithMe")}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
