import type { MetadataRoute } from "next";
import { siteConfig } from "../config/site.config";
import { getPublicEnv } from "../config/env";

// Static export requires explicit force-static for route handlers.
export const dynamic = "force-static";

/**
 * robots.txt — only prod is indexable. Dev + stable + tester all return
 * noindex because NEXT_PUBLIC_ENVIRONMENT !== "prod" on those branches.
 */
export default function robots(): MetadataRoute.Robots {
  const env = getPublicEnv();
  const isProd = env.environment === "prod";
  const base = siteConfig.url.replace(/\/$/, "");

  if (!isProd) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/auth/callback", "/maintenance"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
