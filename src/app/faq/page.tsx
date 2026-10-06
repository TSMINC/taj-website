import type { Metadata } from "next";
import { siteConfig } from "../../config/site.config";
import { InquiryButton } from "../../components/InquiryButton";

export const metadata: Metadata = {
  title: `FAQ — ${siteConfig.name}`,
  description: `Common questions about ${siteConfig.name} — timelines, pricing, process, revisions, maintenance.`,
  robots: { index: true, follow: true },
};

type QA = { q: string; a: string };

const sections: { heading: string; items: QA[] }[] = [
  {
    heading: "Process",
    items: [
      {
        q: "What does the first call look like?",
        a: "15–30 minutes. We ask what you're building, who it's for, and what success looks like. If we're not the right fit, we tell you upfront — and often refer you to someone who is.",
      },
      {
        q: "How are projects scoped?",
        a: "After the call, we send a one-page written proposal: deliverables, timeline, milestones, and a fixed price. You approve in writing, we start.",
      },
      {
        q: "How often do we hear from you during the build?",
        a: "Weekly written update every Friday with progress, blockers, and what's next. Ad-hoc Slack / email for questions. You never wonder what we're doing.",
      },
    ],
  },
  {
    heading: "Pricing + payment",
    items: [
      {
        q: "Fixed price or hourly?",
        a: "Fixed price, always. Hourly incentivizes slowness and vague scope. Fixed prices force us to scope well and ship on time.",
      },
      {
        q: "What if scope changes?",
        a: "We write up a change order (new price, new timeline impact) and you approve it in writing before we proceed. No surprise bills.",
      },
      {
        q: "Payment schedule?",
        a: "50% to start, 50% on delivery. Larger projects use milestone-based payments. Stripe accepts cards; bank transfer available for larger invoices.",
      },
    ],
  },
  {
    heading: "Timelines",
    items: [
      {
        q: "How fast can you start?",
        a: "Usually 1–2 weeks from signed proposal. If you need rush, we can sometimes accommodate for a 15–25% premium.",
      },
      {
        q: "How long does a project take?",
        a: "Starter: 2 weeks. Standard: 4–6 weeks. Custom: scoped per project (typically 2–4 months).",
      },
      {
        q: "What if you miss the deadline?",
        a: "If the delay is on us, you get a prorated discount. If it's on you (unavailable to approve, scope changes, etc.), we pause the clock and resume when you're ready.",
      },
    ],
  },
  {
    heading: "After launch",
    items: [
      {
        q: "What's included in post-launch support?",
        a: "Bug fixes on anything we shipped, 30 days of email response time (60 days on Standard tier). Doesn't include new features — those are a new scope.",
      },
      {
        q: "Can you keep maintaining it after that?",
        a: "Yes — monthly retainer available. Starts at $2,000/month and covers ongoing dev, design updates, dependency bumps, and uptime watching.",
      },
      {
        q: "Who owns the code and assets?",
        a: "You do, from day one. Git repo, design files, keys — all yours. No vendor lock-in.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <p className="text-xs font-semibold tracking-[0.3em] text-white/60 uppercase">FAQ</p>
      <h1 className="mt-3 text-4xl leading-[1.05] font-light tracking-tight text-balance text-white sm:text-5xl">
        Common <span className="font-semibold">questions</span>
      </h1>

      <div className="mt-14 space-y-14">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-light text-white">{s.heading}</h2>
            <dl className="mt-5 space-y-3">
              {s.items.map((qa) => (
                <div
                  key={qa.q}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md"
                >
                  <dt className="text-sm font-semibold text-white">{qa.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-white/70">{qa.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section className="mt-16 rounded-2xl border border-white/15 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
        <h2 className="text-xl font-light text-white sm:text-2xl">
          Didn&rsquo;t answer your <span className="font-semibold">question</span>?
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Email <span className="font-mono">{siteConfig.email.inquiry}</span> — real response from a
          real person within one business day.
        </p>
        <div className="mt-5">
          <InquiryButton subject="Question not in FAQ" label="Ask us anything" />
        </div>
      </section>
    </main>
  );
}
