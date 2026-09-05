# Security Policy

## Reporting a vulnerability

Please report security issues privately to the repository owner (do not open a public issue).

- Include reproduction steps, impact, and a suggested fix if you have one.
- Please allow a reasonable response window before public disclosure.

## Supported versions

Only the `main` branch is actively supported.

## Standing hardening

- Static-export site with no server-side code paths.
- Content Security Policy applied at the CDN / hosting layer (Cloudflare rules).
- No secrets in the repo, ever. `.env` / `.env.local` are gitignored; secret patterns are blocked by pre-tool hooks locally.
- Dependencies audited weekly via Dependabot; CVE fixes prioritized by severity.
- All PRs to `main` require CI green (lint, typecheck, unit, build, E2E).
