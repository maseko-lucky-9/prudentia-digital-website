# ADR-002 — Detail-page routing: `/ai/index.html` folder pattern

**Date:** 2026-05-14
**Status:** Accepted
**Decision-makers:** Thulani Maseko

## Context

Prudentia Digital's website is a static-HTML site deployed to Cloudflare Pages. There is no framework, no router, no build template engine. Existing routes:

- `/` → `index.html`
- `/privacy.html`
- `/terms.html`
- `/404.html`
- `/blog/` → `blog/index.html` (folder pattern)

The new AI Agent Engineering surface needs a dedicated page. Future expansion may include per-capability sub-pages (RAG, MCP, evals, etc.) or per-engagement case studies.

## Decision

Use a **folder route**: `/ai/index.html`, served at the URL `https://prudentiadigital.co.za/ai/`.

This matches the existing `/blog/` precedent and reserves the `/ai/*` URL space for future sub-pages (e.g., `/ai/rag-case-study.html`, `/ai/evals-overview.html`) without requiring a route migration later.

## Rejected alternatives

- **`/ai-agent.html` (flat file at root)** — works for one page but pollutes the root with capability-specific files if sub-pages are added later. Also visually less clean.
- **`/services/ai/`** — adds a `/services/` parent route that doesn't exist for any other service. Premature generalisation.
- **`/#ai-agent` anchor on the homepage** — fails the sales requirement: prospects share the URL, search engines need to crawl the content, and the FAQ + structured data deserve their own page.

## Build script implications

The site's build script in `package.json` already uses `cp -r` for `blog/`. The AI route needs the same treatment:

```
cp -r ai dist/
```

Captured in the Phase 1 file-modification list. No separate ADR for the build script is needed unless we move to a glob pattern (deferred — current file list is small enough).

## Consequences

- All future AI-related sub-pages live under `/ai/*`
- Sitemap, manifest, and `_headers` need `/ai/` entries
- Existing Cloudflare Pages configuration (`wrangler.toml`) covers the entire `dist/` tree — no deployment changes required
