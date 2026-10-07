# SEO + Google Search Console submission guide

**Live site:** https://taj-website.tajmoore74.workers.dev
**Last updated:** 2026-10-06
**Owner:** Taj Moore (`tajmoore74@yahoo.com`)

This file is the single reference for everything a search engine needs to know about Uniynode, and the steps to tell Google about the site so it starts appearing in search results.

---

## 1. The thing Google actually reads: `sitemap.xml`

Google's crawler doesn't read human documents — it reads **sitemap.xml**. The site auto-generates one at build time from [`src/app/sitemap.ts`](../src/app/sitemap.ts).

**Live sitemap URL:** https://taj-website.tajmoore74.workers.dev/sitemap.xml

That one URL is what you paste into Google Search Console. Google downloads it, sees every page listed below, and starts crawling.

---

## 2. Full page inventory

Every page on the site, what it's for, what it says, and what someone would search to find it.

| #   | URL                     | Title tag                                | What it says                                                                                                                                              | Target search intent                                                                  |
| --- | ----------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | `/`                     | Uniynode — A network of connected minds. | Hero welcome with inline email sign-in. Short tagline. CA law + 18+ disclaimer.                                                                           | Brand name: "Uniynode"                                                                |
| 2   | `/services`             | Services — Uniynode                      | Four service cards: Website Builds, Design, App Development, Custom Shopify Stores. Each with tag chips + Inquire mailto. "Products coming soon" section. | "website builder California", "custom Shopify developer", "freelance app development" |
| 3   | `/pricing`              | Pricing — Uniynode                       | Three tiers: Starter ($1,500), Standard ($4,500 featured), Custom (quote). Billing FAQ. Retainer offer.                                                   | "website pricing", "fixed price web design", "freelance web dev cost"                 |
| 4   | `/about`                | About — Uniynode                         | Who we are. 4-step process (Scoping / Proposal / Build Sprint / Launch+Handoff). 6 principles. Inquire CTA.                                               | "about Uniynode", "small web agency process"                                          |
| 5   | `/faq`                  | FAQ — Uniynode                           | ~10 Q&As grouped by Process / Pricing / Timelines / After-launch.                                                                                         | "how does freelance web dev work", "web dev payment terms"                            |
| 6   | `/portfolio`            | Work — Uniynode                          | Placeholder (case studies in progress). Lists project categories we take. Request-references CTA.                                                         | "Uniynode portfolio", "web development case studies"                                  |
| 7   | `/signup`               | Sign up — Uniynode                       | Email magic-link form + ToS/Privacy checkbox + CA law notice.                                                                                             | (not optimized for search; conversion page)                                           |
| 8   | `/login`                | Sign in — Uniynode                       | Email magic-link form.                                                                                                                                    | (not optimized for search)                                                            |
| 9   | `/dashboard`            | (auth-gated)                             | Signed-in-only. Profile edit, ToS re-acceptance banner, account deletion. Redirects to /login if signed out.                                              | **noindex** (dashboard excluded via robots.txt + sitemap excludes it)                 |
| 10  | `/auth/callback`        | (processing)                             | OAuth / magic-link return URL. Processes session hash, redirects to /dashboard.                                                                           | **noindex** (excluded)                                                                |
| 11  | `/legal/terms`          | Terms of Service — Uniynode (DB-sourced) | Full ToS. California law, binding arbitration + JAMS, 30-day opt-out, class-action waiver, liability cap, 15 sections.                                    | "Uniynode terms of service"                                                           |
| 12  | `/legal/privacy`        | Privacy Policy — Uniynode (DB-sourced)   | Full Privacy Policy. CCPA/CPRA + CalOPPA DNT, 12 sections, 45-day rights-response.                                                                        | "Uniynode privacy policy"                                                             |
| 13  | `/legal/do-not-sell`    | Do Not Sell — Uniynode                   | CCPA § 1798.135 required disclosure. States we do not sell/share for cross-context behavioral ads.                                                        | "Uniynode do not sell", "CCPA notice"                                                 |
| 14  | `/legal/rights-request` | Rights Request — Uniynode                | 5 pre-composed mailto buttons for CCPA rights (Know / Delete / Correct / Opt-out / Limit-sensitive).                                                      | "Uniynode data request", "CCPA rights"                                                |
| 15  | `/legal/dmca`           | DMCA — Uniynode                          | Designated agent + 17 U.S.C. § 512(c) notice procedure + § 512(f) counter-notice.                                                                         | "Uniynode DMCA", "copyright takedown"                                                 |

The `/dashboard` and `/auth/callback` pages are explicitly excluded in [`src/app/robots.ts`](../src/app/robots.ts) and NOT listed in `sitemap.ts` — they're private workflows, not search-worthy content.

---

## 3. robots.txt (Google's permission file)

Lives at https://taj-website.tajmoore74.workers.dev/robots.txt, generated from [`src/app/robots.ts`](../src/app/robots.ts).

