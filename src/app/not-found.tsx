import Link from "next/link";
import { siteConfig } from "../config/site.config";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <p className="text-xs font-semibold tracking-[0.35em] text-white/50 uppercase">404</p>
        <h1 className="mt-4 text-4xl font-light tracking-tight text-white sm:text-5xl">
          Page not <span className="font-semibold">found</span>
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-white/65 sm:text-base">
          The link may be broken, the page may have been moved, or you may have typed the URL wrong.
          Either way, we don&rsquo;t have anything to show you here.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#1a0a30] transition hover:bg-white/90"
          >
            Back to home
          </Link>
          <Link
            href="/services"
            className="rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10"
          >
            See services
          </Link>
        </div>
        <p className="mt-10 text-xs text-white/40">
          If this looks like a {siteConfig.name} bug, let us know at{" "}
          <a
            href={`mailto:${siteConfig.email.support}`}
            className="underline underline-offset-2 hover:text-white/60"
          >
            {siteConfig.email.support}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
