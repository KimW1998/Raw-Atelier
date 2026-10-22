import { useEffect, useRef, useState } from "react";
import { Crop, ImagePlus, Images, LoaderCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudioImageCropper } from "./image-crop";
import { invalidateStudioMedia, StudioMediaPicker } from "./media-library";
import { OrderButtons, moveItem } from "./order";

export type StudioMediaFolder = "portfolio" | "shop" | "fabrics" | "pages";

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif";

const MAX_EDGE = 2000;
const MAX_UPLOAD_BYTES = 1_400_000;

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("jpeg"))), "image/jpeg", quality);
  });
}

async function prepareImageFile(file: File): Promise<File> {
  const heic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.hei[cf]$/i.test(file.name);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    if (heic) {
      throw new Error("iPhone-foto (HEIC) lukt niet. Sla 'm op als JPG, of open de studio in Safari.");
    }
    if (file.size <= MAX_UPLOAD_BYTES && file.type.startsWith("image/")) return file;
    throw new Error("Deze foto is te groot of kan niet worden gelezen. Probeer JPG.");
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Foto verkleinen lukt niet");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob: Blob | null = null;
  for (let quality = 0.86; quality >= 0.5; quality -= 0.08) {
    blob = await canvasToJpeg(canvas, quality);
    if (blob.size <= MAX_UPLOAD_BYTES) break;
  }
  if (!blob) throw new Error("Foto verkleinen lukt niet");
  if (blob.size > 5_000_000) {
    throw new Error("Foto blijft te groot. Kies een andere of verklein 'm eerst.");
  }

  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}

function fetchErrorMessage(err: unknown): string {
  if (err instanceof TypeError) {
    return "Upload onderbroken. Start `npx netlify dev` opnieuw en probeer het nog eens.";
  }
  return err instanceof Error ? err.message : "Upload mislukt";
}

function withCacheBust(url: string) {
  const clean = url.split("?")[0];
  return `${clean}?t=${Date.now()}`;
}

function probeImage(url: string, timeoutMs: number) {
  return new Promise<boolean>((resolve) => {
    const image = new Image();
    const timer = window.setTimeout(() => {
      image.onload = null;
      image.onerror = null;
      resolve(false);
    }, timeoutMs);
    image.onload = () => {
      window.clearTimeout(timer);
      resolve(true);
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      resolve(false);
    };
    image.src = withCacheBust(url);
  });
}

async function waitUntilImageReady(url: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (await probeImage(url, 500)) return;
    await new Promise((resolve) => window.setTimeout(resolve, 80 + attempt * 40));
  }
}

async function uploadStudioImage(file: File, folder: StudioMediaFolder): Promise<string> {
  const prepared = await prepareImageFile(file);
  const response = await fetch("/__studio/upload", {
    method: "POST",
    headers: {
      "Content-Type": prepared.type || "image/jpeg",
      "X-Studio-Folder": folder,
      "X-Studio-Name": encodeURIComponent(prepared.name),
    },
    body: prepared,
  });
  let data: { url?: string; error?: string } = {};
  try {
    data = (await response.json()) as { url?: string; error?: string };
  } catch {
    data = {};
  }
  if (!response.ok || !data.url) {
    throw new Error(data.error || "Upload mislukt");
  }
  await waitUntilImageReady(data.url);
  invalidateStudioMedia();
  return data.url;
}

function imageFilesFrom(list: FileList | DataTransferItemList | File[] | null | undefined): File[] {
  if (!list) return [];
  const files: File[] = [];
  if (list instanceof FileList) {
    files.push(...Array.from(list));
  } else if (Array.isArray(list)) {
    files.push(...list);
  } else {
    for (const item of Array.from(list)) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
  }
  return files.filter(
    (file) =>
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|hei[cf])$/i.test(file.name),
  );
}

function pickImageFile(event: { dataTransfer?: DataTransfer | null; target?: EventTarget | null }) {
  return imageFilesFrom(event.dataTransfer?.files ?? (event.target as HTMLInputElement | null)?.files)[0] ?? null;
}

