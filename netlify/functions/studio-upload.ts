import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { Config } from "@netlify/functions";
import { getEnv } from "./_shared/email";

const FOLDERS = new Set(["portfolio", "shop", "fabrics"]);
const MAX_BYTES = 4.5 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isLocal() {
  return getEnv("NETLIFY_DEV") === "true" || getEnv("CONTEXT") === "dev";
}

function extensionFor(file: File): string | null {
  if (TYPES[file.type]) return TYPES[file.type];
  const match = file.name.toLowerCase().match(/\.(jpe?g|png|webp|gif)$/);
  return match ? match[1].replace("jpeg", "jpg") : null;
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

export default async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!isLocal()) {
    return json(
      {
        error:
          "Foto's uploaden kan in de lokale studio. Start `npx netlify dev` en open /studio.",
      },
      503,
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Ongeldige upload" }, 400);
  }

  const folderRaw = String(form.get("folder") || "");
  if (!FOLDERS.has(folderRaw)) {
    return json({ error: "Onbekende map" }, 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return json({ error: "Kies een foto" }, 400);
  }
  if (file.size > MAX_BYTES) {
    return json({ error: "Foto is te groot (max 4,5 MB)" }, 400);
  }

  const ext = extensionFor(file);
  if (!ext) {
    return json({ error: "Gebruik JPG, PNG, WebP of GIF" }, 400);
  }

  const filename = `${slugBase(file.name)}-${Date.now()}.${ext}`;
  const relDir = path.join("public", "images", "uploads", folderRaw);
  const relPath = path.join(relDir, filename);
  const absDir = path.join(process.cwd(), relDir);
  const absPath = path.join(process.cwd(), relPath);

  if (!existsSync(absDir)) mkdirSync(absDir, { recursive: true });
  writeFileSync(absPath, Buffer.from(await file.arrayBuffer()));

  return json({ url: `/images/uploads/${folderRaw}/${filename}` });
};

export const config: Config = {
  path: "/api/studio-upload",
};
