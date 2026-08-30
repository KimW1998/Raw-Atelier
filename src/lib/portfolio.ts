import yaml from "js-yaml";
import { useStudioPreview } from "@/lib/studio-preview";
import type { Locale } from "@/i18n/context";
import type { PortfolioCategoryKey } from "@/lib/constants";

const portfolioYaml = import.meta.glob("../../content/portfolio-items.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
});

export type PortfolioAspect = "wide" | "tall" | "square";

export interface PortfolioItem {
  id: string;
  category: Exclude<PortfolioCategoryKey, "all">;
  aspect: PortfolioAspect;
  featured: boolean;
  image: string;
  title: {
    nl: string;
    en: string;
  };
}

interface PortfolioFile {
  items: PortfolioItem[];
}

function loadPortfolioItems(): PortfolioItem[] {
  const raw = Object.values(portfolioYaml)[0];
  if (typeof raw !== "string") return [];
  const parsed = yaml.load(raw) as PortfolioFile | null;
  return parsed?.items ?? [];
}

const PORTFOLIO_ITEMS = loadPortfolioItems();

export function getPortfolioItems(): PortfolioItem[] {
  return PORTFOLIO_ITEMS;
}

export function getFeaturedPortfolioItems(limit = 3): PortfolioItem[] {
  const featured = PORTFOLIO_ITEMS.filter((item) => item.featured);
  const source = featured.length > 0 ? featured : PORTFOLIO_ITEMS;
  return source.slice(0, limit);
}

export function getPortfolioTitle(item: PortfolioItem, locale: Locale): string {
  return item.title[locale] || item.title.nl;
}

export function usePortfolioItems(): PortfolioItem[] {
  const studio = useStudioPreview();
  return studio?.portfolioItems ?? getPortfolioItems();
}

export function useFeaturedPortfolioItems(limit = 3): PortfolioItem[] {
  const items = usePortfolioItems();
  const featured = items.filter((item) => item.featured);
  const source = featured.length > 0 ? featured : items;
  return source.slice(0, limit);
}
