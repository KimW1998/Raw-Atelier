import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tCta = await getTranslations("cta");

  return (
    <section className="flex min-h-[70vh] items-center pt-24">
      <Container className="text-center">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-heading text-4xl md:text-5xl text-brand-black">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-md font-body text-base text-brand-black/70">
          {t("description")}
        </p>
        <div className="mt-8">
          <Button href="/" variant="primary">
            {tCta("backToHome")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
