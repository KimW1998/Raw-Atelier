import { useEffect, useMemo, useState } from "react";
import { ImagePlus, LoaderCircle, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StudioMediaItem {
  url: string;
  name: string;
  folder: string;
  mtime: number;
}

const FOLDER_LABELS: Record<string, string> = {
  uploads: "Uploads",
  shop: "Shop",
  portfolio: "Portfolio",
  pages: "Pagina's",
  services: "Diensten",
  about: "Over mij",
  fabrics: "Stoffen",
  images: "Overig",
};

let mediaCache: StudioMediaItem[] | null = null;

export function invalidateStudioMedia() {
  mediaCache = null;
}

export async function loadStudioMedia(force = false): Promise<StudioMediaItem[]> {
  if (mediaCache && !force) return mediaCache;
  const response = await fetch("/__studio/media");
  if (!response.ok) {
    throw new Error("Bestaande foto's laden lukt niet. Start `npx netlify dev` opnieuw.");
  }
  const data = (await response.json()) as { items?: StudioMediaItem[] };
  mediaCache = Array.isArray(data.items) ? data.items : [];
  return mediaCache;
}

function folderLabel(folder: string) {
  return FOLDER_LABELS[folder] || folder;
}

export function StudioMediaPicker({
  current,
  selected,
  multiple = false,
  onSelect,
  onUploadNew,
  onClose,
}: {
  current?: string;
  selected?: string[];
  multiple?: boolean;
  onSelect: (urls: string[]) => void;
  onUploadNew: () => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<StudioMediaItem[]>(mediaCache ?? []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(!mediaCache);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [picked, setPicked] = useState<string[]>(selected ?? (current ? [current] : []));

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError("");
    void loadStudioMedia()
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Laden mislukt");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const folders = useMemo(() => {
    const unique = [...new Set(items.map((item) => item.folder))];
    unique.sort((a, b) => folderLabel(a).localeCompare(folderLabel(b), "nl"));
    return unique;
  }, [items]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (folder !== "all" && item.folder !== folder) return false;
      if (!needle) return true;
      return item.name.toLowerCase().includes(needle) || item.url.toLowerCase().includes(needle);
    });
  }, [folder, items, query]);

  const toggle = (url: string) => {
    if (!multiple) {
      onSelect([url]);
      return;
    }
    setPicked((currentPicked) =>
      currentPicked.includes(url) ? currentPicked.filter((item) => item !== url) : [...currentPicked, url],
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-black/55 p-4">
      <div className="flex max-h-[min(720px,90vh)] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <h2 className="font-heading text-xl text-brand-black">Bestaande foto's</h2>
            <p className="mt-1 font-body text-sm leading-relaxed text-brand-black/60">
              Kies een foto die al op de site staat, of upload een nieuwe.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-brand-black/40 hover:text-brand-black"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 px-5">
          <label className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-black/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Zoek op naam…"
              className="w-full rounded-full border border-brand-pink-light bg-white py-2 pl-9 pr-3 font-body text-sm text-brand-black outline-none focus:border-brand-pink-accent"
            />
          </label>
          <button
            type="button"
            onClick={onUploadNew}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-pink-accent px-3 py-2 font-body text-sm font-semibold text-white"
          >
            <ImagePlus className="h-4 w-4" />
            Nieuwe foto
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 px-5">
          <button
            type="button"
            onClick={() => setFolder("all")}
            className={cn(
              "rounded-full px-3 py-1 font-body text-[11px] font-semibold",
              folder === "all" ? "bg-brand-black text-white" : "bg-brand-pink-light text-brand-black/70",
            )}
          >
            Alles
          </button>
          {folders.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFolder(id)}
              className={cn(
                "rounded-full px-3 py-1 font-body text-[11px] font-semibold",
                folder === id ? "bg-brand-black text-white" : "bg-brand-pink-light text-brand-black/70",
              )}
            >
              {folderLabel(id)}
            </button>
          ))}
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-auto px-5 pb-3">
          {busy ? (
            <div className="flex h-40 items-center justify-center text-brand-black/40">
              <LoaderCircle className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <p className="py-8 font-body text-sm text-red-700">{error}</p>
          ) : visible.length === 0 ? (
            <p className="py-8 font-body text-sm text-brand-black/50">Geen foto's gevonden.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {visible.map((item) => {
                const active = picked.includes(item.url);
                return (
                  <li key={item.url}>
                    <button
                      type="button"
                      onClick={() => toggle(item.url)}
                      className={cn(
                        "group relative w-full overflow-hidden rounded-2xl border bg-brand-pink-light text-left",
                        active ? "border-brand-pink-accent ring-2 ring-brand-pink-accent/40" : "border-transparent",
                      )}
                    >
                      <span className="block aspect-square">
                        <img src={item.url} alt="" className="h-full w-full object-cover" />
                      </span>
                      <span className="absolute inset-x-0 bottom-0 truncate bg-brand-black/55 px-2 py-1 font-body text-[10px] text-white">
                        {item.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {multiple ? (
          <div className="flex items-center justify-between gap-3 border-t border-brand-pink-light px-5 py-4">
            <p className="font-body text-xs text-brand-black/50">
              {picked.length ? `${picked.length} geselecteerd` : "Klik foto's aan om ze te gebruiken."}
            </p>
            <button
              type="button"
              disabled={!picked.length}
              onClick={() => onSelect(picked)}
              className="rounded-full bg-brand-pink-accent px-4 py-2 font-body text-sm font-semibold text-white disabled:opacity-50"
            >
              Deze gebruiken
            </button>
          </div>
        ) : (
          <div className="px-5 pb-4">
            <p className="font-body text-[11px] text-brand-black/40">Klik een foto om hem hier te zetten.</p>
          </div>
        )}
      </div>
    </div>
  );
}
