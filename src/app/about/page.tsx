import type { Metadata } from "next";
import { siteConfig } from "../../config/site.config";
import { InquiryButton } from "../../components/InquiryButton";

export const metadata: Metadata = {
  title: `About — ${siteConfig.name}`,
  description: `About ${siteConfig.name} — a network of connected minds building modern websites, apps, and brands.`,
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <p className="text-xs font-semibold tracking-[0.3em] text-white/60 uppercase">About us</p>
      <h1 className="mt-3 text-4xl leading-[1.05] font-light tracking-tight text-balance text-white sm:text-5xl">
        A network of <span className="font-semibold">connected minds</span>
      </h1>

      <section className="mt-10 space-y-6 text-base leading-relaxed text-white/80">
        <p>
          {siteConfig.name} is a small team that builds the kind of software and brand work bigger
          agencies either charge 10× for or won&rsquo;t touch. We care about the craft, the
          performance, and the long-term maintenance — not the pitch deck.
        </p>
        <p>
          Every website we ship loads under a second. Every app we build is instrumented from day
          one. Every Shopify store we launch has conversion-focused UX baked in before the brand
          colors go on. We don&rsquo;t sell templates; we build systems you own.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-light text-white">
          How we <span className="font-semibold">work</span>
        </h2>
        <div className="mt-6 space-y-5">
          {[
            {
              step: "01",
              title: "Scoping call",
              body: "15–30 minute call to understand what you're building, what success looks like, and whether we're the right fit. No sales pitch.",
            },
            {
              step: "02",
              title: "Written proposal",
              body: "A one-page scope with deliverables, timeline, and a fixed price. No open-ended hourly billing.",
            },
            {
              step: "03",
              title: "Build sprint",
              body: "Weekly check-ins. You see progress every Friday. Change requests go through a lightweight written process.",
            },
            {
              step: "04",
              title: "Launch + handoff",
              body: "We deploy, you own the keys. Documented handover. 30 days of post-launch support included on every project.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="flex gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md"
            >
              <div className="flex-shrink-0 font-mono text-xs font-semibold text-white/40">
                {s.step}
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{s.title}</h3>
                <p className="mt-1 text-sm text-white/70">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-light text-white">
          Our <span className="font-semibold">principles</span>
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Ship fast, ship small.",
            "Own what you build.",
            "Performance is a feature.",
            "Say the real timeline.",
            "No vendor lock-in.",
            "Write it down.",
          ].map((p) => (
            <li
              key={p}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 backdrop-blur-md"
            >
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 rounded-2xl border border-white/15 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
        <h2 className="text-xl font-light text-white sm:text-2xl">
          Ready to <span className="font-semibold">build something</span>?
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Pick a service, press inquire, and we&rsquo;ll be in touch within one business day.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <InquiryButton subject="General inquiry" />
          <a
            href="/services"
            className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10"
          >
            See services
          </a>
        </div>
      </section>
    </main>
  );
}
