# Voice Guide — Prudentia Digital

Source of truth for tone, language, and register across the five new service detail pages. Extracted from `/ai/index.html` (the canonical voice). Every paragraph each Phase 2 writer produces is validated against this guide.

## Tone descriptors

Prudentia sounds like:

- **Enterprise but founder-led.** Speaks with the calm of a senior consultant, not the volume of a sales deck.
- **Direct.** Says what we do and what it costs. Doesn't promise the moon.
- **Measured.** Quantified claims only. No hyperbole. If we don't have a number, we don't claim one.
- **Technical when useful.** Names the stack when it adds credibility ("Postgres pgvector", "LangGraph", "OpenTelemetry"). Doesn't drown the reader.
- **Patient.** Long enough to make the point. Never longer.

Prudentia does NOT sound like:

- A SaaS landing page chasing virality.
- A management consultancy hiding behind framework names.
- A startup pitching for FOMO.
- An agency hand-waving timelines.

## Banned phrases (auto-fail in voice verifier)

| Phrase | Replace with |
|---|---|
| "leverage" (as verb) | "use", "apply", "draw on" |
| "synergy" / "synergise" | "compound", "combine", or just drop |
| "revolutionary" | "production-grade", "measurable" |
| "disrupt" / "disruptive" | "displace", "rebuild", or name what's being replaced |
| "world-class" | name the specific control (e.g., "SOC2-aligned") |
| "best-in-class" | same — name the specific |
| "seamless" | "single sign-on", "no hand-off", or whatever's actually true |
| "cutting-edge" | name the actual tech |
| "next-generation" | drop |
| "transformative" | name the change (e.g., "lifted approval rate from 18% to 47%") |
| "robust" | "audited", "instrumented", or be specific |
| "powerful" | drop or be specific |
| "supercharge" | drop |
| "boost" / "supercharge" / "skyrocket" | name the metric delta |
| "in today's fast-paced world" | delete the sentence |
| "we're passionate about" | delete and just say what we do |
| "AI-powered" without specifics | name the model family or capability |
| "harness the power of" | drop |
| "unleash" | drop |
| "game-changer" / "game-changing" | drop |
| "thought leadership" | drop or name the actual publication |
| "low-hanging fruit" | name the specific opportunity |

## Sentence-length cap

- Body paragraphs: average sentence ≤ 22 words. Maximum 28 words. Break compound sentences.
- Hero subhead: average ≤ 18 words.
- FAQ answers: average ≤ 20 words. Use short paragraphs with a leading verb.
- Capability "problem" / "solution" / "use case" / "stack" labels: each followed by 1-3 sentences. The label is bolded, then the sentence(s) flow.

## Preferred verbs

`build`, `ship`, `measure`, `validate`, `instrument`, `migrate`, `harden`, `audit`, `replace`, `consolidate`, `monitor`, `automate`, `verify`, `wire`, `route`, `compose`, `surface`, `escalate`, `document`, `govern`, `restore`.

Avoid: `leverage`, `synergise`, `optimise` (use specifically: "reduce p95 latency"), `democratise`, `revolutionise`, `enable` (often filler — use a stronger verb).

## Examples — do / don't

### Hero subhead

**Don't:** "Leverage our cutting-edge web development services to transform your business and unleash growth."
**Do:** "Web applications built for production: fast first paint, accessible by default, instrumented so you can prove they work."

### Capability problem

**Don't:** "Many businesses struggle with their legacy systems in today's fast-paced world."
**Do:** "Legacy admin tools cost the finance team 6 hours a week on manual reconciliation — and break every time the bank changes its export format."

### Capability solution

**Don't:** "We leverage modern technology to build robust, scalable, world-class web applications."
**Do:** "We build a typed React + Node stack on Postgres, with feature-flag deploys, OpenTelemetry traces, and a Playwright suite that gates every merge."

### FAQ answer

**Don't:** "Yes, we're passionate about security and take it very seriously."
**Do:** "Yes. Production builds ship behind feature flags, secrets live in a vault (never in env files), and we run an OWASP ZAP scan as part of CI."

### Use case

**Don't:** "We transformed a leading retailer's digital experience with cutting-edge tech."
**Do:** "A SA logistics operator's tracking page was timing out at peak. We rebuilt it on a CDN-first stack with server-rendered React. P95 dropped from 14s to 1.2s; bounce rate fell 38%."

## Capitalisation & punctuation

- Sentence case for headings (not Title Case). e.g., "Five capabilities. Real outcomes." — yes; "Five Capabilities. Real Outcomes." — no.
- Em dashes are encouraged for parenthetical asides. Use the actual em dash (—), not double hyphens.
- Oxford comma: yes.
- Numbers: spell out one through nine in body text. Use digits for ten and above, percentages, currency, and metrics.
- Currency: "R" for ZAR, "$" / "£" / "€" for international. Don't abbreviate as "ZAR" / "USD" in body copy unless the context demands disambiguation.
- Acronyms: spell out on first use. POPIA, GDPR, SOC2, RAG, MCP, API are OK to use unspelt because they appear in the AI page that way.

## Service-discipline lexicon (for the "How we ship" sections)

| Service | Discipline-correct verbs / nouns |
|---|---|
| Web | progressive enhancement, perf budget, INP, LCP, a11y AA, design system, feature flags, deploy pipeline, security headers, CSP, lazy-loading |
| Cloud | SLO, error budget, blast radius, IaC, Terraform, ArgoCD, blue/green, canary, OpenTelemetry, runbook, on-call rotation, secrets vault, mTLS |
| Data | data quality gate, lineage, freshness SLA, schema versioning, dbt, parquet, columnar, materialisation, BI governance, RLS, PII redaction |
| Advisory | ADR, target operating model, RACI, vendor neutrality, total cost of ownership, exit criteria, success metric, change-management plan, steering cadence |
| API | contract-first, OpenAPI, idempotency key, rate limit, retry-with-jitter, circuit breaker, OAuth 2.0, JWT, webhook, event-driven, schema evolution |

When a "how we ship" principle uses one of these terms, it signals competence. Use them — but only when the principle is genuinely about that discipline (no copy-pasting tokens for show).

## Trust signals — phrasing

When the research artifact surfaces a real client, certification, or peer outcome, surface it cleanly:

**Do:** "Built and operated a banking-grade reconciliation pipeline at Capitec for three years."
**Don't:** "We have extensive experience with Tier 1 banks." (vague, unverifiable)

If no research-backed trust signal exists, default to the existing footer chrome (B-BBEE Level 1, CIPC registration, founder bio) and do not invent any.

## Voice verifier (Phase 4 check)

The verifier samples 5 paragraphs per page and checks:
1. No banned phrase (regex match against the table above).
2. Average sentence length ≤ 22 words.
3. ≥ 80% of sentences end with a period (no question/exclamation noise except in FAQ questions).
4. No more than 1 hyperbolic adjective per paragraph ("incredible", "amazing", "extraordinary", "remarkable", "phenomenal").
5. Acronyms spelt out at first use (per page).

A page failing any check is sent back to its Phase 2 writer with the specific line(s) flagged.
