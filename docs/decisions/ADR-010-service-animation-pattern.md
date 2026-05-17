# ADR-010: Per-service animated illustrations on home services section

- **Status:** Amended (see Amendment 1 below — Phase 8 supersedes the play-once lifecycle)
- **Date:** 2026-05-17
- **Branch:** `feat/service-illustrations`
- **Supersedes:** none
- **Related:** ADR-001 (AI agent card replacement), ADR-002 (detail page routing)

## Context

The home-page services section (`index.html` 244–339) currently renders six service cards as a uniform 3-column grid with static SVG icons. For the GTM pitch surface, this reads "agency template" rather than "studio that builds what it sells." We want to pair each service with an animated illustration that visualises how the service works / what it saves, inspired by the vite.dev hero animation pattern.

Constraints:

- UI components must NOT change (card title/body/tagline/scope structure preserved).
- Site has a stated **zero-runtime-dependency** principle (vanilla HTML/CSS/JS, no framework, `npm run build` is just `cp` to `/dist`).
- Existing motion stack: CSS `@keyframes`, `@property --card-pulse-angle`, `js/animated-bg.js` IntersectionObserver pause pattern, full `prefers-reduced-motion` honored.
- Browser baseline: Chrome/Edge ≥ 111, Safari ≥ 16.4, Firefox ≥ 128 (precedent set by `@property` already in `.card-pulse`).

## Decision

1. **Layout: Option B — illustration-in-card.** Keep the 3/2/1-col responsive grid. Each card's existing icon-wrap shell is preserved; its inner content is replaced with a `<div class="service-illustration" aria-hidden="true">…</div>` host that holds the animation. `.card-pulse` hover remains on the card frame at `z-index: 0`; illustration lives at `z-index: 1`. Card title/body/tagline/scope are untouched.

2. **Tech: CSS + inline SVG (with optional `<use href>` for non-pilot replicates).** No new runtime dependencies. Rejected alternatives:
   - **Rive** (what vite.dev uses): +~100KB runtime, breaks zero-dep principle. Reserved as v2 escape hatch only if the Phase 5 CSS ceiling test fails.
   - **Lottie-light:** +~30KB runtime, still breaks zero-dep.
   - **Pre-rendered video / GIF:** large payload, no theming, no a11y nuance.

3. **SVG loading strategy:**
   - **Phase 0a measurement confirms the services section is below the fold on all viewports (1146–1336px scroll-distance vs viewport height of 812/1024/900).** Inline-vs-external is therefore a code-organization decision, not a performance one.
   - Default: inline all 6 SVGs in `index.html` if combined payload after Phase 3 sketches stays < 30KB.
   - Fallback: `<svg><use href="assets/illustrations/foo.svg#root"/></svg>` external symbol references. **Plain `<img>` is rejected** because it strips the `currentColor` / CSS-variable cascade that theme switching requires.

4. **Shared motion vocabulary.** All 6 illustrations share easing (`ease-out-quart`), settle beat (~400ms), halo treatment (blur radius + accent). Variety comes from shape language only. Tokens land in `css/design-tokens.css`.

5. **Originality vs vite.dev.** Must differ on all 3 of {shape language, color palette, motion arc} — diff matrix documented at Phase 5.5 critique.

## Phase 0a state captured

- **Branch:** `feat/service-illustrations` created off `main` (pre-existing uncommitted `wrangler.jsonc` deletion left in working tree, unrelated to this work).
- **Existing ADRs:** 001, 002, 009 present. Next sequential ID = **010** (this one).
- **Existing Playwright tests touching services section:**
  - `tests/homepage.spec.ts:34-60` — asserts 6 cards in `.services__grid .card`; asserts 6th card is AI accent + links to `/ai/`. **Compatible with Option B** (card count and existing selectors preserved).
  - `tests/navigation.spec.ts:14, 41-46, 95` — services anchor link + heading position. **Compatible** (heading `#services-heading` unaffected by card-inner changes).
  - `tests/ai-page.spec.ts:62` — `#approach .services__grid .card` on the `/ai/` page. **Out of scope** (AI page untouched).
- **Tool availability:** Playwright 1.59.1, Lighthouse 13.1.0, both via npx.
- **Port environment:** local ports 3000 and 3001 held by Docker (Grafana). Baselines + future test runs use port 4173 via standalone script (`tests/baselines/capture-baseline.mjs`). Existing `playwright.config.ts` `webServer` config (port 3000, `reuseExistingServer: true`) needs the same override or CI will hit Grafana — flagged for Phase 0b user-present window.

## Baselines

Committed to `tests/baselines/`:

- `lighthouse-baseline.json` — consolidated summary + gates
- `lighthouse-mobile.json`, `lighthouse-desktop.json` — raw lighthouse runs
- `above-fold-measurement.json` — services-section scroll-distance per viewport
- `screenshots/services-section/{mobile,desktop}-{light,dark}.png` + `mobile-reduced-motion.png`

