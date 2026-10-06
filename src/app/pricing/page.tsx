import type { Metadata } from "next";
import { siteConfig } from "../../config/site.config";
import { InquiryButton } from "../../components/InquiryButton";

export const metadata: Metadata = {
  title: `Pricing — ${siteConfig.name}`,
  description: `Transparent pricing tiers for ${siteConfig.name} — websites, apps, design, and Shopify builds.`,
  robots: { index: true, follow: true },
};

type Tier = {
  name: string;
  tagline: string;
  startingAt: string;
  bullets: string[];
  featured?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Starter",
    tagline: "Landing pages, simple sites, one-off design work.",
    startingAt: "$1,500",
    bullets: [
      "Up to 5 pages",
      "Mobile-first responsive design",
      "Contact form + basic SEO",
      "2 weeks delivery",
      "30 days post-launch support",
    ],
  },
  {
    name: "Standard",
    tagline: "Marketing sites, CMS builds, mid-size app features.",
    startingAt: "$4,500",
    featured: true,
    bullets: [
      "Up to 15 pages or 1 app feature set",
      "Custom design + brand system",
      "CMS or auth + database",
      "Analytics + sitemap + OG",
      "4–6 weeks delivery",
      "60 days post-launch support",
    ],
  },
  {
    name: "Custom",
    tagline: "Full apps, custom Shopify stores, multi-month engagements.",
    startingAt: "quote",
    bullets: [
      "Scoped per project",
      "Multi-stage sprints",
      "Dedicated weekly check-ins",
      "Full-stack build",
      "Deployment + handoff + training",
      "Ongoing retainer available",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pt-24 pb-16">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.3em] text-white/60 uppercase">Pricing</p>
        <h1 className="mt-3 text-4xl leading-[1.05] font-light tracking-tight text-balance text-white sm:text-5xl">
          Fixed prices. <br />
          <span className="font-semibold">No surprise invoices.</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-balance text-white/70 sm:text-base">
          Every project ships with a one-page written scope, a fixed price, and a delivery date. No
          hourly billing, no scope creep without written agreement.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        {tiers.map((t) => (
          <article
            key={t.name}
            className={`flex flex-col rounded-2xl border backdrop-blur-md transition sm:p-7 ${
              t.featured
                ? "border-white/25 bg-white/[0.07] p-6 ring-1 ring-white/10"
                : "border-white/10 bg-white/[0.03] p-6 hover:border-white/20"
            }`}
          >
            {t.featured && (
              <div className="mb-3 inline-flex self-start rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase">
                Most popular
              </div>
            )}
            <h2 className="text-xl font-semibold text-white">{t.name}</h2>
            <p className="mt-1 text-xs text-white/55">{t.tagline}</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-xs text-white/50">starting at</span>
              <span className="text-2xl font-light text-white">{t.startingAt}</span>
            </div>
            <ul className="mt-5 flex-1 space-y-2 text-sm text-white/75">
              {t.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1 text-white/40">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <InquiryButton
                subject={`${t.name} tier inquiry`}
                variant={t.featured ? "solid" : "ghost"}
              />
            </div>
          </article>
        ))}
      </div>

      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        {[
          {
            q: "What's included in post-launch support?",
            a: "Bug fixes on anything we shipped, 30-day email response. Doesn't include new features — those are a new scope.",
          },
          {
            q: "Do you offer retainers?",
            a: "Yes — monthly retainer for ongoing dev, design, or Shopify work. Starts at $2,000/month.",
          },
          {
            q: "What if the scope changes mid-project?",
            a: "We write up a change order with the new price + timeline impact. You approve in writing before we proceed. No surprise bills.",
          },
          {
            q: "Payment terms?",
            a: "50% to start, 50% on delivery. Larger projects: milestone-based. Stripe for cards, bank transfer available.",
          },
        ].map((f) => (
          <div
            key={f.q}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md"
          >
            <div className="text-sm font-semibold text-white">{f.q}</div>
            <div className="mt-1.5 text-sm text-white/70">{f.a}</div>
          </div>
        ))}
      </section>

      <section className="mt-14 border-t border-white/10 pt-8 text-center">
        <p className="text-sm text-white/70">
          Not sure which tier fits? Just{" "}
          <a
            href={`mailto:${siteConfig.email.inquiry}?subject=Pricing%20question`}
            className="font-mono underline underline-offset-2 hover:text-white"
          >
            email us
          </a>{" "}
          with a short description of what you&rsquo;re building.
        </p>
      </section>
    </main>
  );
}
