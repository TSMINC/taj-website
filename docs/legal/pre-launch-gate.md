# Legal pre-launch gate

Every item below must be present + verified before the site goes live to
real (non-Taj) users. This is a checklist, not a substitute for a
California-licensed attorney reviewing the final artifacts. Each item
has a one-line acceptance criterion.

## Statutory disclosures (CCPA/CPRA + CalOPPA + federal)

- [ ] **Privacy Policy published** — reachable at `/legal/privacy`; the
      exact text is stored in `legal_texts` with `kind='privacy'`,
      `is_current=true`, `text_hash` verified by DB trigger.
- [ ] **Terms of Service published** — reachable at `/legal/terms`;
      same immutability guarantee as above.
- [ ] **CCPA/CPRA notice at collection** — Privacy Policy lists the
      categories of personal information collected, purposes, third
      parties who receive it, and retention periods, per Cal. Civ. Code
      § 1798.100(b).
- [ ] **"Do Not Sell or Share My Personal Information" disclosure** —
      a page at `/legal/do-not-sell` states either the DNS mechanism OR
      that no sale/share occurs. Silence is non-compliant even when we
      don't sell.
- [ ] **CalOPPA "Do Not Track" statement** — Privacy Policy contains an
      explicit statement of how the site responds (or doesn't) to
      browser DNT signals, per Cal. Bus. & Prof. Code § 22575(b)(5).
      Silence is non-compliant.
- [ ] **Consumer rights disclosure** — Privacy Policy names the
      right-to-know, right-to-delete, right-to-correct, right-to-opt-out,
      and right-to-non-discrimination, with a mechanism for exercising
      each (`privacy@…` + a request form).
- [ ] **Retention period per data category** — documented in Privacy
      Policy. `ip_hash` retention specifically states its window and
      alignment with California's 4-year written-contract SOL (Cal. Civ.
      Proc. Code § 337).
- [ ] **Data Processing Agreements** — Supabase DPA on file (available
      at supabase.com/legal/dpa); Cloudflare DPA acknowledged
      (dash.cloudflare.com → account settings). Both stored under
      `docs/legal/dpa/`.

## Arbitration + class action (only if chosen)

- [ ] **Arbitration decision made** — Taj has explicitly chosen either
      "include binding arbitration + class-action waiver" or "exclude
      both." If excluded, skip to next section.
- [ ] **30-day opt-out mechanism** — ToS states a specific email or
      form users can submit within 30 days of account creation to opt
      out of arbitration. Required for California enforceability per
      _McGill v. Citibank_ and post-_AT&T v. Concepcion_ line.
- [ ] **Small-claims carve-out** — ToS explicitly preserves the user's
      right to bring qualifying claims in California small-claims
      court. Also required for enforceability.
- [ ] **Bilateral scope** — the arbitration clause binds Taj's entity
      equally, not just the user. Asymmetric clauses are
      unconscionable under California law.

## Account + age

- [ ] **Age representation at signup** — Google Sign-In flow includes an
      explicit checkbox: "I am at least 18 years old" before the first
      `tos_acceptances` insert. Recorded as part of the profile.
- [ ] **Minor opt-in for anyone 13–17** — deferred; site is 18+ by ToS.
      If Taj ever lowers the age, opt-in from a parent per Cal. Civ.
      Code § 1798.120(c) is required, and this checklist changes.

## ToS mechanics

- [ ] **ToS versioning + re-acceptance** — `has_accepted_current_legal()`
      is called by RLS on any gated write; a user on a stale version is
      blocked at the DB, not just the UI.
- [ ] **Material-change notice** — a change to `is_current` in
      `legal_texts` triggers a UI banner on next visit until the user
      accepts. Non-material changes (typo fixes) publish without
      forcing re-acceptance (they don't flip `is_current`).
- [ ] **Governing-law + venue clause** — ToS explicitly states
      California law governs + California courts have venue for
      non-arbitrated disputes.
- [ ] **Section 230 posture** — ToS states user submissions are the
      user's content; site is not a publisher; DMCA agent contact
      published at `/legal/dmca` if we ever host UGC.

## Contact + rights request

- [ ] **`privacy@<domain>` mailbox live** — receives, catch-all handled,
      auto-ack sent within 24h.
- [ ] **`legal@<domain>` mailbox live** — same standard.
- [ ] **Rights request form at `/legal/rights-request`** — collects
      name, email, request type (know/delete/correct/opt-out),
      verification method. Submissions inserted via Worker
      (Turnstile-gated) into a `rights_requests` table (not yet in
      schema — add before this item can pass).

## Data hygiene

- [ ] **No secret in built bundle** — CI `redteam-audit` workflow green
      for the release commit.
- [ ] **No PII in application logs** — Worker logs `console.log("event
  slug", { ok })` shape, no raw request bodies, no `env` object.
- [ ] **All tables have RLS enabled + policies verified** — the audit
      query at the bottom of `supabase/schema.sql` returns only
      intended rows.
- [ ] **`contact_messages` + `tos_acceptances` inaccessible via anon
      key** — verified by attempting an anon `POST` from the browser
      console; must return 401/403.

## Backups + rollback

- [ ] **Supabase automatic daily backup enabled** — verified in dashboard.
- [ ] **`legal_texts` rollback procedure documented** — see
      `docs/runbook/rollback-legal-text.md`.
- [ ] **Deploy rollback documented** — Cloudflare Pages "Rollback to
      deployment" verified in a dry run.

## Sign-off

- [ ] **Attorney review** — a California-licensed attorney has reviewed
      the final `/legal/terms` + `/legal/privacy` text. Their name +
      date recorded in `docs/legal/attorney-review.md`. Claude is not a
      lawyer; this checklist is diligent research, not legal advice.
