/**
 * Inquiry button — opens Gmail's web compose in a new tab, pre-filled with
 * siteConfig.email.inquiry in the To field plus a subject/body for the
 * selected service. Chosen over `mailto:` because mailto depends on the
 * visitor having a configured default mail client, which modern desktop
 * browsers often don't; Gmail compose always works (and on mobile, opens
 * the Gmail app via a universal link when installed).
 *
 * Server component — no JS; just a styled anchor to a Gmail URL.
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
  const url = buildGmailCompose(subject);
  const classes =
    variant === "solid"
      ? "inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1a0a30] transition hover:bg-white/90"
      : "inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10";

  return (
    <a href={url} className={classes} target="_blank" rel="noopener noreferrer">
      {label}
      <ArrowOut />
    </a>
  );
}

/**
 * Gmail compose URL. `view=cm` opens the compose window, `fs=1` forces
 * full-screen, `to`/`su`/`body` populate the fields. URLSearchParams
 * handles the needed URL encoding for all three.
 */
function buildGmailCompose(subject: string): string {
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
    view: "cm",
    fs: "1",
    to: siteConfig.email.inquiry,
    su: `Inquiry: ${subject}`,
    body,
  });
  return `https://mail.google.com/mail/?${q.toString()}`;
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
