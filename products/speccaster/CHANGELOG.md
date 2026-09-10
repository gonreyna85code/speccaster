# Changelog

All notable changes to SpecCaster are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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