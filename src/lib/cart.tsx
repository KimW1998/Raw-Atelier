import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getShopProduct,
  lineStockUnits,
  remainingStockForSelection,
  stockCapsForSelection,
  type ShopCatalogProduct,
} from "@/lib/shop";
import { overlayLiveStock, useLiveStockMap } from "@/lib/live-stock";
import { isPhysicalCheckoutPaused } from "@/lib/vacation";
import {
  sanitizeSelections,
  type ProductSelections,
} from "@/lib/product-options";

const STORAGE_KEY = "raw-atelier-cart-v2";

export interface CartItem {
  lineId: string;
  productId: string;
  quantity: number;
  selections: ProductSelections;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  addItem: (productId: string, quantity?: number, selections?: ProductSelections) => void;
  removeItem: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function createLineId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function selectionsKey(selections: ProductSelections): string {
  return JSON.stringify(
    Object.keys(selections)
      .sort()
      .map((key) => [key, selections[key]]),
  );
}

function clampCartToStock(
  items: CartItem[],
  live: Record<string, number>,
): CartItem[] {
  const used = new Map<string, number>();
  const next: CartItem[] = [];
  for (const item of items) {
    const catalogProduct = getShopProduct(item.productId);
    if (!catalogProduct) continue;
    const product = overlayLiveStock(catalogProduct, live);
    const pack = lineStockUnits(product, item.selections, 1);
    const caps = stockCapsForSelection(product, item.selections);
    let maxPacks = item.quantity;
    if (caps.length === 0) {
      next.push(item);
      continue;
    }
    for (const cap of caps) {
      const leftover = Math.max(0, cap.remaining - (used.get(cap.key) ?? 0));
      maxPacks = Math.min(maxPacks, Math.floor(leftover / pack));
    }
    if (maxPacks < 1) continue;
    next.push({ ...item, quantity: maxPacks });
    for (const cap of caps) {
      used.set(cap.key, (used.get(cap.key) ?? 0) + pack * maxPacks);
    }
  }
  return next;
}

function sameCart(a: CartItem[], b: CartItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (item, index) => item.lineId === b[index]?.lineId && item.quantity === b[index]?.quantity,
  );
}

function normalizeItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Partial<CartItem> & { productId?: string; quantity?: number };
  if (typeof item.productId !== "string") return null;
  if (!Number.isInteger(item.quantity) || (item.quantity ?? 0) < 1) return null;
  const product = getShopProduct(item.productId);
  if (!product) return null;
  return {
    lineId: typeof item.lineId === "string" ? item.lineId : createLineId(),
    productId: item.productId,
    quantity: item.quantity as number,
    selections: sanitizeSelections(product, item.selections),
  };
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const normalized = normalizeItem(item);
      return normalized ? [normalized] : [];
    });
  } catch {
    return [];
  }
}

function writeStoredCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const liveStock = useLiveStockMap();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const skipHydrateRef = useRef(false);

  useEffect(() => {
    if (skipHydrateRef.current) {
      setReady(true);
      return;
    }
    setItems(readStoredCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setItems((current) => {
      const next = clampCartToStock(current, liveStock);
      return sameCart(current, next) ? current : next;
    });
  }, [liveStock, ready]);

  useEffect(() => {
    if (!ready) return;
    writeStoredCart(items);
  }, [items, ready]);

  const addItem = useCallback(
    (productId: string, quantity = 1, selections: ProductSelections = {}) => {
      const product = getShopProduct(productId);
      if (!product) return;
      if (isPhysicalCheckoutPaused() && product.type === "physical") return;
      const cleaned = sanitizeSelections(product, selections);
      const packSize = lineStockUnits(product, cleaned, 1);
      setItems((current) => {
        const leftover = remainingStockForSelection(product, cleaned, current);
        const remainingPacks = Number.isFinite(leftover)
          ? Math.floor(leftover / packSize)
          : Number.POSITIVE_INFINITY;
        const allowed = Number.isFinite(remainingPacks)
          ? Math.min(quantity, remainingPacks)
          : quantity;
        if (allowed < 1) return current;
        const existing = current.find(
          (item) =>
            item.productId === productId &&
            selectionsKey(item.selections) === selectionsKey(cleaned),
        );
        if (existing) {
          return current.map((item) =>
            item.lineId === existing.lineId
              ? { ...item, quantity: item.quantity + allowed }
              : item,
          );
        }
        return [
          ...current,
          { lineId: createLineId(), productId, quantity: allowed, selections: cleaned },
        ];
      });
      setIsOpen(true);
    },
    [],
  );

  const removeItem = useCallback((lineId: string) => {
    setItems((current) => current.filter((item) => item.lineId !== lineId));
  }, []);

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((current) => current.filter((item) => item.lineId !== lineId));
      return;
    }
    setItems((current) =>
      current.map((item) => {
        if (item.lineId !== lineId) return item;
        const product = getShopProduct(item.productId);
        if (!product) return { ...item, quantity };
        const packSize = lineStockUnits(product, item.selections, 1);
        const leftover = remainingStockForSelection(product, item.selections, current, lineId);
        const remainingPacks = Number.isFinite(leftover)
          ? Math.floor(leftover / packSize)
          : Number.POSITIVE_INFINITY;
        const next = Number.isFinite(remainingPacks)
          ? Math.min(quantity, remainingPacks)
          : quantity;
        if (next < 1) return item;
        return { ...item, quantity: next };
      }),
    );
  }, []);

  const clear = useCallback(() => {
    skipHydrateRef.current = true;
    setItems([]);
    setIsOpen(false);
    writeStoredCart([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => {
        const product = getShopProduct(item.productId);
        return sum + (product ? lineStockUnits(product, item.selections, item.quantity) : item.quantity);
      }, 0),
      addItem,
      removeItem,
      setQuantity,
      clear,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [items, addItem, removeItem, setQuantity, clear, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export function getCartProducts(items: CartItem[]): {
  item: CartItem;
  product: ShopCatalogProduct;
}[] {
  return items.flatMap((item) => {
    const product = getShopProduct(item.productId);
    return product ? [{ item, product }] : [];
  });
}
