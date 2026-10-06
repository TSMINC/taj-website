import type { Metadata } from "next";
import { siteConfig } from "../../config/site.config";
import { InquiryButton } from "../../components/InquiryButton";

export const metadata: Metadata = {
  title: `Work — ${siteConfig.name}`,
  description: `Selected ${siteConfig.name} client work. Case studies in progress.`,
  robots: { index: true, follow: true },
};

export default function PortfolioPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 pt-24 pb-16">
      <p className="text-xs font-semibold tracking-[0.3em] text-white/60 uppercase">Our work</p>
      <h1 className="mt-3 text-4xl leading-[1.05] font-light tracking-tight text-balance text-white sm:text-5xl">
        Selected <span className="font-semibold">client work</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-balance text-white/70 sm:text-base">
        We&rsquo;re writing up our active + recent engagements as case studies. Until each one is
        polished, here&rsquo;s a sketch of what we&rsquo;ve shipped.
      </p>

      <section className="mt-14 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 backdrop-blur-md sm:p-10">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full border-2 border-white/20 border-t-white/80" />
          <h2 className="mt-5 text-2xl font-light text-white sm:text-3xl">
            Case studies <span className="font-semibold">in progress</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/65">
            We&rsquo;re polishing writeups for recent builds. In the meantime, see the kinds of
            projects we take at{" "}
            <a href="/services" className="underline underline-offset-2 hover:text-white">
              /services
            </a>
            , or email us for a direct link to a reference customer.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <InquiryButton subject="Request portfolio references" label="Request references" />
            <a
              href="/services"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10"
            >
              See services
            </a>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-lg font-semibold text-white">What we&rsquo;ve shipped</h2>
        <ul className="mt-5 space-y-3 text-sm text-white/75">
          <li className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md">
            <span className="font-medium text-white">Marketing + member sites</span> on Next.js +
            Cloudflare Workers with Supabase auth. Sub-second LCP, static edge-cached, dynamic where
            it needs to be.
          </li>
          <li className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md">
            <span className="font-medium text-white">Custom Shopify themes</span> hand-built in
            Liquid — not Dawn-forks, not drag-and-drop templates.
          </li>
          <li className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md">
            <span className="font-medium text-white">Native + hybrid apps</span> with real-time
            data, auth, payments, and offline-capable sync.
          </li>
          <li className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md">
            <span className="font-medium text-white">Brand systems</span> from logo through full UI
            kit, Figma-handoff-ready for your in-house team.
          </li>
        </ul>
      </section>
    </main>
  );
}
