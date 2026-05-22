---
service: Cloud Infrastructure & DevOps
slug: cloud
audience: [INT, SA-FS, SA-Mid, SMB]
status: phase-1-final
retrieved: 2026-05-21
---

# Cloud Infrastructure & DevOps — Evidence Base

Prudentia's cloud offer: Kubernetes, CI/CD pipelines, Terraform, Prometheus / OpenTelemetry monitoring. Cloud-native architectures, IaC setup, deployment pipelines, observability. Homepage anchor: "Zero downtime. Zero guesswork."

## 1. Market sizing & demand

- Global public cloud end-user spending **$723.4B in 2025** (+21.5%); CIPS slice **$301B** (+24.2%); projected **$1.42T by 2029**. [C1]
- SA cloud market **~$6.4B in 2025 → ~$40.1B by 2034** (21.84% CAGR, IMARC) / **~$11.56B by 2029** at 24.4% CAGR (BlueWeave). [C2][C3]
- BFSI leads SA cloud adoption; AWS Africa customers include Absa, Standard Bank, Capitec, Discovery, Investec, Old Mutual. AWS invested **R15.6B since 2018**, pledged **R30.4B through 2029**. [C3][C4]
- Platform engineering: **80% of large software orgs by 2026** (Gartner, up from 45% in 2022). 60%+ of Kubernetes-heavy enterprises run platform teams. [C5][C6]

## 2. Pain-point catalogue (6 pains × 4 ICPs)

| # | Pain | ICPs | Evidence |
|---|---|---|---|
| P1 | Runaway cloud bill — 84% struggle to manage spend; 27-32% waste; budget overruns 17% on avg | INT, SA-FS, SA-Mid | [C7][C8] |
| P2 | Alert fatigue + on-call burnout — 70% of SREs flag it top-3; 85% say alerts mostly false-positive; 65% engineers burnt out | INT, SA-FS, SA-Mid | [C9][C10] |
| P3 | Manual deploys — only 19% of teams reach DORA Elite; medians take 1 week-1 month with 10% change failure | INT, SA-Mid, SMB | [C11][C12] |
| P4 | SA-FS regulator pressure — Joint Standard 2 of 2024 effective 1 June 2025 + SARB D3/2018 + 2025 NPS consultation paper | SA-FS | [C13][C14][C15] |
| P5 | Vendor lock-in — ~1/3 of customers cite switching cost; AWS egress ~$4 500 for 50 TB | INT, SA-FS, SA-Mid | [C16][C17] |
| P6 | Blast-radius outages — 54% cost >$100K; 16% >$1M; Gartner avg $5 600/min; FS hourly cost can exceed $5M; 80% preventable | INT, SA-FS, SA-Mid | [C18][C19] |

## 3. ROI benchmarks

- **B1** DORA Elite vs Low — 2 orders of magnitude on deploy frequency. [C11]
- **B2** DORA Elite MTTR <1hr; Medium <1 day; Low weeks. [C11]
- **B3** FinOps Foundation 2024 — 15-25% spend reduction achievable. [C7]
- **B4** Peer case studies: 30% infra cost reduction (RupeeRedee, The Times, Examity, Intruity). [C20]
- **B5** Capitec on AWS — 1.5T reports/month, 27 PB analytical, 1 000+ technical users. SA banking-grade scale exists. [C21]

## 4. Competitive landscape

**SA:** Synthesis Software Technologies (AWS Premier, 5 Competencies inc. Financial Services + DevOps + Security; banks: Absa, Nedbank, Standard Bank, FNB, Capitec) [C22] · BBD (35-year SA engineering generalist) [C23] · Entelect (FT Top 100 Africa; ran Capitec data migration) [C23][C21] · Vodacom Business / MTN / Dimension Data (telco-led managed services) [C24][C25].

**INT:** Thoughtworks (UK global consultancy, platform engineering) [C26] · Container Solutions (Amsterdam K8s specialist; Shell, Adidas, FiduciaGAD) [C26] · DoiT International (FinOps + FDEs, no junior staff) [C27].

**Prudentia gap:** banking-grade discipline + IaC + observability defaults, delivered by senior practitioners at SA founder-led economics. Synthesis owns SA-FS enterprise procurement; Prudentia serves tier-2 banks, fintech, SA mid-market, INT SaaS scaleups without enterprise-consulting overhead.

## 5. Regulatory framing

