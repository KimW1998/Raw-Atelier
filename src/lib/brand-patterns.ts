export type PatternPalette = "brand" | "subtle" | "luxury" | "footer";

export interface PatternColors {
  base: string;
  blob: string;
  wave: string;
  waveAlt: string;
}

export const PATTERN_PALETTES: Record<PatternPalette, PatternColors> = {
  brand: {
    base: "#E7A7C7",
    blob: "#F6DCE8",
    wave: "#F6DCE8",
    waveAlt: "#F0D0E2",
  },
  subtle: {
    base: "#FAF8F6",
    blob: "#F6DCE8",
    wave: "#F3E3ED",
    waveAlt: "#EFE0EA",
  },
  luxury: {
    base: "#FAF8F6",
    blob: "#F6DCE8",
    wave: "#F4E5EE",
    waveAlt: "#F0DCE8",
  },
  footer: {
    base: "#1A1A1A",
    blob: "#F6DCE8",
    wave: "#E7A7C7",
    waveAlt: "#F6DCE8",
  },
};

export const PATTERN_DEFAULT_OPACITY: Record<
  "subtle" | "hero" | "seamless" | "luxury" | "divider" | "section" | "footer",
  number
> = {
  subtle: 1,
  hero: 0.58,
  seamless: 0.1,
  luxury: 1,
  divider: 0.18,
  section: 1,
  footer: 0.14,
};
