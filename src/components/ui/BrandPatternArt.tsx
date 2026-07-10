import type { PatternColors } from "@/lib/brand-patterns";

interface BrandPatternArtProps {
  colors: PatternColors;
  className?: string;
  opacity?: number;
}

export function BrandPatternArt({
  colors,
  className,
  opacity = 1,
}: BrandPatternArtProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 360 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ opacity }}
    >
      <rect width="360" height="640" fill={colors.base} />

      <path
        d="M-24,-12 C72,8 148,52 196,112 C228,152 214,212 168,236 C108,268 36,228 8,156 C-8,108 -8,36 -24,-12 Z"
        fill={colors.blob}
      />
      <path
        d="M-32,392 C48,356 128,420 196,404 C252,392 296,448 360,520 L360,680 L-32,680 Z"
        fill={colors.blob}
      />

      <path
        d="M188,0 C214,88 178,168 206,252 C224,308 196,388 218,468 C232,524 204,584 224,640 L268,640 C248,560 276,480 252,400 C232,320 262,240 242,160 C226,84 256,36 244,0 Z"
        fill={colors.wave}
      />
      <path
        d="M252,0 C276,92 246,176 272,260 C288,320 262,404 284,484 C298,544 270,600 288,640 L332,640 C312,556 338,472 312,388 C292,304 322,220 300,136 C284,72 308,28 296,0 Z"
        fill={colors.waveAlt}
      />
      <path
        d="M300,0 C318,76 296,148 314,228 C326,284 306,360 322,436 C332,492 312,548 326,640 L360,640 L360,0 Z"
        fill={colors.wave}
        opacity="0.85"
      />
    </svg>
  );
}

function seamlessTileSvg(colors: PatternColors) {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240'><rect width='320' height='240' fill='${colors.base}'/><path d='M0,0 C26,84 70,43 109,101 C134,139 96,187 122,240 L0,240 Z' fill='${colors.blob}' opacity='0.55'/><path d='M154,0 C179,67 160,125 186,182 C198,216 173,240 205,240 L230,240 C211,197 237,139 218,86 C198,38 224,14 211,0 Z' fill='${colors.wave}'/><path d='M218,0 C243,58 230,115 256,173 C269,211 243,240 275,240 L320,240 L320,0 Z' fill='${colors.waveAlt}' opacity='0.9'/></svg>`;
}

export function SeamlessPatternFill({
  colors,
  opacity = 0.1,
}: {
  colors: PatternColors;
  opacity?: number;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(seamlessTileSvg(colors))}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "420px 320px",
      }}
      aria-hidden="true"
    />
  );
}
