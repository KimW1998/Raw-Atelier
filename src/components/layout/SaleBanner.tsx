import { Percent } from "lucide-react";
import { useSale } from "@/lib/sale";

export function SaleBanner() {
  const { showSiteBanner, title, message, until, percentOff } = useSale();
  if (!showSiteBanner) return null;

  return (
    <div className="border-b border-brand-pink-accent/30 bg-brand-pink-accent px-4 py-3 text-center text-white md:px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-3">
        <Percent className="h-4 w-4 shrink-0" aria-hidden />
        <p className="font-body text-sm leading-relaxed">
          <span className="font-semibold">{title}</span>
          {percentOff > 0 ? <span> · −{percentOff}%</span> : null}
          {until ? <span className="text-white/80"> · {until}</span> : null}
          <span className="text-white/90"> — {message}</span>
        </p>
      </div>
    </div>
  );
}
