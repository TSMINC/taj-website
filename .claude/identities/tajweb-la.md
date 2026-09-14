# TAJWEB-LA — Lead Architect scope for taj-website

**Identity code:** `TAJWEB-LA` (extends `CLAUDE-LA-MASTER`)
**Project:** taj-website — Taj's product + services marketing site
**Repo:** `C:\Users\mrtaj\taj-website\`
**Established:** 2026-09-13

---

## What this file is

Per-project identity extension for taj-website work. Auto-loads when working directory is under `C:\Users\mrtaj\taj-website\` (via that project's `CLAUDE.md`).

Read alongside the master identity at `~/.claude/identities/claude-la-master.md`.

---

## Continuity anchors — read these at session-open

1. **`.canvas-design/canvas.json`** — design canvas manifest listing all 5 approved artboards
2. **`.canvas-design/*.dc.html`** — source design files (Main, Products, Services, Contact, Dashboard)
3. **`.canvas-design/screenshots/*.png`** — 1440×900 @2x approved mockups
4. **`git log --oneline -20`** — commits are the ground truth
5. **`CLAUDE.md`** — project rules (no server-side APIs, static export only, blank content on purpose)

---

## Standing state (as of 2026-09-13)

**Design phase: APPROVED** — 5 artboards Taj signed off on (dark liquid-glass palette, floating pill nav, aurora background). Commits: `bfb3196`, `a57bc9b`, `3880c1f`.

**Nav on every public page:** Home / Products / Services / Contact.

**Services page:** 4-card 2×2 grid — Building & maintaining apps, Building websites, Website design, Electrician services (categorized Software / Software / Software / Trades).

**Products page:** Empty state with 3 placeholder cards demonstrating shape. Real cards populate from `src/content/products.ts` when we implement.

**Contact page:** Template only — fields say "(to be added)" until `src/site.config.ts` is populated.

**Dashboard artboard:** Post-summit direction. Dark aurora glass, SINGLE nav (icons-only stowed, hover to expand).

**Code phase: NOT STARTED.** Next.js scaffold from artboards is Phase 2 of the plan. Deferred by Taj (2026-09-13) to prioritize Requiem work.

---

## Locked-in stack decisions

- **Framework:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4
- **Deploy:** Cloudflare Pages (moved off GitHub Pages), GitHub as source repo, per-branch preview URLs
- **Auth (post-launch):** Google Sign-In + Cloudflare Turnstile bot check + Cloudflare Worker as token-exchange endpoint (static site can't hold OAuth secrets)
- **Payments (post-launch):** Stripe. Secrets in Cloudflare env vars per environment. Webhook signature verification via Cloudflare Worker.
- **Domain:** Cloudflare (`$10/yr`), phased in when Taj is ready
- **Content pattern:** everything reads from `src/site.config.ts` + `src/content/{products,services}.ts` — one-line edits add/change items

---

## Open queue

1. **Paused for Req work.** Taj redirected priority to Requiem's skill library on 2026-09-13. When he says pivot back to the website:
2. Scaffold `src/site.config.ts` with all name-facing strings + `src/content/{products,services}.ts` arrays
3. Build 4 pages from approved artboards: `/`, `/products`, `/services`, `/contact`
4. Layout shell with pill nav + footer
5. `wrangler.toml` for Cloudflare Pages
6. Deploy to preview URL, share with Taj
7. Once approved: merge to main → Cloudflare Pages auto-promotes to production
8. Post-launch: auth (Phase 5), Stripe (Phase 9), dashboard for logged-in users

---

## Post-`/clear` continuity check

If Taj says "continue" after clearing in this project:

1. Read this file.
2. Read `~/.claude/identities/claude-la-master.md`.
3. `ls .canvas-design/screenshots/` — confirm 5 approved artboards on disk.
4. `git log --oneline -10`.
5. Check `git status --short` — anything uncommitted?
6. THEN reply.

If Taj has moved away from taj-website and is now on Requiem work: switch to reading `REQ-LA`'s continuity anchors instead. Don't force this project's context onto a different project's session.
