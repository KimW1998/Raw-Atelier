import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { type Locale } from "@/i18n/context";
import { cn } from "@/lib/utils";
import {
  collectFields,
  dumpYaml,
  fileForPath,
  getAt,
  loadStudioDraft,
  messagesFromFiles,
  pickRoots,
  setAt,
  type FieldSpec,
  type FileBundle,
  type StudioDraft,
} from "./content";
import { BilingualField, BilingualListField, FieldGroup } from "./fields";
import { PortfolioItemsEditor, ShopProductsEditor } from "./extras";
import { STUDIO_PAGES, studioPageById, type StudioPage } from "./pages";
import { StudioPreview } from "./StudioPreview";
import { StudioErrorBoundary } from "./StudioErrorBoundary";

function mergeSources(bundle: FileBundle, page: StudioPage): Record<string, unknown> {
  let doc: Record<string, unknown> = {};
  for (const source of page.sources) {
    doc = { ...doc, ...pickRoots(bundle[source.file], source.roots) };
  }
  return doc;
}

function renderFields(
  fields: FieldSpec[],
  nlDoc: Record<string, unknown>,
  enDoc: Record<string, unknown>,
  onChange: (locale: Locale, path: string, value: unknown) => void,
): ReactNode {
  return fields.map((field) => {
    if (field.type === "group" && field.children) {
      return (
        <FieldGroup key={field.path} field={field}>
          {renderFields(field.children, nlDoc, enDoc, onChange)}
        </FieldGroup>
      );
    }

    if (field.type === "stringList") {
      const nl = (getAt(nlDoc, field.path) as string[] | undefined) ?? [];
      const en = (getAt(enDoc, field.path) as string[] | undefined) ?? [];
      return (
        <BilingualListField
          key={field.path}
          field={field}
          nl={nl}
          en={en}
          onChange={(locale, value) => onChange(locale, field.path, value)}
        />
      );
    }

    const nl = String(getAt(nlDoc, field.path) ?? "");
    const en = String(getAt(enDoc, field.path) ?? "");
    return (
      <BilingualField
        key={field.path}
        field={field}
        nl={nl}
        en={en}
        onChange={(locale, value) => onChange(locale, field.path, value)}
      />
    );
  });
}

