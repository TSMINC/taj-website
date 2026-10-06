"use client";

import { useState } from "react";
import { siteConfig } from "../../config/site.config";

export function DeleteAccount({ email }: { email: string }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  const mailto = `mailto:${siteConfig.email.privacy}?${new URLSearchParams({
    subject: "Account deletion request",
    body: [
      `Hi,`,
      ``,
      `Please delete my ${siteConfig.name} account and all associated personal information.`,
      ``,
      `Account email: ${email}`,
      ``,
      `I understand this is irreversible and that deletion will be completed within 45 days per CCPA/CPRA, subject to legally-required retention (e.g. tax records for past payments).`,
      ``,
      `Thank you,`,
    ].join("\n"),
  }).toString()}`;

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-red-300/80 underline underline-offset-2 hover:text-red-300"
      >
        Delete my account
      </button>
    );
  }

  const canSend = typed.trim().toLowerCase() === "delete";

  return (
    <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/5 p-5 backdrop-blur-md">
      <h4 className="text-sm font-semibold text-red-100">Delete your account?</h4>
      <p className="mt-1.5 text-xs leading-relaxed text-red-100/80">
        This submits a CCPA/CPRA deletion request to{" "}
        <span className="font-mono">{siteConfig.email.privacy}</span>. We respond within 45 days.
        After confirmation, your account + all personal data are removed (subject to
        legally-required retention like payment records).
      </p>
      <label className="mt-4 block">
        <span className="text-[11px] tracking-wide text-red-100/70 uppercase">
          Type <code className="rounded bg-red-500/20 px-1 font-mono">delete</code> to confirm
        </span>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoFocus
          placeholder="delete"
          className="mt-1.5 w-full rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-white placeholder-red-200/30 focus:border-red-400/50 focus:outline-none"
        />
      </label>
      <div className="mt-4 flex items-center gap-3">
        <a
          href={canSend ? mailto : undefined}
          onClick={(e) => !canSend && e.preventDefault()}
          aria-disabled={!canSend}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            canSend
              ? "bg-red-500 text-white hover:bg-red-500/90"
              : "cursor-not-allowed bg-red-500/30 text-red-100/50"
          }`}
        >
          Send deletion request
        </a>
        <button
          onClick={() => {
            setConfirming(false);
            setTyped("");
          }}
          className="text-xs text-white/60 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
