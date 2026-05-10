import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ hostname: "cdn.sanity.io" }],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@vanashree/ui': path.resolve(__dirname, '../../packages/ui/dist/index.js'),
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
