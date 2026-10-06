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
  name: "Uniynode",

  /** Short/nav display name — used in the top nav bar. */
  shortName: "Uniynode",

  /** One-line tagline. Empty string hides it. */
  tagline: "A network of connected minds.",

  /** Meta description for <head>. */
  description: "Uniynode — a network of connected minds.",

  /** Canonical public URL (no trailing slash). Updated when the real domain lands. */
  url: "https://taj-website.taj-website.workers.dev",

  /** Contact email addresses per purpose. All route to Taj's inbox until
   *  separate addresses + mailboxes are set up on a real domain. */
  email: {
    support: "tajmoore74@yahoo.com",
    legal: "tajmoore74@yahoo.com",
    privacy: "tajmoore74@yahoo.com",
    /** Where inquiry buttons on the services page send mailto links. */
    inquiry: "tajmoore74@yahoo.com",
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
