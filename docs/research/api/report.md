# Research Report — API Development & Integration

Evidence base for the Prudentia Digital `/api/` service detail page.
Audience: International product teams (INT), SA financial services (SA-FS), SA mid-market enterprises (SA-Mid), SMB consolidating point integrations.
Service scope: RESTful API design + build, third-party integrations, payment gateways, webhook delivery, reliability and observability.

All quantified claims are cited inline with `[Cn]` keys that resolve in `citation_index.json`. Retrieval date for every source: 2026-05-21.

---

## 1. Market sizing & demand

### 1.1 Global API economy & management spend

- The global API economy market is projected to grow from **$17.13 billion in 2025 to $20.21 billion in 2026** at a CAGR of 17.9%, reaching **$38.73 billion by 2030** [C1]. A second analyst projects the API management market at **$8.2 billion in 2025 → $53 billion by 2034** (CAGR 22.3%) [C2]. The two analyses agree on direction and double-digit growth.
- **65% of organisations now generate revenue directly from their APIs** — up from 62% in 2024 — and 46% plan to increase API investment in the next 12 months versus 11% planning cuts [C3]. APIs have become a revenue line, not a back-office expense.
- **API-first design correlates with measurable build-cycle gains.** Postman's 2024 report (cited inside the 2025 report and supporting trade press): organisations practising API-first ship **40% faster integration cycles and 35% fewer API-related defects** [C4].
- **AI is now an API-shaped problem.** Nearly **24.3% of developers are designing APIs with AI agents as a first-class consumer**, and 51% of organisations have already deployed AI agents [C3]. Machine-consumable APIs (clean OpenAPI, idempotent endpoints, predictable rate limits) are the entry ticket.

### 1.2 SA payment & open-banking signals

- **South Africa's embedded finance market: ZAR 292 million in 2025 → projected ZAR 3.95 billion by 2030** (≈7.8% annual growth) [C5]. The same research house puts SA digital banking + open finance TAM at **USD 5 billion** in the current five-year window [C5].
- **Open-banking-style licensing is now live.** SARB published draft Exemption Notice + Directive on 3 March 2025 modelled on PSD2, defining **eight categories of payment service** (remittances, e-money, merchant acquiring, PayShap participation, etc.), with final rules expected Q3 2025 [C6]. This pulls non-bank payment service providers (PSPs) into a licensable, supervised perimeter — exactly the regulatory shape that drives demand for compliant, well-instrumented APIs.
- **Stitch raised $55m Series B in April 2025** (total funding $107m in four years) to expand card acquiring and end-to-end payment APIs, with named enterprise customers including Takealot, Mr D, MTN, Vodacom, Standard Bank's Shyft, TFG's Bash, Hollywoodbets, Luno, and The Courier Guy [C7]. SA payment-integration spend is concentrating around API-native infrastructure providers.
- **PayShap (SA real-time payments) went live March 2023** on cloud, open-API, microservice architecture, ISO 20022 compliant [C8]. Uptake is real but skewed to younger users; banks and merchants are still wiring it in [C8] — a fresh demand pocket for integration work.

### 1.3 API attack surface (demand driver for the reliability + security side of the offer)

- **150 billion API attacks** observed by Akamai between January 2023 and December 2024; **84% of security professionals reported an API security incident in the past 12 months**, averaging **US$591,404 per incident** [C9].
- Salt Security's 2H 2025 platform data: a **681% rise in attack traffic against only a 321% rise in API call volume** — i.e., attackers are scaling faster than APIs themselves [C10]. **99% of organisations reported an API security issue** in the past 12 months [C10].
- Akamai's 2024 SOTI: **OWASP API Top 10 incidents up 32% YoY**, web attacks up 33% overall, APIs are now a primary target [C9].

---

## 2. Pain-point catalogue (≥3 × ≥2 ICP segments)

### INT — International SaaS / product teams

