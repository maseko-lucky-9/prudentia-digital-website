# Motion Brief — Per-Service Detail Pages

Each new service page must feel **distinct** but stay inside the Prudentia motion vocabulary (measured, slow, deliberate; never restless or kinetic). The signature lives in three places per page: hero motif, capability-card hover interaction, background fx.

All motion uses GPU-only properties (`transform`, `opacity`, `filter`). All motion respects `prefers-reduced-motion: reduce`. Pointer-driven effects gated by `(hover: hover) and (pointer: fine)`. All transitions reference tokens in `css/pages/_motion-shared.css` — no raw `transition: ... ms ease` per service.

## Per-service motion direction

### Web (`/web/`)

- **Hero motif:** wireframe shards flow in from off-canvas and self-assemble into a stylised device frame. Settles to a static composition with a single gold corner accent. Loop disabled — outcome is the held frame.
- **Capability card hover:** card splits into a "before / after" sliver. Left half darkens (legacy code grey), right half brightens (modern UI gold shimmer). Reverts on pointer-leave.
- **Background fx:** subtle blueprint grid drift (extends `.bg-fx__grid` with finer dot spacing, slower drift). Single drifting gold orb at 8% opacity.
- **Stagger:** 80ms cascade on shards (5 shards × 80ms = 400ms total assembly).
- **Outcome dwell:** 4s before the loop resets if user is still hovering hero.

### Cloud (`/cloud/`)

- **Hero motif:** central cluster node with 6 orbital nodes rotating around it at slow speed (one full orbit ≈ 60s). A gold pulse heartbeat emanates from the cluster centre every 7s.
- **Capability card hover:** thin traffic-flow lines (think: API call lines) pulse from card edge through the icon and out the opposite edge. One line per hover, 700ms transit.
- **Background fx:** slow-rotating ring layer (120s full rotation, 0.5 opacity, blur 1px). Two `.bg-fx__orb` set to navy variant + gold variant.
- **Stagger:** orbital nodes appear sequentially with 200ms cascade on entrance.
- **Outcome dwell:** continuous gentle orbit; the heartbeat is the only periodic gold moment.

### Data (`/data/`)

- **Hero motif:** an animated sparkline draws across the hero from left to right (1.6s draw), ending in a gold halo dot. After the dot lands, two faint chart bars rise behind the line at the right edge (200ms each, staggered).
- **Capability card hover:** the icon morphs into a chart fragment — bar heights animate up (300ms), or a small line draws (450ms). One-shot per hover entry.
- **Background fx:** faint data-grid mesh (different scale than `.bg-fx__grid` — wider spacing, lighter opacity) drifting slowly. No orbs (data is precise, not soft).
- **Stagger:** sparkline draw → halo land → bars rise (sequential).
- **Outcome dwell:** held final composition. Reduced-motion variant skips the draw and shows the final composition immediately.

### Advisory (`/advisory/`)

- **Hero motif:** three ghost-trail paths (curved Bézier) fade in from the left edge with low opacity. They resolve over 1.2s into a single straight resolved arrow shaft pointing right, terminated by a gold arrowhead. Conveys "complexity → clarity."
- **Capability card hover:** the card reveals a phased three-step progression — before / during / after labels animate in as small text below the card body (each 200ms apart).
- **Background fx:** soft fog gradient with slow parallax (2px shift over 30s on scroll). No grid, no orbs — Advisory is the calmest page.
- **Stagger:** ghost trails → resolved arrow → gold arrowhead (sequential).
- **Outcome dwell:** held; arrowhead is the only gold moment.

### API (`/api/`)

- **Hero motif:** three input channels (lines from off-canvas left) converge into a merge point, then exit as a single thicker stream to the right. A gold mid-flow marker pulses once when the convergence completes.
- **Capability card hover:** a request-response arc draws from card edge to icon and back (an outbound + inbound pair), 600ms total. Mimics an API call returning.
- **Background fx:** diagonal flow lines drifting in the direction of read-flow (top-left → bottom-right), 90s cycle, 5% opacity. One gold orb at bottom-right at 10% opacity.
- **Stagger:** channels enter 150ms apart, then converge, then mid-flow marker pulses.
- **Outcome dwell:** held final merge composition; the marker pulse is the only loop element (every 9s).

## Shared motion vocabulary

| Motion event | Token | Default value | Notes |
|---|---|---|---|
| Hero entrance | `--motion-hero-rise` | `350ms cubic-bezier(0.22, 1, 0.36, 1)` | Used on hero headline + subhead reveal. |
| Card tilt-in | `--motion-card-tilt` | `400ms cubic-bezier(0.25, 1, 0.5, 1)` | Pointer-driven; capped at ±3deg rotation. |
| Icon pulse | `--motion-icon-pulse` | `560ms cubic-bezier(0.25, 1, 0.5, 1)` | Service illustration motion beat. |
| Outcome settle | `--motion-settle` | `480ms ease-out` | Final-frame land. |
| Outcome dwell | `--motion-dwell` | `2200ms` | Pause before loop reset (most services don't loop). |
| Background drift | `--motion-bg-drift` | `90s linear infinite` | Slow background motion. |
| Stagger step | `--motion-stagger` | `80ms` | Default per-element delay in a cascade. |
| Reduced-motion | n/a | Set all motion to `none`; show outcome state immediately. |

All five per-service CSS modules must compose from these tokens. Per-service CSS may introduce one new token for its signature motion (e.g., `--motion-web-shard-assembly`) but must NOT redefine the shared tokens.

## Reduced-motion contract (every page)

When `(prefers-reduced-motion: reduce)` matches:
- All `@keyframes` animations cease (`animation: none !important`).
- All `transition` properties resolve to `0s`.
- Hero motif renders the **outcome state** immediately (final frame).
- `.bg-fx__spotlight` is hidden (no pointer-tracking glow).
- Service illustration `.is-playing` class is added without delay so the outcome frame is shown.
- Card tilt / hover transforms are disabled.

The page must remain readable and useable with all motion off. Test with DevTools Rendering → Emulate CSS media feature → prefers-reduced-motion: reduce.

## Pointer-coarse contract (every page)

When `(pointer: coarse)` or `(hover: none)` matches:
- Pointer-driven tilt / glow / spotlight disabled (skip the JS handlers).
- Tap-to-reveal is preferred over hover-to-reveal where the page exposes content on hover.
- Touch targets ≥ 48×48 px.
