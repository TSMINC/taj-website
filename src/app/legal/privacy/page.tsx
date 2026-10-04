"use client";

import { useEffect, useState } from "react";
import { getCurrentLegalText, type LegalText } from "../../../lib/legal";
import { siteConfig } from "../../../config/site.config";

export default function PrivacyPage() {
  const [doc, setDoc] = useState<LegalText | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLegalText("privacy")
      .then((d) => {
        setDoc(d);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setErr(e instanceof Error ? e.message : "Failed to load Privacy Policy.");
        setLoading(false);
      });
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Privacy Policy</h1>
      <p className="mt-1.5 text-sm text-zinc-500">
        {doc
          ? `Version ${doc.version} · Effective ${new Date(doc.effective_at).toLocaleDateString()}`
          : " "}
      </p>

      <div className="mt-8 min-h-[40vh] text-zinc-300">
        {loading && <p className="text-sm text-zinc-500">Loading…</p>}
        {err && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        {!loading && !doc && !err && (
          <p className="text-sm text-zinc-500">
            No Privacy Policy published yet for this environment.
          </p>
        )}
        {doc && (
          <article className="prose prose-invert prose-sm max-w-none font-sans whitespace-pre-wrap">
            {doc.full_text}
          </article>
        )}
      </div>

      <p className="mt-16 border-t border-white/10 pt-4 text-xs text-zinc-500">
        Questions:{" "}
        <a href={`mailto:${siteConfig.email.privacy}`} className="underline">
          {siteConfig.email.privacy}
        </a>
      </p>
    </main>
  );
}
