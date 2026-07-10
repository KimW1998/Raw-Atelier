import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
      {
        source: "/admin/",
        destination: "/admin/index.html",
      },
      // Decap CMS default fallback looks for /config.yml at site root
      {
        source: "/config.yml",
        destination: "/admin/config.yml",
      },
      {
        source: "/config.local.yml",
        destination: "/admin/config.local.yml",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/admin/config.yml",
        headers: [
          { key: "Content-Type", value: "text/yaml; charset=utf-8" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/admin/config.local.yml",
        headers: [
          { key: "Content-Type", value: "text/yaml; charset=utf-8" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