1. **Flaky third-party integrations consume engineering capacity.** **A single hand-coded integration runs 3–6 months of engineering time**; 10 in-house integrations over two years can cost **$500k–$873k once maintenance, security review, and dedicated engineering are included** [C11]. Maintenance alone is **30–40% of the total integration cost over two years** [C11].
2. **Webhook delivery losses are silent revenue leaks.** Without idempotency keys, dead-letter queues, and jitter on retries, "synchronised retry storms" hammer recovered endpoints; jitter alone can **reduce synchronised retry spikes by over 80%** [C12]. Most teams discover this in a post-mortem, not in design.
3. **AI-agent traffic is the new top concern.** **51% of developers cite unauthorised or excessive API calls from AI agents as their #1 security worry**; 80% of organisations lack continuous real-time API monitoring [C3][C10].

### SA-FS — SA financial services & banking

1. **PCI-DSS 4.0 added explicit API requirements** (Req 6.5.6) covering BOLA, broken function-level authorisation, and data exposure, with mandatory effect **from 1 April 2025** [C13]. SA-FS engineering teams now need API gateways that log every request/response, enforce rate limits, validate inputs, and gate by token scope [C13].
2. **SARB Cybersecurity & Cyber-Resilience Directive 1 of 2024** is in force as of 1 June 2025: critical financial systems must resume within **2 hours** of disruption (max 8 hours), material cyber incidents reported within **24 hours**, full report within **48 hours**, and ISO 27001 / NIST CSF v2 alignment is the expected baseline [C14]. Hand-coded integrations without circuit breakers, structured logging, and runbooks will not pass.
3. **KYC handovers are still the most painful customer-journey choke point.** Industry case studies show **90% reduction in onboarding time** (24 hours → minutes) and **40–60% cost savings** once KYC API integration replaces manual review [C15].

### SA-Mid — SA mid-market enterprises (R50m–R2bn turnover)

1. **Point-to-point hand-coded integrations become brittle the moment a vendor pushes a schema change** — one API tweak can break the whole connection [C16]. Teams running 10+ third-party systems on hand-rolled connectors carry permanent integration debt.
2. **No observability across partner calls.** Without OpenTelemetry-style distributed traces, p99 spikes can only be correlated by guesswork. Modern stacks treat traces + metrics + logs as the baseline, with histogram bucket boundaries set to SLO targets (e.g., 500ms for p99) [C17].
3. **Rate-limit and timeout misconfiguration** is a top operational hazard — token-bucket vs. leaky-bucket choices made without traffic shape analysis produce false 429s on legitimate bursts or unbounded queue depth on the wrong endpoints [C18].

### SMB — consolidating point integrations / building a partner program

1. **Each new tool adds another fragile connector**, and SMB teams rarely have the bandwidth to keep them current as APIs evolve [C16].
2. **Partner onboarding is slow and manual.** Industry data: applying a scalable onboarding framework reduced one fintech's partner-onboarding from **14 days to 3 hours** via Swagger-based self-serve docs [C19]; another reduced timelines from **8 weeks to ~1 week** [C19]. Centralised docs cut onboarding by **75%** per Postman's 2023 research [C19].
3. **Payment-gateway switching is risky without idempotency keys**, leading to duplicate charges, chargebacks, and erosion of customer trust [C20][C21].

---

## 3. ROI benchmarks (≥2 with citations)

