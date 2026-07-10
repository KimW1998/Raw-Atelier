import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_API = "https://www.rawluxurystitches.com/wp-json/wc/store/v1/products";
const OUTPUT = path.join(__dirname, "../src/data/shop-products.json");

const SECTION_BY_SLUG = {
  "fabric-name-banner": "babyGifts",
  "custom-fabric-balloon-with-embroidery": "babyGifts",
  "custom-embroidered-apple-keychain": "keychains",
  "custom-embroidered-drawstring-bag": "pouches",
};

const SECTION_BY_CATEGORY = {
  "digital-sewing-patterns": "patterns",
  "baby-gifts": "babyGifts",
  "baby-gift": "babyGifts",
  keychains: "keychains",
  patches: "patches",
  "embroidered-patches": "patches",
  pouches: "pouches",
  bags: "pouches",
};

function formatPrice(prices) {
  const unit = prices.currency_minor_unit ?? 2;
  const divisor = 10 ** unit;
  const decimal = prices.currency_decimal_separator ?? ",";
  const symbol = prices.currency_symbol ?? "€";

  const formatAmount = (amount) => {
    const value = (Number(amount) / divisor).toFixed(unit);
    return `${symbol}\u00a0${value.replace(".", decimal)}`;
  };

  if (prices.price_range) {
    return `${formatAmount(prices.price_range.min_amount)} – ${formatAmount(prices.price_range.max_amount)}`;
  }

  return formatAmount(prices.price);
}

function resolveSection(product) {
  if (SECTION_BY_SLUG[product.slug]) {
    return SECTION_BY_SLUG[product.slug];
  }

  for (const category of product.categories ?? []) {
    const section = SECTION_BY_CATEGORY[category.slug];
    if (section) return section;
  }

  return "gifts";
}

function resolveBadge(product) {
  for (const category of product.categories ?? []) {
    if (category.slug === "digital-sewing-patterns") return "digital";
  }

  return "handmade";
}

function normalizeProduct(product) {
  const image = product.images?.[0]?.thumbnail || product.images?.[0]?.src || "";

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    permalink: product.permalink,
    image,
    priceLabel: formatPrice(product.prices),
    section: resolveSection(product),
    badge: resolveBadge(product),
    actionLabel: product.add_to_cart?.text || "View product",
  };
}

async function fetchAllProducts() {
  const products = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(`${STORE_API}?per_page=100&page=${page}`);

    if (!response.ok) {
      throw new Error(`WooCommerce API failed (${response.status})`);
    }

    totalPages = Number(response.headers.get("x-wp-totalpages") || "1");
    const batch = await response.json();
    products.push(...batch);
    page += 1;
  }

  const bySlug = new Map();
  for (const product of products) {
    const existing = bySlug.get(product.slug);
    if (!existing || product.id > existing.id) {
      bySlug.set(product.slug, product);
    }
  }

  return [...bySlug.values()].map(normalizeProduct);
}

async function main() {
  const existing = fs.existsSync(OUTPUT)
    ? JSON.parse(fs.readFileSync(OUTPUT, "utf8"))
    : null;

  try {
    const products = await fetchAllProducts();
    const payload = {
      syncedAt: new Date().toISOString(),
      source: "https://www.rawluxurystitches.com",
      products,
    };

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`Synced ${products.length} shop products to src/data/shop-products.json`);
  } catch (error) {
    if (existing?.products?.length) {
      console.warn(
        `Shop sync failed (${error.message}). Keeping existing shop-products.json.`
      );
      return;
    }

    throw error;
  }
}

main();
