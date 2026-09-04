import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderButtons, moveItem } from "./order";

export type StudioMediaFolder = "portfolio" | "shop" | "fabrics";

async function uploadStudioImage(file: File, folder: StudioMediaFolder): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  const response = await fetch("/api/studio-upload", { method: "POST", body });
  const data = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !data.url) {
    throw new Error(data.error || "Upload mislukt");
  }
  return data.url;
}

function pickImageFile(event: { dataTransfer?: DataTransfer | null; target?: EventTarget | null }) {
  const fromDrop = event.dataTransfer?.files;
  const fromInput = (event.target as HTMLInputElement | null)?.files;
  const file = fromDrop?.[0] ?? fromInput?.[0];
  if (!file || !file.type.startsWith("image/")) return null;
  return file;
}

export function StudioImageField({
  value,
  onChange,
  folder,
  label = "Foto",
  optional = false,
  className,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: StudioMediaFolder;
  label?: string;
  optional?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadStudioImage(file, folder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("min-w-0", className)}>
      <span className="mb-1.5 block font-body text-xs text-brand-black/50">{label}</span>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void handleFile(pickImageFile(event));
        }}
        className={cn(
          "relative flex aspect-square w-full overflow-hidden rounded-2xl border border-dashed bg-white text-left transition-colors",
          dragOver || !value
            ? "border-brand-pink"
            : "border-brand-pink-light",
          busy && "opacity-70",
        )}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center font-body text-xs text-brand-black/50">
            <ImagePlus className="h-5 w-5" />
            Kies foto
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <LoaderCircle className="h-6 w-6 animate-spin text-brand-pink-accent" />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => void handleFile(pickImageFile(event))}
      />
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="truncate font-body text-[11px] text-brand-black/40">
          {busy ? "Uploaden…" : value ? "Klik of sleep om te vervangen" : "JPG, PNG of WebP"}
        </p>
        {optional && value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 font-body text-[11px] text-brand-rose hover:underline"
          >
            Weg
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 font-body text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

export function StudioImageList({
  images,
  onChange,
  folder,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  folder: StudioMediaFolder;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        uploaded.push(await uploadStudioImage(file, folder));
      }
      if (uploaded.length) onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-xs text-brand-black/50">
          Foto's (eerste = hoofdfoto, omhoog/omlaag = volgorde)
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-brand-pink-light px-3 py-1 font-body text-[11px] font-semibold text-brand-black"
        >
          {busy ? "Uploaden…" : "+ Foto's"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(event) => void addFiles(event.target.files)}
      />
      {images.length === 0 ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-pink bg-white px-3 py-8 font-body text-sm text-brand-black/50"
        >
          <ImagePlus className="h-4 w-4" />
          Foto's kiezen
        </button>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((src, index) => (
            <li key={`${src}-${index}`} className="relative">
              <StudioImageField
                value={src}
                folder={folder}
                label={index === 0 ? "Hoofdfoto" : `Foto ${index + 1}`}
                onChange={(url) =>
                  onChange(images.map((item, i) => (i === index ? url : item)))
                }
              />
              <div className="mt-1 flex flex-col gap-1">
                <OrderButtons
                  index={index}
                  total={images.length}
                  onMove={(direction) => onChange(moveItem(images, index, direction))}
                />
                <div className="flex items-center justify-between gap-1">
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...images];
                        const [picked] = next.splice(index, 1);
                        onChange([picked, ...next]);
                      }}
                      className="font-body text-[10px] text-brand-black/50 hover:text-brand-black"
                    >
                      Hoofdfoto
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => onChange(images.filter((_, i) => i !== index))}
                    className="ml-auto text-brand-black/40 hover:text-brand-rose"
                    aria-label="Foto verwijderen"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error ? <p className="font-body text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
