# PAYOUT LAYER

Modular payout architecture. Adapters connect to the owner's own accounts via
official APIs. **Nothing here is provisioned yet** (`fiat.enabled: false`).
No payout can occur until the owner provides the credentials below and enables
`fiat.enabled: true` in `config/business.yaml`.

## Abstract provider
```text
FiatPayoutProvider
  get_balance() -> { available, currency }
  get_transactions() -> [Transaction]
  create_payout(amount, destination) -> PayoutId
  get_payout_status(payoutId) -> Status
```
Implementations must be owner-owned accounts only, never hard-coded to a vendor.

## Provider: Lemon Squeezy (planned)
Merchant of Record — handles global sales tax/VAT, checkout, license keys, and
payouts to the owner's bank/PayPal. Free platform (5% + $0.50 per sale).

Env vars (never commit; put in a secret manager): `LEMON_SQUEEZY_API_KEY`,
`LEMON_SQUEEZY_SIGNING_SECRET`, `LEMON_SQUEEZY_STORE_ID`.

Reference adapter: `adapters/lemon-squeezy.example.js`.

## Rules
- Payouts only to preconfigured, allowlisted destinations.
- Never withdraw `tax_reserve` or `operating_reserve`.
- Transfer realized profit only when
  `available_profit >= profit_withdrawal_threshold` and configured limits hold.
- Every payout is an append-only ledger entry (`type: payout`).