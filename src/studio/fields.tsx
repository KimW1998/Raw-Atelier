import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { FieldSpec, FieldTone } from "./content";

const inputBase =
  "block w-full resize-none overflow-hidden break-words rounded-2xl border border-brand-pink-light bg-white px-3.5 py-3 font-body leading-relaxed text-brand-black outline-none transition-colors placeholder:text-brand-black/30 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20";

export function AutoGrowField({
  value,
  onChange,
  tone = "short",
  placeholder,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  tone?: FieldTone;
  placeholder?: string;
  "aria-label"?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.max(el.scrollHeight, tone === "body" ? 96 : 48)}px`;
  }, [value, tone]);

  return (
    <textarea
      ref={ref}
      rows={tone === "body" ? 3 : 1}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      spellCheck
      onKeyDown={(event) => {
        if (event.key === "Enter" && tone !== "body") event.preventDefault();
      }}
      className={cn(
        inputBase,
        tone === "title" && "font-heading text-[17px] leading-snug",
        tone === "body" && "text-[15px]",
        tone === "short" && "text-sm",
      )}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function BilingualPair({
  nl,
  en,
  tone = "short",
  onChange,
}: {
  nl: string;
  en: string;
  tone?: FieldTone;
  onChange: (locale: "nl" | "en", value: string) => void;
}) {
  const nlRef = useRef<HTMLTextAreaElement>(null);
  const enRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const fields = [nlRef.current, enRef.current];
    let tallest = tone === "body" ? 96 : 48;
    for (const el of fields) {
      if (!el) continue;
      el.style.height = "0px";
      tallest = Math.max(tallest, el.scrollHeight);
    }
    for (const el of fields) {
      if (el) el.style.height = `${tallest}px`;
    }
  }, [nl, en, tone]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block min-w-0">
        <span className="mb-1.5 inline-flex rounded-full bg-brand-pink-light px-2 py-0.5 font-body text-[10px] font-semibold tracking-[0.12em] text-brand-rose">
          NL
        </span>
        <textarea
          ref={nlRef}
          rows={tone === "body" ? 3 : 1}
          value={nl}
          placeholder="Typ hier…"
          aria-label="Nederlands"
          spellCheck
          onKeyDown={(event) => {
            if (event.key === "Enter" && tone !== "body") event.preventDefault();
          }}
          className={cn(
            inputBase,
            tone === "title" && "font-heading text-[17px] leading-snug",
            tone === "body" && "text-[15px]",
            tone === "short" && "text-sm",
          )}
          onChange={(event) => onChange("nl", event.target.value)}
        />
      </label>
      <label className="block min-w-0">
        <span className="mb-1.5 inline-flex rounded-full bg-brand-black/5 px-2 py-0.5 font-body text-[10px] font-semibold tracking-[0.12em] text-brand-black/50">
          EN
        </span>
        <textarea
          ref={enRef}
          rows={tone === "body" ? 3 : 1}
          value={en}
          placeholder="Type here…"
          aria-label="English"
          spellCheck
          onKeyDown={(event) => {
            if (event.key === "Enter" && tone !== "body") event.preventDefault();
          }}
          className={cn(
            inputBase,
            tone === "title" && "font-heading text-[17px] leading-snug",
            tone === "body" && "text-[15px]",
            tone === "short" && "text-sm",
          )}
          onChange={(event) => onChange("en", event.target.value)}
        />
      </label>
    </div>
  );
}

export function BilingualField({
  field,
  nl,
  en,
  onChange,
}: {
  field: FieldSpec;
  nl: string;
  en: string;
  onChange: (locale: "nl" | "en", value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="font-body text-xs font-semibold text-brand-black/70">{field.label}</p>
      <BilingualPair nl={nl} en={en} tone={field.tone} onChange={onChange} />
    </div>
  );
}

export function BilingualListField({
  field,
  nl,
  en,
  onChange,
}: {
  field: FieldSpec;
  nl: string[];
  en: string[];
  onChange: (locale: "nl" | "en", value: string[]) => void;
}) {
  const count = Math.max(nl.length, en.length, 1);

  const update = (locale: "nl" | "en", index: number, value: string) => {
    const current = locale === "nl" ? [...nl] : [...en];
    while (current.length < count) current.push("");
    current[index] = value;
    onChange(locale, current);
  };

  const add = () => {
    onChange("nl", [...nl, ""]);
    onChange("en", [...en, ""]);
  };

  const remove = (index: number) => {
    onChange("nl", nl.filter((_, i) => i !== index));
    onChange("en", en.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <p className="font-body text-xs font-semibold text-brand-black/70">{field.label}</p>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-brand-pink-light/80 bg-brand-offwhite/80 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-body text-xs text-brand-black/50">{index + 1}</span>
            <button
              type="button"
              onClick={() => remove(index)}
              className="font-body text-xs text-brand-rose hover:underline"
            >
              Verwijder
            </button>
          </div>
          <BilingualPair
            nl={nl[index] ?? ""}
            en={en[index] ?? ""}
            tone="body"
            onChange={(locale, value) => update(locale, index, value)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-full border border-brand-pink px-3 py-1.5 font-body text-xs font-semibold text-brand-rose"
      >
        + Regel
      </button>
    </div>
  );
}

export function FieldGroup({
  field,
  children,
}: {
  field: FieldSpec;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="overflow-hidden rounded-2xl border border-brand-pink-light bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-heading text-base text-brand-black">{field.label}</span>
        <span className="font-body text-xs text-brand-black/40">{open ? "Verberg" : "Toon"}</span>
      </button>
      {open ? <div className="space-y-6 border-t border-brand-pink-light px-4 py-5">{children}</div> : null}
    </section>
  );
}
