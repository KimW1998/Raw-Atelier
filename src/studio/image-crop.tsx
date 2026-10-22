import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { LoaderCircle } from "lucide-react";

const OUTPUT = 1600;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export type CropAspect = { w: number; h: number };

export function parseAspect(value = "1/1"): CropAspect {
  const [w, h] = value.split("/").map(Number);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return { w: 1, h: 1 };
  return { w, h };
}

function coverScale(width: number, height: number, frameW: number, frameH: number) {
  return Math.max(frameW / width, frameH / height);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function limits(width: number, height: number, frameW: number, frameH: number, zoom: number) {
  const scale = coverScale(width, height, frameW, frameH) * zoom;
  const displayW = width * scale;
  const displayH = height * scale;
  return {
    scale,
    displayW,
    displayH,
    minX: Math.min(0, frameW - displayW),
    minY: Math.min(0, frameH - displayH),
  };
}

function centeredOffset(width: number, height: number, frameW: number, frameH: number, zoom: number) {
  const { displayW, displayH, minX, minY } = limits(width, height, frameW, frameH, zoom);
  return {
    x: clamp((frameW - displayW) / 2, minX, 0),
    y: clamp((frameH - displayH) / 2, minY, 0),
  };
}

function outputSize(aspect: CropAspect) {
  const long = Math.max(aspect.w, aspect.h);
  return {
    width: Math.max(1, Math.round((OUTPUT * aspect.w) / long)),
    height: Math.max(1, Math.round((OUTPUT * aspect.h) / long)),
  };
}

async function loadBitmap(src: string): Promise<ImageBitmap> {
  const response = await fetch(src);
  if (!response.ok) throw new Error("Foto laden mislukt");
  return createImageBitmap(await response.blob());
}

export function StudioImageCropper({
  src,
  aspect = "1/1",
  onClose,
  onApply,
}: {
  src: string;
  aspect?: string;
  onClose: () => void;
  onApply: (file: File) => Promise<void>;
}) {
  const ratio = parseAspect(aspect);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [frame, setFrame] = useState({ w: 320, h: 320 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loaded: ImageBitmap | null = null;
    setBitmap(null);
    setError("");
    void loadBitmap(src)
      .then((next) => {
        loaded = next;
        if (cancelled) {
          next.close();
          return;
        }
        setBitmap(next);
      })
      .catch(() => {
        if (!cancelled) setError("Foto kon niet worden geladen.");
      });
    return () => {
      cancelled = true;
      loaded?.close();
    };
  }, [src]);

  useEffect(() => {
    if (!bitmap) return;
    setZoom(1);
    setOffset(centeredOffset(bitmap.width, bitmap.height, frame.w, frame.h, 1));
  }, [bitmap, frame.h, frame.w]);

  useEffect(() => {
    const box = frameRef.current;
    if (!box) return;
    const measure = () => {
      const maxW = Math.round(Math.min(box.clientWidth, 420));
      const maxH = 380;
      let w = Math.max(220, maxW);
      let h = Math.round((w * ratio.h) / ratio.w);
      if (h > maxH) {
        h = maxH;
        w = Math.round((h * ratio.w) / ratio.h);
      }
      setFrame({ w: Math.max(160, w), h: Math.max(160, h) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [ratio.h, ratio.w]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const applyZoom = useCallback(
    (nextZoom: number) => {
      if (!bitmap) return;
      const zoomed = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      const prev = limits(bitmap.width, bitmap.height, frame.w, frame.h, zoom);
      const next = limits(bitmap.width, bitmap.height, frame.w, frame.h, zoomed);
      const cx = frame.w / 2;
      const cy = frame.h / 2;
      const sourceX = (cx - offset.x) / prev.scale;
      const sourceY = (cy - offset.y) / prev.scale;
      setZoom(zoomed);
      setOffset({
        x: clamp(cx - sourceX * next.scale, next.minX, 0),
        y: clamp(cy - sourceY * next.scale, next.minY, 0),
      });
    },
    [bitmap, frame.h, frame.w, offset.x, offset.y, zoom],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !bitmap) return;
    const next = limits(bitmap.width, bitmap.height, frame.w, frame.h, zoom);
    setOffset({
      x: clamp(dragRef.current.ox + (event.clientX - dragRef.current.x), next.minX, 0),
      y: clamp(dragRef.current.oy + (event.clientY - dragRef.current.y), next.minY, 0),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const save = async () => {
    if (!bitmap) return;
    setBusy(true);
    setError("");
    try {
      const { scale } = limits(bitmap.width, bitmap.height, frame.w, frame.h, zoom);
      const sx = clamp(-offset.x / scale, 0, Math.max(0, bitmap.width - frame.w / scale));
      const sy = clamp(-offset.y / scale, 0, Math.max(0, bitmap.height - frame.h / scale));
      const sw = Math.min(bitmap.width - sx, frame.w / scale);
      const sh = Math.min(bitmap.height - sy, frame.h / scale);
      const { width: outW, height: outH } = outputSize(ratio);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);
      ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outW, outH);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("jpeg"))), "image/jpeg", 0.9);
      });
      const name = src.split("/").pop()?.replace(/\.[^.]+$/, "") || "foto";
      await onApply(new File([blob], `${name}-crop.jpg`, { type: "image/jpeg" }));
    } catch {
      setError("Uitsnede opslaan lukt niet.");
      setBusy(false);
    }
  };

  const drawn = bitmap ? limits(bitmap.width, bitmap.height, frame.w, frame.h, zoom) : null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-black/55 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl">
        <h2 className="font-heading text-xl text-brand-black">Foto uitsnede</h2>
        <p className="mt-1 font-body text-sm leading-relaxed text-brand-black/60">
          Sleep de foto tot het juiste stuk in het kader valt. Zoom in als je dichterop wilt.
        </p>
        <div ref={frameRef} className="mx-auto mt-4 w-full max-w-[420px]">
          <div
            className="relative overflow-hidden rounded-2xl border border-brand-pink bg-brand-pink-light touch-none"
            style={{ width: frame.w, height: frame.h, margin: "0 auto" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={(event) => {
              event.preventDefault();
              applyZoom(zoom + (event.deltaY > 0 ? -0.08 : 0.08));
            }}
          >
            {bitmap && drawn ? (
              <img
                src={src}
                alt=""
                draggable={false}
                className="absolute max-w-none select-none"
                style={{
                  width: drawn.displayW,
                  height: drawn.displayH,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
              />
            ) : (
              <span className="flex h-full items-center justify-center font-body text-xs text-brand-black/50">
                {error || "Laden…"}
              </span>
            )}
          </div>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block font-body text-xs text-brand-black/50">Zoom</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            disabled={!bitmap || busy}
            onChange={(event) => applyZoom(Number(event.target.value))}
            className="w-full accent-brand-pink-accent"
          />
        </label>
        {error ? <p className="mt-2 font-body text-xs text-red-700">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-full px-4 py-2 font-body text-sm text-brand-black/70 hover:text-brand-black"
          >
            Annuleren
          </button>
          <button
            type="button"
            disabled={!bitmap || busy}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 rounded-full bg-brand-pink-accent px-4 py-2 font-body text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {busy ? "Opslaan…" : "Uitsnede opslaan"}
          </button>
        </div>
      </div>
    </div>
  );
}
