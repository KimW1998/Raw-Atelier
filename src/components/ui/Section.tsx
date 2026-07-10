import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "default" | "pink" | "offwhite" | "dark";
  spacing?: "default" | "compact" | "tight";
}

const bgClasses = {
  default: "bg-brand-offwhite",
  pink: "bg-brand-pink-light",
  offwhite: "bg-brand-offwhite",
  dark: "bg-brand-black text-white",
};

const spacingClasses = {
  default: "py-16 md:py-24 lg:py-28",
  compact: "py-10 md:py-14 lg:py-16",
  tight: "py-8 md:py-10 lg:py-12",
};

export function Section({
  children,
  className,
  id,
  background = "default",
  spacing = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative", spacingClasses[spacing], bgClasses[background], className)}
    >
      {children}
    </section>
  );
}
