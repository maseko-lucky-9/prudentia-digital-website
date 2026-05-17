# Service-illustration brief

> Source of truth for the 6 per-service animated illustrations on the home page services grid. Phase 3 sketches and Phase 5 builds reference this document.

**Branch:** `feat/service-illustrations` · **Related:** `.impeccable.md`, `docs/decisions/ADR-010-service-animation-pattern.md`

---

## The one-sentence brief

Six **quiet, considered process→outcome vignettes**, one per service card, that read as *"we work like this, so you get this"* in under 4 seconds, share a single motion vocabulary, and would never be mistaken for a Linear or Stripe loop.

---

## Framing (locked in Phase 0b)

**Hybrid — process implied, outcome emphasised.**

Every illustration follows the same dramatic arc:

```
[ Process beat 1 ] → [ Process beat 2 ] → [ Process beat 3 ] → [ OUTCOME ━━ held ]
   quiet, navy           quiet, navy          quiet, navy        gold accent, settle 400–600ms
   ≤ 600ms              ≤ 600ms              ≤ 600ms             then pause ≥ 2s
```

- Process beats are **quick and quiet** — navy stroke on warm-white, no flourish.
- Outcome beat **lands and holds** — the only gold moment in the illustration.
- After the outcome holds, the illustration **pauses for ≥ 2 seconds** before the IO observer's class-state can re-trigger. No restless looping.
- **Exception:** AI Agent Engineering illustration loops with a quiet 1.5s pause between cycles, because the metaphor is "continuous compression of manual operations" and a single play breaks the meaning.

---

## Shared motion vocabulary

These five tokens live in `css/design-tokens.css` and are referenced by every illustration. Variety comes from shape language only — never from treatment.

| Token | Value | Used for |
|---|---|---|
| `--anim-illustration-ease` | `cubic-bezier(0.25, 1, 0.5, 1)` (ease-out-quart) | Every transform/opacity transition |
| `--anim-illustration-beat` | `560ms` | Duration of a single process beat |
| `--anim-illustration-settle` | `480ms` | Outcome resolution hold-on |
| `--anim-illustration-pause` | `2200ms` | Held-still time after outcome before pause-state |
| `--anim-illustration-halo-blur` | `24px` | Gold halo around outcome accent |

