export type StudioPageId =
  | "home"
  | "about"
  | "services"
  | "portfolio"
  | "shop"
  | "contact"
  | "global"
  | "legal";

export interface StudioPage {
  id: StudioPageId;
  label: string;
  previewPath: string;
  sources: { file: string; roots?: string[] }[];
  extra?: "portfolio" | "shop";
}

export const STUDIO_PAGES: StudioPage[] = [
  {
    id: "home",
    label: "Home",
    previewPath: "/",
    sources: [
      { file: "home" },
      { file: "shared", roots: ["testimonials", "process"] },
    ],
  },
  {
    id: "about",
    label: "Over mij",
    previewPath: "/about",
    sources: [
      { file: "about" },
      { file: "shared", roots: ["faq"] },
    ],
  },
  {
    id: "services",
    label: "Diensten",
    previewPath: "/services",
    sources: [{ file: "services" }],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    previewPath: "/portfolio",
    sources: [{ file: "portfolio" }],
    extra: "portfolio",
  },
  {
    id: "shop",
    label: "Shop",
    previewPath: "/shop",
    sources: [{ file: "shop" }],
    extra: "shop",
  },
  {
    id: "contact",
    label: "Contact",
    previewPath: "/contact",
    sources: [{ file: "contact" }],
  },
  {
    id: "global",
    label: "Menu & footer",
    previewPath: "/",
    sources: [{ file: "global" }],
  },
  {
    id: "legal",
    label: "Voorwaarden",
    previewPath: "/legal/terms",
    sources: [{ file: "legal" }],
  },
];

export function studioPageByPath(path: string): StudioPage | undefined {
  const normalized = path === "" ? "/" : path;
  return STUDIO_PAGES.find((page) => page.previewPath === normalized);
}

export function studioPageById(id: string | undefined): StudioPage {
  return STUDIO_PAGES.find((page) => page.id === id) ?? STUDIO_PAGES[0];
}
