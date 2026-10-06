"use client";

import { useEffect, useState } from "react";
import { requireSupabase, isSupabaseConfigured } from "../../lib/supabase-client";
import { siteConfig } from "../../config/site.config";

type AcceptanceStatus = "loading" | "current" | "stale" | "unknown" | "error";

export function ToSStatus() {
  const [configured] = useState<boolean>(() => isSupabaseConfigured());
  const [status, setStatus] = useState<AcceptanceStatus>(configured ? "loading" : "unknown");

  useEffect(() => {
    if (!configured) return;
    const sb = requireSupabase();
    sb.rpc("has_accepted_current_legal").then(({ data, error }) => {
      if (error) setStatus("error");
      else setStatus(data ? "current" : "stale");
    });
  }, [configured]);

  if (status === "loading" || status === "unknown") return null;

  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
        Couldn&rsquo;t verify your Terms acceptance status.
      </div>
    );
  }

  if (status === "stale") {
    const mailto = `mailto:${siteConfig.email.privacy}?${new URLSearchParams({
      subject: "Re-accept updated Terms of Service",
      body: `Hi,\n\nMy account email: \n\nI'd like to accept the updated Terms of Service + Privacy Policy currently published at ${siteConfig.url}/legal/terms and ${siteConfig.url}/legal/privacy.\n\nThank you,`,
    }).toString()}`;
    return (
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-5 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-amber-100">Terms of Service updated</h3>
        <p className="mt-1.5 text-sm text-amber-100/85">
          Our Terms or Privacy Policy has been updated since you last accepted. Review the current
          versions, then confirm acceptance.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/legal/terms"
            className="rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25"
          >
            Review Terms
          </a>
          <a
            href="/legal/privacy"
            className="rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25"
          >
            Review Privacy
          </a>
          <a
            href={mailto}
            className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[#1a0a30] hover:bg-white/90"
          >
            Confirm acceptance
          </a>
        </div>
      </div>
    );
  }

  // current
  return (
    <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 px-4 py-2.5 text-xs text-emerald-100/80 backdrop-blur-md">
      You&rsquo;re on the current Terms + Privacy versions.
    </div>
  );
}
