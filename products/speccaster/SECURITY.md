# Security

## Reporting a vulnerability

Do not open a public issue for security problems. Email the maintainer via the
GitHub repo's security advisories, or open a private report using GitHub's
"Report a vulnerability" on `gonreyna85code/speccaster`.

## Scope

- This package generates code and runs it as `node:test` only. Generated suites
  are plain JS in the user's repo; they are their own code, not ours.
- The CLI reads a local OpenAPI file (YAML/JSON) from disk only. No network
  calls are made by the CLI; `data:`/`file:` remote schemas are not fetched.
- The GitHub Action only runs the local CLI; no outbound traffic.

## Secrets

Never commit API keys, tokens, or wallet material. This package has no
persistent storage and never transmits telemetry.