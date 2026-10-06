import type { Metadata } from "next";
import { siteConfig } from "../../config/site.config";
import { InquiryButton } from "../../components/InquiryButton";

export const metadata: Metadata = {
  title: `Services — ${siteConfig.name}`,
  description: `Services and products from ${siteConfig.name} — websites, design, apps, and Shopify builds.`,
  robots: { index: true, follow: true },
};

type Service = {
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
};

const services: Service[] = [
  {
    title: "Website Builds",
    tagline: "Marketing sites, product pages, custom CMS.",
    description:
      "Fast, modern websites built on today's stack — Next.js, static CDN delivery, custom design, optional CMS. Done right the first time.",
    bullets: ["Design + build + deploy", "Mobile-first", "SEO-ready", "Analytics + sitemap"],
  },
  {
    title: "Design",
    tagline: "Brand, UI, and product design that lands.",
    description:
      "Visual systems that give your product a point of view. Logos, color systems, typography, UI mockups, and design-to-code handoffs.",
    bullets: ["Brand identity", "UI/UX mockups", "Design systems", "Figma handoff"],
  },
  {
    title: "App Development",
    tagline: "Web apps, mobile apps, and desktop apps.",
    description:
      "Full-stack app builds — real-time features, auth, payments, data pipelines. From MVP to production, maintained end-to-end.",
    bullets: [
      "React + React Native",
      "Supabase / Postgres",
      "Auth + payments",
      "Deploy + maintain",
    ],
  },
  {
    title: "Custom Shopify Stores",
    tagline: "Branded e-commerce that doesn't look like everyone else.",
    description:
      "Shopify builds with custom themes, Liquid templates, and app integrations. Fast, conversion-focused, and brand-true.",
    bullets: [
      "Custom theme + Liquid",
      "Product catalog setup",
      "Payment + shipping",
      "Launch + support",
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col px-6 pt-24 pb-16 sm:px-12 lg:px-20">
      {/* Header */}
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.3em] text-white/60 uppercase">What we do</p>
        <h1 className="mt-3 text-4xl leading-[1.05] font-light tracking-tight text-balance text-white sm:text-5xl">
          Services &amp; <span className="font-semibold">Products</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-balance text-white/70 sm:text-base">
          Everything {siteConfig.name} builds, in one place. Press an inquire button on any card and
          your email client opens pre-composed to{" "}
          <span className="font-mono text-white/85">{siteConfig.email.inquiry}</span>.
        </p>
      </div>

      {/* Services grid */}
      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {services.map((s) => (
          <article
            key={s.title}
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.05] sm:p-7"
          >
            <h2 className="text-xl font-semibold text-white sm:text-2xl">{s.title}</h2>
            <p className="mt-1 text-xs tracking-wide text-white/55 uppercase">{s.tagline}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/75">{s.description}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {s.bullets.map((b) => (
                <li
                  key={b}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70"
                >
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center">
              <InquiryButton subject={s.title} />
            </div>
          </article>
        ))}
      </div>

      {/* Products — coming soon */}
      <section className="mt-16 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 backdrop-blur-md sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-white/60 uppercase">
              Products
            </p>
            <h2 className="mt-2 text-2xl font-light text-white sm:text-3xl">
              New products <span className="font-semibold">coming soon</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
              We&rsquo;re building a handful of in-house products on the {siteConfig.name} stack.
              Want early access or want to collab? Press the button.
            </p>
          </div>
          <div className="hidden flex-shrink-0 sm:block">
            <InquiryButton subject="Early access to upcoming products" label="Get notified" />
          </div>
        </div>
        <div className="mt-6 sm:hidden">
          <InquiryButton subject="Early access to upcoming products" label="Get notified" />
        </div>
      </section>

      {/* Direct contact */}
      <section className="mt-16 border-t border-white/10 pt-10">
        <h2 className="text-lg font-semibold text-white">Prefer direct?</h2>
        <p className="mt-1 max-w-md text-sm text-white/60">
          Skip the form and email me directly at{" "}
          <a
            href={`mailto:${siteConfig.email.inquiry}`}
            className="font-mono text-white underline underline-offset-2 hover:text-white/80"
          >
            {siteConfig.email.inquiry}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
