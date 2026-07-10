export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T {
  const output = { ...target } as Record<string, unknown>;

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = output[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      output[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else {
      output[key] = sourceValue;
    }
  });

  return output as T;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as object)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function translate(
  messages: Record<string, unknown>,
  namespace: string | undefined,
  key: string,
  params?: Record<string, string>
): string {
  const fullKey = namespace ? `${namespace}.${key}` : key;
  const value = getNestedValue(messages, fullKey);

  if (typeof value !== "string") return fullKey;

  if (!params) return value;

  return Object.entries(params).reduce(
    (text, [param, replacement]) => text.replace(`{${param}}`, replacement),
    value
  );
}

export function translateRaw(
  messages: Record<string, unknown>,
  namespace: string | undefined,
  key: string
): unknown {
  const fullKey = namespace ? `${namespace}.${key}` : key;
  return getNestedValue(messages, fullKey);
}
