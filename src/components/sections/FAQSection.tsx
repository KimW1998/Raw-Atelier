"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/animations/FadeIn";
import { FAQ_IDS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FAQSection() {
  const tFaq = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {FAQ_IDS.map((id, index) => (
        <FadeIn key={id} delay={index * 0.05}>
          <div className="overflow-hidden rounded-2xl border border-brand-pink-light bg-white">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between p-6 text-left"
              aria-expanded={openIndex === index}
            >
              <span className="pr-4 font-heading text-lg text-brand-black">
                {tFaq(`${id}.question`)}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-brand-pink-accent transition-transform duration-300",
                  openIndex === index && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300",
                openIndex === index
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 font-body text-sm leading-relaxed text-brand-black/70">
                  {tFaq(`${id}.answer`)}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
