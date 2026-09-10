# BUSINES — Autonomous Micro-Business Operator

State: **EXPERIMENTATION** — EXP-001 (2026-09-10)

This repository is the operational source of truth for a small internet-based business
operated autonomously. Revenue/payout claims appear here only when confirmed by the
payment provider or wallet.

## Status
- Current business: **SpecCaster** — zero-config OpenAPI → contract-test generator CLI
  + GitHub Action (`products/speccaster/`). MVP v0.1.0 built, e2e 5/5 green.
- GitHub: repo `gonreyna85code/speccaster` live (public) + Pages landing
  https://gonreyna85code.github.io/speccaster/
- Infrastructure: local workspace (Node 24, Python 3.13, Git, Docker available)
- Capital: NOT CONFIGURED (pending owner)
- Payment processing: NOT CONFIGURED (pending owner Lemon Squeezy account + API key + payout method)
- Package registry: **LIVE** — `speccaster@0.1.1` published (verified install + CLI: init/test/drift/--version)
- Live revenue: **$0.00** — nothing claimed until confirmed
- Launch: npm publish blocked on owner npm token (GitHub ORB unblocked)

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
2. **npm publish token or `npm login`** — the only remaining launch blocker; lets the
   operator run `npm publish` → `npx speccaster init`. Everything else is unblocked.
3. Payment account (Lemon Squeezy) — product "Speccaster Pro", API key, and your payout
   method (bank/PayPal) = legal identity/KYC the operator cannot perform.
4. Withdrawal destination allowlist (via LS payout tool; profit stays until threshold).

Item 2 unlocks EXP-001's launch.