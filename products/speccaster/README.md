# SpecCaster

Zero-config contract tests from your OpenAPI spec.

One command writes an owned, extendable test suite into your repo. Your CI
regenerates it, rejects spec/test drift, and runs it against your live API —
so the tests and the spec can never silently fall out of sync.

Status: **MVP (v0.1.0)**. Cross-platform, works offline, zero recurring cost.

## Why

OpenAPI specs rot. Contract tests drift. Both get fixed fastest when the CI
tells you — on every PR — that the spec you shipped no longer matches either
the code or the tests. SpecCaster makes the generated tests the single source
they must agree on.

- **You own the tests.** They're plain `node:test` files committed to your repo
  — extend them, don't fight a framework.
- **Drift = red build.** `speccaster drift` fails when the committed suite is
  out of date with the spec.
- **Zero config.** Point it at your spec. Nothing to install permanently
  (`npx`), no server, no credentials, no SaaS dashboard.

## Quickstart

```bash
npx speccaster init --spec openapi.yaml
# writes speccaster/contract.test.js + .github/workflows/speccaster.yml

# point the tests at your running API and execute
SPECCASTER_BASE_URL=http://localhost:8080/v1 node --test speccaster/contract.test.js
```

Your sub-git workflow then blocks anything that drifts:

```yaml
# .github/workflows/speccaster.yml (auto-generated)
- name: Regenerate + drift gate
  run: npx speccaster@latest drift --spec openapi.yaml --out speccaster/contract.test.js
- name: Run contract tests
  env:
    SPECCASTER_BASE_URL: ${{ secrets.SPECCASTER_BASE_URL }}
  run: node --test speccaster/contract.test.js
```

Or as a reusable action:

```yaml
- uses: your-org/speccaster@v1
  with:
    spec: openapi.yaml
    base-url: http://localhost:8080/v1
```

## Commands

| Command | Effect |
|---|---|
| `speccaster init` | Generate the suite + workflow. Fails if the file exists unless `--force`. |
| `speccaster test` | Generate to a temp file and run it (`node --test`). |
| `speccaster drift` | Exit non-zero when the committed suite is out of sync with the spec. For CI. |

Options: `--spec <file>`, `--out <file>`, `--base-url <url>`, `--force`.
Env override: `SPECCASTER_BASE_URL` (replaces the whole base URL, including any
mount path, e.g. `https://api.example.com/v1`).

## What it generates

For every path+method it emits a `node:test` case that:

- calls the operation with sample payloads derived from your schemas
  (path/required-query params and request bodies),
- asserts the status is one the spec declares as success,
- asserts the `content-type` matches the declared media type
  (`HEAD`/`OPTIONS`/error-only responses are tolerated).

Add your own deeper assertions in the same file — they're your tests.

## Pricing

- **Free** for open-source and personal use (MIT license).
- **Pro** (private repos, teams, priority support): planned once the free
  tier has real users. No revenue is claimed before any is confirmed.

## Development

```bash
npm install
npm test          # end-to-end: spins a fixture API, generates, runs, drift-checks
```

## License

MIT — see [LICENSE](LICENSE).