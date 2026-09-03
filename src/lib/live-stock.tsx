import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type StockMap = Record<string, number>;

const LiveStockContext = createContext<StockMap>({});

let stockCache: StockMap = {};

export function getLiveStockCache(): StockMap {
  return stockCache;
}

export function overlayLiveStock<T extends { id: string; stock?: number }>(
  product: T,
  live: Record<string, number> = stockCache,
): T {
  if (typeof product.stock !== "number") return product;
  const remaining = live[product.id];
  if (typeof remaining !== "number") return product;
  return { ...product, stock: remaining };
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
