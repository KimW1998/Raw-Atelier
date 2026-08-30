import { useState } from "react";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { useTranslations } from "@/i18n/context";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const t = useTranslations("shop");
  const [active, setActive] = useState(0);
  const gallery = images.length > 0 ? images : [];
  const current = gallery[Math.min(active, Math.max(gallery.length - 1, 0))] ?? "";

  if (!current) return null;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-sm">
        <PremiumImage
          src={current}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {gallery.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label={t("product.photos")}>
          {gallery.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={t("product.photoOf", {
                  current: String(index + 1),
                  total: String(gallery.length),
                })}
                aria-pressed={index === active}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-2xl ring-1 transition-all",
                  index === active
                    ? "ring-2 ring-brand-pink-accent ring-offset-2 ring-offset-brand-offwhite"
                    : "ring-brand-pink-light hover:ring-brand-pink",
                )}
              >
                <PremiumImage src={src} alt="" fill sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
