# SpecCaster — Ideal Customer Profile

## Primary ICP

**Backend developers building REST APIs with OpenAPI specs who have been burned by spec drift.**

### Demographics
- Role: Backend developer, API developer, platform engineer, DevOps engineer, QA engineer
- Company size: 5-500 developers
- Tech stack: Node.js 18+, OpenAPI 3.0/3.1, CI/CD (GitHub Actions preferred)
- API style: REST, OpenAPI-first or OpenAPI-as-documentation

### Behavioral Signals
- Has an OpenAPI spec file in their repo
- Uses CI/CD (GitHub Actions)
- Has experienced a production incident caused by API drift
- Manually maintains API tests
- Has considered or tried contract testing tools

### Pain Level
- **High**: "We keep finding out about API changes in production"
- **Medium**: "Our tests are always out of date"
- **Low**: "We want to improve our API testing but haven't had time"

## Secondary ICP

**API-first companies with multiple API consumers.**

### Demographics
- Role: Platform engineer, API team lead
- Company size: 50-5000 developers
- Tech stack: Multiple languages, OpenAPI as contract
- API style: REST with multiple SDK consumers

### Behavioral Signals
- Generates SDKs from OpenAPI specs
- Has multiple teams consuming the same API
- Has an API review/approval process
- Uses spec linting (Spectral) or spec diffing (oasdiff)

### Pain Level
- **High**: "SDK consumers keep breaking because the spec doesn't match"
- **Medium**: "We need a lightweight contract test floor"

## Anti-ICP

- Teams without OpenAPI specs
- Teams not using Node.js
- Teams needing deep property-based fuzzing (point them to Schemathesis)
- Teams needing runtime validation (point them to openapi-sentinel)
- Teams needing spec linting (point them to Spectral)

## Activation Definition

A user has activated when they:
1. Run `npx speccaster demo` successfully
2. OR run `npx speccaster init --spec openapi.yaml` on their own spec
3. OR add the CI workflow to their repo

## Conversion Path

```
awareness → npx speccaster demo → init on own spec → CI integration → return usage → Pro purchase
```
