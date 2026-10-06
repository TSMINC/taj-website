"use client";

import { useEffect, useState } from "react";
import { requireSupabase, isSupabaseConfigured } from "../../lib/supabase-client";

type Profile = { display_name: string | null; avatar_url: string | null };

export function ProfileEditor({ userId }: { userId: string }) {
  const [configured] = useState<boolean>(() => isSupabaseConfigured());
  const [displayName, setDisplayName] = useState("");
  const [initial, setInitial] = useState("");
  const [loading, setLoading] = useState<boolean>(configured);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<null | "ok" | string>(null);

  useEffect(() => {
    if (!configured) return;
    const sb = requireSupabase();
    sb.from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setStatus(error.message);
        } else {
          const p = (data ?? { display_name: "", avatar_url: null }) as Profile;
          setDisplayName(p.display_name ?? "");
          setInitial(p.display_name ?? "");
        }
        setLoading(false);
      });
  }, [userId, configured]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      const sb = requireSupabase();
      const { error } = await sb
        .from("profiles")
        .update({ display_name: displayName.trim() || null, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;
      setInitial(displayName.trim());
      setStatus("ok");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const dirty = displayName.trim() !== initial.trim();

  if (loading) {
    return <div className="text-sm text-white/50">Loading profile…</div>;
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium tracking-wide text-white/60 uppercase">
          Display name
        </span>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={60}
          placeholder="How should we address you?"
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 backdrop-blur-md focus:border-white/35 focus:outline-none"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!dirty || saving}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1a0a30] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {status === "ok" && <span className="text-xs text-emerald-300">Saved ✓</span>}
        {status && status !== "ok" && <span className="text-xs text-red-300">{status}</span>}
      </div>
    </form>
  );
}
