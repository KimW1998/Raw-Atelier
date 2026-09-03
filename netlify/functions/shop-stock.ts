import type { Config } from "@netlify/functions";
import { readLiveStock } from "./_shared/stock";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const stock = await readLiveStock();
    return json({ stock });
  } catch (error) {
    console.error("[shop-stock]", error);
    return json({ stock: {} });
  }
};

export const config: Config = {
  path: "/api/shop-stock",
};
