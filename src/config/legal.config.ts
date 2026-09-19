/**
 * Legal configuration — governing law, ToS/Privacy versions, jurisdiction.
 *
 * Bumping `tosVersion` or `privacyVersion` forces every signed-in user to
 * re-accept on next visit (checked by `lib/tos-gate.ts` against the
 * `tos_acceptances` table).
 *
 * See `docs/summit-mvp-architecture.md` § 8.
 */

export const legalConfig = {
  /** ISO date of the current ToS revision. Bump to force re-acceptance. */
  tosVersion: "2026-09-19",

  /** ISO date of the current Privacy Policy revision. Bump to force re-acceptance. */
  privacyVersion: "2026-09-19",

  /** Governing law — locked to California per Taj's ask (2026-09-19). */
  governingLaw: {
    state: "California",
    country: "United States",
    /**
     * Statutory anchors we cite in the ToS/Privacy pages. These are public
     * statutes; the source doc `docs/legal/terms-of-service.md` links to
     * each one on leginfo.legislature.ca.gov.
     */
    statutes: [
      "Cal. Civ. Code §§ 1798.100–1798.199.100 (CCPA/CPRA)",
      "Cal. Bus. & Prof. Code §§ 22575–22579 (CalOPPA)",
      "Cal. Civ. Code § 1633.1 et seq. (UETA)",
    ] as const,
    /** Venue for disputes not resolved through arbitration. */
    venue: "State and federal courts located in California",
    /** Whether arbitration + class-action waiver are enforced. */
    arbitration: true,
    classActionWaiver: true,
  },

  /** Minimum age to hold an account. Cal. + COPPA + Google account rules. */
  minimumAgeYears: 18,
} as const;

export type LegalConfig = typeof legalConfig;
