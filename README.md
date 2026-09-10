# BUSINES — Autonomous Micro-Business Operator

State: **EXPERIMENTATION** — EXP-001 (2026-09-10)

This repository is the operational source of truth for a small internet-based business
operated autonomously. Revenue/payout claims appear here only when confirmed by the
payment provider or wallet.

## Status
- Current business: **SpecProof** — zero-config OpenAPI → contract-test generator CLI
  + GitHub Action (`products/specproof/`). MVP v0.1.0 built, e2e 5/5 green.
- Infrastructure: local workspace (Node 24, Python 3.13, Git, Docker available)
- Capital: NOT CONFIGURED (pending owner)
- Payment processing: NOT CONFIGURED (pending owner Lemon Squeezy account + API key + payout method)
- Deployment/registry: NOT CONFIGURED (pending owner GitHub + npm credentials)
- Live revenue: **$0.00** — nothing claimed until confirmed
- Launch: BLOCKED on owner credentials (see Owner checklist) — product work is complete

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
1. Confirm `config/business.yaml` capital parameters (still zero → no autonomous spend).
2. npm publish token — lets the operator publish SpecProof (`npm publish`).
3. GitHub account/repo — stars/issues, GitHub Pages for `site/index.html`, action listing.
4. Payment account (Lemon Squeezy) — product "SpecProof Pro", API key, and your payout
   method (bank/PayPal) = legal identity/KYC the operator cannot perform.
5. Withdrawal destination allowlist (via LS payout tool; profit stays until threshold).

Items 2–3 unlock EXP-001's launch. Until they exist, no revenue is possible;
each is a credential the owner must provision.