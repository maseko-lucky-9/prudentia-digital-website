# Topic Slugs — `?topic=` Query Param Map

Every CTA on a service detail page passes a topic slug to the homepage contact form via `/?topic={slug}#contact`. The handler in [`js/contact-prefill.js`](../../js/contact-prefill.js) reads the slug and prefills the form's subject, hidden topic field, services checkbox, and challenge textarea.

**Phase 3 must extend the `TOPICS` object in `contact-prefill.js` with every slug below**, plus refactor the subject-line construction to use the topic's `label` field (currently hardcoded to "AI Agent Engineering — ..."), and make the services-checkbox selector resolve by topic prefix (currently hardcoded to `ai-engineering`).

## Slug taxonomy

`{service-prefix}-{intent}` where:
- `service-prefix`: `web`, `cloud`, `data`, `advisory`, `api` (5 new) + `ai` (existing)
- `intent`: `general` (default top-of-funnel) or capability-specific suffix

## Full slug map

### Web (`/web/`)
| Slug | Label | Services checkbox value |
|---|---|---|
| `web-general` | Web Application Development (general) | `web-development` |
| `web-discovery` | Discovery Sprint | `web-development` |
| `web-product-build` | Product Build | `web-development` |
| `web-modernisation` | Legacy Web App Modernisation | `web-development` |
| `web-retainer` | Web Engineering Retainer | `web-development` |

### Cloud (`/cloud/`)
| Slug | Label | Services checkbox value |
|---|---|---|
| `cloud-general` | Cloud Infrastructure & DevOps (general) | `cloud-devops` |
| `cloud-architecture-review` | Free Architecture Review | `cloud-devops` |
| `cloud-migration` | Cloud Migration | `cloud-devops` |
| `cloud-kubernetes` | Kubernetes Build/Operate | `cloud-devops` |
| `cloud-cicd` | CI/CD & IaC Setup | `cloud-devops` |
| `cloud-retainer` | Platform Retainer | `cloud-devops` |

### Data (`/data/`)
| Slug | Label | Services checkbox value |
|---|---|---|
| `data-general` | Data Analytics & Dashboards (general) | `data-analytics` |
| `data-audit` | Data Audit | `data-analytics` |
| `data-dashboards` | Dashboard Build | `data-analytics` |
| `data-pipelines` | Data Pipelines | `data-analytics` |
| `data-ml` | ML Categorisation / Reporting Automation | `data-analytics` |
| `data-retainer` | Analytics Retainer | `data-analytics` |

### Advisory (`/advisory/`)
| Slug | Label | Services checkbox value |
|---|---|---|
| `advisory-general` | Digital Transformation Advisory (general) | `digital-advisory` |
| `advisory-consult` | Transformation Consult | `digital-advisory` |
| `advisory-architecture-review` | Architecture Review | `digital-advisory` |
| `advisory-cloud-migration-strategy` | Cloud Migration Strategy | `digital-advisory` |
| `advisory-modernisation-roadmap` | Legacy Modernisation Roadmap | `digital-advisory` |
| `advisory-steering` | Steering Retainer | `digital-advisory` |

### API (`/api/`)
| Slug | Label | Services checkbox value |
|---|---|---|
| `api-general` | API Development & Integration (general) | `api-integration` |
| `api-assessment` | Free Integration Assessment | `api-integration` |
| `api-design` | API Design & Build | `api-integration` |
| `api-integrations` | Third-Party Integrations | `api-integration` |
| `api-payments` | Payment Gateway Integration | `api-integration` |
| `api-retainer` | Reliability Retainer | `api-integration` |

### AI (`/ai/` — existing, unchanged)
| Slug | Label | Services checkbox value |
|---|---|---|
| `ai-general` | AI Engineering (general) | `ai-engineering` |
| `ai-agent-loop` | Agent Loops | `ai-engineering` |
| `ai-rag` | Production RAG | `ai-engineering` |
| `ai-evals` | Evals | `ai-engineering` |
| `ai-vector` | Vector Databases | `ai-engineering` |
| `ai-mcp` | MCP server | `ai-engineering` |

## contact-prefill.js refactor required (Phase 3 step 3)

Current code (lines 4-11) only has AI topics. After Phase 3:
1. Extend `TOPICS` with every slug above.
2. Replace the hardcoded subject `"AI Agent Engineering — ${config.label} — strategy session request"` with a derived prefix: e.g., `${config.serviceName} — ${config.label} — engagement request`. Each topic entry gains a `serviceName` field.
3. Replace the hardcoded `input[name="services"][value="ai-engineering"]` selector with `input[name="services"][value="${config.servicesCheckbox}"]`. Each topic entry gains a `servicesCheckbox` field.
4. Each topic entry gains a `message` field with a service-appropriate seed sentence for the challenge textarea.

This single refactor lets the same handler serve all 6 service pages without duplication. The existing `ai-*` topics keep working unchanged because their entries are extended with the new fields, not replaced.
