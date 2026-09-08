import { getStore } from "@netlify/blobs";
import { getCatalogProducts } from "./catalog";

export type StockMap = Record<string, number>;

type StockEntry = {
  remaining: number;
  catalogStock: number;
};

type StockState = Record<string, StockEntry>;

function catalogStockOf(product: { stock?: unknown }): number | null {
  return typeof product.stock === "number" && Number.isFinite(product.stock)
    ? Math.max(0, Math.floor(product.stock))
    : null;
}

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

export async function readLiveStock(): Promise<StockMap> {
  const state = await readState();
  const map: StockMap = {};
  let changed = false;

  for (const product of getCatalogProducts()) {
    const catalogStock = catalogStockOf(product);
    if (catalogStock === null) continue;

    const row = state[product.id];
    if (!row || row.catalogStock !== catalogStock) {
      state[product.id] = { remaining: catalogStock, catalogStock };
      map[product.id] = catalogStock;
      changed = true;
      continue;
    }

    map[product.id] = Math.max(0, Math.floor(row.remaining));
  }

  if (changed) await writeState(state);
  return map;
}

export async function remainingFor(productId: string): Promise<number | null> {
  const live = await readLiveStock();
  return productId in live ? live[productId] : null;
}

export async function applyPaidOrder(
  sessionId: string,
  lines: { productId: string; quantity: number }[],
): Promise<void> {
  const store = stockStore();
  const processedKey = `processed/${sessionId}`;
  const already = await store.get(processedKey);
  if (already) return;

  await store.set(processedKey, "1");

  const state = await readState();
  for (const product of getCatalogProducts()) {
    const catalogStock = catalogStockOf(product);
    if (catalogStock === null) continue;
    if (!state[product.id] || state[product.id].catalogStock !== catalogStock) {
      state[product.id] = { remaining: catalogStock, catalogStock };
    }
  }

  for (const line of lines) {
    if (line.quantity < 1) continue;
    const row = state[line.productId];
    if (!row) continue;
    row.remaining = Math.max(0, Math.floor(row.remaining) - line.quantity);
  }

  await writeState(state);
}
