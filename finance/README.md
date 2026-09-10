# FINANCE SUBSYSTEM

Append-only ledger: `finance/ledger.jsonl`.
Never modify or delete historical entries. Corrections are new entries with type `correction`.

## Accounting model
```
REVENUE
- PAYMENT_FEES
- INFRASTRUCTURE_COST
- MARKETING_COST
- REFUNDS
- TAX_RESERVE
- OTHER_OPERATIONAL_COST
= NET_PROFIT
```

## Accounts
- `available_cash` — spendable business cash
- `operating_budget` — ring-fenced for known near-term ops
- `tax_reserve` — withheld for mandatory obligations; NEVER withdrawn as profit
- `revenue_received` — confirmed incoming (never booked until provider-confirmed)
- `profit_available` — available for withdrawal

## Ledger entry types
`init`, `capital`, `revenue`, `payment_fee`, `expense`, `refund`,
`tax_reserve`, `payout`, `transfer`, `correction`, `snapshot`.

Ledger entries must carry: `ts`, `id`, `type`, `account`, `amount`, `note`.