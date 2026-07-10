import { Instagram } from "lucide-react";
import { useTranslations } from "@/i18n/context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { FadeIn } from "@/components/animations/FadeIn";
import { BRAND, INSTAGRAM_PREVIEW_IMAGES } from "@/lib/constants";

export function InstagramSection() {
  const t = useTranslations("home");
  const tCta = useTranslations("cta");

  return (
    <Section background="pink">
      <Container className="relative">
        <SectionHeading
          eyebrow={t("instagram.eyebrow")}
          title={t("instagram.title")}
          description={t("instagram.description")}
        />

        <FadeIn>
          <a
            href={BRAND.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-10 flex items-center gap-4 rounded-2xl border border-brand-pink bg-white/70 p-5 transition-colors hover:border-brand-black hover:bg-white"
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {INSTAGRAM_PREVIEW_IMAGES.map((image, index) => (
            <FadeIn key={image} delay={index * 0.05}>
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-xl"
                aria-label={`${t("instagram.viewOnInstagram")} ${index + 1}`}
              >
                <PremiumImage
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-brand-black/0 transition-colors duration-300 group-hover:bg-brand-black/35">
                  <Instagram className="h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </a>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div className="mt-10 text-center">
            <Button href={BRAND.instagram} variant="primary" size="large" external>
              {tCta("followInstagram")}
            </Button>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
