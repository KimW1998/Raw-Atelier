import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function adminRoutePlugin(): Plugin {
  return {
    name: "admin-route",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url?.split("?")[0];
        if (url === "/admin" || url === "/admin/") {
          req.url = "/admin/index.html";
        } else if (url === "/config.yml") {
          req.url = "/admin/config.yml";
        } else if (url === "/config.local.yml") {
          req.url = "/admin/config.local.yml";
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), adminRoutePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
});
