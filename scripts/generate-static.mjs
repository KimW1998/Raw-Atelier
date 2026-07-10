import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://raw-atelier.netlify.app";
const locales = ["en", "nl"];
const routes = ["", "/about", "/services", "/portfolio", "/shop", "/contact"];

const urls = locales.flatMap((locale) =>
  routes.map((route) => {
    const loc = route === "" ? `/${locale}` : `/${locale}${route}`;
    return `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <changefreq>${route === "" ? "weekly" : "monthly"}</changefreq>\n    <priority>${route === "" ? "1.0" : "0.8"}</priority>\n  </url>`;
  })
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const dist = path.join(__dirname, "../dist");
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(dist, "robots.txt"), robots);

// Netlify serves 404.html for missing paths; mirror index.html so SPA reloads work
const indexHtml = path.join(dist, "index.html");
const notFoundHtml = path.join(dist, "404.html");
if (fs.existsSync(indexHtml)) {
  fs.copyFileSync(indexHtml, notFoundHtml);
}

console.log("Generated sitemap.xml, robots.txt, and 404.html");
