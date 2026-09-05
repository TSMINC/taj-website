# taj-website

Enterprise-grade static site scaffold. Content deliberately left blank — design lands later.

## Stack

- **Framework:** Next.js 16 (App Router) with static export (`output: "export"`)
- **UI:** React 19, Tailwind CSS 4
- **Language:** TypeScript (strict, `noUncheckedIndexedAccess`)
- **Lint / format:** ESLint (`eslint-config-next`), Prettier (+ tailwindcss plugin)
- **Tests:** Vitest + Testing Library (unit) · Playwright (E2E, chromium/firefox/webkit)
- **CI:** GitHub Actions (`.github/workflows/ci.yml`)
- **Deploy:** GitHub Pages (`.github/workflows/pages.yml`), Cloudflare later
- **Deps:** Dependabot weekly (`.github/dependabot.yml`)

## Requirements

- Node 22 (see `.nvmrc`)
- npm 11+

## Getting started

```bash
npm ci --legacy-peer-deps
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command                 | What it does                                                |
| ----------------------- | ----------------------------------------------------------- |
| `npm run dev`           | Next dev server on port 3000                                |
| `npm run build`         | Static export → `out/`                                      |
| `npm run start`         | Serve the exported `out/` on port 3000 (used by Playwright) |
| `npm run lint`          | ESLint                                                      |
| `npm run lint:fix`      | ESLint --fix                                                |
| `npm run format`        | Prettier write                                              |
| `npm run format:check`  | Prettier check (CI)                                         |
| `npm run typecheck`     | `tsc --noEmit`                                              |
| `npm run test`          | Vitest run                                                  |
| `npm run test:watch`    | Vitest watch                                                |
| `npm run test:ui`       | Vitest UI                                                   |
| `npm run test:coverage` | Vitest with coverage report                                 |
| `npm run e2e`           | Playwright tests                                            |
| `npm run e2e:ui`        | Playwright UI                                               |
| `npm run prepare`       | Install Husky hooks (auto on install)                       |

## Deploying

### GitHub Pages (initial)

1. Push to `main` on GitHub.
2. In repo Settings → Pages, set **Source: GitHub Actions**.
3. The `pages.yml` workflow builds with `BASE_PATH=/<repo-name>` and deploys to `https://<user>.github.io/<repo-name>/`.

### Cloudflare (later)

- Custom domain via Cloudflare DNS → GitHub Pages custom-domain, OR
- Migrate build target to Cloudflare Pages (unset `BASE_PATH` for root deploys).

## Directory layout

```
.
├── .github/
│   ├── workflows/       CI, Pages deploy
│   ├── dependabot.yml
│   ├── CODEOWNERS
│   └── PULL_REQUEST_TEMPLATE.md
├── e2e/                 Playwright specs
├── public/              Static assets
├── src/
│   └── app/             App Router pages (blank scaffold)
├── CHANGELOG.md
├── CLAUDE.md            Agent guidance for this repo
├── SECURITY.md
├── next.config.ts       output: "export", basePath from env
├── playwright.config.ts
├── vitest.config.ts
└── vitest.setup.ts
```

## Content status

**Site content is intentionally empty.** A single blank landing page ships as `src/app/page.tsx`. Design + copy come in a later pass.

## Security

See [SECURITY.md](./SECURITY.md). No secrets in the repo. `.env*` is gitignored.

## License

MIT — see [LICENSE](./LICENSE).
