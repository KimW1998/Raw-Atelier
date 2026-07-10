import { Navigate, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LocaleProvider, routing, type Locale } from "@/i18n/context";
import { RootLayout } from "@/layouts/RootLayout";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ServicesPage from "@/pages/ServicesPage";
import PortfolioPage from "@/pages/PortfolioPage";
import ShopPage from "@/pages/ShopPage";
import ContactPage from "@/pages/ContactPage";
import NotFoundPage from "@/pages/NotFoundPage";

function LocaleRoutes({ locale }: { locale: Locale }) {
  return (
    <LocaleProvider locale={locale}>
      <RootLayout>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </RootLayout>
    </LocaleProvider>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to={`/${routing.defaultLocale}`} replace />} />
        <Route path="/en/*" element={<LocaleRoutes locale="en" />} />
        <Route path="/nl/*" element={<LocaleRoutes locale="nl" />} />
        <Route path="*" element={<Navigate to={`/${routing.defaultLocale}`} replace />} />
      </Routes>
    </>
  );
}
