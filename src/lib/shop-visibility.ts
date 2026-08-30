import { NAV_ROUTES } from "@/lib/constants";

/** Shop is visible locally. On the live site it stays hidden until VITE_SHOP_ENABLED=true. */
export function isShopPublic(): boolean {
  return (
    import.meta.env.DEV === true ||
    import.meta.env.VITE_SHOP_ENABLED === "true"
  );
}

export function getPublicNavRoutes() {
  return NAV_ROUTES.filter((route) => route.href !== "/shop" || isShopPublic());
}
