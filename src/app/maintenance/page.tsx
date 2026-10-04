import type { Metadata } from "next";
import { siteConfig } from "../../config/site.config";

export const metadata: Metadata = {
  title: `Maintenance — ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

/**
 * Maintenance splash. Used in two scenarios:
 *   1. Scheduled updates: deploy workflow routes traffic here while a new
 *      build is going live (set via a CF Pages redirect rule).
 *   2. Incident mode: operator flips a feature flag; middleware (future)
 *      serves this page instead of normal routes.
 *
 * Entirely static — no JS, no network calls — so it works even if the
 * backend is the source of the outage.
 */
export default function Maintenance() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-6 h-12 w-12 animate-pulse rounded-full border-2 border-white/20 border-t-white/80" />
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Updating {siteConfig.shortName}
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          We&rsquo;re pushing an update. The site will be back in a few minutes. Thanks for your
          patience.
        </p>
        <p className="mt-6 text-xs text-zinc-600">
          For urgent issues:{" "}
          <a href={`mailto:${siteConfig.email.support}`} className="underline hover:text-zinc-400">
            {siteConfig.email.support}
          </a>
        </p>
      </div>
    </main>
  );
}
