import type { NextConfig } from "next";

// Static export for Cloudflare Pages.
// BASE_PATH env var lets prod publish under a subpath if ever needed;
// Cloudflare Pages uses root by default so this stays empty.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
