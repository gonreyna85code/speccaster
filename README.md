# BUSINES — Autonomous Micro-Business Operator

State: **BOOTSTRAPPING** (2026-09-10)

This repository is the operational source of truth for a small internet-based business
operated autonomously. Revenue/payout claims appear here only when confirmed by the
payment provider or wallet.

## Status
- Infrastructure: local workspace (Node 24, Python 3.13, Git, Docker available)
- Capital: NOT CONFIGURED (pending owner)
- Payment processing: NOT CONFIGURED (pending owner account + API key)
- Deployment targets: NOT CONFIGURED (pending owner account)
- Live revenue: **$0.00** — nothing claimed until confirmed
- Current business: none selected yet (research in progress)

## Files
- `BUSINESS.md` — current business, strategy, plan
- `FINANCE.md` — financial posture, rules
- `OPERATIONS.md` — systems, automations, daily loop
- `DECISIONS.md` — decision log
- `config/business.yaml` — capital limits, payout rules (owner fills in)
- `core/state.json` — live operational state
- `finance/ledger.jsonl` — append-only transaction ledger
- `memory/` — experiments, customers, incidents

## Owner checklist (blocking items, in order)
1. Confirm `config/business.yaml` capital parameters.
2. Payment account (Lemon Squeezy / Stripe) — handles KYC + payouts to you.
3. Deployment account (GitHub + free host) for the product.
4. Withdrawal destination (bank/paypal via payment platform, or allowlisted wallet).

Nothing above is required to validate demand for a zero-cost MVP.