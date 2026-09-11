# SpecCaster Outreach Queue — Phase 6 (OWNER_SEND)

Posting all messages requires your GitHub account
(`gonreyna85code`). Drafted, personalized, ready to paste.

Rule: **one comment per issue, problem-first, 50–120 words, low-friction CTA.**
No follow-up unless the reply adds a question.

---

## QUEUE STATUS

| Tracking | Prospect | Issue | Frame | Status |
|----------|----------|-------|-------|--------|
| OS-001 | Hermes | #431 | A (drift) | OWNER_SEND |
| OS-002 | Directus | #27700 | B (CI) | OWNER_SEND |
| OS-003 | api-drift-ci | repo README | B (CI) | OWNER_SEND |
| OS-004 | jest-openapi | repo README | A (drift) | OWNER_SEND |
| OS-005 | openai-node | repo CONTRIBUTING/testing | A (drift) | OWNER_SEND |
| OS-006 | ClickHouse clickhousectl | #224 | — | DO_NOT_CONTACT |

---

## OS-001 — Hermes (#431) — FRAME A (drift)

**Target:** https://github.com/HomericIntelligence/Hermes/issues/431
**Why this person:** Issue literally says "Add CI step to detect openapi.json drift" (closed, label `state:plan-go`, follow-up from #320). Their committed `openapi.json` is exported via `just export-openapi`; they asked for a CI diff job that "blocks merge on mismatch."
**Fit:** They built a spec-vs-export diff. SpecCaster does spec→tests→live-behavior, catching the case their diff can't: spec and local export both being stale relative to the running app.
**Expected outcome:** Reply (PROBLEM_CONFIRMED or INTERESTED) → `npx speccaster demo` trial.
**Caution:** Python project — CI must have Node available for the generated `node:test` suite. Be honest about that.

Subject (comment): **Re: add CI step to detect openapi.json drift**

> Re: the drift check in this issue (and follow-up from #320). The `diff openapi.json /tmp/openapi-ci.json` job catches a stale committed spec, but it can't detect when the spec *and* the running API diverge — both can be "up to date" yet disagree at runtime.
>
> I worked on that exact second failure mode. SpecCaster generates a plain `node:test` contract suite from your exported `openapi.json`, runs it against the API in CI, and `speccaster drift` fails the build when the committed suite falls out of sync with the spec.
>
> If useful: `npx speccaster demo` (zero-config, ~30s). Happy to run a repro on Hermes' spec.

---

## OS-002 — Directus (#27700) — FRAME B (CI)

**Target:** https://github.com/directus/directus/issues/27700
**Why:** Open 37.9k-star TypeScript project with a *cataloged* spec drift problem: gaps between `@directus/specs` and `@directus/api`, after prior audits (#20972, #26539, #25179, #27316). Maintainer actively chunking the fixes.
**Fit:** After they document paths, SpecCaster enforces spec↔API stability so the gaps don't reopen. Limitation: SpecCaster does NOT discover undocumented endpoints — their controller audit is the real work there. Say so explicitly.
**Expected outcome:** Reply (PROBLEM_CONFIRMED / WANTS_DEMO) → demo → possible internal trial. Even a "not right now" is useful signal.
**Caution:** Huge project, busy maintainers. Comment only on #27700 (the drift-tracking issue), not random PRs.

Subject (comment): **Re: fix(specs): track OpenAPI spec drift for undocumented endpoints and missing methods**

> This catalog (following the #27316 audit) makes the gap list real, but I notice the recurring pattern: the same categories of drift show up again in #20972, #26539, #25179. Closing them once isn't the hard part — keeping them closed is.
>
> SpecCaster is a zero-config CLI that takes the published spec and generates a plain `node:test` contract suite, then CI runs `speccaster drift` so any spec↔test desync fails the build. Once a path is documented, it can't silently drift back out. Caveat: it won't find undocumented endpoints — that genuinely needs the controller-vs-paths audit this issue is doing.
>
> If worth 30 seconds: `npx speccaster demo`. Happy to show a repro against a documented Directus route.

---

## OS-003 — EENMachine/api-drift-ci — FRAME B (CI)

**Target:** https://github.com/EENMachine/api-drift-ci (file an issue / discussion; README "spec↔spec diff via oasdiff")
**Why:** Same category, cousin problem: they diff spec-vs-spec on PRs (oasdiff, sticky comment, fail-on-breaking). The spec-vs-live-behavior layer is unaddressed. Small repo (0★) — a genuine complement offer, not an attack.
**Fit:** Their gate + SpecCaster's behavior gate = two-layer contract floor. Natural pairing; good chance of a technical reply.
**Expected outcome:** Collaborator/hyper-engaged technical reply → trial → possible GitHub Action interop.

Subject (comment): **Complementary layer: spec-vs-behavior contract testing**

> Your composite action (oasdiff on PR base vs head, sticky comment, fail-on-breaking) closes the spec-vs-spec gap cleanly — that's a real gap. The layer I don't see covered anywhere in the SpecCaster ecosystem is spec-vs-behavior: a spec can be internally consistent yet not match what the server actually returns.
>
> I built SpecCaster for that: it generates a plain `node:test` suite from the OpenAPI file and runs it against the live API, with a `speccaster drift` gate that fails CI when the committed suite is stale vs the spec. It complements oasdiff rather than replacing it.
>
> If useful: `npx speccaster demo`. I'd genuinely value your view on whether the two layers belong together.

---

## OS-004 — openapi-library/OpenAPIValidators (jest-openapi) — FRAME A (drift)

**Target:** https://github.com/openapi-library/OpenAPIValidators/tree/master/packages/jest-openapi (raise a discussion)
**Why:** 38,679 weekly downloads proves developer demand for "server behavior must match the OpenAPI spec." Their maintainer(s) know the pain firsthand; their user base is the ICP.
**Fit:** They provide matchers (`toSatisfyApiSpec()`), Jest-only, hand-written tests. SpecCaster is the generation layer: no matcher setup per endpoint, node:test-native, CI drift gate. Complementary framing, not competitive.
**Expected outcome:** Technical reply (PROBLEM_CONFIRMED or WANTS_FEATURE) → possible cross-mention/writeup.

Subject (discussion): **Generation layer for the matcher pattern you built**

> jest-openapi's own "Problem" section is the pitch: *if your server's behaviour doesn't match your API documentation, the sooner you know the better.* The 38k weekly installs say developers agree — but hand-writing `toSatisfyApiSpec()` per endpoint is real boilerplate, and the matcher approach can't tell you when your response objects were never added to a test at all.
>
> SpecCaster is the generation complement: `npx speccaster init --spec openapi.yaml` writes a plain `node:test` contract suite covering every path, and CI runs `speccaster drift` to fail the build when the suite goes stale vs the spec. No Jest dependency, no per-test matcher wiring.
>
> If useful: `npx speccaster demo`. Curious whether you'd consider a generator↔matcher interop a good direction.

---

## OS-005 — openai/openai-node — FRAME A (drift)

**Target:** https://github.com/openai/openai-node (Contributing/discussion; do NOT comment on unrelated PRs)
**Why:** They already generate API-resource tests from the OpenAPI spec and run them in CI against a mock server (Steady). They've already adopted the "spec is the source of truth for tests" philosophy at scale.
**Fit:** Complementary: they test spec-stability offline vs a mock; SpecCaster tests live behavior. Not a pitch "my tool replaces yours."
**Expected outcome:** Unlikely to convert (Stainless-generated SDK, mock-based tests are deliberate), but a substantive reply would validate positioning. If no reply in 2 weeks, no follow-up.

Subject (discussion): **Spec-driven test generation vs live-API contract layer**

> The setup you landed on — generate API-resource tests from the OpenAPI spec, regenerate in CI, serve them against a mock — is the pattern I'd argue most OpenAPI projects should copy. Your CONTRIBUTING.md describing `./scripts/test` + the Steady mock server is a great reference.
>
> One gap that pattern leaves open is live behavior: a mock never drifts, but the production API can. I built SpecCaster to be the live-API complement — same generated-from-spec idea, but produces a plain `node:test` suite run against `SPECCASTER_BASE_URL` with a CI drift gate.
>
> Totally understand if mock-based is the deliberate choice here. If the angle is interesting at all: `npx speccaster demo`.

---

## OS-006 — ClickHouse clickhousectl (#224) — DO_NOT_CONTACT

**Decision:** Do not message. Documented in `memory` as a model/limitation note, not outreach.

**Why not:**
- Rust project; drift is SDK-vs-live-spec (generated `client.rs`/`models.rs` missing operations), not runtime API behavior testing.
- Their fix path is codegen/runtime tooling in Rust — SpecCaster (JS CLI, node:test output) is not compatible with that workflow.
- Nothing to add without inventing claims. Respect the maintainer's time.
- The `openapi-drift` label is still strong market validation → capture as VOC.

---

## SEND ORDER (if you can do only 1–2 today)

1. **OS-001 Hermes** — highest-signal, most personalizable (their issue is literally SpecCaster's thesis).
2. **OS-002 Directus** — biggest project reach if they engage.

## TRACKING
After each send, update `marketing/prospects.jsonl`
`message_status: SENT` for the corresponding tracking ID,
and record in `memory/experiments.md` EXP-001-D14.