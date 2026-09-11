# Changelog

All notable changes to SpecCaster are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.2] - 2026-09-11

### Added
- **Response body validation.** Generated suites now validate `2xx` JSON/text
  response bodies against the declared schema with a self-contained,
  dependency-free validator written next to the suite (`speccaster/validate.js`).
  Failures are structured: operation, property path, expected vs. received.
- **$ref hardening.** Consistent local `$ref` resolution everywhere (parameters,
  request bodies, responses, path items, nested schemas), including JSON Pointer
  escaping (`~0`/`~1`, percent-decoding), OpenAPI 3.1 `$defs`, circular-chain
  detection (no infinite recursion), and local *external* file refs
  (`./schemas/user.yaml#/components/schemas/User`) with path-safety and clear
  errors instead of silent fallback.
- **Parameter serialization.** `form` (explode on/off), `pipeDelimited`,
  `spaceDelimited`, `deepObject` for query params; `simple` for path params.
- **Server variables.** `servers[].url` templates are substituted using
  declared defaults. `SPECCASTER_BASE_URL` / `--base-url` still win.
- **Status semantics.** `2XX`/`4XX`/`5XX` wildcards and `default` response keys
  are accepted by the generated matcher (exact codes still required otherwise).
- **Request body media types.** `application/json`, `application/*+json`,
  `application/x-www-form-urlencoded`, `text/plain` are generated; unsupported
  media (e.g. `multipart/form-data`) produce an explicit skipped test + warning
  instead of an invalid request.
- **Sampler correctness.** `readOnly` never sent in request bodies; `writeOnly`
  never required by response validation; `int64` stays numeric in JSON bodies;
  min/max exclusive bounds, `minLength`/`maxLength`, `minItems`, `enum`/`const`,
  nullable / 3.1 `type` arrays and `prefixItems` handled.
- **Determinism regression tests.** `generate(spec) === generate(spec)`
  byte-identical; lightweight mutation fuzzer (`node scripts/fuzz.js`).
- Unit/compat suite (`npm test` now runs 34 unit tests + end-to-end).

### Changed
- Generated workflow and the composite action pin `speccaster@0.2.2`
  (reproducible drift); `init` no longer overwrites an existing workflow unless
  you pass `--force`.
- Generated paths are embedded as JSON string literals (hostile spec paths
  cannot inject JS into the generated suite).
- A header comment reminds that mutating operations send real traffic — point
  `SPECCASTER_BASE_URL` at a test environment.

## [0.2.1] - 2026-09-11

### Changed
- npm metadata: search-intent keywords (openapi3, test-generator, node-test,
  github-action, drift, api-testing) and a keyword-carrying description to
  improve npm discovery. No code behavior change.

## [0.2.0] - 2026-09-10

### Added
- `speccaster demo` — instant proof of value with zero setup: spins up an
  ephemeral API from an embedded OpenAPI spec, generates the contract suite,
  runs it green, then shows how a spec edit changes the suite (the CI drift
  gate). No files left behind. Ideal first run for new users.

## [0.1.1] - 2026-09-10

### Added
- `--version` / `-V` flag.
- Traceable, versioned header in generated files.

## [0.1.0] - 2026-09-10

### Added
- `speccaster init` — writes an owned, extendable `node:test` contract suite
  into `speccaster/contract.test.js` from a local OpenAPI YAML/JSON spec.
  Refuses to overwrite unless `--force` is passed.
- `speccaster test` — runs the generated suite against a live server
  (base URL from `SPECCASTER_BASE_URL` or `--base-url`, replacing the whole
  server URL incl. mount path).
- `speccaster drift` — exits non-zero when the committed suite is out of sync
  with the spec (the CI freshness gate).
- Composite GitHub Action `action.yml` (inputs: `spec`, `out`, `base-url`,
  `run-tests`) for use as `gonreyna85code/speccaster/products/speccaster@v1`.
- Landing page (tracker-free) and MIT license.

### Notes
- Produced by an autonomous operator. Renamed from "SpecProof" because that npm
  name was taken by a competing project.