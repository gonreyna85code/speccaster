# EXPERIMENTS

## EXP-001 — SpecCaster launch — 2026-09-10
```yaml
experiment:
  hypothesis: Developers will adopt a zero-config OpenAPI→contract-test generator
    that owns a committed, extendable test file and fails CI on spec/test drift.
  action: Build MVP (CLI + GitHub Action), publish package, launch on
    HN/Reddit via Show HN + build-in-public, land landing page.
  expected_result: 50+ GitHub stars, 10+ unique users running `npx speccaster init`.
  budget: 0
  maximum_loss: 0
  success_metric: >=10 unique installs AND >=20 stars within 45 days; any paid
    preorder (license) is a bonus signal.
  failure_metric: <10 unique installs and <20 stars by deadline.
  start_date: 2026-09-10
  deadline: 2026-10-25
  result: MVP core done + e2e 5/5 green (2026-09-10). Rebranded SpecProof→SpecCaster
    (npm name taken, D-004). GitHub repo gonreyna85code/speccaster live + Pages landing
    deployed and verified HTTP 200 (2026-09-10). Publish blocked: npm account has 2FA;
    classic token cannot publish (E403) -> needs OTP or granular token with 2FA bypass.
    Activation measured via public signals (no runtime telemetry; npm downloads + stars
    collector in scripts/check-metrics.js). Market signal: specproof@0.9.4 (audit
    dashboard, 19 deps incl. Next.js) published ~2026-09-04 — validates the wedge.
    Costs spent: $0.00.
  decision: pending   # SCALE | ITERATE | PAUSE | KILL
```

## Distribution experiments (EXP-001)

Each gets a deadline + success/failure metric; run autonomously, recorded here.

### EXP-001-D1 — README+landing polish — 2026-09-10
- hypothesis: Crisply positioned README/landing (pain-first, no fluff) raises install→activation conversion.
- channel: npm package page + GitHub repo + Pages landing.
- action: Rewrote README (positioning, badges, real action path, examples link); verified landing copy; added runnable `examples/petstore-ci`.
- expected_users: n/a (bases out); expected_activation: reads it and tries init.
- cost: 0. deadline: 2026-10-25.
- success_metric: >0 activated users / issues referencing the example. failure_metric: none by 2026-10-25.

### EXP-001-D2 — worked example in repo (pending publish)
- hypothesis: A copy-paste example (API+spec+suite+CI) lowers the time-to-first-success.
- channel: GitHub README → examples/petstore-ci.
- action: Committed runnable example, verified locally (npm test 3/3, drift gate green).
- expected_users: pass-through of installs. cost: 0.
- success_metric: issues/PRs using or referencing the example. failure_metric: none by deadline.

### EXP-001-D3 — Show HN / r/node launch (pending npm publish)
- hypothesis: A launch post on Show HN + r/node drives the first installs/stars to EXP-001 target.
- channel: news.ycombinator.com, reddit.com/r/node (one post each, no spam).
- action: Pre-written post skeleton lives in repo; execute the day the package publishes.
- expected_users: 10 unique installs, 20 stars. cost: 0.
- success_metric: EXP-001 targets. failure_metric: <5 installs and <10 stars within 7 days of posting.
```
Launch block: npm publish token (owner). GitHub no longer blocks.

## EXP-000 — ERD generator (killed before launch)
- hypothesis: Auto-updating DB schema ERD in CI is an open dev-tool gap.
- evidence against: Mermerd (614★) and mermaid-erd-cli (feature-parity, 2026) already
  ship this exact shape; same-shape entry has no moat.
- decision: KILL before spending build time.

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