**Production branch (main) emits:**

```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /auth/callback
Disallow: /maintenance

Sitemap: https://taj-website.tajmoore74.workers.dev/sitemap.xml
```

**Any other branch (dev/stable/tester) emits:** `Disallow: /` — those branches shouldn't be indexed because the content is identical to prod and would create a duplicate-content SEO penalty.

---

## 4. Open Graph / social preview

When someone shares a Uniynode URL on Twitter, Slack, LinkedIn, iMessage, Discord, etc., they see the Open Graph preview card. That's generated by:

- **Dynamic OG image:** [`src/app/opengraph-image.tsx`](../src/app/opengraph-image.tsx) — renders a 1200×630 PNG at build time with the Uniynode brand treatment (plexus background, name, tagline).
- **Meta tags:** [`src/app/layout.tsx`](../src/app/layout.tsx) sets `openGraph` and `twitter` metadata keyed off `siteConfig`.
- **Favicon + apple-touch-icon:** [`src/app/icon.svg`](../src/app/icon.svg), [`src/app/apple-icon.svg`](../src/app/apple-icon.svg) — "U" wordmark with magenta dot on dark gradient.

---

## 5. Google Search Console — step-by-step submission

Submit the sitemap so Google crawls the site in days, not weeks.

### 5a. Verify ownership

1. Go to https://search.google.com/search-console
2. Sign in with any Google account
3. Click **Add property** → choose **URL prefix**
4. Enter `https://taj-website.tajmoore74.workers.dev` → Continue
5. Google offers verification methods. **Pick HTML tag** (simplest for a static site):
   - Copy the full `<meta name="google-site-verification" content="…" />` tag
   - Paste the `content="…"` value into chat here and I'll add it to [`src/app/layout.tsx`](../src/app/layout.tsx) and push
   - Once CF redeploys (~2 min), click **Verify** in Search Console

### 5b. Submit the sitemap

Once verified:

1. In Search Console left nav → **Sitemaps**
2. In "Add a new sitemap" enter `sitemap.xml` (NOT the full URL — just the path)
3. Submit

Google should fetch within minutes. Within 1-3 days you'll see all 13 public pages indexed.

### 5c. Request specific pages (optional, speeds things up)

For the top 4 pages (`/`, `/services`, `/pricing`, `/about`):

1. In Search Console → **URL inspection** at top → paste the full URL
2. Click **Request indexing** → Google crawls that page within hours instead of days

---

## 6. What else matters for ranking

Beyond "Google knows about the pages," ranking depends on:

| Factor                       | Status                                                  | Action                                                                                    |
| ---------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Page speed (Core Web Vitals) | Served from CF edge, static assets, sub-1s LCP expected | Already optimal                                                                           |
| Mobile responsive            | Yes (Tailwind + viewport meta)                          | Already optimal                                                                           |
| HTTPS                        | Yes (CF Workers always HTTPS)                           | Already optimal                                                                           |
| Unique page titles           | Yes (every page sets `metadata.title`)                  | Already optimal                                                                           |
| Unique meta descriptions     | Yes (set in each page's metadata)                       | Already optimal                                                                           |
| Structured data (JSON-LD)    | NOT yet                                                 | Add Organization + WebSite schema in layout.tsx when it matters                           |
| Backlinks                    | NOT yet                                                 | Share on LinkedIn, Twitter, Reddit r/webdev; add to Taj's email signature                 |
| Custom domain                | NOT yet (`*.workers.dev` is CF subdomain)               | Buy `uniynode.com` or similar when revenue starts; ranks better than a `.workers.dev` URL |
| Content depth                | Thin on `/portfolio` (placeholder)                      | Fill in real case studies when first project ships                                        |

---

## 7. Alternative search engines

While you're at it, submit to:

- **Bing Webmaster Tools:** https://www.bing.com/webmasters — same sitemap, same process. Powers Bing + DuckDuckGo + ChatGPT web results.
- **Yandex Webmaster:** https://webmaster.yandex.com — Russian search, ~5% global share.
- **IndexNow protocol:** Bing + Yandex support this; a single POST tells both to recrawl. Can be added as a GitHub Action later.

Google Search Console is 95% of what matters. The others are nice-to-have.

---

## 8. Verifying it's working

A week after submitting:

- Google: search `site:taj-website.tajmoore74.workers.dev` — all public pages should appear
- Google Search Console → **Performance** tab shows impressions, clicks, average position for queries driving traffic
- Google Analytics (not currently wired — CF Web Analytics is wired instead) would show inbound organic visits

CF Web Analytics is already placed in [`src/components/CfAnalytics.tsx`](../src/components/CfAnalytics.tsx) — populate `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` in [`scripts/pre-build.mjs`](../scripts/pre-build.mjs) when the CF Web Analytics beacon token is generated in dash.cloudflare.com → Analytics & Logs → Web Analytics.
