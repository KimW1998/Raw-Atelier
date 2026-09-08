import { Check } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "@/i18n/context";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { formatEuro, getProductHref } from "@/lib/shop";
import type { OrderReceipt } from "@/lib/order-confirmation";

export function OrderReceiptCard({ order }: { order: OrderReceipt }) {
  const locale = useLocale();
  const t = useTranslations("shop");

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)]">
      <div className="rounded-3xl bg-white p-5 shadow-sm md:p-8">
        <h2 className="font-heading text-2xl text-brand-black">{t("result.itemsHeading")}</h2>
        <ul className="mt-6 space-y-5">
          {order.items.map((item, index) => (
            <li key={`${item.productId}-${index}`} className="flex gap-4">
              {item.image ? (
                item.productId ? (
                  <Link
                    href={getProductHref(item.productId)}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl md:h-28 md:w-28"
                  >
                    <PremiumImage src={item.image} alt={item.name} fill sizes="112px" />
                  </Link>
                ) : (
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl md:h-28 md:w-28">
                    <PremiumImage src={item.image} alt={item.name} fill sizes="112px" />
                  </div>
                )
              ) : (
                <div className="h-24 w-24 shrink-0 rounded-xl bg-brand-pink-light md:h-28 md:w-28" />
              )}
              <div className="min-w-0 flex-1">
                {item.productId ? (
                  <Link href={getProductHref(item.productId)}>
                    <p className="font-heading text-lg text-brand-black md:text-xl">{item.name}</p>
                  </Link>
                ) : (
                  <p className="font-heading text-lg text-brand-black md:text-xl">{item.name}</p>
                )}
                <p className="mt-1 font-body text-sm text-brand-black/55">
                  {t("result.quantity", { count: String(item.quantity) })}
                </p>
                {item.details.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {item.details.map((line) => (
                        <li key={line} className="whitespace-pre-line font-body text-xs leading-relaxed text-brand-black/55">
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
                {item.downloadUrl ? (
                  <a
                    href={item.downloadUrl}
                    className="mt-2 inline-block font-body text-sm font-semibold text-brand-pink-accent hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("result.download")}
                  </a>
                ) : null}
              </div>
              <p className="shrink-0 font-body text-sm font-semibold text-brand-pink-accent">
                {formatEuro(item.amountCents, locale)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-heading text-2xl text-brand-black">{t("cart.summary")}</h2>
          <dl className="mt-6 space-y-3 font-body text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-brand-black/60">{t("cart.subtotal")}</dt>
              <dd className="font-semibold text-brand-black">
                {formatEuro(order.subtotalCents, locale)}
              </dd>
            </div>
            {order.shippingCents > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-brand-black/60">{t("result.shipping")}</dt>
                <dd className="font-semibold text-brand-black">
                  {formatEuro(order.shippingCents, locale)}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t border-brand-pink-light pt-3">
              <dt className="font-semibold text-brand-black">{t("result.total")}</dt>
              <dd className="font-heading text-xl text-brand-pink-accent">
                {formatEuro(order.totalCents, locale)}
              </dd>
            </div>
          </dl>
          {order.paid && (
            <p className="mt-4 flex items-center gap-2 font-body text-sm text-brand-black/70">
              <Check className="h-4 w-4 text-brand-pink-accent" aria-hidden />
              {t("result.paid")}
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-heading text-2xl text-brand-black">{t("result.customerHeading")}</h2>
          {order.email && (
            <p className="mt-4 font-body text-sm leading-relaxed text-brand-black/70">
              {t("result.emailSent", { email: order.email })}
            </p>
          )}
          {order.addressLines.length > 0 && (
            <>
              <h3 className="mt-5 font-body text-xs font-semibold uppercase tracking-[0.16em] text-brand-black/45">
                {order.hasPhysical ? t("result.shippingAddress") : t("result.address")}
              </h3>
              <p className="mt-2 whitespace-pre-line font-body text-sm leading-relaxed text-brand-black">
                {order.addressLines.join("\n")}
              </p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
