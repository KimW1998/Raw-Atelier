import { cn } from "@/lib/utils";

interface PatternBackgroundProps {
  className?: string;
  opacity?: number;
  variant?: "hero" | "section" | "footer" | "divider";
}

export function PatternBackground({
  className,
  opacity = 0.08,
  variant = "section",
}: PatternBackgroundProps) {
  const heightClass =
    variant === "divider"
      ? "h-32 md:h-48"
      : variant === "hero"
        ? "inset-0"
        : "inset-0";

  return (
    <div
      className={cn(
        "pointer-events-none absolute overflow-hidden",
        variant === "divider" ? "relative w-full" : "inset-0",
        heightClass,
        className
      )}
      aria-hidden="true"
    >
      <svg
        className="absolute h-full w-full"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity }}
      >
        <defs>
          <linearGradient id="pinkGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E7A7C7" />
            <stop offset="100%" stopColor="#D98AB5" />
          </linearGradient>
          <linearGradient id="pinkGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F6DCE8" />
            <stop offset="100%" stopColor="#E7A7C7" />
          </linearGradient>
        </defs>
        <path
          d="M-20,0 C80,120 200,80 300,200 C400,320 350,500 450,650 C500,720 400,800 200,800 L-20,800 Z"
          fill="url(#pinkGrad1)"
        />
        <path
          d="M420,0 C320,150 180,100 80,250 C-20,400 50,600 -30,800 L420,800 L420,0 Z"
          fill="url(#pinkGrad2)"
        />
        <path
          d="M150,0 C250,80 350,60 400,180 C430,260 380,400 420,550 C440,650 350,750 250,800 L150,800 C200,650 120,450 180,300 C220,200 100,100 150,0 Z"
          fill="#E7A7C7"
          opacity="0.5"
        />
        <path
          d="M0,400 C100,350 200,420 300,380 C350,360 380,440 400,500 C420,560 350,620 250,680 C150,740 50,700 0,750 Z"
          fill="#F6DCE8"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
