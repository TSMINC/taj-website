# Payments — Stripe plan

**Status:** schema reserved (tables exist, zero rows), wiring NOT started. This doc is the plan Taj asked for ("think it through, more robust later").

## Why Stripe

- **PCI compliance offloaded.** Card data never touches our servers. Stripe hosts the input field (via their Payment Element iframe); we only hold tokenized references.
- **California-based company.** Legal + support locality matches our governing-law stance.
- **Enterprise-grade infra.** 99.999% uptime, mature webhook delivery, idempotency keys built in.
- **Supabase integration pattern is well-trodden** — standard webhook → service_role insert flow.
- **Pricing is linear.** 2.9% + 30¢/txn, no setup fee, no monthly minimum. Scales with revenue, not with us.

**Rejected alternatives:**

- **Lemon Squeezy** (Merchant of Record — handles sales tax globally): tempting, but costs 5% + 50¢ vs Stripe's 2.9% + 30¢; the tax win doesn't offset at low volume.
- **Paddle:** similar MoR trade-off.
- **PayPal:** terrible API, high dispute rate.
- **Direct ACH / wire:** zero fit for consumer product.

## Architecture

```
Browser                     Stripe                    Our Worker                  Supabase
  │                            │                           │                           │
  │ Payment Element iframe     │                           │                           │
  │────────────────────────────▶                           │                           │
  │  (card details stay here)  │                           │                           │
  │                            │                           │                           │
  │ Submit → client confirms   │                           │                           │
  │────────────────────────────▶                           │                           │
  │                            │                           │                           │
  │  { payment_intent: ... }   │                           │                           │
  │◀────────────────────────────                           │                           │
  │                            │                           │                           │
  │                            │   webhook (signed)        │                           │
  │                            │──────────────────────────▶│  verify sig, parse event  │
  │                            │                           │─ INSERT/UPDATE ─────────▶│
  │                            │                           │                           │
```

**Card data path:** Browser → Stripe. Never ours.
**State sync path:** Stripe → our Worker (via webhook) → Supabase.
**UI reads:** Browser → Supabase (anon key, RLS'd to own rows).

## Schema (already in place — see `supabase/migrations/20261004024531_*`)

- `public.stripe_customers` — one per auth.user. Primary key = our UUID, holds the `cus_...` string.
- `public.subscriptions` — recurring billing state. Writes on `customer.subscription.*` webhooks.
- `public.payments` — one-time charges + subscription invoice records. Writes on `payment_intent.succeeded` / `invoice.paid` webhooks.

All three have RLS: user reads own, service_role writes everything, nobody updates or deletes directly.

## Worker to build (`workers/stripe-webhook/`) — not yet implemented

```
POST /api/stripe/webhook
  - Verify Stripe-Signature header (HMAC-SHA256 of body with webhook secret).
  - Reject if signature invalid.
  - Idempotency: check if event.id already in `payments` or `subscriptions` (via Stripe's event.id column we'd add).
  - Switch on event.type:
    - "customer.created"          → upsert stripe_customers
    - "customer.subscription.*"   → upsert subscriptions
    - "payment_intent.succeeded"  → insert payments
    - "invoice.paid"              → insert payments + update subscription period
  - Return 200 within 5s or Stripe retries (we must be fast).
```

Everything behind this is service_role Supabase writes. Browser never touches these tables directly.

## Security controls

| Control                        | Mechanism                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Card data never on our servers | Stripe Payment Element handles input + tokenization.                                        |
| Webhook authenticity           | Signature verification with `stripe-webhook-secret`.                                        |
| Replay prevention              | Stripe signs with timestamp + body; reject if timestamp > 5 min old.                        |
| Idempotency                    | Store processed `event.id` per webhook; dedupe on insert conflict.                          |
| Subscription state tampering   | RLS: `subscriptions.user_id` matches `auth.uid()` for read; no write policy for users.      |
| Price manipulation             | Checkout session created server-side with hard-coded `price_id` → user can't change amount. |
| Insider threat (DB operator)   | `audit_log` captures every INSERT via trigger (optional — add before launch).               |

## Launch phases

1. **Phase 1 — foundation (NOW):** schema reserved. No code. Users see no payment UI.
2. **Phase 2 — one product:** add first `price_id` in Stripe dashboard. Build Worker webhook. Build checkout button on marketing page.
3. **Phase 3 — subscriptions:** add recurring product. Build billing portal link via Stripe Customer Portal (zero code — hosted page).
4. **Phase 4 — self-serve plan changes:** switch plans, cancel, resume all via Customer Portal.
5. **Phase 5 — tax:** Stripe Tax ($0.50/txn) OR move to Lemon Squeezy if international revenue warrants.
6. **Phase 6 — enterprise invoicing:** manual invoice flow via Stripe Invoicing for high-ticket B2B.

## When to pay Taj's attention

- **Pre-launch:** this doc + attorney review of the Stripe-provided ToS clauses (refunds, chargebacks, subscription auto-renewal disclosure — CA has specific auto-renewal law, Cal. Bus. & Prof. Code § 17602).
- **Pre-first-charge:** fire a test $1 charge end-to-end in Stripe test mode, verify webhook lands + DB updates + user sees receipt.
- **Pre-production-flip:** rotate test keys to live keys, update Pages env var `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, update Worker secret `STRIPE_SECRET_KEY`, update webhook endpoint signing secret.

## Compliance

- **PCI-DSS SAQ A** — the lightest tier, because we never touch cards. Just a self-attestation form annually.
- **CA auto-renewal law:** required disclosures (price, renewal frequency, cancel method) must appear on the signup page in a specific format. Covered in `docs/legal/pre-launch-gate.md` when Phase 3 lands.
- **Chargebacks:** Stripe handles the dispute process; we provide evidence (login logs, usage records). Our `audit_log` is the evidence source.

## What's NOT in this plan (yet)

- Crypto / wallet payments
- International currencies beyond USD
- Enterprise ACH / wire for B2B
- Referral / affiliate payouts
- Tax collection + remittance

Each is a conscious "later" — add when a user actually asks, not before.
