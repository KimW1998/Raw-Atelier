import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PatternBackground } from "@/components/ui/PatternBackground";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <PatternBackground variant="subtle" />
      </div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
