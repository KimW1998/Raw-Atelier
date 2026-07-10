import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/animations/FadeIn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  dark?: boolean;
  spacing?: "default" | "compact" | "tight";
  size?: "default" | "compact";
}

const spacingClasses = {
  default: "mb-12 md:mb-16",
  compact: "mb-8 md:mb-10",
  tight: "mb-6 md:mb-8",
};

const titleSizeClasses = {
  default: "text-3xl md:text-4xl lg:text-5xl",
  compact: "text-2xl md:text-3xl lg:text-4xl",
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  dark = false,
  spacing = "default",
  size = "default",
}: SectionHeadingProps) {
  return (
    <FadeIn
      className={cn(
        spacingClasses[spacing],
        align === "center" && "text-center mx-auto max-w-2xl",
        align === "left" && "text-left max-w-xl",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 font-body text-sm font-semibold uppercase tracking-[0.2em]",
            dark ? "text-brand-pink" : "text-brand-pink-accent"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-heading leading-tight",
          titleSizeClasses[size],
          dark ? "text-white" : "text-brand-black"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 font-body text-base md:text-lg leading-relaxed",
            dark ? "text-white/80" : "text-brand-black/70"
          )}
        >
          {description}
        </p>
      )}
    </FadeIn>
  );
}
