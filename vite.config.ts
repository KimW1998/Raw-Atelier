import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";

const STUDIO_FOLDERS = new Set(["portfolio", "shop", "fabrics"]);
const STUDIO_UPLOAD_PATH = "/__studio/upload";
const STUDIO_MAX_BYTES = 8 * 1024 * 1024;

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function slugBase(name: string): string {
  const withoutExt = name.replace(/\.[^.]+$/, "");
  const slug = withoutExt
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return slug || "foto";
}

function extensionFor(type: string, name: string): string | null {
  const fromType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  if (fromType[type]) return fromType[type];
  const match = name.toLowerCase().match(/\.(jpe?g|png|webp|gif)$/);
  return match ? match[1].replace("jpeg", "jpg") : null;
}

async function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > limit) {
      throw new Error("too-big");
    }
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}

function studioUploadPlugin(): Plugin {
  return {
    name: "studio-upload",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== STUDIO_UPLOAD_PATH) {
          next();
          return;
        }
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        void (async () => {
          try {
            const folder = String(req.headers["x-studio-folder"] || "");
            if (!STUDIO_FOLDERS.has(folder)) {
              sendJson(res, 400, { error: "Onbekende map" });
              return;
            }
            const rawName = decodeURIComponent(String(req.headers["x-studio-name"] || "foto.jpg"));
            const type = String(req.headers["content-type"] || "");
            const ext = extensionFor(type, rawName);
            if (!ext) {
              sendJson(res, 400, { error: "Gebruik JPG, PNG, WebP of GIF" });
              return;
            }
            const body = await readBody(req, STUDIO_MAX_BYTES);
            if (!body.length) {
              sendJson(res, 400, { error: "Kies een foto" });
              return;
            }
            const filename = `${slugBase(rawName)}-${Date.now()}.${ext}`;
            const absDir = path.resolve(server.config.root, "public", "images", "uploads", folder);
            if (!existsSync(absDir)) mkdirSync(absDir, { recursive: true });
            writeFileSync(path.join(absDir, filename), body);
            sendJson(res, 200, { url: `/images/uploads/${folder}/${filename}` });
          } catch (err) {
            if (err instanceof Error && err.message === "too-big") {
              sendJson(res, 413, { error: "Foto is te groot. Kies een kleinere JPG." });
              return;
            }
            sendJson(res, 500, { error: "Upload mislukt" });
          }
        })();
      });
    },
  };
}

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
  plugins: [react(), adminRoutePlugin(), studioUploadPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
});
