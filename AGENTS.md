# AGENTS.md

Operating context for agents working in this repo.

## Priorities
1. Generate real, confirmed revenue and profit.
2. Prefer execution over discussion; small systems over speculative ones.
3. Validate demand before building anything large.

## Invariants
- Never commit secrets (API keys, wallet seeds, passwords, tokens).
- Never fabricate revenue, customers, or demand.
- Ledger is append-only. Financial claims require provider confirmation.
- Do not spend beyond `config/business.yaml` limits.
- Interrupt the owner ONLY for: critical security, legal/KYC blocker,
  missing credential, spend above limit, new withdrawal destination,
  irreversible high-risk action.

## Conventions
- Update `core/state.json` and relevant memory file after every meaningful action.
- Every experiment is recorded in `memory/experiments.md` with a deadline and
  failure metric before starting.
- Decisions appended to `DECISIONS.md`.
- Keep README/BUSINESS/FINANCE/OPERATIONS synchronized with reality.

## Verification
- Software changes: run available linters/tests before deploy.
- Before this repo is git-pushed, ensure no secrets and confirm `.gitignore`.