# CLAUDE.md — taj-website

Project-scoped guidance for Claude Code in this repo. The global `~/.claude/CLAUDE.md` still applies; this file overrides only where noted.

## Project

- **Purpose:** Marketing / portfolio site. Static export, no server-side code.
- **Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4.
- **Deploy:** GitHub Pages initially, Cloudflare later.
- **Content status:** blank on purpose. Do NOT invent copy, imagery, or product claims.

## Commands (source of truth for CI + hooks)

- Install: `npm ci --legacy-peer-deps`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Format check: `npm run format:check`
- Typecheck: `npm run typecheck`
- Unit tests: `npm run test`
- E2E: `npm run e2e`
- Build (static export): `npm run build` → `out/`

## Rules for this repo

1. **No content invention.** Placeholder text = `TODO: content`. Never fabricate names, quotes, testimonials, or feature claims.
2. **No new deps without a reason** written in the PR description. Prefer built-ins.
3. **Server-only APIs are off-limits.** This is a static export — nothing that requires a Node runtime at request time.
4. **Images:** everything in `public/`, referenced with `next/image` and `unoptimized: true` (static export requirement).
5. **Env vars:** anything read at build time goes in `.env.example` too, or the CI build breaks silently.
6. **Every PR:** lint + typecheck + test + build must be green locally before requesting review; CI enforces the same.

## Anti-patterns for this repo

- Adding runtime-only Next features (`server actions`, `revalidatePath`, ISR) — they don't work with `output: "export"`.
- Committing generated files (`.next/`, `out/`, `coverage/`, `playwright-report/`).
- Widening image `remotePatterns` — the site should ship all its own assets.

## Cross-links

- Root memory / doctrine: `~/.claude/CLAUDE.md`
- Skill library: `~/.claude/skills/INDEX.md`
- Sibling project: `requiem-ai` (Tauri desktop app) — do not accidentally edit files there when working here.
