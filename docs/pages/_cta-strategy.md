# CTA Strategy — Per-Service Entry Offers

Each service detail page leads with a service-specific entry offer (not the generic AI-page "Book a Strategy Session"). The offer name is the primary CTA label; the topic slug is what `js/contact-prefill.js` reads. Secondary CTAs are uniform: "Email us" mailto link.

## Per-service entry offer

| Service | Primary CTA label | Topic slug | What the offer means | Why this works |
|---|---|---|---|---|
| **Web** (`/web/`) | **Book a Discovery Session** | `web-general` | Free 45-minute scoping call. Walk through current product, sketch an initial roadmap, identify quick wins. No proposal pressure. | Web buyers are usually evaluating multiple vendors — a low-commitment scoping call surfaces fit fast and beats a generic "book a demo" CTA. |
| **Cloud** (`/cloud/`) | **Free Architecture Review** | `cloud-architecture-review` | One-hour technical audit. Walk the current stack, surface 3-5 risks, leave with a written summary. | Cloud buyers respond to a tangible deliverable. "Architecture review" is the lingua franca of platform teams and signals technical depth. |
| **Data** (`/data/`) | **Book a Data Audit** | `data-audit` | One-day diagnostic. Inventory data sources, identify quality gaps, propose a dashboard or pipeline scope. Fixed-fee or absorbed into pilot. | Data buyers want to know "is our data even usable?" — a paid audit is a fast yes/no that often converts to a pilot. |
| **Advisory** (`/advisory/`) | **Schedule a Transformation Consult** | `advisory-consult` | 90-minute structured conversation, optional written summary. Useful when the buyer has a decision to make and wants a second opinion. | Advisory is a relationship sale. A consult is the right first step — neither a sales call nor a full engagement. |
| **API** (`/api/`) | **Free Integration Assessment** | `api-assessment` | One-week scoped review of one critical integration (e.g., a payment gateway flow or a customer-facing API). Output: a written readout with reliability + design gaps. | API buyers usually have one acute pain point. Offering a free assessment of that specific pain converts higher than a generic "let's talk." |

## Secondary CTA (uniform across pages)

- **Label:** "Email us instead"
- **Type:** `mailto:masekolt@prudentiadigital.co.za`
- **Position:** alongside the primary CTA in the hero and the final CTA section
- **Style:** `.btn.btn--outline.btn--lg` (matches AI page)

## Capability-level CTAs

Each of the 5 capability cards on a service page gets its own CTA pointing at a capability-specific topic slug (see `_topic-slugs.md`). Label format: "Talk to us about {Capability}".

Example for Cloud page:
- Capability 1 (Migration) → "Talk to us about migration" → `?topic=cloud-migration#contact`
- Capability 2 (Kubernetes) → "Talk to us about Kubernetes" → `?topic=cloud-kubernetes#contact`
- ... etc.

## Final CTA section copy

The final-CTA section header on each page follows this template:

```
Heading:   "{Entry offer name in present-tense action}"
            e.g., "Book a discovery session for your web product."
                  "Reserve a free architecture review."
                  "Book a data audit."
                  "Schedule a transformation consult."
                  "Reserve a free integration assessment."

Subtext:   1-2 sentences. Describe what happens in the session:
           - duration
           - what the conversation will cover
           - what the buyer walks away with
           - "no slides, no commitment" (matches AI page voice)

Primary:   {Entry offer label} button → /?topic={slug}#contact
Secondary: "Email us instead" → mailto:masekolt@prudentiadigital.co.za
```

## Engagement tiers (used in JSON-LD `hasOfferCatalog` and About-blurb)

Each service has 3 tiers — same Audit → Pilot → Retainer pattern as the AI page, but rebadged service-appropriately. Suggested per service (refine in Phase 2 once research is in):

| Service | Tier 1 — Audit | Tier 2 — Pilot | Tier 3 — Retainer |
|---|---|---|---|
| Web | Discovery Sprint (1 week, fixed-fee) | Product Build (8-12 weeks, fixed-fee per milestone) | Engineering Retainer (monthly, capacity-based) |
| Cloud | Architecture Review (1 week, fixed-fee) | Migration / Greenfield Build (6-10 weeks) | Platform Retainer (monthly, on-call + change) |
| Data | Data Audit (1 day, fixed-fee) | Dashboard / Pipeline Build (4-8 weeks) | Analytics Retainer (monthly) |
| Advisory | Transformation Consult (1-3 days) | Roadmap & ADRs Engagement (4-6 weeks) | Steering Retainer (monthly cadence) |
| API | Integration Assessment (1 week, fixed-fee) | API Design + Build (4-8 weeks) | Reliability Retainer (monthly, on-call) |

The tier names land in:
- The `Service > hasOfferCatalog` JSON-LD on the detail page
- The "Audit → Pilot → Retainer" card in the "How we ship" section (Card 6 of 6, `.card--accent`)
- The final-CTA subtext when relevant ("Start with a {Tier 1 name} — fixed fee, fast turnaround.")

## Voice notes for CTA copy

- Use imperative mood for primary CTAs ("Book", "Reserve", "Schedule").
- Avoid "Get started" or "Learn more" — both are noise.
- Avoid "Contact us" — "Email us" is more direct.
- The final-CTA subtext should mirror the AI page's voice: short sentences, no slides language ("no slides, no commitment" is a Prudentia signature).
