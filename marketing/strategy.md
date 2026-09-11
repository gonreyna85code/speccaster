# SpecCaster — Marketing Strategy

## Current State (2026-09-11)

| Metric | Value | Source |
|--------|-------|--------|
| npm downloads (week) | 0 | npm registry |
| npm downloads (month) | 0 | npm registry |
| GitHub stars | 0 | GitHub |
| Landing page status | 200 | check-metrics.js |
| Published version | 0.2.1 | npm |
| Customers | 0 | memory/customers.md |
| Revenue | $0.00 | FINANCE.md |

## Bottleneck Analysis

Current biggest bottleneck: **ZERO IMPRESSIONS**

Everything downstream (installs, activation, revenue) is blocked because nobody knows SpecCaster exists.

## Strategy

### Phase 1: Discovery (Week 1-2)

**Objective**: Generate first qualified impressions from target users.

**Channels (ranked by expected ROI)**:
1. **Developer directories** — openapi.tools PR #828 (submitted, pending)
2. **npm keywords** — optimized in 0.2.1
3. **GitHub ecosystem** — GitHub Action listing
4. **Reddit** — r/node, r/QualityAssurance, r/OpenAPI (when owner ready)
5. **Hacker News** — Show HN (when owner ready)

### Phase 2: Activation (Week 2-4)

**Objective**: Convert impressions into `npx speccaster demo` runs.

**Actions**:
- Landing page CRO: improve quickstart section
- README improvements: make the value proposition immediate
- Blog SEO: target "openapi spec drift" and "contract testing CI" keywords

### Phase 3: Retention + Conversion (Week 4+)

**Objective**: Convert activated users into returning users and paying customers.

**Actions**:
- Monitor GitHub Issues for feedback
- Iterate on Pro tier features
- A/B test pricing

## Experiments

See `experiments.jsonl` for active experiment queue.

## Kill Rules

Kill any channel that produces < 1 qualified visitor per week after 2 weeks of effort.

## Scale Rules

Scale any channel that produces > 5 qualified visitors per week with positive activation signal.