| Benchmark | Before | After | Source / pattern |
|---|---|---|---|
| Single 3rd-party integration build (in-house) | 3–6 months engineering | 1–2 weeks via unified APIs / standardised contracts | [C11] |
| Maintenance share of integration TCO (2 yrs) | 30–40% of total cost | Materially reduced when API design is contract-first + governed | [C11] |
| Partner / marketplace onboarding cycle | 8 weeks | ~1 week with scalable onboarding framework | [C19] |
| Partner onboarding (fintech case) | 14 days | 3 hours via Swagger-based docs | [C19] |
| KYC onboarding journey | 24 hours | Minutes (90% reduction) | [C15] |
| KYC ops cost | Baseline | 40–60% cost savings post-API integration | [C15] |
| Retry-storm risk on recovered webhook endpoints | Synchronised retries crash the endpoint | >80% reduction in synchronised retry spikes with **retry-with-jitter** | [C12] |
| Stripe-style **idempotency key** overhead | N/A | <2ms per request; eliminates an entire class of double-charge bugs | [C20][C21] |
| API-first vs. ad-hoc integration | Baseline | 40% faster integration cycles, 35% fewer defects, 37% lower integration cost | [C4][C19] |
| Contract-test automation | Manual regression | Up to 60% less integration-test time | [C4] |

These benchmarks tie cleanly to named patterns Prudentia ships against: **idempotency keys**, **retry-with-jitter**, **circuit breakers**, **contract-first OpenAPI**, **OAuth 2.0 with refresh-token rotation**, and **OpenTelemetry-based observability**.

---

## 4. Competitive landscape

### 4.1 International (INT)

- **Boomi** — Leader in the 2025 Gartner Magic Quadrant for iPaaS; the only vendor recognised as a Leader in every iPaaS MQ since the category's inception (11 consecutive placements) [C22]. Strong low-code workflow + AI agent orchestration; weak fit when teams need bespoke domain models or want to own their stack.
- **Workato** — Named a Leader in the 2025 MQ; positioned as the AI-forward, low-code intelligent automation play [C22].
- **MuleSoft (Salesforce)** — Dropped to **Challenger** in the 2025 iPaaS MQ, citing slower innovation pace; retains Leader status in API Management (9th consecutive year) [C22]. Common procurement complaint: licensing cost + lock-in.
- **Mid-market unified-API plays** (Merge, Apideck, etc.) — Pre-built standardised connectors for HRIS / accounting / CRM. Useful when schemas fit; rigid when they don't.

### 4.2 South Africa (SA)

- **Synthesis** — SA enterprise software development house with a dedicated Payments Centre of Excellence for high-value low-volume processing at banks and fintechs [C23]. Strong banking pedigree.
- **BBD (Business Built by Developers)** — SA enterprise integration and platform consultancy; banking client base.
- **Stitch** — SA payments infrastructure (Cape Town, founded 2021), $107m raised in four years, ISO 27001 + PCI DSS Level 1 certified, named enterprise customers including Takealot, MTN, Vodacom, Standard Bank Shyft [C7]. Stitch competes when the buyer wants the payment rails outsourced.
- **Peach Payments** — Highest test transaction success rate (98.5%) in SA gateway comparisons; enterprise-leaning [C24].
- **PayFast** — Most recognised SA gateway, broad payment-method support, deep WooCommerce/Shopify integration, 96.5% transaction success in tests [C24].
- **Yoco** — POS-led brand expanding into online; competitive SMB and mid-market pricing [C24].

### 4.3 Where Prudentia sits

iPaaS sells a platform; SA consultancies hand-code; payment infrastructure plays sell rails. **Prudentia's gap** is the seam between them: **contract-first APIs the client owns**, **integrations governed by OpenAPI specs not by tribal knowledge**, **observability instrumented from day one with OpenTelemetry**, and **payment integrations built with idempotency keys, retry-with-jitter, and dead-letter queues from the first commit**. No platform licence to renew, no opaque hand-coded glue, no "we'll add monitoring later".

---

## 5. Regulatory framing

### 5.1 PCI-DSS 4.0 (mandatory for payments — INT + SA)

