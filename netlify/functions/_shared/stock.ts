import { getStore } from "@netlify/blobs";
import {
  catalogStockTracks,
  stockCapsForSelection,
  type ProductSelections,
} from "../../../src/lib/product-options";
import { getCatalogProducts } from "./catalog";

export type StockMap = Record<string, number>;

type StockEntry = {
  remaining: number;
  catalogStock: number;
};

type StockState = Record<string, StockEntry>;

function stockStore() {
  return getStore({ name: "shop-stock", consistency: "strong" });
}

async function readState(): Promise<StockState> {
  const store = stockStore();
  const stored = (await store.get("remaining", { type: "json" })) as StockState | null;
  return stored && typeof stored === "object" ? stored : {};
}

async function writeState(state: StockState): Promise<void> {
  await stockStore().setJSON("remaining", state);
}

function allTracks() {
  return getCatalogProducts().flatMap((product) =>
    catalogStockTracks({
      id: product.id,
      priceCents: product.priceCents,
      stock: product.stock,
      options: product.options,
    }),
  );
}

function syncCatalog(state: StockState): { state: StockState; map: StockMap; changed: boolean } {
  const map: StockMap = {};
  let changed = false;

  for (const track of allTracks()) {
    const row = state[track.key];
    if (!row || row.catalogStock !== track.catalogStock) {
      state[track.key] = { remaining: track.catalogStock, catalogStock: track.catalogStock };
      map[track.key] = track.catalogStock;
      changed = true;
      continue;
    }
    map[track.key] = Math.max(0, Math.floor(row.remaining));
  }

  return { state, map, changed };
}

export async function readLiveStock(): Promise<StockMap> {
  const synced = syncCatalog(await readState());
  if (synced.changed) await writeState(synced.state);
  return synced.map;
}

export async function remainingFor(productId: string): Promise<number | null> {
  const live = await readLiveStock();
  return productId in live ? live[productId] : null;
}

export async function applyPaidOrder(
  sessionId: string,
  lines: { productId: string; quantity: number; selections?: ProductSelections }[],
): Promise<void> {
  const store = stockStore();
  const processedKey = `processed/${sessionId}`;
  const already = await store.get(processedKey);
  if (already) return;

  await store.set(processedKey, "1");

  const synced = syncCatalog(await readState());
  const state = synced.state;
  const products = getCatalogProducts();

  for (const line of lines) {
    if (line.quantity < 1) continue;
    const product = products.find((item) => item.id === line.productId);
    if (!product) continue;
    const caps = stockCapsForSelection(
      {
        id: product.id,
        priceCents: product.priceCents,
        stock: product.stock,
        options: product.options,
      },
      line.selections ?? {},
    );
    for (const cap of caps) {
      const row = state[cap.key];
      if (!row) continue;
      row.remaining = Math.max(0, Math.floor(row.remaining) - line.quantity);
    }
  }

  await writeState(state);
}
