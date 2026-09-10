# EXPERIMENTS

## EXP-001 — SpecProof launch — 2026-09-10
```yaml
experiment:
  hypothesis: Developers will adopt a zero-config OpenAPI→contract-test generator
    that owns a committed, extendable test file and fails CI on spec/test drift.
  action: Build SpecProof MVP (CLI + GitHub Action), publish package, launch on
    HN/Reddit via Show HN + build-in-public, land landing page.
  expected_result: 50+ GitHub stars, 10+ unique users running `npx specproof init`.
  budget: 0
  maximum_loss: 0
  success_metric: >=10 unique installs AND >=20 stars within 45 days; any paid
    preorder (license) is a bonus signal.
  failure_metric: <10 unique installs and <20 stars by deadline.
  start_date: 2026-09-10
  deadline: 2026-10-25
  result: pending
  decision: pending   # SCALE | ITERATE | PAUSE | KILL
```
Launch is BLOCKED on: owner GitHub account + npm publish token (credentials).

Template:
```yaml
experiment:
  hypothesis:
  action:
  expected_result:
  budget:
  maximum_loss:
  success_metric:
  failure_metric:
  start_date:
  deadline:
  result:
  decision:   # SCALE | ITERATE | PAUSE | KILL
```