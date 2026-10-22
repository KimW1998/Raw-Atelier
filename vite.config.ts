import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "fs";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";

const STUDIO_FOLDERS = new Set(["portfolio", "shop", "fabrics", "pages"]);
const STUDIO_UPLOAD_PATH = "/__studio/upload";
const STUDIO_MEDIA_PATH = "/__studio/media";
const STUDIO_MAX_BYTES = 8 * 1024 * 1024;
const STUDIO_IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const STUDIO_MEDIA_SKIP = new Set(["brand", "icons"]);

function listPublicImages(imagesRoot: string): { url: string; name: string; folder: string; mtime: number }[] {
  const items: { url: string; name: string; folder: string; mtime: number }[] = [];

  const walk = (absDir: string, urlDir: string, folder: string) => {
    if (!existsSync(absDir)) return;
    for (const entry of readdirSync(absDir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const abs = path.join(absDir, entry.name);
      const url = `${urlDir}/${entry.name}`;
      if (entry.isDirectory()) {
        const nextFolder = folder === "images" ? entry.name : folder;
        if (STUDIO_MEDIA_SKIP.has(nextFolder)) continue;
        walk(abs, url, nextFolder);
        continue;
      }
      if (!STUDIO_IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) continue;
      items.push({
        url,
        name: entry.name,
        folder,
        mtime: statSync(abs).mtimeMs,
      });
    }
  };

  walk(imagesRoot, "/images", "images");
  items.sort((a, b) => b.mtime - a.mtime);
  return items;
}

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

const UPLOAD_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function studioUploadPlugin(): Plugin {
  return {
    name: "studio-upload",
    configureServer(server) {
      const uploadsRoot = path.resolve(server.config.root, "public", "images", "uploads");
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (req.method === "GET" && url.startsWith("/images/uploads/")) {
          const rel = decodeURIComponent(url.slice("/images/uploads/".length));
          const abs = path.resolve(uploadsRoot, rel);
          if (abs !== uploadsRoot && !abs.startsWith(`${uploadsRoot}${path.sep}`)) {
            res.statusCode = 403;
            res.end();
            return;
          }
          if (!existsSync(abs)) {
            next();
            return;
          }
          const ext = path.extname(abs).slice(1).toLowerCase();
          res.statusCode = 200;
          res.setHeader("Content-Type", UPLOAD_MIME[ext] || "application/octet-stream");
          res.setHeader("Cache-Control", "no-store");
          createReadStream(abs).pipe(res);
          return;
        }
        if (req.method === "GET" && url === STUDIO_MEDIA_PATH) {
          const imagesRoot = path.resolve(server.config.root, "public", "images");
          sendJson(res, 200, { items: listPublicImages(imagesRoot) });
          return;
        }
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
    watch: {
      ignored: ["**/public/images/uploads/**"],
    },
  },
});
