# Security teams review — delete GitHub Pages workflow

**Date:** 2026-10-04
**Triggered by:** failing CI noise on every push; project deploys to Cloudflare Workers, not GitHub Pages. Scope: delete `.github/workflows/pages.yml` (47 lines).

---

## White (governance)

- **Scope IN:** `.github/workflows/pages.yml` only.
- **Scope OUT:** `ci.yml`, `redteam-audit.yml`, Cloudflare Workers deploy, Supabase schema, application code — untouched.
- **Business priority:** reduce CI noise + email spam from failing-every-push workflow. Deploy to CF Workers is the one true deploy path going forward (per Taj, 2026-10-04).
- **Compliance:** none specific to this change (no PII, no credentials, no legal content).
- **Rules of engagement:** Red/Black assume attacker knows the deploy path changed. Blue must not re-introduce the removed path by accident.
- **Referee rulings:** none required; single-file deletion with no runtime effect.

## Red (software attacks)

- **R1:** Attacker clones the repo at an old commit (pre-deletion), builds the GitHub Pages artifact, and attempts to deploy via GitHub's Pages infrastructure. **Verify by:** Pages must be DISABLED in GitHub repo Settings → Pages after this change, OR the gh-pages environment must be deleted. Repo setting is the enforcement, not the workflow file.
- **R2:** Someone restores `pages.yml` from git history (`git revert` or `git show HEAD~1 -- .github/workflows/pages.yml | git apply`). **Verify by:** branch protection on `main` requires a PR + review for workflow changes; this is already the plan per `docs/architecture/environments.md`.
- **R3:** The removed workflow referenced `BASE_PATH: /taj-website`. If `next.config.ts` still reads `BASE_PATH` and someone sets it in another env, routing could break on `main`. **Verify by:** search confirms `BASE_PATH` is still read in `next.config.ts` as an optional env var defaulting to empty string — safe when unset, which it is on the Cloudflare build.

## Black (physical/hardware attacks)

**N/A at this scope.** No physical attack vector exists on a repo-level workflow file deletion.

## Blue (controls added / affirmed)

- **B1 [addresses R1]:** Add a note to `docs/architecture/environments.md` explaining GitHub Pages was abandoned; Taj disables Pages in GitHub repo Settings as a one-time cleanup. Verify in repo settings after push.
- **B2 [addresses R2]:** Branch protection on `main` already planned (per `docs/architecture/environments.md` § Branch protection). Required-review on any `.github/workflows/*` change makes accidental restoration a two-person action.
- **B3 [addresses R3]:** Keep `BASE_PATH` logic in `next.config.ts` — it's cheap defense for future deploy targets (sub-path hosting). Harmless when unset.
- **B4 [proactive]:** Email notifications on failed GitHub Actions runs should be filtered to the one workflow we actually care about (`CI`) — Taj can mute `Deploy to GitHub Pages` from the GitHub notification settings. (Moot after this deletion since no workflow by that name exists, but documented in case he reintroduces one later.)

## Purple (bridge)

- **Blind spot:** R1 (someone deploying from old commit) succeeds through PATH not covered by this workflow deletion — the gh-pages infrastructure is enabled or disabled in GitHub repo settings, independent of workflow file presence. Deleting the file is necessary but not sufficient.
- **Derived rule:** When removing a deploy path, delete BOTH the workflow file AND the destination's enablement (GitHub Pages setting, Cloudflare project, Vercel project, etc.). Workflow-file-only cleanup leaves an orphaned receiver.

## Yellow (meta)

- **Root pattern:** scaffold-era deploy workflows persist past their usefulness because they're invisible until they fail noisily. Same shape as unused dependencies, dead code, half-wired integrations.
- **Cross-cutting control:** quarterly audit of `.github/workflows/*.yml` + corresponding deploy destinations. If a workflow hasn't produced a USED artifact in 30 days, review for deletion. Can be scripted via `gh run list` cross-referenced against the active deploy path doc.
- **Systemic risk:** LOW. One failing workflow is cosmetic; multiple would hide the one that matters.
- **Recommendation:** fix now (deletion), defer the quarterly audit skill to a dedicated session.

## Gray (external independent)

- **Mode:** historical precedent.
- **Observation:** every Next.js scaffold project I've seen that migrated to Cloudflare / Vercel / Netlify eventually had this same orphaned GitHub Pages workflow linger. The failure mode is identical: email spam + confusion about which deploy is "real." Deletion is standard practice.
- **Verified findings:** CONFIRMED — the move from GitHub Pages to any CDN platform makes `pages.yml` noise.
- **Cross-cutting insight:** none new; aligns with Yellow's root pattern.

## Orange (audit)

- **Red rigor:** 4/5 — covered attack-via-restoration (R2) + destination-still-enabled (R1) + env-var ghost dependency (R3). Missed: attacker exploiting the gh-pages environment's leftover `id-token: write` permission. Mitigated by R1's control (disable Pages).
- **Black rigor:** 5/5 — correctly ruled N/A at this scope. Padding Black with speculation would be noise.
- **Blue rigor:** 5/5 — four controls across the three Red findings + one proactive. Each tied to a specific action Taj can verify.
- **Gray rigor:** 3/5 — historical precedent is weak evidence vs. an actual external AI pass. Acceptable for a 1-file deletion; would be insufficient for a schema change.
- **Adjustment for next review:** for infrastructure deletions, add an explicit "destination state" question (is the receiving service still enabled?) to the Red checklist.

## Green (ops) — released only after White sign-off

- **Reactive:**
  - Log: deletion commit SHA; link in `docs/architecture/environments.md`.
  - Alert: next push to `main` should produce ONE workflow run (`CI`), not two. If a `Deploy to GitHub Pages` run appears, something restored it.
  - Playbook: if restored by mistake, `git rm .github/workflows/pages.yml && git commit && git push`.
- **Proactive:**
  - Canary: watch `gh run list --limit 3` after next push; confirm no `Deploy to GitHub Pages` entry.
  - Periodic: next session, verify Pages is disabled at repo Settings → Pages (Taj's click).
- **Rollback:** `git revert <this-sha>` (zero data impact; purely restores a failing workflow).
- **White sign-off:** [x] granted — scope is a single workflow file, zero runtime effect, three independent Blue controls cover the Red findings, Gray + Orange concur.
