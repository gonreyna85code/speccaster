# SpecCaster

Contract tests from your OpenAPI spec — **generated, owned, drift-protected, run in CI**.

One command writes a plain `node:test` suite into your repo. Your CI regenerates it,
rejects spec↔test drift, and runs it against your live API. When spec and tests fall
out of sync, the build goes red — before production does.

<p>
  <img alt="npm" src="https://img.shields.io/npm/v/speccaster">
  <img alt="npm downloads" src="https://img.shields.io/npm/dm/speccaster">
  <img alt="GitHub stars" src="https://img.shields.io/github/stars/gonreyna85code/speccaster">
</p>

Status: **MVP (v0.2.0)**. Cross-platform, works offline, zero recurring cost.

## Try it in seconds

```bash
npx speccaster demo
```

It spins up an ephemeral API, generates the contract suite, runs it green, then
shows how a spec edit changes the suite (the CI drift gate). Nothing is written
to your repo — pure proof of value, then you tackle your real spec.

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
npx speccaster demo                       # prove it works in seconds
npx speccaster init --spec openapi.yaml   # then generate your own suite
# writes speccaster/contract.test.js + .github/workflows/speccaster.yml

# point the tests at your running API and execute
SPECCASTER_BASE_URL=http://localhost:8080/v1 node --test speccaster/contract.test.js
```

Your CI workflow then blocks anything that drifts:

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
- uses: gonreyna85code/speccaster/products/speccaster@v1
  with:
    spec: openapi.yaml
    base-url: http://localhost:8080/v1
```

## Examples

Worked, runnable sample in
[`examples/petstore-ci`](https://github.com/gonreyna85code/speccaster/tree/main/products/speccaster/examples/petstore-ci):
a complete API + spec + committed generated suite + CI workflow.

## Commands

| Command | Effect |
|---|---|
| `speccaster init` | Generate the suite + workflow. Fails if the file exists unless `--force`. |
| `speccaster test` | Generate to a temp file and run it (`node --test`). |
| `speccaster drift` | Exit non-zero when the committed suite is out of sync with the spec. For CI. |
| `speccaster demo` | Ephemeral API + generated suite + drift demo. No files kept. |

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

- **Free** for open-source and personal use (MIT license). Not crippled —
  the free tool is the product.
- **Pro** (private repos, teams, priority support): planned once the free
  tier has real users. No revenue is claimed before any is confirmed.

## Development

```bash
npm install
npm test          # end-to-end: spins a fixture API, generates, runs, drift-checks
```

## License

MIT — see [LICENSE](LICENSE).