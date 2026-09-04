import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Analytics } from "@/components/layout/Analytics";
import { VacationBanner } from "@/components/layout/VacationBanner";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { isShopPublic } from "@/lib/shop-visibility";
import { useVacation } from "@/lib/vacation";
import { cn } from "@/lib/utils";

export function RootLayout({ children }: { children: React.ReactNode }) {
  const { enabled } = useVacation();

  return (
    <>
      <Analytics />
      <Navbar />
      <VacationBanner />
      <main className={cn(enabled && "pt-16 md:pt-14")}>{children}</main>
      <Footer />
      {isShopPublic() && <CartDrawer />}
      <CookieBanner />
    </>
  );
}
