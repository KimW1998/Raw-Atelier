import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "default" | "pink" | "offwhite" | "dark";
}

const bgClasses = {
  default: "bg-brand-offwhite",
  pink: "bg-brand-pink-light",
  offwhite: "bg-brand-offwhite",
  dark: "bg-brand-black text-white",
};

export function Section({
  children,
  className,
  id,
  background = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative py-16 md:py-24 lg:py-28", bgClasses[background], className)}
    >
      {children}
    </section>
  );
}
