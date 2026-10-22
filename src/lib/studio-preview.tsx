import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { Locale } from "@/i18n/context";
import type { PortfolioItem } from "@/lib/portfolio";
import { normalizeSaleSettings, setSaleSettingsOverride, type SaleSettings } from "@/lib/sale-pricing";
import type { PageImages } from "@/lib/page-images";
import type { ShopCatalogProduct } from "@/lib/shop";

export interface StudioPreviewValue {
  disableSeo: boolean;
  previewLocale: Locale;
  previewPath: string;
  setPreviewPath: (path: string) => void;
  setPreviewLocale: (locale: Locale) => void;
  portfolioItems?: PortfolioItem[];
  shopProducts?: ShopCatalogProduct[];
  pageImages?: PageImages;
  vacation?: { enabled: boolean; pausePhysical: boolean };
  sale?: SaleSettings;
}

const StudioPreviewContext = createContext<StudioPreviewValue | null>(null);

export function StudioPreviewProvider({
  value,
  children,
}: {
  value: StudioPreviewValue;
  children: ReactNode;
}) {
  useEffect(() => {
    setSaleSettingsOverride(value.sale ? normalizeSaleSettings(value.sale) : null);
    return () => setSaleSettingsOverride(null);
  }, [value.sale]);

  return (
    <StudioPreviewContext.Provider value={value}>
      {children}
    </StudioPreviewContext.Provider>
  );
}

export function useStudioPreview(): StudioPreviewValue | null {
  return useContext(StudioPreviewContext);
}
