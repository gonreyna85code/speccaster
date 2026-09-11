# SpecCaster — Positioning

## One-liner

Contract tests from your OpenAPI spec — generated, owned, drift-protected, run in CI.

## Elevator Pitch

Your OpenAPI spec drifts. Your tests drift. Nobody notices until production breaks. SpecCaster makes the spec the contract: it generates a `node:test` suite into your repo, and your CI fails the build whenever the committed suite falls out of sync with the spec.

## Positioning Statement

For backend developers building APIs with OpenAPI specs, SpecCaster is a zero-config CLI that generates committed contract test suites and a CI drift gate, unlike spec-diffing tools that only compare spec versions, because SpecCaster catches the gap between spec and reality.

## Key Messages

1. **Problem**: OpenAPI specs drift from actual API behavior silently
2. **Solution**: Generated contract tests + CI drift gate
3. **Proof**: Tested against GitHub REST API (815 paths), Spotify, Petstore
4. **How it works**: `npx speccaster init` → committed tests → CI fails on drift
5. **CTA**: `npx speccaster demo`

## Comparison Positioning

| vs. | SpecCaster advantage |
|-----|---------------------|
| Schemathesis | Committed baseline + drift gate (Schemathesis fuzzes) |
| oasdiff | Catches spec-vs-reality drift (oasdiff compares spec versions) |
| Pact | OpenAPI-native, zero-config (Pact needs consumer/provider setup) |
| Spectral | Generates tests, not just lints (Spectral validates spec shape) |
| Optic | Still maintained (Optic archived Jan 2026) |
| Hand-written tests | Auto-generated, always in sync, auditable in review |

## Trust Signals

- MIT licensed, free, not crippled
- Zero runtime dependencies
- Zero network calls at runtime
- Exercised against real-world specs (GitHub, Spotify, Petstore)
- Honest about scope: not a fuzzing replacement, not a linter, not a ditter