**Forbidden easings:** bounce, elastic, linear (except for the AI loop's continuous descent which uses linear by necessity).

**Forbidden treatments:** gradient text, gradient halos that pulse, cyan accents anywhere, sparkline decoration, side-stripe borders, breathing background loops behind the illustration, glow trails on moving elements, glassmorphic surfaces.

---

## Motion budget (per service)

| Limit | Value | Why |
|---|---|---|
| Inline SVG payload | ≤ 8 KB | Six × 8 KB = 48 KB total HTML inflation. Acceptable below the fold. |
| CSS rules added | ≤ 200 lines per service in `css/service-illustrations.css` | Triggers Phase 5 ceiling test if exceeded |
| Concurrent tween channels | ≤ 4 | Triggers Phase 5 ceiling test if exceeded |
| Nested `@property` declarations | ≤ 2 | Triggers Phase 5 ceiling test if exceeded |
| Active illustrations at once on mobile | 1 (enforced by IntersectionObserver) | Mobile is 1-col, so naturally only one card is in viewport |
| Active illustrations at once on desktop | ≤ 3 (one per visible row) | Desktop is 3-col; never more than 3 visible |

**Ceiling test (Phase 5):** if any limit is exceeded by the pilot, halt — dump WIP state to `docs/design/pilot-build-checkpoint.md` and escalate Rive-vs-simplify decision.

---

## Per-service spec

Each service below follows the same template: **savings sentence · process beats · outcome · lifecycle · shape language**. Phase 3 will sketch 1 strong + 2 alternates per service against this spec.

### 1. Web Application Development

- **Savings sentence:** "Prototype to production-grade — without the months between."
- **Process beats:**
  1. Five small UI shards (rect, circle, list-line, button, chart) fade in from off-canvas, drifting at different speeds.
  2. They align to an invisible 4pt grid, jittering briefly into snap positions.
  3. Thin navy lines draw between them, suggesting structure.
- **Outcome:** Shards consolidate into a single device frame outline. Gold accent on the frame's upper-right corner.
- **Lifecycle:** Play-once on first viewport entry. Static key-frame after.
- **Shape language:** Rectangles, circles, lines. Geometric, modular, snap-positioned.

### 2. Cloud Infrastructure & DevOps

- **Savings sentence:** "One platform to operate, not a rack to maintain."
- **Process beats:**
  1. Three small server-tower icons appear with red/amber/green status dots blinking out of sync.
  2. The towers dissolve into ascending dot particles (~12 dots total).
  3. Particles drift toward a single converging point above.
- **Outcome:** Particles coalesce into one cloud-node circle. Gold pulse-ring expands once from the centre, then settles.
- **Lifecycle:** Play-once on first viewport entry. Static key-frame (single cloud node) after.
- **Shape language:** Vertical stacks dissolving into particle flow into single node. Vertical → diffuse → single.

### 3. Data Analytics & Dashboards

- **Savings sentence:** "Signal extracted from your noise — daily, without you asking."
- **Process beats:**
  1. Dense scatter of ~30 small dots appears, randomly positioned within the frame.
  2. A horizontal filter line sweeps from left to right at mid-height, dimming dots above it.
  3. Below the filter line, dots reorganise into a left-to-right sequence.
- **Outcome:** Sequence resolves into a single ascending sparkline (navy stroke). Gold endpoint dot lands at the upper-right with a small halo.
- **Lifecycle:** Play-once on first viewport entry. Static key-frame (final sparkline + endpoint) after.
- **Shape language:** Scatter → filter → sequence → line. Compression of cardinality.

### 4. Digital Transformation Advisory

- **Savings sentence:** "Decision velocity — direction agreed before the next quarter starts."
- **Process beats:**
  1. A tangled knot of three bezier curves visible at centre, slowly pulsing.
  2. One strand pulls taut horizontally; the knot begins to unwind.
  3. Remaining strands untangle in sequence, fading as they straighten.
- **Outcome:** A single horizontal forward arrow (navy stroke) with a gold arrowhead.
- **Lifecycle:** Play-once on first viewport entry. Static key-frame (single arrow) after.
- **Shape language:** Tangled curves → straight line. Resolution of complexity into direction.

### 5. API Development & Integration

- **Savings sentence:** "Three systems behaving as one — without rewriting any of them."
- **Process beats:**
  1. Three horizontal channels stacked vertically; each pulses with a small dot at a different rhythm.
  2. A vertical sync marker descends through all three channels.
  3. The three rhythms align — dots pulse in unison.
- **Outcome:** Three channels merge visually into one thicker stream. A single gold marker passes from left to right through the merged stream.
- **Lifecycle:** Play-once on first viewport entry. Static key-frame (single stream with marker mid-flow) after.
- **Shape language:** Parallel channels → synchronisation → merged flow. Horizontal, rhythmic.

### 6. AI Agent Engineering — *the loop exception*

- **Savings sentence:** "Operations that run themselves — and notify you only when they shouldn't."
- **Process beats:**
  1. Thin horizontal lines stack upward from the bottom of the frame (request queue building, ~4 lines).
  2. A vertical beam descends from the top, passing through the stack.
  3. Lines collapse through the beam, disappearing.
- **Outcome:** One horizontal answer-line exits at the top with a quiet gold glow.
- **Lifecycle:** **LOOP** (the only one). 1.5s pause between cycles. Continuous because the metaphor is continuous compression of manual operations; a single play breaks the meaning.
- **Shape language:** Vertical stack ↑ beam ↓ single line. Continuous, breathing-but-restrained.

---

## Originality diff matrix vs vite.dev

Every illustration must differ from vite.dev's hero on **all three** of the following axes. This matrix lives in the ADR and is verified at Phase 5.5 critique.

| Axis | vite.dev | Prudentia |
|---|---|---|
| Shape language | Lightning bolt + radiating rays | Geometric primitives consolidating (see per-service shape) |
| Colour palette | Pink/purple/yellow gradient halo on dark | Navy + gold on warm-white, no gradients |
| Motion arc | Continuous radial rotation + flowing rays | Discrete process beats → held outcome, pauses ≥ 2s |

If any single illustration matches vite.dev on **2 of 3 axes**, it ships nothing — back to Phase 3 for that service.

---

## SaaS-clone smell test (run before every Phase 5.5 critique)

Mandatory pre-critique checklist. Any "yes" sends the illustration back to Phase 5.

- [ ] Could a designer mistake this for a Linear, Stripe, or Vercel marketing-page loop?
- [ ] Is there a glowing orb anywhere in the frame?
- [ ] Does anything pulse continuously without resolving (other than the AI loop)?
- [ ] Is there a cyan accent anywhere, even briefly mid-tween?
- [ ] Does it use a sparkline as decoration rather than as the actual outcome?
- [ ] Is anything centred and breathing?
- [ ] Does the motion express urgency or speed?

All seven must be "no." The brand voice is *restrained*; "yes" on any answer kills the restraint.

---

## Reduced-motion fallback (every service)

When `prefers-reduced-motion: reduce` is set, the illustration renders as the **outcome key frame** only — the final settled state, gold accent visible, no entry motion, no halo animation, no JS observer activity. Reduced-motion users get the same *meaning* as motion users: the resolved outcome of the process. They just skip the prologue.

This is a design deliverable, not an afterthought — each Phase 3 concept must specify its key frame explicitly.

---

## What this brief does NOT cover

- Specific timing per beat beyond the shared tokens (Phase 3 may tune per illustration within ±20% of the token value).
- The exact SVG geometry — that's Phase 3's sketching work.
- Copy changes to the cards (out of scope — illustration only).
- Replication CSS architecture details — that's Phase 4.

---

## Concept gallery (Phase 3)

Six outcome key-frame SVG sketches live in `docs/design/concepts/`. Each represents the static state held after the process beats resolve — and the state shown in `prefers-reduced-motion: reduce` mode.

| # | Service | File | Lifecycle |
|---|---|---|---|
| 01 | Web Application Development | `concepts/01-web-application-development.svg` | play-once |
| 02 | Cloud Infrastructure & DevOps | `concepts/02-cloud-infrastructure-devops.svg` | play-once |
| 03 | Data Analytics & Dashboards | `concepts/03-data-analytics-dashboards.svg` | play-once |
| 04 | Digital Transformation Advisory | `concepts/04-digital-transformation-advisory.svg` | play-once |
| 05 | API Development & Integration | `concepts/05-api-development-integration.svg` | play-once |
| 06 | AI Agent Engineering | `concepts/06-ai-agent-engineering.svg` | **loop** (1.5s gap) |

**Preview:** open `docs/design/concepts/preview.html` in a browser for a side-by-side gallery with strong-concept descriptions, motion choreography per service, and 2 alternate directions per service (collapsed in `<details>` blocks).

**Phase 3 approval gate:** user signs off on the strong concepts as the build set OR substitutes any alternate(s) before Phase 4.

---

*Authored 2026-05-17 as Phase 2 deliverable. Phase 3 concept gallery appended same day. Edits require re-running Phase 0b interview if framing changes; minor tuning OK in place.*
