# ADR-009 — AI offering tiers (Audit / Pilot / Retainer) and no public pricing

**Date:** 2026-05-14
**Status:** Accepted
**Decision-makers:** Thulani Maseko

## Context

The `/ai/` page sells a 30-minute strategy session via a "Book a strategy session →" CTA. The session itself needs a clear offer structure so prospects know what they're buying after the call. Without a defined offer stack, the conversation drifts and conversion rates stay low.

Separately, a decision is needed on whether to publish prices on `/ai/`.

## Decision

**Three-tier offering**, presented in the strategy session (not on the page):

| Tier | What | Outcome | Indicative price |
|---|---|---|---|
| **AI Audit** | 1-day workshop reviewing prospect's workflows, data assets, current AI usage. Output: prioritised opportunity list + recommended next step. | Qualified pipeline, paid discovery | R12k–R25k fixed |
| **Capability Pilot** | 4–6 week build of one capability (RAG / Agent loop / Evals / Vector search / MCP) on prospect's data. Production-shaped but scoped. | Working system the prospect keeps running; foundation for a retainer | R80k–R180k fixed |
| **AI Engagement Retainer** | Monthly retainer for ongoing capability builds, evals, model upgrades, on-call AI-engineering support. | Sustained capability, multi-quarter relationship | R40k–R90k/month |

**Prices are not published on `/ai/`.** The page mentions tiers in plain language in the FAQ ("audit, pilot, or retainer — we scope pricing in the strategy session") but does not list rates.

## Rationale

- **Value-based pricing requires the conversation first.** Listing fixed prices on the page commoditises the work and prevents pricing on outcome rather than effort.
- **The strategy session itself is the qualifier.** Tyre-kickers who need a price tag to convert are not the right buyers for production AI engagements; the page CTA filters them out by design.
- **South African market context.** For services in the R12k–R180k+ range, published prices typically anchor low and erode margin. Procurement-driven buyers expect quotes; price-sensitive buyers will go to commoditised vendors regardless.
- **Three tiers keeps the offer simple.** Audit unlocks the rest; Pilot proves the capability on real data; Retainer is the sustained-revenue product.

## Rejected alternatives

- **Publish full price list.** Rejected — see Rationale.
- **"From R12k" anchor on the page.** Rejected — anchors compress upward perception of value. Better to let the conversation reveal scope first.
- **Two tiers (Pilot + Retainer only).** Rejected — without the Audit entry tier, the buyer journey skips a qualified-discovery step and conversion from cold inquiry to Pilot is slow.

## Consequences

- The FAQ section on `/ai/` must include "What does pricing look like?" with a buyer-respecting answer that defers to the session
- The discovery-call script (Phase 7 artefact) drives tier selection
- One-pager PDF (Phase 7) mentions tiers in plain language, also without rates
- This ADR is revisited if 6+ months of pipeline data shows the no-price stance is suppressing top-of-funnel
