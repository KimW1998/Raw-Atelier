import { SEO } from "@/components/SEO";
import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PatternBackground } from "@/components/ui/PatternBackground";
import { useLocale, useTranslations } from "@/i18n/context";

export type LegalKind = "terms" | "shipping" | "privacy" | "disclaimer" | "cookies";

function renderBody(text: string) {
  const blocks = text.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);

  return blocks.map((block, index) => {
    if (block.startsWith("## ")) {
      return (
        <h2
          key={`h-${index}`}
          className="pt-4 font-heading text-2xl text-brand-black md:text-3xl"
        >
          {block.replace(/^##\s+/, "")}
        </h2>
      );
    }

    if (block.startsWith("### ")) {
      return (
        <h3
          key={`h3-${index}`}
          className="pt-2 font-heading text-xl text-brand-black md:text-2xl"
        >
          {block.replace(/^###\s+/, "")}
        </h3>
      );
    }

    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.every((line) => line.startsWith("- "))) {
      return (
        <ul key={`ul-${index}`} className="list-disc space-y-1 pl-5 font-body text-base leading-relaxed text-brand-black/75">
          {lines.map((line) => (
            <li key={line}>{line.replace(/^-\s+/, "")}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`p-${index}`} className="whitespace-pre-line font-body text-base leading-relaxed text-brand-black/75">
        {block}
      </p>
    );
  });
}

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const locale = useLocale();
  const tMeta = useTranslations("metadata");
  const tBrand = useTranslations("brand");
  const t = useTranslations("legal");
  const title = t(`${kind}Title`);
  const body = t.raw(kind);
  const text = typeof body === "string" ? body : "";

  return (
    <>
      <SEO
        title={title}
        description={tMeta("shop.description")}
        locale={locale}
        path={`/legal/${kind}`}
        brandName={tBrand("name")}
        tagline={tBrand("tagline")}
        keywords={tMeta("keywords")}
      />
      <section className="relative flex min-h-[40vh] items-center overflow-hidden pt-24">
        <PatternBackground variant="hero" />
        <Container className="relative z-10 py-12 text-center">
          <FadeIn>
            <h1 className="font-heading text-4xl text-brand-black md:text-5xl">
              {title}
            </h1>
          </FadeIn>
        </Container>
      </section>
      <Section spacing="compact">
        <Container size="narrow">
          <div className="space-y-5">{renderBody(text)}</div>
        </Container>
      </Section>
    </>
  );
}
