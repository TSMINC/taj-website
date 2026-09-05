# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); dates are ISO 8601; semver.

## [Unreleased]

### Added

- Initial enterprise-grade scaffold: Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind 4.
- Vitest + Testing Library (unit) with 60% coverage floor.
- Playwright (E2E) across chromium / firefox / webkit.
- Prettier (+ prettier-plugin-tailwindcss), ESLint (next core-web-vitals + typescript).
- Husky pre-commit + lint-staged.
- GitHub Actions: CI (lint → typecheck → test → build → E2E) and GitHub Pages deploy.
- Dependabot weekly (npm + actions), CODEOWNERS, PR template.
- Static export ready for GitHub Pages and Cloudflare Pages.
- `SECURITY.md`, `.env.example`, `.editorconfig`, `.nvmrc`, `CLAUDE.md`.
