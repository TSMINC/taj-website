/**
 * Inquiry button — opens the user's email client composing a message to
 * siteConfig.email.inquiry with a pre-filled subject and greeting body.
 * Server component — just a styled anchor to a mailto: URL, no JS.
 */

import { siteConfig } from "../config/site.config";

type Props = {
  /** Subject label — becomes "Inquiry: <subject>" in the composed email. */
  subject: string;
  /** Visible button label. */
  label?: string;
  /** Visual variant. */
  variant?: "solid" | "ghost";
};

export function InquiryButton({ subject, label = "Inquire", variant = "solid" }: Props) {
  const url = buildMailto(subject);
  const classes =
    variant === "solid"
      ? "inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1a0a30] transition hover:bg-white/90"
      : "inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10";

  return (
    <a href={url} className={classes}>
      {label}
      <ArrowOut />
    </a>
  );
}

function buildMailto(subject: string): string {
  const body = [
    `Hi Taj,`,
    ``,
    `I'm interested in: ${subject}.`,
    ``,
    `A bit about my project:`,
    ``,
    `-- `,
    `Sent from ${siteConfig.url}`,
  ].join("\n");
  const q = new URLSearchParams({
    subject: `Inquiry: ${subject}`,
    body,
  });
  return `mailto:${siteConfig.email.inquiry}?${q.toString()}`;
}

function ArrowOut() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" width="14" height="14" fill="none">
      <path
        d="M7 13L13 7M13 7H8.5M13 7V11.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
