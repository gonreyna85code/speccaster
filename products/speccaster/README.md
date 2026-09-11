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

Status: **MVP (v0.2.2)** — hardening release. Cross-platform, works offline, zero recurring cost.

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
# writes speccaster/contract.test.js + speccaster/validate.js + .github/workflows/speccaster.yml

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
- uses: gonreyna85code/speccaster/products/speccaster@main
  with:
    spec: openapi.yaml
    base-url: http://localhost:8080/v1
```

> The generated workflow and action pin a concrete speccaster version (`@0.2.2`)
> for reproducible drift checks. To receive updates, bump the pinned version.

## Examples

Worked, runnable sample in
[`examples/petstore-ci`](https://github.com/gonreyna85code/speccaster/tree/main/products/speccaster/examples/petstore-ci):
a complete API + spec + committed generated suite + CI workflow.

## Commands

| Command | Effect |
|---|---|
| `speccaster init` | Generate `speccaster/contract.test.js` + `validate.js` + workflow (existing files kept unless `--force`). |
| `speccaster test` | Generate to a temp file and run it (`node --test`). |
| `speccaster drift` | Exit non-zero when the committed suite is out of sync with the spec. For CI. |
| `speccaster demo` | Ephemeral API + generated suite + drift demo. No files kept. |

Options: `--spec <file>`, `--out <file>`, `--base-url <url>`, `--force`.
Env override: `SPECCASTER_BASE_URL` (replaces the whole base URL, including any
mount path, e.g. `https://api.example.com/v1`).

## What it generates

`npx speccaster init` writes two committed, owned files:

- `speccaster/contract.test.js` — the `node:test` suite. For every path+method it
  emits a test that:
  - calls the operation with sample payloads derived from your schemas (path and
    required-query params, request bodies; `readOnly` fields are never sent),
  - asserts the status matches one of the declared responses (exact codes,
    `2XX`-style ranges and `default` are honored),
  - asserts the `content-type` matches the declared media type (charset params
    and `application/*+json` handled),
  - validates the success response body against the declared schema — object /
    array / string / number / integer / boolean / enum / required / nested /
    nullable / composition (`oneOf`/`anyOf`/`allOf`). Failures are readable:
    `response.body.email — expected string, received number`.
- `speccaster/validate.js` — the self-contained, dependency-free runtime the
  suite uses. It only changes when you upgrade SpecCaster.

Request bodies: `application/json`, `application/*+json`,
`application/x-www-form-urlencoded` and `text/plain` are generated.
`multipart/form-data` and other media types produce an explicit skipped test +
warning (add the body yourself — never an invalid request).

Other behavior:

- `$ref` is resolved consistently — local pointers (`#/components/...`,
  `#/$defs/...`, `~0`/`~1`), and local files (`./schemas/user.yaml#/...`) with
  path-safety. Unresolvable refs fail with a clear message, never silently.
- Server URLs with `{variables}` use their declared defaults. Override with
  `--base-url` or `SPECCASTER_BASE_URL`.
- OpenAPI 3.0.x and 3.1.x are both supported (3.1 `type` arrays, `const`,
  `$defs`, `prefixItems`, boolean schemas).

Add your own deeper assertions in the same file — they're your tests.

> Generated tests send **real traffic**. Mutating operations
> (POST/PUT/PATCH/DELETE) modify whatever you point them at — run them against a
> **test environment** via `SPECCASTER_BASE_URL`.

## Development

```bash
npm install
npm test          # 34 unit/compat tests + end-to-end (fixture API, generate, run, drift)
node scripts/fuzz.js         # deterministic schema-variant fuzz (offline)
node scripts/robustness.js   # real-world corpus sweep (needs network)
```

## Pricing

- **Free** for open-source and personal use (MIT license). Not crippled —
  the free tool is the product.
- **Pro** (private repos, teams, priority support): planned once the free
  tier has real users. No revenue is claimed before any is confirmed.

## Learn more

- [Why OpenAPI specs drift — and how CI catches it](./site/blog/why-openapi-specs-drift.html)
- [How to catch breaking API changes automatically in CI](./site/blog/catch-breaking-api-changes-in-ci.html)

## Development

```bash
npm install
npm test          # end-to-end: spins a fixture API, generates, runs, drift-checks
```

## License

MIT — see [LICENSE](LICENSE).