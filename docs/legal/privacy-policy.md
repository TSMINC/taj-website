# Privacy Policy

**Version:** 2026-10-04
**Effective:** October 4, 2026

This Privacy Policy describes how {{COMPANY}} ("{{COMPANY_SHORT}}", "we", "us", "our") collects, uses, discloses, and protects personal information in connection with your use of {{SITE_URL}} and any associated services (collectively, the "Service").

If you are a California resident, this Policy also serves as our notice at collection under the California Consumer Privacy Act, as amended by the California Privacy Rights Act (together, "CCPA/CPRA").

---

## 1. Information We Collect

### 1.1 Information you provide

- **Account information:** When you sign up, we collect your email address. If you sign in with Google or Apple, we also receive the profile fields they return (typically name and avatar URL).
- **Communications:** If you contact us by email or through the Service, we store your message and the email address you sent it from.
- **Payment information:** If you purchase a paid feature, Stripe collects your payment-method details directly; we receive only a tokenized reference, the amount, status, and your billing country.

### 1.2 Information collected automatically

- **Technical data:** IP address (which we hash before storing — see § 5), user-agent string, approximate geographic region (country/state) derived from your IP, and timestamps of actions.
- **Usage data:** Pages visited, features used, and errors encountered, limited to what is necessary to operate and improve the Service.
- **Cookies and similar technologies:** We use a small number of first-party cookies for authentication (session tokens) and for security (CSRF protection, bot verification via Cloudflare Turnstile). We do **not** use advertising cookies or third-party analytics cookies.

### 1.3 Information from third parties

- **Identity providers (Google, Apple):** When you choose to sign in with them, they share the profile fields listed in § 1.1 with us. We do not receive your Google or Apple password.
- **Payment processor (Stripe):** For completed transactions, Stripe shares the token, amount, status, and limited billing data as listed in § 1.1.

## 2. How We Use Information

We use the information we collect to:

(a) create and maintain your account;
(b) provide, operate, and improve the Service;
(c) authenticate you and prevent fraud, abuse, and security incidents;
(d) communicate with you about your account or the Service (service announcements, security alerts, replies to inquiries) — we do **not** send marketing email without your explicit opt-in;
(e) process payments if you purchase a paid feature;
(f) comply with legal obligations and enforce our Terms.

## 3. Legal Bases (if you are in a region requiring one)

We rely on the following bases for processing: (a) contract performance (providing the Service you signed up for); (b) legitimate interests (security, fraud prevention, product improvement); (c) consent (where applicable); and (d) legal obligation.

## 4. How We Share Information

We share personal information only with the following categories of recipients and only as described:

- **Service providers acting on our behalf:**
  - **Supabase** — database and authentication (processor).
  - **Cloudflare** — hosting, edge delivery, DDoS and bot protection, Turnstile human verification (processor).
  - **Google / Apple** — identity verification during sign-in (processors).
  - **Stripe** — payment processing (processor, for the limited data in § 1.1).
- **Legal and safety:** We may disclose information when we believe in good faith it is necessary to comply with a legal obligation, respond to lawful requests from authorities, protect the rights, property, or safety of any person, or investigate violations of our Terms.
- **Business transfers:** If we are involved in a merger, acquisition, financing, or sale of assets, personal information may be transferred as part of that transaction, subject to the receiving party honoring this Policy.

**We do not sell personal information. We do not share personal information for cross-context behavioral advertising** (as those terms are defined under CCPA/CPRA).

## 5. Data Retention

- **Account data:** retained for as long as your account is active, plus up to ninety (90) days after deletion for backups to expire.
- **Payment records:** retained for seven (7) years after the transaction to meet U.S. tax and accounting obligations.
- **IP hash:** we store a salted SHA-256 hash of your IP address (not the raw IP) alongside security-relevant events (sign-ins, ToS acceptances, contact-form submissions). The hash is kept for up to **four (4) years**, matching California Code of Civil Procedure § 337 (statute of limitations on written contracts) so that we have evidence available for any contractual dispute within the limitation period.
- **Logs:** operational logs are retained for thirty (30) days.
- **Legal texts and acceptance records:** retained for the life of your account plus seven (7) years, so that we can prove which version of the Terms you accepted and when.

## 6. Security

We take reasonable technical and organizational measures to protect personal information, including:

- Encryption in transit (TLS 1.2+ for all connections).
- Encryption at rest for the database.
- Row-level security policies ensuring you can only access your own data.
- Rate limiting and bot verification on all public forms.
- Secret material (API keys, tokens, service-role credentials) stored only in dedicated secret stores, never in source code or logs.
- Regular security advisor scans of the database schema.

No security measure is perfect. If we become aware of a breach affecting your personal information, we will notify you and relevant authorities as required by applicable law (including California Civil Code § 1798.82).

## 7. Your Rights

### 7.1 All Users

- **Access:** request a copy of the personal information we hold about you.
- **Correct:** ask us to correct inaccurate information.
- **Delete:** ask us to delete your account and associated personal information.
- **Portability:** receive a copy of your personal information in a structured, machine-readable format.
- **Withdraw consent:** where we rely on consent, withdraw it at any time (future processing only).

To exercise any of these rights, email {{EMAIL_PRIVACY}} from the email address associated with your account, or use the request form at {{SITE_URL}}/legal/rights-request. We will respond within forty-five (45) days.

### 7.2 California Residents (CCPA/CPRA)

In addition to the rights above, you have the right to:

- **Know** what categories of personal information we have collected about you, the purposes, and the categories of third parties with whom we have shared it.
- **Delete** personal information we have collected from you (subject to certain exceptions).
- **Correct** inaccurate personal information.
- **Opt out of sale/share:** we do not sell or share personal information for cross-context behavioral advertising, so there is nothing to opt out of; the "Do Not Sell or Share My Personal Information" link at {{SITE_URL}}/legal/do-not-sell confirms this.
- **Limit use of sensitive personal information:** we do not collect sensitive personal information (as defined by CPRA) for any purpose other than performing the Service.
- **Non-discrimination:** we will not deny service, charge different prices, or provide a different quality of service because you exercised your rights.

You may authorize an agent to make a request on your behalf; we may require verification of the agent's authority.

### 7.3 Do Not Track

Our Service **does not respond to "Do Not Track" (DNT) browser signals**, because there is no industry-wide standard for interpreting them. This Section is provided to comply with California Business and Professions Code § 22575(b)(5) (CalOPPA), which requires us to disclose how we treat DNT signals regardless of our choice.

## 8. Children

The Service is not directed to children under eighteen (18), and we do not knowingly collect personal information from anyone under 18. If you believe a minor has provided us personal information, please contact {{EMAIL_PRIVACY}} and we will delete it.

## 9. International Users

Our servers are located in the United States. If you access the Service from outside the United States, your information will be transferred to and processed in the United States, which may have different data-protection laws than your jurisdiction. By using the Service you consent to this transfer.

## 10. Links to Other Websites

The Service may contain links to third-party websites. We are not responsible for the privacy practices of those websites and encourage you to review their policies before providing any personal information.

## 11. Changes to This Policy

We may update this Policy from time to time. If a change is material, we will notify you by email or in-Service notice. The current version is always posted at {{SITE_URL}}/legal/privacy with its effective date. Continued use of the Service after a change takes effect means you accept the updated Policy.

## 12. Contact

Questions about this Policy or requests related to your personal information:

{{COMPANY}}
Email: {{EMAIL_PRIVACY}}
Legal: {{EMAIL_LEGAL}}
State of registration: California, USA
