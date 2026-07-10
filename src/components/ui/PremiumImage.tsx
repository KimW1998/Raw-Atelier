import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
}

const UNSPLASH_FALLBACKS: Record<string, string> = {
  hero: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&q=80",
  embroidery: "https://images.unsplash.com/photo-1594736797933-d0cbc0b8d0e8?w=1200&q=80",
  thread: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80",
  textile: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  workshop: "https://images.unsplash.com/photo-1452860606248-08befc0ff4a9?w=1200&q=80",
  gift: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80",
  fashion: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&q=80",
  corporate: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1200&q=80",
  studio: "https://images.unsplash.com/photo-1528744599571-75e7aa71b3ae?w=1200&q=80",
  product: "https://images.unsplash.com/photo-1594736797933-d0cbc0b8d0e8?w=800&q=80",
};

function getFallbackSrc(src: string): string {
  if (src.includes("hero")) return UNSPLASH_FALLBACKS.hero;
  if (src.includes("live-events") || src.includes("events")) return UNSPLASH_FALLBACKS.embroidery;
  if (src.includes("corporate")) return UNSPLASH_FALLBACKS.corporate;
  if (src.includes("gifts") || src.includes("gift")) return UNSPLASH_FALLBACKS.gift;
  if (src.includes("workshop")) return UNSPLASH_FALLBACKS.workshop;
  if (src.includes("fashion")) return UNSPLASH_FALLBACKS.fashion;
  if (src.includes("studio") || src.includes("about")) return UNSPLASH_FALLBACKS.studio;
  if (src.includes("shop") || src.includes("product")) return UNSPLASH_FALLBACKS.product;
  if (src.includes("portfolio")) return UNSPLASH_FALLBACKS.textile;
  return UNSPLASH_FALLBACKS.embroidery;
}

export function PremiumImage({
  src,
  alt,
  className,
  priority = false,
  fill = false,
  width,
  height,
  sizes,
}: ImagePlaceholderProps) {
  const fallbackSrc = getFallbackSrc(src);

  if (fill) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        priority={priority}
        sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
      />
    );
  }

  return (
    <Image
      src={fallbackSrc}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={cn("object-cover", className)}
      priority={priority}
      sizes={sizes}
    />
  );
}
