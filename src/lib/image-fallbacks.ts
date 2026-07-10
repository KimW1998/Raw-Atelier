export const PLACEHOLDER_IMAGES = {
  hero: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&q=80&auto=format&fit=crop",
  embroidery:
    "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=80&auto=format&fit=crop",
  thread:
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80&auto=format&fit=crop",
  textile:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop",
  digitizing:
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80&auto=format&fit=crop",
  gift: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80&auto=format&fit=crop",
  fashion:
    "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&q=80&auto=format&fit=crop",
  corporate:
    "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1200&q=80&auto=format&fit=crop",
  studio:
    "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=80&auto=format&fit=crop",
  product:
    "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=80&auto=format&fit=crop",
  default:
    "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=80&auto=format&fit=crop",
} as const;

export function getPlaceholderForSrc(src: string): string {
  if (src.includes("hero")) return PLACEHOLDER_IMAGES.hero;
  if (src.includes("live-events") || src.includes("events")) {
    return PLACEHOLDER_IMAGES.embroidery;
  }
  if (src.includes("corporate")) return PLACEHOLDER_IMAGES.corporate;
  if (src.includes("gifts") || src.includes("gift")) return PLACEHOLDER_IMAGES.gift;
  if (src.includes("digitizing")) return PLACEHOLDER_IMAGES.digitizing;
  if (src.includes("fashion")) return PLACEHOLDER_IMAGES.fashion;
  if (src.includes("studio") || src.includes("about")) return PLACEHOLDER_IMAGES.studio;
  if (src.includes("shop") || src.includes("product")) return PLACEHOLDER_IMAGES.product;
  if (src.includes("portfolio")) return PLACEHOLDER_IMAGES.textile;
  if (src.includes("services")) return PLACEHOLDER_IMAGES.embroidery;
  return PLACEHOLDER_IMAGES.default;
}
