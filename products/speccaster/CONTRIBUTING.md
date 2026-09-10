# Contributing

Thanks for considering a contribution to SpecCaster.

## Setup

```bash
cd products/speccaster
npm install
npm test   # runs the e2e suite (spins up a local fixture server)
```

## What's in scope for the MVP

- `src/cli.js` — argv parsing, `init` / `test` / `drift` commands
- `src/generate.js` — OpenAPI → generated `node:test` suite
- `src/sample.js` — schema → sample payload values
- `action.yml` — composite GitHub Action that wraps the CLI

## Before opening a PR

1. Run `npm test` — the full e2e suite must stay green.
2. Keep generated output plain and owned: users edit these files by hand, so
   keep the generated shape stable and predictable.
3. No new runtime dependencies unless strongly justified; the package must stay
   zero-service and offline-friendly.
4. Update `README.md`, `CHANGELOG.md`, and `docs/MONETIZATION.md` if behavior changes.

## House rules

- One feature per PR, small diffs.
- CLI output goes through the same `print`/`log` helpers used today.
- Never add telemetry, analytics, or outbound network calls to the CLI.