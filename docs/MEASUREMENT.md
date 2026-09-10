# MEASUREMENT

How SpecCaster is measured. The product runtime makes **zero network calls**
(a selling point and a privacy decision); measurement therefore comes from
public registries, the repo, and manual signals — not from telemetry.

## Metric hierarchy

1. Net profit
2. Paying customers
3. Activated users
4. Retention / recurring usage
5. Revenue
6. Installs (npm downloads)
7. Traffic (landing)
8. GitHub stars (distribution signal only)

## Activation definition

> A user successfully runs SpecCaster against a real OpenAPI document and gets
> a passing contract-test result — i.e. `speccaster init` + `speccaster test`
> (or the committed suite `node --test` passing against their API).

Because the CLI is offline-first, activation is not directly observable.
Measurable proxies, in order of strength:

- GitHub issues/PRs that reference real use (bugs, confusion, feature requests)
- installation spikes in npm download data correlated with distribution posts
- landing → docs → install conversion via the landing's outbound link clicks
- direct user feedback (feedback channel, see OPERATIONS)

## Funnel stages (as far as observable)

```
LANDING VISIT    → landing page requests (no trackers; spot-checks only)
  ↓ DOCS         → README / quickstart (npm views, README views)
  ↓ INSTALL      → npm downloads (api.npmjs.org, public)
  ↓ INIT         → not directly observable; proxy = issues about init
  ↓ FIRST TEST   → not directly observable; proxy = drift/test issues + e2e reports
  ↓ CI INTEGRATION → GitHub Action usage (star spikes, issues, Action runs reported)
  ↓ RECURRING USE → issue traffic, stars over time
  ↓ PAID         → Lemon Squeezy orders (once enabled)
```

## Telemetry decision

No runtime telemetry in v0.1.0:

- the package makes no network calls — common in security-minded teams and a
  differentiating claim;
- there is no server to ingest events (would need infra spend and GDPR/legal
  handling the product gains nothing from at this stage);
- install/base signals are already available from public npm stats (
  `https://api.npmjs.org/downloads/point/last-week/speccaster`).

Revisit only if activation-specific data becomes cheap, legal, and opted-in.

## Collector

`scripts/check-metrics.js` (repo root) fetches public, aggregate metrics and
appends to `memory/metrics.jsonl`:

```
node scripts/check-metrics.js
```

Fields: date, npm_downloads_last_week, npm_downloads_last_month, github_stars,
github_open_issues, landing_status (HTTP code).

No credentials are needed (public endpoints). GitHub unauthenticated rate limit
is 60 req/hr — plenty for a daily run.