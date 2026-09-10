# LAUNCH — distribution execution playbook

Mode: honest, single post per channel, no spam, no manipulation. All copy below
is problem-first technical content; the product appears where it naturally fits.

## Show HN (day of publish)

Title:
> Show HN: SpecCaster — contract tests from OpenAPI that fail your build on drift

Text (first ~3 lines do the work):
> You've got an OpenAPI spec, a repo full of API code, and a test suite. All three
> slowly disagree about what the API actually does. SpecCaster makes one of those
> the contract: `npx speccaster init` writes a plain `node:test` suite into your
> repo, and CI regenerates it + fails whenever the committed suite and the spec
> drift apart — then runs it against your live API.
>
> No server, no dashboard, no credentials, zero network calls at runtime (that's
> also the privacy story). Generated tests are real files you own and can extend.
> MIT. `examples/petstore-ci` in the repo is a fully runnable API+spec+suite+CI.
>
> Problems I know remain: error-only responses are tolerated, sample values are
> schema-derived (not property coverage), and there's no request-sequence testing —
> happy path coverage first, which is measured, not claimed.

## r/node (same day)

Title: `OpenAPI spec == contract tests. I generated them from the spec and made CI fail the build on drift`

Body: same problem statement, tuned to Node (node:test runner, npm, GitHub Action),
links to repo + npm. End with a concrete question to invite the "existing tools vs this"
discussion (Schemathesis, Dredd, spectral).

## Directory submissions (same week)

- npm (the package page itself)
- Awesome lists: awesome-openapi3 (PR with a listing entry)
- GitHub topic `openapi` already set
- toolhunt / saashub / alternativeTo listings — only if they add real value, no link farms

## Content that can be produced later (install-gated)

- "How OpenAPI drift happens in practice" (engineering article; product used as the fix)
- "Contract tests vs integration tests" comparison
- "Testing your API against its OpenAPI spec in CI" tutorial using the example repo

## Rules

- Never fabricate usage, stars, installs, or testimonials.
- No giveaway/hack-vote communities.
- Every post gets a metric: unique installs delta + stars delta within 7 days (EXP-001-D3).