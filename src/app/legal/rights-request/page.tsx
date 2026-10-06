import type { Metadata } from "next";
import { siteConfig } from "../../../config/site.config";

export const metadata: Metadata = {
  title: `Privacy Rights Request — ${siteConfig.name}`,
  description: `Submit a CCPA/CPRA privacy rights request to ${siteConfig.name}.`,
  robots: { index: true, follow: true },
};

type RequestType = {
  label: string;
  subject: string;
  body: string;
};

const requestTypes: RequestType[] = [
  {
    label: "Right to Know",
    subject: "CCPA Right to Know Request",
    body: `Hi,\n\nI am exercising my right to know under CCPA/CPRA. Please provide:\n\n- The categories of personal information you have collected about me in the past 12 months\n- The categories of sources\n- The business purposes for collecting it\n- The categories of third parties with whom it was shared\n- The specific pieces of personal information you hold about me\n\nMy account email: \n\nThank you,`,
  },
  {
    label: "Right to Delete",
    subject: "CCPA Right to Delete Request",
    body: `Hi,\n\nI am exercising my right to delete under CCPA/CPRA. Please delete all personal information you have collected from me, subject to the exceptions allowed by law (e.g. tax/accounting records for payment data).\n\nMy account email: \n\nThank you,`,
  },
  {
    label: "Right to Correct",
    subject: "CCPA Right to Correct Request",
    body: `Hi,\n\nI am exercising my right to correct inaccurate personal information under CCPA/CPRA.\n\nMy account email: \n\nWhat is inaccurate: \n\nWhat it should say: \n\nThank you,`,
  },
  {
    label: "Right to Opt-Out of Sale/Share",
    subject: "CCPA Right to Opt-Out Request",
    body: `Hi,\n\nI am exercising my right to opt out of the sale or sharing of my personal information under CCPA/CPRA.\n\n(Note: ${siteConfig.name} does not sell or share personal information. This request is logged for compliance.)\n\nMy account email: \n\nThank you,`,
  },
  {
    label: "Right to Limit Sensitive Info Use",
    subject: "CCPA Right to Limit Sensitive Info Request",
    body: `Hi,\n\nI am exercising my right to limit the use and disclosure of my sensitive personal information under CCPA/CPRA.\n\nMy account email: \n\nThank you,`,
  },
];

function buildMailto(r: RequestType): string {
  const q = new URLSearchParams({ subject: r.subject, body: r.body });
  return `mailto:${siteConfig.email.privacy}?${q.toString()}`;
}

export default function RightsRequestPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Privacy Rights Request
      </h1>
      <p className="mt-2 text-sm text-white/55">
        California Consumer Privacy Act (CCPA/CPRA) · 45-day response window
      </p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed text-white/75">
        <p>
          Pick the type of request below. Each button opens your email client composing a pre-filled
          message to <span className="font-mono text-white/85">{siteConfig.email.privacy}</span>.
          Fill in your account email and send.
        </p>
        <p>
          We respond within <strong className="text-white">45 days</strong>. If we need an extension
          (up to another 45 days), we&rsquo;ll notify you.
        </p>
      </section>

      <div className="mt-10 space-y-3">
        {requestTypes.map((r) => (
          <a
            key={r.label}
            href={buildMailto(r)}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div>
              <div className="text-base font-semibold text-white">{r.label}</div>
              <div className="mt-0.5 text-xs text-white/55">
                Opens email to {siteConfig.email.privacy}
              </div>
            </div>
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              width="18"
              height="18"
              fill="none"
              className="text-white/60"
            >
              <path
                d="M7 13L13 7M13 7H8.5M13 7V11.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        ))}
      </div>

      <section className="mt-12 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/70 backdrop-blur-md">
        <h2 className="text-base font-semibold text-white">Authorized agents</h2>
        <p className="mt-2">
          You may authorize an agent to submit a request on your behalf. We may require verification
          of the agent&rsquo;s authority. Include the authorization in your email.
        </p>
        <h2 className="mt-5 text-base font-semibold text-white">Non-discrimination</h2>
        <p className="mt-2">
          We will not deny you service, charge you a different price, or provide a different quality
          of service because you exercise your privacy rights.
        </p>
      </section>
    </main>
  );
}
