import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import { FadeIn } from "@/components/animations/FadeIn";
import { OrderReceiptCard } from "@/components/shop/OrderReceiptCard";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { useCart } from "@/lib/cart";
import { reloadLiveStock } from "@/lib/live-stock";
import type { OrderReceipt } from "@/lib/order-confirmation";
import { useLocale, useTranslations } from "@/i18n/context";

export default function ShopResultPage({
  variant,
}: {
  variant: "success" | "cancel";
}) {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");
  const t = useTranslations("shop");
  const { clear } = useCart();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id")?.trim() || "";
  const [order, setOrder] = useState<OrderReceipt | null>(null);
  const [orderStatus, setOrderStatus] = useState<"idle" | "loading" | "ready" | "missing">(
    "idle",
  );

  useEffect(() => {
    if (variant !== "success") return;
    clear();
    void reloadLiveStock();
  }, [variant, clear]);

  useEffect(() => {
    if (variant !== "success") return;
    if (!sessionId) {
      setOrderStatus("idle");
      return;
    }

    let cancelled = false;
    setOrderStatus("loading");

    const load = async () => {
      try {
        const response = await fetch(
          `/api/order-session?session_id=${encodeURIComponent(sessionId)}`,
        );
        const payload = (await response.json()) as { order?: OrderReceipt };
        if (cancelled) return;
        if (!response.ok || !payload.order) {
          setOrderStatus("missing");
          return;
        }
        setOrder(payload.order);
        setOrderStatus("ready");
      } catch {
        if (!cancelled) setOrderStatus("missing");
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [variant, sessionId]);

  const isSuccess = variant === "success";
  const greetingName = order?.name
    ? order.name
        .trim()
        .split(/\s+/)[0]
        ?.replace(/^./, (letter) => letter.toUpperCase())
    : undefined;

  return (
    <>
      <SEO
        title={isSuccess ? t("result.successTitle") : t("result.cancelTitle")}
        description={tMeta("shop.description")}
        locale={locale}
        path={isSuccess ? "/shop/success" : "/shop/cancel"}
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
      />
      <section className="relative overflow-hidden pt-28 md:pt-32">
        <PatternBackground variant="hero" />
        <Container className="relative z-10 pb-8">
          <FadeIn>
            {isSuccess && (
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink-accent text-white">
                <Check className="h-6 w-6" strokeWidth={2.4} aria-hidden />
              </div>
            )}
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
              {isSuccess ? t("result.confirmationEyebrow") : t("cart.eyebrow")}
            </p>
            <h1 className="mt-3 font-heading text-4xl text-brand-black md:text-5xl">
              {isSuccess && greetingName
                ? t("result.successTitleNamed", { name: greetingName })
                : isSuccess
                  ? t("result.successTitle")
                  : t("result.cancelTitle")}
            </h1>
          </FadeIn>
          <FadeIn delay={0.08}>
            <p className="mt-5 max-w-2xl font-body text-base leading-relaxed text-brand-black/70 md:text-lg">
              {isSuccess ? t("result.successDescription") : t("result.cancelDescription")}
            </p>
            {isSuccess && order?.orderNumber && (
              <p className="mt-3 font-body text-sm text-brand-black/55">
                {t("result.orderNumber", { number: order.orderNumber })}
              </p>
            )}
          </FadeIn>
        </Container>
      </section>

      {isSuccess && (
        <section className="pb-10">
          <Container>
            {orderStatus === "loading" && (
              <div className="rounded-3xl bg-white px-8 py-16 text-center shadow-sm">
                <p className="font-body text-base text-brand-black/60">{t("result.loadingOrder")}</p>
              </div>
            )}
            {orderStatus === "ready" && order && (
              <>
                <OrderReceiptCard order={order} />
                <div className="mt-8 space-y-3 font-body text-sm leading-relaxed text-brand-black/65">
                  {order.hasDigital && <p>{t("result.digitalNext")}</p>}
                  {order.hasPhysical && <p>{t("result.physicalNext")}</p>}
                </div>
              </>
            )}
            {orderStatus === "missing" && (
              <div className="rounded-3xl bg-white px-8 py-10 shadow-sm">
                <p className="font-body text-base leading-relaxed text-brand-black/70">
                  {t("result.missingOrder")}
                </p>
              </div>
            )}
          </Container>
        </section>
      )}

      <section className="pb-20 md:pb-28">
        <Container>
          <div className="flex flex-wrap gap-4">
            <Button href="/shop" variant="primary">
              {t("result.backToShop")}
            </Button>
            {isSuccess && (
              <Button href="/contact" variant="outline">
                {t("result.contact")}
              </Button>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