export function StudioImageField({
  value,
  onChange,
  folder,
  label = "Foto",
  optional = false,
  aspect = "1/1",
  className,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: StudioMediaFolder;
  label?: string;
  optional?: boolean;
  aspect?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [broken, setBroken] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [displaySrc, setDisplaySrc] = useState(value);
  const retriesRef = useRef(0);

  useEffect(() => {
    setBroken(false);
    retriesRef.current = 0;
    setDisplaySrc(value);
  }, [value]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadStudioImage(file, folder));
    } catch (err) {
      setError(fetchErrorMessage(err));
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
        onClick={() => setLibraryOpen(true)}
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
          "relative flex w-full overflow-hidden rounded-2xl border border-dashed bg-white text-left transition-colors",
          dragOver || !value || broken ? "border-brand-pink" : "border-brand-pink-light",
          busy && "opacity-70",
        )}
        style={{ aspectRatio: aspect.replace("/", " / ") }}
      >
        {value && !broken ? (
          <img
            src={displaySrc}
            alt=""
            className="h-full w-full object-cover"
            onError={() => {
              if (retriesRef.current >= 8) {
                setBroken(true);
                return;
              }
              retriesRef.current += 1;
              window.setTimeout(() => setDisplaySrc(withCacheBust(value)), 100 * retriesRef.current);
            }}
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center font-body text-xs text-brand-black/50">
            <ImagePlus className="h-5 w-5" />
            {broken ? "Foto niet gevonden" : "Kies foto"}
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
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => void handleFile(pickImageFile(event))}
      />
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="truncate font-body text-[11px] text-brand-black/40">
          {busy ? "Uploaden…" : value ? "Kies bestaande of sleep een nieuwe" : "Bestaande foto of nieuw bestand"}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setLibraryOpen(true)}
            className="inline-flex items-center gap-0.5 font-body text-[11px] text-brand-black/60 hover:text-brand-black"
          >
            <Images className="h-3 w-3" />
            Bestaande
          </button>
          {value && !broken ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setCropOpen(true)}
              className="inline-flex items-center gap-0.5 font-body text-[11px] text-brand-black/60 hover:text-brand-black"
            >
              <Crop className="h-3 w-3" />
              Uitsnede
            </button>
          ) : null}
          {optional && value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="font-body text-[11px] text-brand-rose hover:underline"
            >
              Weg
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-1 font-body text-xs text-red-700">{error}</p> : null}
      {libraryOpen ? (
        <StudioMediaPicker
          current={value}
          selected={value ? [value] : []}
          onClose={() => setLibraryOpen(false)}
          onUploadNew={() => {
            setLibraryOpen(false);
            inputRef.current?.click();
          }}
          onSelect={([url]) => {
            if (url) onChange(url);
            setLibraryOpen(false);
          }}
        />
      ) : null}
      {cropOpen && value ? (
        <StudioImageCropper
          src={value}
          aspect={aspect}
          onClose={() => setCropOpen(false)}
          onApply={async (file) => {
            setBusy(true);
            setError("");
            try {
              onChange(await uploadStudioImage(file, folder));
              setCropOpen(false);
            } catch (err) {
              setError(fetchErrorMessage(err));
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}

export function StudioImageList({
  images,
  onChange,
  folder,
  aspect = "1/1",
}: {
  images: string[];
  onChange: (images: string[]) => void;
  folder: StudioMediaFolder;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const addFiles = async (list: FileList | File[] | null) => {
    const files = imageFilesFrom(list);
    if (!files.length) return;
    setBusy(true);
    setError("");
    const uploaded: string[] = [];
    const failed: string[] = [];
    try {
      for (const file of files) {
        try {
          uploaded.push(await uploadStudioImage(file, folder));
        } catch (err) {
          failed.push(fetchErrorMessage(err));
        }
      }
      if (uploaded.length) onChange([...images, ...uploaded]);
      if (failed.length) {
        setError(
          uploaded.length
            ? `${uploaded.length} foto’s gezet. ${failed[0]}`
            : failed[0] || "Upload mislukt",
        );
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-xs text-brand-black/50">
          Foto's (eerste = hoofdfoto). Kies bestaande of upload nieuwe.
        </span>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setLibraryOpen(true)}
            className="rounded-full bg-white px-3 py-1 font-body text-[11px] font-semibold text-brand-black ring-1 ring-brand-pink-light disabled:opacity-50"
          >
            Bestaande
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-brand-pink-accent px-3 py-1 font-body text-[11px] font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Uploaden…" : "+ Foto's"}
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(event) => void addFiles(event.target.files)}
      />
      {images.length === 0 ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => setLibraryOpen(true)}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            void addFiles(Array.from(event.dataTransfer.files));
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-white px-3 py-8 font-body text-sm text-brand-black/50",
            dragOver ? "border-brand-pink-accent bg-brand-pink-light/40" : "border-brand-pink",
          )}
        >
          <ImagePlus className="h-4 w-4" />
          Bestaande kiezen, of nieuwe hierheen slepen
        </button>
      ) : (
        <>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((src, index) => (
              <li key={`${src}-${index}`} className="relative">
                <StudioImageField
                  value={src}
                  folder={folder}
                  aspect={aspect}
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
          <button
            type="button"
            disabled={busy}
            onClick={() => setLibraryOpen(true)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              void addFiles(Array.from(event.dataTransfer.files));
            }}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed px-3 py-4 font-body text-xs text-brand-black/50",
              dragOver ? "border-brand-pink-accent bg-brand-pink-light/40" : "border-brand-pink bg-white",
            )}
          >
            <ImagePlus className="h-4 w-4" />
            Extra foto's: bestaande of nieuwe
          </button>
        </>
      )}
      <p className="font-body text-[11px] leading-relaxed text-brand-black/40">
        Bestaande foto's kun je hergebruiken. Nieuwe bestanden worden verkleind.
      </p>
      {error ? <p className="font-body text-xs text-red-700">{error}</p> : null}
      {libraryOpen ? (
        <StudioMediaPicker
          multiple
          onClose={() => setLibraryOpen(false)}
          onUploadNew={() => {
            setLibraryOpen(false);
            inputRef.current?.click();
          }}
          onSelect={(urls) => {
            const extra = urls.filter((url) => !images.includes(url));
            if (extra.length) onChange([...images, ...extra]);
            setLibraryOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
