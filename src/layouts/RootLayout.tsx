import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Analytics } from "@/components/layout/Analytics";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { isShopPublic } from "@/lib/shop-visibility";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Analytics />
      <Navbar />
      <main>{children}</main>
      <Footer />
      {isShopPublic() && <CartDrawer />}
      <CookieBanner />
    </>
  );
}
