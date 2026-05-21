# Research Brief — Service Detail Pages

Shared research scaffold for the 5 new service detail pages. Each `docs/research/{slug}/report.md` must satisfy the floor below before Phase 2 page authoring can start.

## ICP Matrix (audience the use cases must serve)

| Code | Segment | Why it matters | Buying patterns | Regulatory posture |
|---|---|---|---|---|
| **INT** | International SaaS / mid-market | Largest TAM. Pays in USD/GBP/EUR. Often Series-A → Series-D, North America + EU. | Outcome-driven, RFP-light, expects published case studies and benchmarks. | SOC2, ISO27001, GDPR. |
| **SA-FS** | SA financial services & banking | Regulator-heavy. High-touch enterprise sales. Builds trust with named past engagements (Capitec / Absa / E4 lineage matters). | Long procurement (6-12 months). Demands tested vendor due diligence. | POPIA, FAIS, PA Directive 2/2025 (cyber resilience), banking-grade controls. |
| **SA-Mid** | SA mid-market enterprises (R50m-R2bn turnover, cross-industry) | Volume opportunity. Retail, logistics, healthcare, manufacturing, professional services. | Lighter procurement, decision-maker is usually CTO/COO/MD. Wants quick wins + measurable ROI. | POPIA. Sometimes ISO9001 / industry-specific. |
| **SMB** | SMB digital-transformation laggards (R5m-R50m, owner-operated) | High volume, lower deal size. Spreadsheet-and-email native. | Founder-decision. Low-touch. Wants packaged offers, not bespoke. | POPIA-aware but rarely audited. |

Each service detail page must surface at least one named use case per ICP segment present in its target. Use the `Scope & Targets` table in the plan to decide which ICPs are in-scope for each service.

## Universal Research Pipeline (URP) per-service config template

```yaml
# docs/research/{slug}/research-config.yaml
objective: |
  Build evidence base for the Prudentia Digital "{Service Name}" detail page.
  Audience: International SaaS, SA financial services, SA mid-market, SMB digital-transformation laggards.
  Output: report.md + citation_index.json honoring the minimum-viable-research floor.

audience: [INT, SA-FS, SA-Mid, SMB]   # adjust per service per the Scope & Targets table

dimensions:
  - market-sizing                # spend, growth, vendor consolidation
  - pain-points                  # operational pains per ICP
  - roi-benchmarks               # cycle-time, cost, downtime, conversion
  - competitive-landscape        # named INT + SA competitors
  - regulatory-framing           # POPIA, GDPR, SOC2, ISO27001, banking-grade
  - use-cases                    # quantified, ICP-tagged

tools:
  primary: [WebSearch, WebFetch]   # built-in only — MCP unavailable to subagents
  forbidden: [firecrawl, exa-web-search, apify, gemini-mcp]   # orchestrator-only pre-seed, never inside collectors

tier_routing:
  T1: [analyst reports (Gartner, Forrester, IDC), vendor docs, regulator publications]
  T2: [industry press, conference talks, peer-reviewed benchmarks]
  T3: [blog posts, vendor case studies, community discussion — used only to corroborate, never alone]

stall_handling:
  - if a dimension yields < floor after 3 query iterations, narrow the scope (e.g., "SA banking" instead of "financial services")
  - if still under floor after 5 iterations, escalate to orchestrator with the gap surfaced — do NOT fabricate

output:
  - report.md
  - citation_index.json
  - use-case-bank.json
  - seed-urls.json   # optional, populated by orchestrator if MCP pre-seed was used
```

## Minimum-Viable-Research Floor (per service)

Phase 1 cannot complete unless every dimension hits its floor. Phase 2 cannot start with research below floor.

| Dimension | Floor | What "good" looks like |
|---|---|---|
| Market sizing & demand | ≥3 cited data points | Spend figures from ≥2 analysts + 1 SA-specific signal (e.g., local banking IT spend, SARB digital adoption rate). |
| Pain-point catalogue | ≥3 pains × ≥2 ICP segments | Each pain quoted/paraphrased from a named source (operator survey, vendor pain-finder, regulator report). |
| ROI benchmarks | ≥2 benchmarks with citations | Before/after metric pairs (e.g., "deployment time 6 weeks → 4 days"). Source must be a public case study or analyst note. |
| Competitive landscape | ≥1 INT + ≥1 SA competitor | Named, with positioning summary + the gap Prudentia can occupy. |
| Regulatory framing | ≥1 framework per applicable region | POPIA (mandatory for SA), GDPR (if INT-EU), SOC2/ISO27001 (if INT or SA-FS), banking-grade controls (if SA-FS). |
| Use-case bank | ≥4 (target ≥8) | Each tagged INT / SA-FS / SA-Mid / SMB, problem stated, intervention summarised, outcome quantified, source cited. |
| Citation index | 100% coverage | Every quantified claim mapped to URL + retrieval date. Uncited claims rejected. |

## POPIA / GDPR / Banking-grade posture (shared context)

- **POPIA (SA, mandatory)** — Process personal information lawfully, with consent, for specified purposes. Operators must register with the Information Regulator. Data retention defaults to 7 days for pilots (Prudentia house rule, matches AI page).
- **GDPR (EU/UK, applies if INT customer in EU)** — Lawful basis, data minimisation, DSR rights, breach notification ≤ 72hrs.
- **SOC2 / ISO27001** — Control framework for service organisations. Required for INT enterprise + SA-FS procurement.
- **Banking-grade (SA-FS specifically)** — PA Directive 2/2025 (cyber resilience), BCBS 239 (data aggregation), South African Reserve Bank D9/2022 (cloud). Architecture must support segregation, audit logs, key custody, and named approvers.

Per-service research must surface ≥1 applicable framework with a citation. If the service is regulatorily neutral, document why (e.g., "Advisory engagements produce ADRs and roadmaps, not data flows, so direct POPIA exposure is limited").

## Source allowlist (T1 starting points)

When in doubt, start from these — they reliably yield T1 evidence:

- gartner.com, forrester.com (analyst notes — paywalled but headlines/excerpts are cite-worthy)
- mckinsey.com, bcg.com (consultancy reports, freely published)
- statssa.gov.za, bankservafrica.com, sarb.co.za (SA economic + financial data)
- popia.co.za, justice.gov.za (POPIA primary source)
- aws.amazon.com/architecture, cloud.google.com/architecture, learn.microsoft.com (cloud reference architectures)
- thoughtworks.com/insights/blog/tech-radar (technology landscape)
- web.dev, baseline.google.dev (web platform standards)
- owasp.org (security)
- popi-act.co.za (SA-specific privacy)

Per-service brief should add 3-5 service-specific T1 sources beyond these (e.g., martechalliance.com for data, postman.com/state-of-api for API).
