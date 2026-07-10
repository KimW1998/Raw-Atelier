import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  type LinkProps,
} from "react-router-dom";
import { routing, useLocale, type Locale } from "./context";

export { routing, type Locale };

export function Link({
  href,
  children,
  className,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
} & Omit<LinkProps, "to">) {
  const locale = useLocale();
  const to =
    href === "/" ? `/${locale}` : href.startsWith("/") ? `/${locale}${href}` : href;

  return (
    <RouterLink to={to} className={className} {...props}>
      {children}
    </RouterLink>
  );
}

export function usePathname() {
  const { pathname } = useLocation();
  const stripped = pathname.replace(/^\/(en|nl)/, "");
  return stripped === "" ? "/" : stripped;
}

export function useRouter() {
  const navigate = useNavigate();
  const locale = useLocale();

  return {
    replace: (path: string, options?: { locale?: Locale }) => {
      const nextLocale = options?.locale ?? locale;
      const to =
        path === "/" ? `/${nextLocale}` : `/${nextLocale}${path}`;
      navigate(to, { replace: true });
    },
  };
}

export function localizedPath(locale: Locale, path: string) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
