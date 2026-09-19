/**
 * Site-wide configuration — the single source of truth for every
 * user-facing string, name, URL, and legal-entity fact.
 *
 * To rename the site: change `name`, `shortName`, `url`, and `email.*`
 * below. That is the entire renaming procedure. If a component elsewhere
 * hardcodes a name, the ESLint rule at `eslint.config.mjs` will flag it.
 *
 * See `docs/summit-mvp-architecture.md` § 4 for the design rationale.
 */

export const siteConfig = {
  /** Full display name — used in <title>, hero, footer, meta. */
  name: "Summit MVP",

  /** Short/nav display name — used in the top nav bar. */
  shortName: "Summit",

  /** One-line tagline. Empty string hides it. */
  tagline: "",

  /** Meta description for <head>. */
  description: "TODO: description",

  /** Canonical public URL (no trailing slash). Updated when the real domain lands. */
  url: "https://summit-mvp.pages.dev",

  /** Contact email addresses per purpose. */
  email: {
    support: "support@example.com",
    legal: "legal@example.com",
    privacy: "privacy@example.com",
  },

  /** Legal entity — used in ToS + Privacy Policy rendering. */
  legalEntity: {
    /** Full legal business name as registered. */
    name: "TODO: legal entity name",
    /** US state of registration. */
    state: "California",
    /** Country. */
    country: "United States",
  },

  /** Social profiles — empty string hides the link in nav/footer. */
  socials: {
    twitter: "",
    linkedin: "",
    github: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
