# CHECKOUT ARCHITECTURE (Lemon Squeezy — pending credentials)

Design for the paid tier. Nothing here is live; no revenue is claimed.
Go-live requires the owner's LS account (see `products/speccaster/docs/MONETIZATION.md`).

## Separation of concerns

| Concern | Owner | Notes |
|---|---|---|
| Product | SpecCaster CLI | free; license only gates Pro features |
| Pricing | LS product "SpecCaster Pro" | one-time $19 per repo license |
| Checkout | LS hosted checkout | hosted page/cart — no custom PCI surface |
| Payment confirmation | LS **webhook** (signed, HMAC) | never trust a browser redirect |
| Access control | license key = `speccaster.lic` file | CLI reads it locally; offline |
| Accounting | append-only ledger | `finance/ledger.jsonl`, provider TXN ids |
| Payout | owner dashboard | LS has no public payout API; operator only flags crossings |

## Webhook flow (future)

1. LS sends `order_created` (created|paid) to a draft webhook receiver.
2. Receiver verifies HMAC `X-Signature` using `LEMON_SQUEEZY_SIGNING_SECRET`.
3. **Idempotency**: ledger key = `LS:<order_id>`; skip if already recorded.
4. Record ledger entry (SALE, gross/fees/net per LS payload; provider = lemon-squeezy,
   external_id = order id).
5. Issue license key (LS generated) → delivered to customer mailbox by LS.
   CLI's `license activate` is future work; MVP keeps the license key file.
6. Reconciliation: daily pull LS transactions vs ledger via `get_transactions`.

Every entry requires provider confirmation. A browser redirect alone never
grants access (there is no middleware access to gate — offline product).

## Accounting fields per payment (§16)

```
gross_amount, fees, net_amount, tax_reserve, business_amount, status
```

- `tax_reserve`: LS is Merchant of Record and remits tax; we still keep a
  configurable reserve until verification (default 0 for non-remitting providers).
- Entries: SALE (positive), REFUND (negative), FEE (platform), OPERATING_EXPENSE,
  TAX_RESERVE, OWNER_PAYOUT, REINVESTMENT.

## Profit & payout (§24)

```
available_profit = cash − operating_reserve − tax_reserve − pending_liabilities
payout allowed only when available_profit > profit_withdrawal_threshold
```

Payout targets come from `config/business.yaml` `withdrawal_defaults` —
never modified autonomously. Fiat handled in the owner's LS dashboard; crypto via
the payout adapters (draft) when configured.