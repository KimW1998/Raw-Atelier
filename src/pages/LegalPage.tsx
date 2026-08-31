import { SEO } from "@/components/SEO";
import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "@/i18n/context";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type LegalKind = "terms" | "shipping" | "privacy" | "disclaimer" | "cookies";

const LEGAL_PAGES: LegalKind[] = ["terms", "shipping", "privacy", "disclaimer", "cookies"];

function renderBody(text: string) {
  const nodes: React.ReactNode[] = [];
  const lines = text.split("\n");
  let paragraph: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const body = paragraph.join("\n").trim();
    paragraph = [];
    if (!body) return;
    nodes.push(
      <p
        key={`p-${key++}`}
        className="whitespace-pre-line font-body text-[13px] leading-6 text-brand-black/70"
      >
        {body}
      </p>,
    );
  };

  const flushList = () => {
    if (!list.length) return;
    const items = list;
    list = [];
    nodes.push(
      <ul
        key={`ul-${key++}`}
        className="list-disc space-y-1 pl-5 font-body text-[13px] leading-6 text-brand-black/70 marker:text-brand-pink-accent"
      >
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>,
    );
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      flushParagraph();
      nodes.push(
        <h2
          key={`h-${key++}`}
          className="scroll-mt-28 border-b border-brand-pink-light pb-2 pt-2 font-body text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-black first:pt-0"
        >
          {trimmed.replace(/^##\s+/, "")}
        </h2>,
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      flushParagraph();
      nodes.push(
        <h3
          key={`h3-${key++}`}
          className="scroll-mt-28 pt-1 font-body text-sm font-semibold text-brand-black"
        >
          {trimmed.replace(/^###\s+/, "")}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      list.push(trimmed.replace(/^-\s+/, ""));
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushList();
  flushParagraph();
  return nodes;
}

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");
  const tFooter = useTranslations("footer");
  const t = useTranslations("legal");
  const title = t(`${kind}Title`);
  const body = t.raw(kind);
  const text = typeof body === "string" ? body : "";
  const eyebrow = locale === "en" ? "Legal" : "Juridisch";

  return (
    <>
      <SEO
        title={title}
        description={tMeta("home.description")}
        locale={locale}
        path={`/legal/${kind}`}
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
      />
      <section className="relative overflow-hidden border-b border-brand-pink-light pt-24">
        <Container size="narrow" className="relative z-10 py-8 md:py-10">
          <FadeIn>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-brand-pink-accent">
              {eyebrow}
            </p>
            <h1 className="mt-2 font-heading text-xl leading-snug text-brand-black md:text-2xl">
              {title}
            </h1>
          </FadeIn>
          <nav
            className="mt-6 flex flex-wrap gap-x-1 gap-y-2"
            aria-label={eyebrow}
          >
            {LEGAL_PAGES.map((page) => (
              <Link
                key={page}
                href={`/legal/${page}`}
                className={cn(
                  "rounded-full px-3 py-1 font-body text-xs transition-colors",
                  page === kind
                    ? "bg-brand-black text-white"
                    : "bg-white text-brand-black/60 ring-1 ring-brand-pink-light hover:text-brand-black",
                )}
              >
                {tFooter(page)}
              </Link>
            ))}
          </nav>
        </Container>
      </section>
      <section className="bg-brand-offwhite pb-16 pt-8 md:pb-20 md:pt-10">
        <Container size="narrow">
          <article className="mx-auto max-w-3xl space-y-4 rounded-2xl bg-white px-5 py-7 shadow-sm ring-1 ring-brand-pink-light/80 sm:px-8 sm:py-8 md:px-10">
            {renderBody(text)}
          </article>
        </Container>
      </section>
    </>
  );
}