export function StudioApp() {
  const { page: pageParam } = useParams();
  const navigate = useNavigate();
  const page = studioPageById(pageParam);
  const [draft, setDraft] = useState<StudioDraft>(() => loadStudioDraft());
  const [baseline] = useState(() => JSON.stringify(loadStudioDraft()));
  const [previewLocale, setPreviewLocale] = useState<Locale>("nl");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Raw Atelier studio";
    document.documentElement.lang = "nl";
  }, []);

  const dirty = JSON.stringify(draft) !== baseline;

  const nlView = useMemo(() => mergeSources(draft.files.nl, page), [draft.files.nl, page]);
  const enView = useMemo(() => mergeSources(draft.files.en, page), [draft.files.en, page]);
  const fields = useMemo(() => collectFields(nlView, enView), [nlView, enView]);
  const previewMessages = useMemo(
    () => messagesFromFiles(draft.files[previewLocale]),
    [draft.files, previewLocale],
  );

  const updatePath = useCallback(
    (locale: Locale, path: string, value: unknown) => {
      setDraft((current) => {
        const file = fileForPath(current.files[locale], path);
        if (!file) return current;
        return {
          ...current,
          files: {
            ...current.files,
            [locale]: {
              ...current.files[locale],
              [file]: setAt(current.files[locale][file], path, value),
            },
          },
        };
      });
      setStatus("idle");
    },
    [],
  );

  const save = async () => {
    setStatus("saving");
    setError("");

    const files: { path: string; content: string }[] = [];
    const original = JSON.parse(baseline) as StudioDraft;

    for (const locale of ["nl", "en"] as const) {
      for (const [name, doc] of Object.entries(draft.files[locale])) {
        if (JSON.stringify(doc) !== JSON.stringify(original.files[locale][name])) {
          files.push({
            path: `content/${locale}/${name}.yaml`,
            content: dumpYaml(doc),
          });
        }
      }
    }

    if (JSON.stringify(draft.portfolioItems) !== JSON.stringify(original.portfolioItems)) {
      files.push({
        path: "content/portfolio-items.yaml",
        content: dumpYaml({ items: draft.portfolioItems }),
      });
    }

    if (JSON.stringify(draft.shopProducts) !== JSON.stringify(original.shopProducts)) {
      files.push({
        path: "src/data/shop-catalog.json",
        content: `${JSON.stringify({ products: draft.shopProducts }, null, 2)}\n`,
      });
    }

    try {
      const response = await fetch("/api/studio-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Opslaan is niet gelukt.");
      }
      setStatus("saved");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Opslaan is niet gelukt.");
    }
  };

  return (
      <div className="flex h-screen overflow-hidden bg-brand-offwhite text-brand-black">
        <aside className="flex w-52 shrink-0 flex-col border-r border-brand-pink-light bg-white">
          <div className="border-b border-brand-pink-light px-4 py-4">
            <p className="font-heading text-xl">Studio</p>
            <p className="mt-1 font-body text-xs text-brand-black/50">Raw Atelier</p>
          </div>
          <nav className="flex-1 space-y-1 overflow-auto p-3">
            {STUDIO_PAGES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/studio/${item.id}`)}
                className={cn(
                  "block w-full rounded-xl px-3 py-2 text-left font-body text-sm",
                  item.id === page.id
                    ? "bg-brand-pink-light font-semibold"
                    : "hover:bg-brand-offwhite",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="border-t border-brand-pink-light p-3 font-body text-xs text-brand-black/50">
            <Link to="/nl" className="hover:text-brand-rose">
              Naar de website
            </Link>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-brand-pink-light bg-white px-4 py-3">
            <div>
              <h1 className="font-heading text-2xl">{page.label}</h1>
              <p className="font-body text-xs text-brand-black/50">
                Links Nederlands, rechts Engels. Rechts zie je de pagina zoals bezoekers die zien.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-brand-pink-light bg-brand-offwhite p-1">
                {(["nl", "en"] as const).map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => setPreviewLocale(locale)}
                    className={cn(
                      "rounded-full px-3 py-1 font-body text-xs font-semibold",
                      previewLocale === locale ? "bg-brand-black text-white" : "text-brand-black/60",
                    )}
                  >
                    {locale === "nl" ? "Voorbeeld NL" : "Preview EN"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={save}
                disabled={!dirty || status === "saving"}
                className="rounded-full bg-brand-pink-accent px-4 py-2 font-body text-sm font-semibold text-white disabled:opacity-40"
              >
                {status === "saving" ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </header>
          {status === "saved" ? (
            <p className="bg-brand-pink-light px-4 py-2 font-body text-sm text-brand-rose">
              Opgeslagen. Vernieuw de website om de live versie te zien.
            </p>
          ) : null}
          {status === "error" ? (
            <p className="bg-red-50 px-4 py-2 font-body text-sm text-red-800">{error}</p>
          ) : null}

          <div className="grid min-h-0 flex-1 grid-cols-[minmax(460px,38vw)_minmax(0,1fr)]">
            <div className="min-h-0 space-y-5 overflow-auto border-r border-brand-pink-light p-5">
              {page.extra === "portfolio" ? (
                <PortfolioItemsEditor
                  items={draft.portfolioItems}
                  onChange={(portfolioItems) => {
                    setDraft((current) => ({ ...current, portfolioItems }));
                    setStatus("idle");
                  }}
                />
              ) : null}
              {page.extra === "shop" ? (
                <ShopProductsEditor
                  products={draft.shopProducts}
                  onChange={(shopProducts) => {
                    setDraft((current) => ({ ...current, shopProducts }));
                    setStatus("idle");
                  }}
                />
              ) : null}
              {renderFields(fields, nlView, enView, updatePath)}
            </div>
            <div className="min-h-0 bg-[#eee6e1]">
              <StudioErrorBoundary>
                <StudioPreview
                  locale={previewLocale}
                  path={page.previewPath}
                  messages={previewMessages}
                  portfolioItems={draft.portfolioItems}
                  shopProducts={draft.shopProducts}
                  onPreviewLocale={setPreviewLocale}
                />
              </StudioErrorBoundary>
            </div>
          </div>
        </section>
      </div>
  );
}
