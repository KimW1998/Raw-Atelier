import fs from "fs";
import path from "path";
import yaml from "js-yaml";

function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === "object" && !Array.isArray(item));
}

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T {
  const output = { ...target } as Record<string, unknown>;

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = output[key];

    if (isObject(sourceValue) && isObject(targetValue)) {
      output[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue
      );
    } else {
      output[key] = sourceValue;
    }
  });

  return output as T;
}

export async function loadContent(locale: string): Promise<Record<string, unknown>> {
  const contentDir = path.join(process.cwd(), "content", locale);

  if (!fs.existsSync(contentDir)) {
    throw new Error(`Content directory not found for locale: ${locale}`);
  }

  const files = fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort();

  let content: Record<string, unknown> = {};

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const fileContent = yaml.load(
      fs.readFileSync(filePath, "utf8")
    ) as Record<string, unknown>;

    if (fileContent) {
      content = deepMerge(content, fileContent);
    }
  }

  return content;
}

export type ContentMessages = Record<string, unknown>;
