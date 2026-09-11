# SpecCaster — Product Marketing Context

Canonical source of truth for all marketing skills.

## Product

SpecCaster is a zero-config CLI tool that generates `node:test` contract test suites from OpenAPI 3.0/3.1 specifications, with a CI drift gate that fails builds when the committed test suite falls out of sync with the spec.

## ICP

- Backend / API developers building REST APIs with OpenAPI specs
- Platform engineers managing API contracts across services
- DevOps / CI engineers responsible for build pipelines
- QA engineers maintaining API test suites
- API-first companies with multiple API consumers

## Problem

OpenAPI specs drift from actual API behavior silently. Tests get out of sync. Nobody notices until production breaks. The manual process of keeping spec, tests, and code in sync is boring, error-prone, and gets skipped under pressure.

## Existing Alternatives

| Category | Tools | Gap |
|----------|-------|-----|
| Spec diffing | oasdiff, open-api-diff, apidiff, SchemGuard | Compare two spec versions; don't detect spec-vs-reality drift |
| Fuzz testing | Schemathesis | Property-based testing; doesn't generate committed test suites or drift gates |
| Runtime validation | openapi-sentinel, Beeceptor | Runtime middleware; not CI-native, no committed artifact |
| SDK drift | SDKDrift | SDK surface drift; not API contract drift |
| LLM-based | DriftSpec, ContractsSentry | AI-powered; heavier, requires LLM keys |
| Legacy | Optic (archived Jan 2026) | No longer maintained |

## Pain

- "Your API spec rotates. Your tests drift. Nobody notices until production does."
- Teams skip keeping hand-written tests in sync under delivery pressure
- Breaking changes slip through green CI because tests were never updated
- New endpoints are added without corresponding test coverage
- Existing tools either diff spec versions (not spec-vs-reality) or require complex setup

## Desired Outcome

A single command that generates committed, auditable test files from the spec, plus a CI gate that fails the build the moment spec and tests disagree. Zero config. No server. No SaaS. Just `npx`.

## Positioning

"The spec is the contract. Generated tests are the proof. CI is the referee."

SpecCaster is NOT:
- A fuzzing tool (Schemathesis does that)
- A spec linter (Spectral does that)
- A spec ditter (oasdiff does that)
- A runtime validator (openapi-sentinel does that)

SpecCaster IS:
- The cheapest, always-on fresh-contract floor
- A drift gate that makes spec-vs-test disagreement visible in CI
- A generator of owned, extendable `node:test` files committed to your repo

## Differentiators

1. **Generated + committed**: Tests live in your repo as plain `node:test` files — auditable in code review
2. **Drift = red build**: `speccaster drift` exits non-zero when committed suite is out of sync
3. **Zero config**: `npx speccaster init`. No server, no credentials, no SaaS dashboard
4. **Zero runtime dependencies**: Makes no network calls at runtime (privacy/security)
5. **Complements, doesn't replace**: Works alongside Schemathesis, Spectral, oasdiff — not instead of them

## Proof

- Exercised against GitHub REST API spec (815 paths) — generates clean
- Exercised against Spotify OpenAPI spec (67 paths) — generates clean
- Exercised against Petstore 3.0.4 — generates clean
- Time-to-first-success: 7.7 seconds (fresh user activation audit)
- MIT licensed, free, not crippled

## Pricing Hypothesis

- Free tier: MIT, open-source, personal and open-source use. Not crippled.
- Pro tier: $19 one-time per private repo. Private repos, teams, priority support.
- Revenue model: one-time purchase, not SaaS subscription.

## Objections

| Objection | Response |
|-----------|----------|
| "I can build this myself" | You can. SpecCaster saves you the maintenance. The drift gate is the hard part. |
| "I already use Schemathesis" | SpecCaster complements Schemathesis. Schemathesis fuzzes; SpecCaster generates committed baseline + drift gate. |
| "Too early / MVP" | The free tier is the product. No revenue is claimed before it is real. |
| "Another dependency" | Zero runtime dependencies. One `npx` call. No permanent install needed. |
| "node:test only" | Correct — it generates `node:test`. If you need a different runner, the generated file is a plain text starting point. |

## Language

Use customer vocabulary, not marketing fluff:
- "drift" not "divergence"
- "contract tests" not "compliance suites"
- "CI gate" not "pipeline enforcement"
- "generated" not "auto-generated"
- "committed" not "version-controlled"
- "red build" not "pipeline failure"