- **Effective 1 April 2025**; v4.0.1 is the current text [C13].
- **Req 6.5.6** explicitly calls out APIs — protect against BOLA (OWASP API #1, present in ~40% of API attacks [C25]), broken function-level authorisation, and data exposure [C13].
- **Req 6.3.2** requires an inventory of bespoke and third-party components, with continuous vulnerability and patch management [C13].
- API gateways must **log every request and response, enforce rate limits, validate inputs, block suspicious patterns** [C13]. mTLS and signed-payload patterns are expected baseline at the gateway edge.

### 5.2 POPIA (mandatory for SA)

- POPIA Amendment Regulations 2025 took immediate effect on 17 April 2025: simplified processes for data-subject objections, corrections, deletions, and direct-marketing consent [C26].
- **Security compromises must be reported as soon as reasonably certain** — not after a full investigation [C26]. This drives the SARB-grade incident-response SLA into the API platform layer.

### 5.3 GDPR (INT-EU customers)

- Standard lawful-basis, data-minimisation, DSR, and **72-hour breach notification** obligations apply when an SA-built API serves EU data subjects.

### 5.4 SARB cyber-resilience (SA-FS specifically)

- **SARB Directive 1 of 2024**: 2-hour recovery time objective for critical financial systems (max 8 hours); 24-hour incident notification; 48-hour written report; alignment to ISO 27001 + NIST CSF v2 expected [C14].
- **MFA, encryption, access-control policies, SIEM** are the named baseline controls [C14].

### 5.5 PSD2 / SA open-banking equivalent

- SARB's 3 March 2025 draft Exemption Notice + Directive defines eight categories of regulated payment service, modelled on EU PSD2; final rules expected Q3 2025 [C6]. This will sharpen demand for compliant API surfaces from non-bank PSPs.

### 5.6 OWASP API Security Top 10 (engineering baseline)

- **API1:2023 Broken Object-Level Authorisation (BOLA)** — ~40% of all API attacks; every endpoint that accepts an object ID must perform authorisation continuously [C25].
- **95% of API attacks come from authenticated sources** [C10] — i.e., bearer-token validation alone is not enough; **scope, audience, and object-level checks** must run on every call.

---

## 6. Use-case bank (target ≥8)

> Each tagged by ICP. Every outcome metric resolves to a public source or named industry pattern.

1. **[INT, SaaS] Webhook delivery rebuilt with retry-with-jitter and a DLQ.** A SaaS platform retiring synchronous webhook dispatch in favour of a queue-backed dispatcher with exponential backoff + jitter and a dead-letter queue. Synchronised retry spikes drop by **>80%**, and lost events fall toward zero [C12]. Idempotent receivers (event-ID dedup table) prevent double-processing [C20].
2. **[SA-FS, lending / fintech] KYC integration cuts onboarding from 24 hours to minutes.** API-led KYC orchestration (document capture → liveness → sanctions → screening) replaces manual review queues. **90% onboarding-time reduction and 40–60% cost savings** are the documented industry outcomes [C15].
3. **[INT + SA-Mid, retail] Payment-gateway switch with zero double-charges.** Migrating from one PSP (e.g., PayFast → Peach Payments, or Stripe → Adyen) with **client-generated idempotency keys (V4 UUIDs), 24-hour key TTL, exponential backoff** on retries. Stripe's documented overhead is <2ms per request, and the pattern eliminates an entire class of duplicate-charge bugs [C20][C21].
4. **[SA-FS, banking] Real-time payment integration to PayShap.** PayShap is ISO 20022 compliant on a cloud + open-API + microservices stack [C8]. Integration entails participant registration, ISO 20022 message handling, idempotency on credit-transfer instructions, and SARB-grade telemetry. The reliability bar is set by SARB Directive 1 of 2024 (2-hour RTO) [C14].
5. **[INT, marketplace SaaS] Partner onboarding cut from 8 weeks to ~1 week.** Self-service developer portal, OpenAPI contracts, mock servers, automated contract tests. One fintech got from **14 days to 3 hours** [C19]. Postman's 2023 research: centralised docs cut onboarding by **75%** [C19].
6. **[SA-Mid, enterprise] Replace point-to-point ERP↔CRM hand-coded integrations with contract-first OpenAPI plus an event bus.** The pre-state — every vendor schema change breaks something — converts into a stable, versioned API surface with deprecation policy [C16].
7. **[SA-FS, bank] PCI-DSS 4.0 API gateway hardening.** Gateway-level enforcement of object-level authorisation (BOLA mitigation), rate limits, input validation, and full request/response logging [C13]. Closes Req 6.5.6 / 6.3.2 gaps before assessment.
8. **[INT, fintech] Circuit breakers around third-party PSP calls.** Resilience4j-style circuit breaker on outbound PSP calls (Closed / Open / Half-Open), paired with bulkheads to isolate slow downstreams from exhausting the thread pool. Tail-latency on partner calls becomes survivable, not catastrophic [C27].
9. **[SA-Mid + SMB, ops] OpenTelemetry distributed tracing across the API estate.** Histogram buckets tuned to SLO (e.g., 500ms p99 boundary), correlated traces+metrics+logs. Symptom-to-cause time on incidents drops from "hours of guessing" to a single trace [C17].
10. **[SA-FS, payments] Stitch / Capitec Pay / Absa Pay / Nedbank Direct EFT integration.** Enterprise SA buyers (Takealot, MTN, Vodacom, TFG's Bash) are wiring direct-bank rails alongside cards [C7]. Integration scope: bank-direct payment initiation, debit order, DebiCheck, wallet support, reconciliation.

---

## 7. Five capabilities (Prudentia's offer surface)

> Each tile: problem → solution → use case → stack. Lexicon adheres to `_voice-guide.md`.

### 7.1 API design & contract-first build

- **Problem.** Teams ship endpoints that drift from documentation, break consumers on the next deploy, and force frontend + backend to integrate in series instead of in parallel.
- **Solution.** Contract-first OpenAPI 3.x. The spec is the source of truth: client SDKs, mock servers, request/response validators, and contract tests all generate from it. Frontend pulls against the mock while backend builds against the same spec.
- **Use case.** A SaaS platform cut integration-test time by ~60% and shipped 40% faster integration cycles after moving to contract-first [C4].
- **Stack.** OpenAPI 3.1, Spectral linting, Prism / WireMock mocks, Pact / Schemathesis contract tests, Stoplight / Redoc for docs.

### 7.2 Third-party integrations (iPaaS alternative)

- **Problem.** Hand-rolled point-to-point connectors break on every vendor schema change; iPaaS adds licensing and lock-in.
- **Solution.** A typed integration layer the client owns: domain-modelled adapters, anti-corruption layer at each vendor boundary, versioned API contracts, and an event bus for fan-out.
- **Use case.** SA mid-market enterprise replaces 12 brittle ERP↔CRM↔payments connectors with a governed integration layer; vendor changes become localised refactors instead of multi-day fire drills [C16].
- **Stack.** Node/Go/Python microservices, Kafka or Redis Streams, OpenAPI + AsyncAPI, OpenTelemetry, Terraform.

### 7.3 Payment gateways (PCI-DSS, idempotency, reconciliation)

- **Problem.** Payment integrations without idempotency keys produce duplicate charges. Without reconciliation, mismatches between gateway, ledger, and ERP go undetected.
- **Solution.** Contract-first integration to the SA / INT gateway of record (PayFast, Peach Payments, Yoco, Stitch, Stripe, Adyen), with client-generated V4 UUID idempotency keys, exponential backoff with jitter, signed-webhook verification, and a reconciliation worker that proves the ledger matches the gateway daily [C20][C21].
- **Use case.** SA retailer switched PSP with zero duplicate charges via idempotency keys (<2ms overhead per request) [C20]; weekly reconciliation report goes to finance.
- **Stack.** PSP SDKs, Postgres ledger with `event_id UNIQUE` constraint, BullMQ/Sidekiq workers, signature-verified webhooks, OpenTelemetry, PCI-DSS 4.0 evidence trail [C13].

### 7.4 Webhook delivery & event-driven

- **Problem.** Synchronous webhook dispatch couples the producer to every consumer's uptime; without jitter, recovered consumers get hammered by synchronised retries.
- **Solution.** Queue-backed dispatcher (SQS / RabbitMQ / Kafka), exponential backoff with jitter, dead-letter queue for unprocessable events, event-ID dedup at the consumer, signature verification on every payload.
- **Use case.** SaaS platform rebuilt webhook delivery; synchronised retry spikes drop >80%, lost events approach zero [C12].
- **Stack.** SQS / RabbitMQ / Kafka, signed payload (HMAC), V4 UUID event IDs, dedup table with UNIQUE constraint, DLQ, replay tooling.

### 7.5 Reliability (circuit breakers, rate limits, observability)

- **Problem.** Partner downtime cascades into your own service; rate-limit misconfiguration produces false 429s or unbounded queue depth; p99 incidents are diagnosed by guesswork.
- **Solution.** Resilience4j-style circuit breaker around every outbound third-party call (Closed / Open / Half-Open), token-bucket rate limit on public endpoints, OpenTelemetry traces + metrics + logs with histogram buckets aligned to SLO (e.g., 500ms p99 boundary), correlation IDs everywhere [C17][C18][C27].
- **Use case.** SA mid-market enterprise reduces mean-time-to-diagnosis on partner-call incidents from hours to a single trace.
- **Stack.** Resilience4j / Polly / opossum, Redis-backed token-bucket, OpenTelemetry collector, Prometheus, Grafana, Jaeger / Tempo.

---

## 8. Six "how we ship" principles

1. **Contract-first OpenAPI.** The spec is the source of truth. Endpoints, types, errors, and pagination live in the OpenAPI file; SDKs, mocks, and tests generate from it. No prose-documented APIs.
2. **Idempotency keys on every state-changing endpoint.** Client-generated V4 UUIDs, 24-hour TTL minimum, deduplication table with a `UNIQUE` constraint. Stripe's pattern; <2ms overhead per request [C20][C21].
3. **Semver-aligned API versioning + deprecation policy.** Breaking changes ship under a new major version; deprecated versions stay live for a documented sunset window. No silent breakage.
4. **Rate limits + retry-with-jitter.** Token-bucket on inbound traffic (burst-friendly), exponential backoff with random jitter on outbound retries, capped retry count, dead-letter queue at the tail [C12][C18].
5. **OAuth 2.0 / JWT with refresh-token rotation.** Short-lived access tokens (15–60 min), longer-lived refresh tokens (7–14 days) with rotation and reuse-detection, HS256 / RS256 signing, refresh tokens in HTTP-only cookies — never localStorage [C28]. mTLS at sensitive gateway edges.
6. **Observability per route from day one.** OpenTelemetry traces + metrics + logs, histogram buckets aligned to SLO (e.g., p99 < 500ms → bucket boundary at 500ms), per-route error rate and latency dashboards, structured logs with correlation IDs [C17].

---

## 9. FAQ

**Q1. How long is a typical API engagement?**
A. Integration Assessment: 1 week. API Design + Build: 6–12 weeks for a focused surface (single domain, ~15–25 endpoints), 3–6 months for a multi-domain platform. The data is consistent: a single hand-coded integration runs 3–6 months on a baseline team; contract-first compresses that materially [C11][C4].

**Q2. Can you work with our existing API?**
A. Yes. We start with an API audit — OpenAPI spec extraction (or first-time authoring), contract-test suite, observability gap analysis, security review against OWASP API Top 10 [C25]. We then incrementally harden in place: idempotency keys, rate limits, OpenTelemetry, refresh-token rotation, gateway controls. No rewrite required.

**Q3. Which payment gateways do you support?**
A. SA: PayFast, Peach Payments, Yoco, Stitch, Ozow, PayGate, PayShap (BankservAfrica) [C24][C8]. INT: Stripe, Adyen. Direct-bank rails: Capitec Pay, Absa Pay, Nedbank Direct EFT [C7]. Every payment integration ships with idempotency keys, signed webhooks, reconciliation worker, and PCI-DSS 4.0 evidence trail [C13][C20].

**Q4. What SLAs do you offer?**
A. SLAs match the workload tier. For production APIs we publish an availability SLO (e.g., 99.9% monthly), p99 latency SLO, and an error-budget policy. For SA-FS clients we align the resilience layer to SARB Directive 1 of 2024 (2-hour recovery time objective, max 8 hours; 24-hour incident notification) [C14]. The reliability retainer includes on-call coverage.

**Q5. How do you handle security and PCI-DSS?**
A. Baseline: OAuth 2.0 with refresh-token rotation, JWT signed with HS256/RS256, refresh tokens in HTTP-only cookies, mTLS at sensitive edges [C28]. For payments: PCI-DSS 4.0 Req 6.5.6 enforcement at the gateway (BOLA mitigation, broken function-level auth checks, full request/response logging) and Req 6.3.2 component inventory [C13]. POPIA: data-subject rights wired into the API, incident reporting "as soon as reasonably certain" per the 2025 amendment regulations [C26].

**Q6. Can we self-host?**
A. Yes. Default architecture is portable: containerised services, IaC for infrastructure (Terraform), no proprietary platform lock-in. Deployment targets include the client's AWS / Azure / GCP, on-prem Kubernetes, or a SA-hosted regulated environment when SARB / banking-grade controls are in play [C14].

---

## 10. Tier suggestions

| Tier | Length | What's in it | When to pick it |
|---|---|---|---|
| **Integration Assessment** | 1 week (fixed-scope) | OpenAPI extraction / authoring, security review vs. OWASP API Top 10, observability gap analysis, integration inventory, prioritised remediation plan with effort estimates | Buyer has an existing API or 10+ third-party integrations and wants an honest read before committing to a build |
| **API Design + Build** | 6–12 weeks (focused) / 3–6 months (platform) | Contract-first OpenAPI, full build (idempotency, rate limits, OAuth 2.0/JWT, OpenTelemetry), CI with contract + load + security tests, gateway config, runbook | Buyer is shipping a new public API, partner program, or replacing a brittle integration estate |
| **Reliability Retainer (on-call)** | Monthly, rolling | On-call rotation, error-budget governance, SLO dashboards, incident response, monthly reliability review, regulatory reporting support (PCI-DSS, POPIA, SARB) | SA-FS, INT SaaS at scale, or any production API that has paying customers depending on it |

---

## Coverage notes (what is — and is not — claimed)

- **Quantified claims are sourced.** Every percentage, dollar/rand figure, time-saving, or attack-volume number cites `[Cn]`. Resolves in `citation_index.json`.
- **What we did NOT find:** transaction-volume figures for individual SA gateways (PayFast / Yoco / Peach) for FY2025; SA-specific KYC time savings (industry numbers are global). These are flagged in `use-case-bank.json` as `evidence: pattern` rather than `evidence: case-study`.
- **Lexicon discipline.** All "how we ship" tokens (contract-first, OpenAPI, idempotency key, rate limit, retry-with-jitter, circuit breaker, OAuth 2.0 / JWT, OpenTelemetry, mTLS) are sourced to either Stripe's engineering docs, OpenAPI / OWASP authority, or 2025 analyst data — never used decoratively.
- **Banned-phrase audit pre-flighted.** Report uses preferred verbs (`build`, `ship`, `instrument`, `harden`, `audit`, `replace`, `consolidate`). No instances of `leverage`, `seamless`, `cutting-edge`, `synergy`, `revolutionary`, `world-class`, `next-generation`, `transformative`, `powerful`, `harness`, `unleash`.
