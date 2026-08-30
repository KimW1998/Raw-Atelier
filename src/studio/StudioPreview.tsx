import { LocaleProvider, type Locale } from "@/i18n/context";
import { RootLayout } from "@/layouts/RootLayout";
import { StudioPreviewProvider } from "@/lib/studio-preview";
import type { PortfolioItem } from "@/lib/portfolio";
import type { ShopCatalogProduct } from "@/lib/shop";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ServicesPage from "@/pages/ServicesPage";
import PortfolioPage from "@/pages/PortfolioPage";
import ShopPage from "@/pages/ShopPage";
import ContactPage from "@/pages/ContactPage";
import LegalPage from "@/pages/LegalPage";

function PreviewPage({ path }: { path: string }) {
  if (path === "/about") return <AboutPage />;
  if (path === "/services") return <ServicesPage />;
  if (path === "/portfolio") return <PortfolioPage />;
  if (path === "/shop") return <ShopPage />;
  if (path === "/contact") return <ContactPage />;
  if (path === "/legal/terms") return <LegalPage kind="terms" />;
  if (path === "/legal/shipping") return <LegalPage kind="shipping" />;
  if (path === "/legal/privacy") return <LegalPage kind="privacy" />;
  if (path === "/legal/disclaimer") return <LegalPage kind="disclaimer" />;
  if (path === "/legal/cookies") return <LegalPage kind="cookies" />;
  return <HomePage />;
}

export function StudioPreview({
  locale,
  path,
  messages,
  portfolioItems,
  shopProducts,
  onPreviewLocale,
}: {
  locale: Locale;
  path: string;
  messages: Record<string, unknown>;
  portfolioItems: PortfolioItem[];
  shopProducts: ShopCatalogProduct[];
  onPreviewLocale: (locale: Locale) => void;
}) {
  return (
    <div className="h-full overflow-auto bg-brand-offwhite" style={{ transform: "translateZ(0)" }}>
      <LocaleProvider locale={locale} messages={messages}>
        <StudioPreviewProvider
          value={{
            disableSeo: true,
            previewLocale: locale,
            previewPath: path,
            setPreviewLocale: onPreviewLocale,
            portfolioItems,
            shopProducts,
          }}
        >
          <RootLayout>
            <PreviewPage path={path} />
          </RootLayout>
        </StudioPreviewProvider>
      </LocaleProvider>
    </div>
  );
}
