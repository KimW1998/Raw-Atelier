import { useTranslations } from "@/i18n/context";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
}

export function Logo({ className, variant = "default" }: LogoProps) {
  const t = useTranslations("brand");

  return (
    <Link
      href="/"
      className={cn("group flex flex-col items-start leading-none", className)}
      aria-label={`${t("name")} - Home`}
    >
      <span
        className={cn(
          "font-heading text-2xl md:text-3xl font-bold tracking-tight transition-colors",
          variant === "light" ? "text-white" : "text-brand-black"
        )}
      >
        RAW
      </span>
      <span
        className={cn(
          "font-heading text-xs md:text-sm tracking-[0.35em] uppercase transition-colors",
          variant === "light" ? "text-white/90" : "text-brand-black/80"
        )}
      >
        Atelier
      </span>
    </Link>
  );
}