**Lighthouse baseline:** desktop perf 0.91 / a11y 0.97; mobile perf 0.96 / a11y 0.97. CLS desktop 0.0006, mobile 0.032. TBT 0ms.

**Phase 6 gates (revised from plan defaults to match measured baseline):**

| Metric | Gate |
|---|---|
| Desktop performance | ≥ 0.88 |
| Mobile performance | ≥ 0.93 |
| Accessibility (both) | ≥ 0.97 (baseline — plan said "100" but baseline is 97; not a regression) |
| CLS mobile | ≤ 0.05 |
| CLS desktop | ≤ 0.01 |
| INP | ≤ 200ms — measured via PerformanceObserver in Playwright (Lighthouse doesn't emit INP from lab runs) |

## Consequences

- Adds ~200 lines CSS + 6 SVG assets (≤8KB each target). Build step (`cp -r css assets`) requires no changes — new paths captured automatically.
- Card height grows ~140px to host the illustration zone; reserves `aspect-ratio` to prevent CLS.
- Risk: **monoculture font (Inter)** flagged by impeccable's reflex-font reject list. Accepted because typography is out of scope per the "keep UI components" constraint. Revisit on branding refresh.
- Risk: hand-coded CSS ceiling. Mitigated by Phase 5 ceiling test (>4 channels / >300 LoC / >2 nested `@property` → halt and escalate to Rive adoption).
- Pilot does NOT merge to `main` between Phase 6 and Phase 7. The PR carries the complete 6-service set, to avoid shipping a visually inconsistent page (1 animated + 5 static).

## Open items resolved in later phases

- Phase 0b: `/impeccable teach` to write `.impeccable.md` and answer "outcome-savings framing OR process-explanation framing?"
- Phase 4: confirm inline-vs-`<use>` based on summed SVG payload after Phase 3.
- Phase 5.5: originality diff matrix (shape / palette / motion arc) documented against vite.dev.
- Phase 7: per-service ceiling-test fallbacks ship as static key-frame for that service only (does not block PR merge).

---

## Amendment 1 — Continuous loop with in-place entry (2026-05-17, Phase 8)

After PR #7 (`c76e7da`) shipped, the user reported two issues with the live result:

1. Five of six cards "only ran during page load" — the play-once-then-hold lifecycle made them look broken on subsequent viewing.
2. Several entry animations read as "swooping in from the side" rather than appearing with the card.

### What this amendment changes

| Decision | Original | Amended |
|---|---|---|
| Lifecycle | Play-once on first viewport entry, static key-frame held thereafter (AI exception loops) | **All 6 cards loop continuously**; AI is no longer an exception |
| Cycle length | Per-service, 4–6s arc + 2.2s pause (AI: 3.7s loop) | **Shared 6s cycle**: 2s build → 2s hold → 1s fade-out → 1s breath |
| Entry direction | `scaleX from left center`, `translateY from above`, `stroke-dashoffset draw` allowed | **In-place only**: opacity fade + scale-from-center |
| Off-screen behaviour | Animations paused off-screen via existing IntersectionObserver | **Always running** — user's explicit preference; CPU cost accepted |

### What's preserved from the original ADR

- **Layout** (Option B — illustration-in-card, 3-col grid)
- **Tech stack** (vanilla CSS + inline SVG, zero new runtime deps)
- **SVG loading strategy** (inline-all, well under 30KB total)
- **Shared motion vocabulary**: still `ease-out-quart`. Halo treatment unchanged.
- **Browser baseline** (Chrome ≥ 111 / Safari ≥ 16.4 / Firefox ≥ 128)
- **Accessibility**: `prefers-reduced-motion: reduce` still freezes to static outcome key-frame
- **Originality matrix vs vite.dev**: still differs on shape language, palette, motion arc (vite is rotating radial; Prudentia is now breathing geometric)

### Acceptance gates for Phase 8 (additive to Phase 6's)

- 62/62 Playwright tests passing (60 from Phase 7 + 2 new: AI loop assertion, broadened transform-origin)
- Lighthouse mobile perf ≥ 0.93, desktop ≥ 0.88, a11y ≥ 0.97 (median of 3 runs)
- Sustained 60fps under loop: ≥ 95% of frames < 16.67ms over 10s scroll-hold (measured via `phase8-perf-probe.mjs`)
- Static lint (`tests/lint-no-directional-entry.mjs`) finds no `scaleX`, no `translateX`, no non-center `transform-origin` outside the AI block

### Trade-offs accepted

- **CPU cost** of 6 always-on animations vs prior play-once. Mitigated by GPU-only props. If field perf complaints surface, mitigation is to extend the existing `cardIo` callback to toggle `.is-playing` off on viewport leave (3-line JS change, Phase 9 candidate).
- **Brand voice "stillness over motion"** is suspended for the services grid only. `.impeccable.md` records the scoped override.

