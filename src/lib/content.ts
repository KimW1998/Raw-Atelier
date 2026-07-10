import yaml from "js-yaml";
import { deepMerge } from "./utils";

const contentModules = import.meta.glob("../../content/*/*.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
});

const contentCache: Record<string, Record<string, unknown>> = {};

export function loadContent(locale: string): Record<string, unknown> {
  if (contentCache[locale]) return contentCache[locale];

  let content: Record<string, unknown> = {};

  for (const [path, raw] of Object.entries(contentModules)) {
    if (!path.includes(`/content/${locale}/`)) continue;
    const parsed = yaml.load(raw as string) as Record<string, unknown>;
    if (parsed) content = deepMerge(content, parsed);
  }

  contentCache[locale] = content;
  return content;
}

export type ContentMessages = Record<string, unknown>;
