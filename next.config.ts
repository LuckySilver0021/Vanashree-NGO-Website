import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { hostname: "cdn.sanity.io" }, // for Phase 5 — Sanity CMS images
    ],
  },
};

export default withNextIntl(nextConfig);
