import { Instagram } from "lucide-react";
import { useTranslations } from "@/i18n/context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animations/FadeIn";
import { useBeholdInstagram } from "@/hooks/useBeholdInstagram";
import { BRAND } from "@/lib/constants";

export function InstagramSection() {
  const t = useTranslations("home");
  const tCta = useTranslations("cta");
  const { posts, isLoading } = useBeholdInstagram();

  return (
    <Section spacing="compact" className="border-t border-brand-pink/25 pt-8 md:pt-10">
      <Container className="relative">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink-accent">
              {t("instagram.eyebrow")}
            </p>
            <h2 className="mt-2 font-heading text-2xl text-brand-black md:text-3xl">
              {t("instagram.title")}
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-brand-black/60">
              {t("instagram.description")}
            </p>
          </div>
        </FadeIn>

        <FadeIn>
          <a
            href={BRAND.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 flex items-center gap-4 rounded-2xl border border-brand-pink bg-white/70 p-5 transition-colors hover:border-brand-black hover:bg-white"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-pink-light">
              <Instagram className="h-7 w-7 text-brand-black" />
            </div>
            <div>
              <p className="font-body text-sm font-semibold text-brand-black">
                @{BRAND.instagramHandle}
              </p>
              <p className="mt-1 font-body text-sm text-brand-black/70">
                {t("instagram.profileHint")}
              </p>
            </div>
          </a>
        </FadeIn>

        {isLoading ? (
          <div className="mx-auto grid max-w-xl grid-cols-3 gap-1.5 sm:gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-lg bg-brand-pink-light/60"
              />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="mx-auto max-w-xl">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {posts.map((post, index) => (
                <FadeIn key={post.permalink} delay={index * 0.04}>
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded-lg bg-brand-pink-light/40"
                    aria-label={t("instagram.viewOnInstagram")}
                  >
                    <img
                      src={post.imageUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-brand-black/0 transition-colors duration-300 group-hover:bg-brand-black/20" />
                  </a>
                </FadeIn>
              ))}
            </div>
          </div>
        ) : null}

        <FadeIn delay={0.15}>
          <div className="mt-6 text-center">
            <Button href={BRAND.instagram} variant="outline" size="default" external>
              {tCta("followInstagram")}
            </Button>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
