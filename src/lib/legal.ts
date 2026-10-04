/**
 * Legal doc fetching + ToS acceptance recording.
 *
 * The actual TEXT lives in Supabase `legal_texts` table (immutable, hashed).
 * This module fetches the current rows and records acceptance against them.
 */

import { requireSupabase, isSupabaseConfigured } from "./supabase-client";

export { isSupabaseConfigured };

export type LegalKind = "tos" | "privacy";

export type LegalText = {
  id: string;
  kind: LegalKind;
  version: string;
  full_text: string;
  text_hash: string;
  effective_at: string;
};

/** Fetches the currently-effective ToS or Privacy text (public, no auth). */
export async function getCurrentLegalText(kind: LegalKind): Promise<LegalText | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("legal_texts")
    .select("id, kind, version, full_text, text_hash, effective_at")
    .eq("kind", kind)
    .eq("is_current", true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as LegalText | null;
}

/** Has the current user accepted both current ToS + Privacy? */
export async function hasAcceptedCurrentLegal(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("has_accepted_current_legal");
  if (error) throw error;
  return Boolean(data);
}
