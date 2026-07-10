import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-16 w-16",
} as const;

interface BrandIconProps {
  src: string;
  alt: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function BrandIcon({
  src,
  alt,
  size = "md",
  className,
}: BrandIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(
        "object-contain object-center",
        sizeClasses[size],
        className
      )}
    />
  );
}
