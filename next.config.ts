import type { NextConfig } from "next";

// Static export for GitHub Pages / Cloudflare Pages.
// BASE_PATH env var lets prod publish under /taj-website (GH Pages project site)
// while local dev stays at /.
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
