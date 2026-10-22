import { useEffect, useRef, useState } from "react";
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

function withCacheBust(url: string) {
  const clean = url.split("?")[0];
  return `${clean}?t=${Date.now()}`;
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
  const srcRef = useRef(src);
  const retriesRef = useRef(0);

  useEffect(() => {
    srcRef.current = src;
    retriesRef.current = 0;
    setImageSrc(src);
    setStage("primary");
  }, [src]);

  const handleError = () => {
    if (srcRef.current !== src) return;

    if (stage === "primary") {
      if (retriesRef.current < 8) {
        retriesRef.current += 1;
        const attempt = retriesRef.current;
        window.setTimeout(() => {
          if (srcRef.current !== src) return;
          setImageSrc(withCacheBust(src));
        }, 100 * attempt);
        return;
      }
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
