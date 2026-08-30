import catalog from "../../../src/data/shop-catalog.json";

export type CatalogProduct = (typeof catalog.products)[number];

export function getCatalogProducts(): CatalogProduct[] {
  return catalog.products;
}

export function getCatalogProduct(id: string): CatalogProduct | undefined {
  return catalog.products.find((product) => product.id === id);
}
