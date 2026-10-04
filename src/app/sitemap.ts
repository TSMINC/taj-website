import type { MetadataRoute } from "next";
import { siteConfig } from "../config/site.config";

// Static export requires explicit force-static for route handlers.
export const dynamic = "force-static";

/**
 * Google-ready sitemap. Static export emits /sitemap.xml at build time.
 * Only public, indexable URLs; dashboard + auth callbacks are excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date().toISOString();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
