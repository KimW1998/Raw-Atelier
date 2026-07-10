"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { FadeIn } from "@/components/animations/FadeIn";
import {
  PORTFOLIO_ITEMS,
  PORTFOLIO_CATEGORIES,
  type PortfolioCategoryKey,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PortfolioGallery() {
  const t = useTranslations("portfolioPage");
  const tPortfolio = useTranslations("portfolio");
  const [activeCategory, setActiveCategory] =
    useState<PortfolioCategoryKey>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered =
    activeCategory === "all"
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.category === activeCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const navigateLightbox = (direction: "prev" | "next") => {
    if (lightboxIndex === null) return;
    const next =
      direction === "next"
        ? (lightboxIndex + 1) % filtered.length
        : (lightboxIndex - 1 + filtered.length) % filtered.length;
    setLightboxIndex(next);
  };

  return (
    <>
      <Section>
        <Container>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />

          <FadeIn>
            <div className="mb-12 flex flex-wrap justify-center gap-3">
              {PORTFOLIO_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "rounded-full px-5 py-2 font-body text-sm font-semibold transition-all duration-300",
                    activeCategory === category
                      ? "bg-brand-black text-white"
                      : "bg-brand-pink-light text-brand-black hover:bg-brand-pink"
                  )}
                >
                  {tPortfolio(`categories.${category}`)}
                </button>
              ))}
            </div>
          </FadeIn>

          <motion.div
            layout
            className="columns-1 gap-6 sm:columns-2 lg:columns-3"
          >
            {filtered.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="mb-6 break-inside-avoid"
              >
                <button
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="group relative w-full overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                >
                  <div
                    className={cn(
                      "relative w-full overflow-hidden",
                      item.aspect === "tall" && "aspect-[3/4]",
                      item.aspect === "wide" && "aspect-[4/3]",
                      item.aspect === "square" && "aspect-square"
                    )}
                  >
                    <PremiumImage
                      src={item.image}
                      alt={tPortfolio(`items.${item.id}.title`)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-brand-black/0 transition-colors duration-500 group-hover:bg-brand-black/30" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full transition-transform duration-500 group-hover:translate-y-0">
                      <span className="font-body text-xs font-semibold uppercase tracking-wider text-brand-pink">
                        {tPortfolio(`categories.${item.category}`)}
                      </span>
                      <h3 className="mt-1 font-heading text-lg text-white">
                        {tPortfolio(`items.${item.id}.title`)}
                      </h3>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/90 p-4 backdrop-blur-sm"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox("prev");
              }}
              className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox("next");
              }}
              className="absolute right-16 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <PremiumImage
                src={filtered[lightboxIndex].image}
                alt={tPortfolio(
                  `items.${filtered[lightboxIndex].id}.title`
                )}
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-black/80 to-transparent p-6">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-brand-pink">
                  {tPortfolio(
                    `categories.${filtered[lightboxIndex].category}`
                  )}
                </span>
                <h3 className="mt-1 font-heading text-2xl text-white">
                  {tPortfolio(`items.${filtered[lightboxIndex].id}.title`)}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
