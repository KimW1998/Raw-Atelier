import { getDatabase } from "@netlify/database";
import { getCatalogProducts } from "./catalog";

export type StockMap = Record<string, number>;

function catalogStockOf(product: { stock?: unknown }): number | null {
  return typeof product.stock === "number" && Number.isFinite(product.stock)
    ? Math.max(0, Math.floor(product.stock))
    : null;
}

export async function readLiveStock(): Promise<StockMap> {
  const db = getDatabase();
  const map: StockMap = {};

  for (const product of getCatalogProducts()) {
    const catalogStock = catalogStockOf(product);
    if (catalogStock === null) continue;

    const existing = await db.sql`
      SELECT remaining, catalog_stock
      FROM product_stock
      WHERE product_id = ${product.id}
      LIMIT 1
    `;
    const row = (Array.isArray(existing) ? existing[0] : undefined) as
      | { remaining?: number; catalog_stock?: number }
      | undefined;

    if (!row) {
      await db.sql`
        INSERT INTO product_stock (product_id, remaining, catalog_stock)
        VALUES (${product.id}, ${catalogStock}, ${catalogStock})
        ON CONFLICT (product_id) DO NOTHING
      `;
      map[product.id] = catalogStock;
      continue;
    }

    const storedCatalog = Number(row.catalog_stock);
    const storedRemaining = Number(row.remaining);
    if (storedCatalog !== catalogStock) {
      await db.sql`
        UPDATE product_stock
        SET remaining = ${catalogStock},
            catalog_stock = ${catalogStock},
            updated_at = NOW()
        WHERE product_id = ${product.id}
      `;
      map[product.id] = catalogStock;
      continue;
    }

    map[product.id] = Math.max(0, storedRemaining);
  }

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
  const db = getDatabase();
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const claimed = await client.query(
      `INSERT INTO processed_checkouts (session_id)
       VALUES ($1)
       ON CONFLICT (session_id) DO NOTHING
       RETURNING session_id`,
      [sessionId],
    );
    if (!claimed.rowCount) {
      await client.query("COMMIT");
      return;
    }

    for (const line of lines) {
      if (line.quantity < 1) continue;
      await client.query(
        `UPDATE product_stock
         SET remaining = GREATEST(0, remaining - $2),
             updated_at = NOW()
         WHERE product_id = $1`,
        [line.productId, line.quantity],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
