import { type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LocaleProvider, routing, useLocale, type Locale } from "@/i18n/context";
import { CartProvider } from "@/lib/cart";
import { RootLayout } from "@/layouts/RootLayout";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ServicesPage from "@/pages/ServicesPage";
import PortfolioPage from "@/pages/PortfolioPage";
import ShopPage from "@/pages/ShopPage";
import ShopResultPage from "@/pages/ShopResultPage";
import ContactPage from "@/pages/ContactPage";
import FaqPage from "@/pages/FaqPage";
import LegalPage from "@/pages/LegalPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProductPage from "@/pages/ProductPage";
import CartPage from "@/pages/CartPage";
import { StudioApp } from "@/studio/StudioApp";
import { StudioErrorBoundary } from "@/studio/StudioErrorBoundary";
import { isShopPublic } from "@/lib/shop-visibility";

function HiddenShop() {
  const locale = useLocale();
  return <Navigate to={`/${locale}`} replace />;
}

function shopElement(page: ReactNode) {
  return isShopPublic() ? page : <HiddenShop />;
}

function LocaleRoutes({ locale }: { locale: Locale }) {
  return (
    <LocaleProvider locale={locale}>
      <RootLayout>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="shop" element={shopElement(<ShopPage />)} />
          <Route path="shop/cart" element={shopElement(<CartPage />)} />
          <Route path="shop/success" element={shopElement(<ShopResultPage variant="success" />)} />
          <Route path="shop/cancel" element={shopElement(<ShopResultPage variant="cancel" />)} />
          <Route path="shop/:productId" element={shopElement(<ProductPage />)} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="legal/terms" element={<LegalPage kind="terms" />} />
          <Route path="legal/shipping" element={<LegalPage kind="shipping" />} />
          <Route path="legal/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="legal/disclaimer" element={<LegalPage kind="disclaimer" />} />
          <Route path="legal/cookies" element={<LegalPage kind="cookies" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </RootLayout>
    </LocaleProvider>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to={`/${routing.defaultLocale}`} replace />} />
        <Route
          path="/studio"
          element={
            <StudioErrorBoundary>
              <StudioApp />
            </StudioErrorBoundary>
          }
        />
        <Route
          path="/studio/:page"
          element={
            <StudioErrorBoundary>
              <StudioApp />
            </StudioErrorBoundary>
          }
        />
        <Route path="/en/*" element={<LocaleRoutes locale="en" />} />
        <Route path="/nl/*" element={<LocaleRoutes locale="nl" />} />
        <Route path="*" element={<Navigate to={`/${routing.defaultLocale}`} replace />} />
      </Routes>
    </CartProvider>
  );
}
