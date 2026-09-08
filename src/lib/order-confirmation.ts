export type OrderReceiptItem = {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  amountCents: number;
  details: string[];
  type: "physical" | "digital";
  downloadUrl?: string;
};

export type OrderReceipt = {
  sessionId: string;
  orderNumber: string;
  paid: boolean;
  email: string;
  name: string;
  addressLines: string[];
  hasPhysical: boolean;
  hasDigital: boolean;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  items: OrderReceiptItem[];
};

export function orderNumberFromSession(sessionId: string): string {
  const compact = sessionId.replace(/^cs_(test_|live_)/, "");
  return compact.slice(-8).toUpperCase();
}
