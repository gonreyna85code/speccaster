# FINANCE

## Posture (as of 2026-09-10)
- Capital: **unconfigured** (desired: owner fills `config/business.yaml`)
- Autonomous spending: **disabled** until capital configured
- Revenue: **$0.00** (none confirmed)
- Profit available for withdrawal: **$0.00**

## Rules
- Revenue booked only on provider confirmation.
- Any received revenue: allocate payment fees → infrastructure → tax reserve
  (conservative % while jurisdiction uncertainty unresolved) → operating budget → profit.
- Never withdraw reserved funds.
- Withdrawals only to configured, allowlisted destinations.
- Every transaction logged in `finance/ledger.jsonl`.