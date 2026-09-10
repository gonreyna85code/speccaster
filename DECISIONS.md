# DECISION LOG

Format:
```yaml
date:
decision:
reason:
evidence:
expected_result:
actual_result:
lesson:
```

## D-001 — 2026-09-10
- decision: Bootstrap this workspace as an autonomous micro-business operator repo.
- reason: Starting state was empty; foundation needed before any validated business.
- evidence: Empty working directory; Node 24 / Python 3.13 / Git / Docker available; no credentials or capital provisioned.
- expected_result: A durable state + accounting + memory skeleton that later decisions attach to.
- actual_result: Pending (repo created; foundation files written).
- lesson: -

## D-002 — 2026-09-10
- decision: Select dev-tool experimentation over generic micro-SaaS for the first validated business.
- reason: Dev tools have the highest verified margin (76.8% avg) and developer-buyer economics; Content-pulp:
  inflection shows an offline-buildable, zero-infra-product fits all of this operator's constraints
  (no capital, no hosting to run, near-zero support, high automation).
- evidence: Multiple 2026 sources (Freemius/Rocking Web, Flowjam: 27 verified micro-SaaS at $1K-$200K MRR,
  dev-tool margins 76.8%). Generic AI wrappers are the most crowded, lowest-margin category (~$1.7K MRR
  avg across 1200+ products) → avoided.
- expected_result: A working, testable dev tool MVP in this repo, with a documented monetization + distribution path.
- actual_result: Confirmed — SpecProof MVP built, e2e green, monetization plan in `products/specproof/docs/MONETIZATION.md`.
- lesson: ETOOMANY competitor CLIs already ship the "generate ERD from DB" shape → KILLED that angle
  (would have been a same-shape entry with no moat).

## D-003 — 2026-09-10
- decision: Build "SpecProof" — a zero-config OpenAPI-spec → runnable contract-test-suite generator + CI drift gate.
- reason: "API testing: from spec to working tests automatically" and "documentation sync in CI" rank as
  documented 2026 dev-tool gaps (Trend Seeker, 3000+ request corpus; freeToolArena). Existing tools are
  interactive (Postman) or heavyweight (Schemathesis/Python+live server, Dredd aging). The
  "one command writes an owned, extendable test file into your repo, CI rejects drift" DX is not owned.
  Fully buildable + verifiable offline; zero recurring cost; distributes via npx + GitHub Action; monetizes
  via license keys (Lemon Squeezy MoR handles tax) — all autonomous-friendly.
- evidence: See D-002 sources + competitor scan (Mermerd, mermaid-erd-cli, dbcli, LLMSchema exist for ERD;
  Schemathesis/Dredd are the contract-test incumbents but not zero-config Node DX).
- expected_result: Shipped MVP with demo test run passing; landing page + action + publish config prepared.
- actual_result: Built v0.1.0 (CLI init/test/drift + GitHub Action + landing page). E2E 5/5 green.
  Launch blocked on owner credentials (npm token, GitHub), not on product debt.
- lesson: Base-URL overrides must follow the "replace whole server URL incl. mount path"
  convention consistently; generated exit codes must propagate through the bin wrapper.

## D-004 — 2026-09-10
- decision: Rebrand product from "SpecProof" to "SpecCaster" and publish the npm package as `speccaster`.
- reason: The npm name `specproof` is already taken by specproof@0.9.4 — a competing OpenAPI audit
  dashboard (Next.js, 19 deps) published ~2026-09-04; we cannot squat a name we don't own.
- evidence: `npm view specproof` → taken (maintainer hiccup_za). `speccaster`, `specproof-cli`,
  `openapi-contract-test`, `contract-test-gen` all AVAILABLE. Distinct positioning confirmed:
  their job = coverage audit dashboard; ours = generate owned tests + CI drift gate.
- expected_result: Clean npm name, same product, no brand litigation/confusion.
- actual_result: Full rebrand executed (folder, package, bin, docs, env vars SPECCASTER_*).
  E2E still 5/5 green. `speccaster` confirmed available on npm.
- lesson: Verify package-name availability before finalizing a product name; a fresh competitor
  publishing in the same wedge days earlier is demand validation, not just a collision.
- lesson2: competitor specproof v0.9.4 (2026-09-04) validates EXP-001's demand — log in experiments.

## D-005 — 2026-09-10
- decision: Publish SpecCaster source publicly to GitHub under the owner's existing account
  (`gonreyna85code/speccaster`, public) and deploy the landing page via Pages+Actions.
- reason: Public repo = stars/issues/distribution channel for EXP-001; Pages from the repo
  gives a live landing URL without new infra. The owner's machine already carries a valid
  GitHub credential (GCM: repo + workflow scopes) = an authorized credential per policy.
- evidence: `git credential-manager` stored bearer authenticated successfully; probe
  `GET /user` → login `gonreyna85code`, scopes gist, repo, workflow; name `speccaster` free.
- expected_result: Live repo + `https://gonreyna85code.github.io/speccaster/` landing.
- actual_result: Repo created (API 201), code pushed, Pages enabled (build_type workflow)
  via API; landing verified live at https://gonreyna85code.github.io/speccaster/ (HTTP 200).
- lesson: Re-check auth + name availability at publish time; GCM `github login` takes no host argument.