import { useState } from "react";
import { useLocale, useTranslations } from "@/i18n/context";
import { useCart, type CartItem } from "@/lib/cart";

export function useCheckout() {
  const locale = useLocale();
  const t = useTranslations("shop");
  const { items } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const checkout = async (cartItems: CartItem[] = items) => {
    if (cartItems.length === 0) return;
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            selections: item.selections,
          })),
          locale,
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || t("cart.checkoutError"));
      }
      window.location.href = data.url;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : t("cart.checkoutError"));
    }
  };

  return { checkout, status, error };
}
