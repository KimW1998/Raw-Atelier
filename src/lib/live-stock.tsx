import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  catalogStockNumber,
  variantStockKey,
  type ProductOption,
} from "@/lib/product-options";

type StockMap = Record<string, number>;

const LiveStockContext = createContext<StockMap>({});

let stockCache: StockMap = {};

export function getLiveStockCache(): StockMap {
  return stockCache;
}

export function overlayLiveStock<
  T extends { id: string; stock?: number; options?: ProductOption[] },
>(product: T, live: Record<string, number> = stockCache): T {
  let next = product;
  if (typeof product.stock === "number" && typeof live[product.id] === "number") {
    next = { ...next, stock: live[product.id] };
  }
  if (!next.options?.length) return next;

  let optionsChanged = false;
  const options = next.options.map((option) => {
    if (option.type !== "fabric" || !option.choices?.length) return option;
    let choicesChanged = false;
    const choices = option.choices.map((choice) => {
      if (catalogStockNumber(choice.stock) === null) return choice;
      const remaining = live[variantStockKey(product.id, option.id, choice.id)];
      if (typeof remaining !== "number") return choice;
      choicesChanged = true;
      return { ...choice, stock: remaining };
    });
    if (!choicesChanged) return option;
    optionsChanged = true;
    return { ...option, choices };
  });

  return optionsChanged ? { ...next, options } : next;
}

async function fetchLiveStock(): Promise<StockMap> {
  const response = await fetch("/api/shop-stock");
  if (!response.ok) return stockCache;
  const payload = (await response.json()) as { stock?: StockMap };
  return payload.stock && typeof payload.stock === "object" ? payload.stock : {};
}

export let reloadLiveStock = async () => {};

export function LiveStockProvider({ children }: { children: ReactNode }) {
  const [stock, setStock] = useState<StockMap>(stockCache);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const next = await fetchLiveStock();
        if (cancelled) return;
        stockCache = next;
        setStock(next);
      } catch {
        if (!cancelled) setStock(stockCache);
      }
    };

    reloadLiveStock = load;
    void load();

    return () => {
      cancelled = true;
      reloadLiveStock = async () => {};
    };
  }, []);

  return <LiveStockContext.Provider value={stock}>{children}</LiveStockContext.Provider>;
}

export function useLiveStockMap(): StockMap {
  return useContext(LiveStockContext);
}