- **POPIA s.72** — cross-border PI transfer requires substantially-similar protection / consent / contract necessity / binding agreement. Cloud provider = operator. National Data and Cloud Policy May 2024 keeps national-security data in-country. [C28]
- **SARB / PA Directive 3 of 2018** — cloud outsourcing for banks (notification + accountability + inspectability). 2025 NPS consultation paper expanding scope. [C13][C29] (Brief's "D9/2022" not located — D3/2018 is the live instrument.)
- **Joint Standard 2 of 2024** (FSCA + PA) — commenced **1 June 2025**: MFA on critical systems, quarterly resilience testing including cloud vendors, 24hr incident reporting, encrypted backups. [C14][C15]
- **BCBS 239** — 14 principles, ECB RDARR Guide May 2024, supervisory priority 2025-2027. [C31]
- **SOC 2 / ISO 27001:2022** — adoption +40% in 2024; 60%+ buyers prefer SOC2-compliant vendors. [C32]

## 6. Use-case bank (9 cases — see `use-case-bank.json`)

UC-1 Capitec → AWS Amazon Connect 600+ agents in 5 days [SA-FS]. UC-2 Capitec 15-yr EDL migration [SA-FS]. UC-3 Greenfield SOC 2-ready SaaS on AWS [INT]. UC-4 SA mid-market 30% cost reduction via FinOps [SA-Mid]. UC-5 INT SaaS active-active EU+US [INT]. UC-6 SA insurer Joint Standard 2 of 2024 readiness [SA-FS]. UC-7 SA retailer observability rebuild — alert volume -70% [SA-Mid]. UC-8 INT fintech SOC 2 Type II in 6-week prep [INT]. UC-9 SMB managed-K8s with FinOps guardrails [SMB].

## 7. Five-capability brainstorm

### Capability 1 — Cloud architecture review & strategy
Problem. Cloud bills run away. Reliability slips. The team builds new things faster than they understand the existing system. Outages cost an average of $5 600/minute (Gartner), more for financial services.
Solution. Workshop the current state through a Well-Architected lens (AWS / Azure CAF / GCP). Document target architecture in ADRs. Land a 90-day remediation plan with named owners.
Use case. SA mid-market manufacturer mid-Azure migration with no clear destination — 6-week review surfaces 12 ADR-grade decisions, kills 2 dead-end projects, recovers an estimated 22% of forecast spend.
Stack. ADRs, Wardley maps, Well-Architected workbooks.

### Capability 2 — Kubernetes platform engineering
Problem. K8s adoption hits a wall at "developer self-service." Teams want a paved road; ops can't carry the cognitive load of supporting ten different deployment patterns.
Solution. Paved-road IDP. Golden-path Helm charts, ArgoCD GitOps, SLO-defined service contracts, policy-as-code gates. Developers ship without filing a ticket; ops sleep.
Use case. INT SaaS migrates 12 services to a paved-road platform in 8 weeks; deploy frequency from weekly to per-PR; CFR drops below 10%.
Stack. K8s, ArgoCD, Backstage, cert-manager, OPA/Kyverno, External Secrets Operator.

### Capability 3 — Multi-region migration & resilience
Problem. Single-region production until a regulator asks about resilience or an AZ outage takes you offline for 6 hours. SA-FS regulator (Joint Standard 2 of 2024) demands quarterly resilience tests including cloud vendors.
Solution. Design the topology — active-passive or active-active. Land the data-replication strategy. Run quarterly failover drills with documented RPO and RTO. Write the runbook your CIO will be asked for.
Use case. SA-FS payments processor moves to active-passive CT+JNB; documented RPO < 5 min, RTO < 30 min; Joint-Standard-aligned.
Stack. Terraform, Route 53 or Azure Traffic Manager, Aurora Global / Cosmos DB, Velero for stateful failover.

### Capability 4 — CI/CD & Infrastructure-as-Code
Problem. Manual deploys, console clicks in production, "works on my laptop" infra. Config drift is invisible until something breaks.
Solution. Terraform / OpenTofu modules versioned and reviewed. GitOps for K8s state. Progressive delivery — canary, blue/green, feature flags. Policy-as-code on every PR.
Use case. SA mid-market lifts 6 services to IaC over 6 weeks; production config change goes from 2 days to 20 minutes; CFR halves.
Stack. Terraform, ArgoCD, Argo Rollouts, Conftest/OPA, GitHub Actions / GitLab CI.

### Capability 5 — Observability & on-call discipline
Problem. Alert fatigue. Pages firing for symptoms, not causes. Engineers burnt out. MTTR climbing because no one knows where to look.
Solution. SLIs, SLOs, error budgets. Burn-rate alerts, not symptom alerts. OpenTelemetry traces, structured logs, RED + USE metrics. A runbook per pageable alert. Humane on-call rotation.
Use case. INT SaaS observability rebuild — alert volume -70%, MTTR 4hr → <1hr, on-call satisfaction up from 2/5 to 4/5.
Stack. Prometheus / Grafana / Loki / Tempo, OpenTelemetry, PagerDuty.

## 8. "How we ship" — six principles

### 1. SLO-first, alert-second
Body. We define service-level objectives before we wire alerts. Pages fire on burn rate of the error budget, not raw symptoms. False-positive rate stays low, MTTR drops, on-call sleeps.
Tagline. Page on what matters.

### 2. Infrastructure-as-Code is the API
Body. Terraform modules are versioned, reviewed, applied via pipeline. No console clicks in production. State is auditable; rollback is git revert.
Tagline. No clicks in prod.

### 3. Limit blast radius by default
Body. Multi-AZ for state, multi-region for critical paths, IAM segregation, feature flags, canary or blue/green deploys. The worst day is bounded.
Tagline. The worst day is bounded.

### 4. Observability wired before launch
Body. OpenTelemetry spans, structured logs, RED + USE metrics, distributed traces, synthetic probes from outside the network. You see how it behaves in production, not how it behaved in a demo.
Tagline. You see it. You own it.

### 5. Secrets live in a vault
Body. External-secrets-operator + Vault / AWS Secrets Manager / Azure Key Vault. Rotation automated and audited. mTLS between internal services. No secrets in env files, ever.
Tagline. Secrets in a vault, not in a repo.

### 6. Runbooks live in the repo and on-call is humane
Body. Every pageable alert links to a markdown runbook in the same repo as the code. Rotation respects the Google SRE benchmark of 2-3 actionable incidents per shift. On-call is a craft, not a punishment.
Tagline. Direct line, no relay.

## 9. FAQ

**Q1. How long is a typical engagement?**
Architecture reviews two to four weeks. Migration or greenfield platform builds eight to sixteen weeks. Platform retainers monthly with a 90-day minimum.

**Q2. Where does our data live, and how do you handle POPIA?**
SA data stays in the AWS Cape Town or Azure South Africa North region by default. Cross-border replication requires a documented POPIA Section 72 basis and a signed binding agreement.

**Q3. Do you provide on-call coverage and SLAs?**
Yes, on the Platform Retainer tier. We share a rotation with your engineers, define SLIs and SLOs, and respond on a target MTTR. SLAs are written, with credits for missed targets.

**Q4. Can you build active-active across multiple regions?**
Yes. We design the topology, handle data replication and consistency trade-offs, and run quarterly failover drills with documented RPO and RTO.

**Q5. What's the pricing model — fixed-fee or T&M?**
Architecture Review is fixed-fee. Migration / Greenfield Build is fixed-fee per phase with named deliverables. Platform Retainer is monthly with a documented capacity envelope.

**Q6. How do we exit if we want to take this in-house?**
Everything is in your repos, your cloud account, your secrets vault, your monitoring stack. We document handover, run two weeks of shadow on-call with your team, and exit. No proprietary lock-in.

## 10. Tier suggestions

| Tier | Scope | Output | Duration |
|---|---|---|---|
| Cloud Architecture Review | Workshop current state; Well-Architected lens; target architecture + ADRs + 90-day plan | Architecture doc + ADR set + plan | 2-4 weeks |
| Migration / Greenfield Platform Build | Land target architecture; IaC + CI/CD + K8s + observability wired from day one; SOC 2 / Joint-Standard-ready scaffold | Production platform + runbooks + handover | 8-16 weeks |
| Platform Retainer + On-Call | Operate platform alongside client team; quarterly DR drill; monthly FinOps review; continuous IaC hygiene | Monthly platform health report + SLO dashboard + on-call coverage | Monthly, 90-day minimum |

## 11. Guardrails for the Phase 2 writer

- SARB references: use **D3/2018** for cloud outsourcing (not the brief's "D9/2022", which was not found) and **Joint Standard 2 of 2024** for cyber resilience.
- Acknowledge Synthesis as the SA-FS incumbent; do not over-claim banking client work that belongs to Synthesis / Entelect / NTT.
- DORA elite-rate (19%), Flexera waste (27-32%), Gartner downtime ($5 600/min), Joint Standard 2 of 2024 effective date (1 June 2025), and Capitec scale (1.5T reports/month) are the strongest direct-quotable anchors.
- Voice-guide compliance: avoid "leverage / seamless / world-class / cutting-edge"; prefer "instrument / harden / replace / restore"; sentence avg ≤22 words.
