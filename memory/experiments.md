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
    verified HTTP 200. PUBLISHED 2026-09-10T23:28:50Z speccaster@0.1.0 (shasum
    bc0f9f3086426e2887bd080f62f550ee48bbc097) after clean-registry install+init+drift+test
    verification (3/3 green vs live API). Distribution executing. Activation measured via
    public signals (script check-metrics). Market signal: specproof@0.9.4 audit dashboard
    ~2026-09-04 validates wedge. Costs spent: $0.00.
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
```

### EXP-001-D4 — `demo` activation command (0.2.0, publish blocked on npm token)
- hypothesis: An instant proof-of-value (`npx speccaster demo`: ephemeral API +
  generated suite + drift demo, nothing written) converts visitors into activated users.
- channel: npm quickstart + landing + README; new users' first command.
- action: Built src/demo.js (embedded spec + in-process API); runs generated tests
  via async child so the in-process server can serve them (spawnSync deadlocks on
  same-thread server). Covered by e2e (demo + --version cases). e2e 7/7 green.
- cost: 0. deadline: none (part of activation loop).
- success_metric: demo path converges to `init` (activation), fewer dead-end installs.
  failure_metric: demo exits non-zero for users.
- status: READY at 0.2.0, NOT published — npm token with 2FA bypass needed (INC-001).
- PUBLISHED 2026-09-11: speccaster@0.2.0 live (latest). Verified from clean registry
  install (init 0 / drift 0 / test 3/3 green). GitHub Release v0.2.0 + tag push CI green
  (e2e 7/7 on Action runner). Discussions welcome thread live (/discussions/1). Resume result.

### EXP-001-D5 — SEO/content: drift essay + site structure (2026-09-11)
- hypothesis: A genuine keyword-matched explainer page + sitemap/robots on GitHub Pages
  brings long-tail organic visits ("openapi spec drift", "contract tests in CI") that convert.
- channel: gonreyna85code.github.io/speccaster/blog/why-openapi-specs-drift.html (+ blog index,
  sitemap.xml, robots.txt; landing header/footer links; canonical/OG tags).
- action: Wrote the essay (3 drift patterns, generated-suite fix, demo CTA); reusable as Show HN text.
  cost: 0. deadline: 2026-10-25 (aligns EXP-001).
- success_metric: >0 organic landing hits; blog page 200; indexed. failure_metric: 404 or no index by deadline.

### EXP-001-D6 — real-world spec robustness sweep (2026-09-11)
- hypothesis: The generator must not crash on real-world OpenAPI docs, or activation dies.
- action: Ran `speccaster init` against GitHub REST spec (815 paths, OpenAPI 3.0.3 → 16,013-line
  suite, exit 0) and Swagger Petstore 3.0.4 (exit 0). Both generated cleanly. Deeper edge fuzzing
  deferred until metrics justify it.
- cost: 0. success_metric: 0 crashes on sightsweep specs. failure_metric: crash on any real spec → fix in-hours.

## Pricing evidence (2026-09-10)
- Stoplight platform: Basic $44/mo → Pro Team $362/mo (per team, monthly). Spectral is free OSS.
- Schemathesis: free MIT OSS + commercial cloud; property-based (not the same wedge).
- Dredd: widely judged "largely abandoned" → deterministic no-longer-maintained?
  Gap: maintained spec-game contract testing in the JS/node:test space.
- Keep $19 one-time Pro (validated by 0-conversion iteration + first-payer psych), documented
  in products/speccaster/docs/MONETIZATION.md.

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