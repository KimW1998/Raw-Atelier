import { useState } from "react";
import { cn } from "@/lib/utils";
import { getPlaceholderForSrc, PLACEHOLDER_IMAGES } from "@/lib/image-fallbacks";

interface ImagePlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
}

export function PremiumImage({
  src,
  alt,
  className,
  priority = false,
  fill = false,
  width,
  height,
}: ImagePlaceholderProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [stage, setStage] = useState<"primary" | "placeholder" | "default">("primary");

  const handleError = () => {
    if (stage === "primary") {
      setImageSrc(getPlaceholderForSrc(src));
      setStage("placeholder");
      return;
    }

    if (stage === "placeholder") {
      setImageSrc(PLACEHOLDER_IMAGES.default);
      setStage("default");
    }
  };

  const imgProps = {
    src: imageSrc,
    alt,
    onError: handleError,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    decoding: "async" as const,
  };

  if (fill) {
    return (
      <img
        {...imgProps}
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          className
        )}
      />
    );
  }

  return (
    <img
      {...imgProps}
      width={width || 800}
      height={height || 600}
      className={cn("object-cover", className)}
    />
  );
}
