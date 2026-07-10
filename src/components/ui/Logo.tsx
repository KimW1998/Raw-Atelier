import { useTranslations } from "@/i18n/context";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/images/brand/raw-atelier-logo.png";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
}

export function Logo({ className, variant = "default" }: LogoProps) {
  const t = useTranslations("brand");

  return (
    <Link
      href="/"
      className={cn("group inline-flex shrink-0 items-center", className)}
      aria-label={`${t("name")} - Home`}
    >
      <img
        src={LOGO_SRC}
        alt={t("name")}
        width={900}
        height={518}
        className={cn(
          "h-9 w-auto transition-opacity duration-300 group-hover:opacity-80 md:h-10",
          variant === "light" && "invert"
        )}
      />
    </Link>
  );
}
