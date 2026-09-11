# SpecCaster — Objection Map

## 1. "I can build this myself"

- **Evidence**: Common among experienced backend developers
- **Response**: You can. SpecCaster saves you the maintenance burden. The drift gate logic (regenerate + diff + exit code) is the hard part to maintain. The generated tests are plain `node:test` — you own them.
- **Proof**: 815-path GitHub REST spec generates clean. Petstore generates clean. Spotify generates clean. The sample generation handles allOf/oneOf/anyOf, nested refs, formats.
- **Product fix**: Make init/drift so simple that self-building is clearly more work.

## 2. "I already use Schemathesis"

- **Evidence**: Schemathesis has 3.5k+ stars, used by Spotify/Red Hat
- **Response**: SpecCaster complements Schemathesis. Schemathesis fuzzes for bugs; SpecCaster generates a committed baseline + drift gate. They solve different problems.
- **Proof**: Blog post "What it does not do" section explicitly positions alongside Schemathesis.
- **Product fix**: Could add Schemathesis integration guidance.

## 3. "node:test only — I use Jest/Vitest/Mocha"

- **Evidence**: Node.js ecosystem has multiple test runners
- **Response**: The generated file is a plain text starting point. You can adapt it to any runner. The drift gate (regenerate + diff) works regardless of test runner.
- **Proof**: Generated tests use only `node:test` and `node:assert/strict` — minimal, portable syntax.
- **Product fix**: Could add `--runner jest` flag in future.

## 4. "Too early / MVP"

- **Evidence**: v0.2.1, 0 downloads, 0 stars
- **Response**: The free tier is the product. No revenue is claimed before it is real. The tool works — try `npx speccaster demo`.
- **Proof**: E2E tests pass. 4-spec robustness sweep passes. Time-to-first-success: 7.7s.
- **Product fix**: Keep shipping. Focus on activation.

## 5. "Another dependency in my project"

- **Evidence**: Developer fatigue with tool proliferation
- **Response**: Zero runtime dependencies. One `npx` call. No permanent install. No server. No SaaS dashboard.
- **Proof**: `package.json` has one dependency: `yaml ^2.5.0`. No network calls at runtime.
- **Product fix**: Keep it dependency-free.

## 6. "I don't trust CI tools / security concerns"

- **Evidence**: Security-conscious developers wary of CI marketplace tools
- **Response**: Zero network calls at runtime. MIT licensed. Source code is the product. SECURITY.md documents scope.
- **Proof**: SECURITY.md explicitly states "no network calls, no telemetry." CONTRIBUTING.md enforces "no new deps, no telemetry."
- **Product fix**: Keep the security posture strong. Never add telemetry.

## 7. "Setup complexity"

- **Evidence**: Some tools require complex configuration
- **Response**: `npx speccaster init --spec openapi.yaml`. One command. Generates test file + CI workflow. Done.
- **Proof**: Time-to-first-success: 7.7 seconds.
- **Product fix**: Keep it zero-config.

## 8. "What if the spec is wrong?"

- **Evidence**: Spec-first vs code-first debate
- **Response**: If the spec is wrong, the drift gate catches it — that's the point. The spec is the contract. If the spec doesn't match reality, you want to know.
- **Proof**: Blog post explains the three drift patterns.
- **Product fix**: Could add `--source code` mode in future.

## 9. "I need deep fuzzing, not happy-path tests"

- **Evidence**: Schemathesis users, security-focused teams
- **Response**: SpecCaster is not a fuzzing tool. It generates the cheapest, always-on fresh-contract floor. Use it alongside Schemathesis, not instead of it.
- **Proof**: Blog post explicitly states "not a substitute for deep property-based fuzzing."
- **Product fix**: Position clearly as complementary.
