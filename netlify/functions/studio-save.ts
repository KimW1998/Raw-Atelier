import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { Config } from "@netlify/functions";
import { getEnv } from "./_shared/email";

const ALLOWED = [
  /^content\/(nl|en)\/[a-z0-9-]+\.yaml$/,
  /^content\/portfolio-items\.yaml$/,
  /^src\/data\/shop-catalog\.json$/,
  /^src\/data\/vacation\.json$/,
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isAllowed(filePath: string) {
  return ALLOWED.some((pattern) => pattern.test(filePath));
}

function isLocal() {
  return getEnv("NETLIFY_DEV") === "true" || getEnv("CONTEXT") === "dev";
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!isLocal()) {
    return json(
      {
        error:
          "De visuele studio slaat lokaal op. Start `npx netlify dev` en open /studio, of gebruik daarna git om live te zetten.",
      },
      503,
    );
  }

  let payload: { files?: { path: string; content: string }[] };
  try {
    payload = (await req.json()) as { files?: { path: string; content: string }[] };
  } catch {
    return json({ error: "Ongeldige data" }, 400);
  }

  const files = payload.files ?? [];
  if (!files.length) {
    return json({ ok: true, saved: 0 });
  }

  const root = process.cwd();

  for (const file of files) {
    if (!file.path || !isAllowed(file.path) || file.path.includes("..")) {
      return json({ error: `Dit bestand mag niet: ${file.path}` }, 400);
    }

    const abs = path.join(root, file.path);
    const dir = path.dirname(abs);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(abs, file.content, "utf8");
  }

  return json({ ok: true, saved: files.length });
};

export const config: Config = {
  path: "/api/studio-save",
};
