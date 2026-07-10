import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "large";
  className?: string;
  external?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

const variantClasses = {
  primary:
    "bg-brand-black text-white hover:bg-brand-pink-accent focus-visible:ring-brand-pink",
  secondary:
    "bg-brand-pink text-brand-black hover:bg-brand-pink-accent focus-visible:ring-brand-pink-accent",
  outline:
    "border-2 border-brand-black text-brand-black hover:bg-brand-black hover:text-white focus-visible:ring-brand-black",
  ghost:
    "text-brand-black hover:text-brand-pink-accent underline-offset-4 hover:underline focus-visible:ring-brand-pink",
};

const sizeClasses = {
  default: "px-6 py-3 text-sm",
  large: "px-8 py-4 text-base",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "default",
  className,
  external = false,
  type = "button",
  onClick,
  disabled,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
