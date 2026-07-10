import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { loadContent } from "@/lib/content";
import { translate, translateRaw } from "@/lib/utils";

export const routing = {
  locales: ["en", "nl"] as const,
  defaultLocale: "en" as const,
};

export type Locale = (typeof routing.locales)[number];

type TranslationFn = ((
  key: string,
  params?: Record<string, string>
) => string) & {
  raw: (key: string) => unknown;
};

interface I18nContextValue {
  locale: Locale;
  messages: Record<string, unknown>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const messages = useMemo(() => loadContent(locale), [locale]);

  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within LocaleProvider");
  return context;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

export function useTranslations(namespace?: string): TranslationFn {
  const { messages } = useI18n();

  const fn = useCallback(
    (key: string, params?: Record<string, string>) =>
      translate(messages, namespace, key, params),
    [messages, namespace]
  ) as TranslationFn;

  fn.raw = (key: string) => translateRaw(messages, namespace, key);

  return fn;
}
