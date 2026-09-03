CREATE TABLE IF NOT EXISTS product_stock (
  product_id VARCHAR(120) PRIMARY KEY,
  remaining INTEGER NOT NULL,
  catalog_stock INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS processed_checkouts (
  session_id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
