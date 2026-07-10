import { cn } from "@/lib/utils";
import {
  PATTERN_DEFAULT_OPACITY,
  PATTERN_PALETTES,
  PATTERN_TILE_SIZE,
  type PatternPalette,
} from "@/lib/brand-patterns";
import { BrandPatternArt, BrandPatternRepeat } from "./BrandPatternArt";

export type PatternVariant =
  | "subtle"
  | "hero"
  | "seamless"
  | "luxury"
  | "divider"
  | "section"
  | "footer";

interface PatternBackgroundProps {
  className?: string;
  opacity?: number;
  variant?: PatternVariant;
}

function resolvePalette(variant: PatternVariant): PatternPalette {
  switch (variant) {
    case "hero":
      return "brand";
    case "luxury":
      return "luxury";
    case "footer":
      return "footer";
    case "subtle":
    case "section":
    case "divider":
    case "seamless":
    default:
      return "subtle";
  }
}

export function PatternBackground({
  className,
  opacity,
  variant = "section",
}: PatternBackgroundProps) {
  const resolvedVariant = variant === "section" ? "subtle" : variant;
  const palette = resolvePalette(resolvedVariant);
  const colors = PATTERN_PALETTES[palette];
  const patternOpacity = opacity ?? PATTERN_DEFAULT_OPACITY[variant];

  if (resolvedVariant === "divider" || resolvedVariant === "seamless") {
    const tileWidth = PATTERN_TILE_SIZE[variant];

    if (resolvedVariant === "divider") {
      return (
        <div
          className={cn(
            "pointer-events-none relative w-full overflow-hidden",
            "h-28 md:h-40",
            className
          )}
          aria-hidden="true"
        >
          <BrandPatternRepeat tileWidth={tileWidth} opacity={patternOpacity} />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-offwhite via-transparent to-brand-offwhite" />
        </div>
      );
    }

    return (
      <div
        className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
        aria-hidden="true"
      >
        <BrandPatternRepeat tileWidth={tileWidth} opacity={patternOpacity} />
      </div>
    );
  }

  const artOpacity =
    resolvedVariant === "subtle"
      ? 0.13
      : resolvedVariant === "luxury"
        ? 0.92
        : resolvedVariant === "footer"
          ? patternOpacity
          : patternOpacity;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <BrandPatternArt
        colors={colors}
        className="absolute h-full w-full min-h-full min-w-full scale-105"
        opacity={artOpacity}
      />
      {resolvedVariant === "hero" && (
        <div className="absolute inset-0 bg-gradient-to-b from-brand-offwhite/40 via-brand-offwhite/10 to-brand-offwhite" />
      )}
      {resolvedVariant === "luxury" && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-offwhite/30 via-transparent to-brand-pink-light/20" />
      )}
      {resolvedVariant === "footer" && (
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-brand-black/60" />
      )}
    </div>
  );
}
