import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Analytics } from "@/components/layout/Analytics";
import { VacationBanner } from "@/components/layout/VacationBanner";
import { SaleBanner } from "@/components/layout/SaleBanner";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { isShopPublic } from "@/lib/shop-visibility";
import { useSale } from "@/lib/sale";
import { useVacation } from "@/lib/vacation";
import { cn } from "@/lib/utils";

export function RootLayout({ children }: { children: React.ReactNode }) {
  const { enabled: vacationOn } = useVacation();
  const { showSiteBanner: saleOn } = useSale();
  const bannerCount = (vacationOn ? 1 : 0) + (saleOn ? 1 : 0);

  return (
    <>
      <Analytics />
      <Navbar />
      <div className="fixed inset-x-0 top-[4.25rem] z-40">
        <VacationBanner />
        <SaleBanner />
      </div>
      <main
        className={cn(
          bannerCount === 1 && "pt-16 md:pt-14",
          bannerCount >= 2 && "pt-[7.5rem] md:pt-[6.75rem]",
        )}
      >
        {children}
      </main>
      <Footer />
      {isShopPublic() && <CartDrawer />}
      <CookieBanner />
    </>
  );
}
