# SpecCaster — monetization plan

Status: free MIT MVP; **no revenue yet, none claimed**. The experiment is
`EXP-001`: adoption first, monetization after a measurable user base.

## Pricing proposal (to calibrate when the experiment has data)
- **Free** — open-source (MIT), personal + open-source use. The distribution engine.
- **Pro license** — private-repo and team use:
  - Suggested: **$19 one-time per private repo** or **$29/repo** with a year of
    priority support. Offline license check via bundled license key file.
  - Rationale: micro-SaaS data shows dev tools have the highest margins (76.8%)
    and one-time pricing beats subscriptions for small utilities (ShipFast,
    Carrd, tearoff.app patterns, 2026).

## Market evidence (2026-09-10)
- **Stoplight platform**: Basic $44/mo, Startup $113/mo, Pro Team $362/mo
  (per team, per month; first users free). Spectral itself is free open-source.
  → teams already pay far more than our price when API governance hurts enough.
- **Schemathesis**: free MIT open-source CLI (+ commercial cloud). Not a direct
  substitute (property-based fuzzing vs. owned `node:test` suite), but proves
  spec-to-test tooling is a saturated, well-funded space.
- **Dredd**: assessed as "largely abandoned" (2026 community write-ups) →
  deterministic spec-game contract testing has no maintained modern incumbent
  in the JS/`node:test` space. This is our positioning gap.
- **Pricing takeaway**: $19 one-time is deliberately below Stoplight's $44/mo
  per user and below a friction-inducing $49. It tests willingness-to-pay with
  minimal buyer risk. If 0 conversions at $19 within 4–6 weeks of a live
  checkout, iterate price (raise/lower), or pivot the Pro framing (repos → orgs
  → support). All pricing stays provisional until real purchases validate it.

## Mechanics (Lemon Squeezy, user-owned store)
- Merchant of Record: sales tax/VAT handled; payouts to owner's bank/PayPal.
- `ls: 5% + $0.50` avoids low price points (< $10) that the flat fee eats.
- License delivery: LS license-key product; CLI reads a `speccaster.lic` file.

## Required owner steps (to go live)
1. Create Lemon Squeezy account (`your-store.lemonsqueezy.com`).
2. Create product "SpecCaster Pro — one repo license", price $19 once.
3. Generate an **API key** (settings > API) → provide as `LEMON_SQUEEZY_API_KEY`.
4. Connect payout method (bank / PayPal) inside LS — that is the withdrawal
   destination and legal identity (KYC) step the operator cannot do.
5. Confirm `config/business.yaml` fiat block (`enabled: true, provider: lemon-squeezy`).

Until steps 1–5 are done, the Pro checkout button stays a placeholder.