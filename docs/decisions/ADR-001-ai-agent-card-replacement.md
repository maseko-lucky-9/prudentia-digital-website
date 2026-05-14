# ADR-001 — Replace "Government & Enterprise Tenders" services card with "AI Agent Engineering"

**Date:** 2026-05-14
**Status:** Accepted
**Decision-makers:** Thulani Maseko

## Context

The 6th services card on the homepage (`index.html`, `.card.card--accent`) was titled "Government & Enterprise Tenders" with body:

> 100% Black-owned · Level 1 B-BBEE EME. POPIA, PFMA, PPPFA compliance. Maximum procurement recognition.
> Tagline: Win more. Deliver better.
> Scope: compliance documentation, technical proposal, delivery

This positioning was deliberate — it surfaced the B-BBEE classification and government-procurement readiness as a distinct service line.

In parallel, the 2026 freelance and enterprise market is shifting AI engineering capability from "nice to have" to "table stakes". Production-grade AI agents, RAG, evals, vector databases, and MCP servers are the highest-paid niches and the fastest-growing categories in B2B technology procurement.

Prudentia Digital needs to signal AI capability on the homepage to convert that demand.

## Decision

Replace the 6th services card with **AI Agent Engineering**. Keep the `card--accent` class so it retains visual distinction in the grid. Wrap the card in `<a href="/ai/">` so the entire card is a navigation surface to the new AI detail page.

The card slot count stays at six. The existing Playwright assertion (`tests/homepage.spec.ts:36`) on `.services__grid .card` length remains valid without modification.

## Rationale

- **Forward positioning over backward positioning.** Government tender capability was a positioning statement, not a service the homepage was actively converting on. AI engineering is the live demand signal.
- **B-BBEE / compliance signals don't disappear** — they remain in the site footer, in the privacy/terms pages, and surface naturally during procurement conversations. They were not the right hero card in 2026.
- **Visual continuity** — keeping `card--accent` means no CSS or layout work and no test churn beyond text assertions.
- **Single click to detail page** — wrapping the card in an anchor reuses the existing 6-card grid behaviour without introducing a new pattern.

## Removed content (recoverable from git history)

The replaced card's title, body, tagline, and scope strings are preserved in git history at `index.html` blame for the lines around 322–332 prior to this change. If the positioning is ever needed again, it can be restored as a 7th card in the grid, as a footer module, or as a dedicated `/government-tenders.html` page (see ADR-002 for the folder-routing pattern).

## Consequences

- Homepage now surfaces AI capability as a peer to the five other services
- `/ai/` detail page becomes the authoritative AI sales surface (see ADR-002)
- Government / B-BBEE positioning is de-emphasised on the homepage; this is acceptable for the current pipeline mix but should be revisited if government procurement re-enters the top of the pipeline
- ClickUp epic `[Prudentia] AI Agent Portfolio Surface + 5 Production Demos` tracks the downstream work
