(() => {
  'use strict';

  // Topic slug map for every service detail page. Each entry:
  //   label              — short human-readable topic label
  //   serviceName        — the prefix that appears in the form subject line
  //   servicesCheckbox   — the value of the <input name="services"> checkbox to tick (or null to skip)
  //   message            — seed text inserted into the "challenge" textarea
  //
  // Adding a new service? Add the topic slug + 4 fields here. No other change needed.
  const TOPICS = {
    // AI Agent Engineering (existing)
    'ai-general':    { label: 'AI Engineering (general)', serviceName: 'AI Agent Engineering', servicesCheckbox: 'ai-engineering', message: "I'd like to book a strategy session about AI for our business." },
    'ai-agent-loop': { label: 'Agent Loops',              serviceName: 'AI Agent Engineering', servicesCheckbox: 'ai-engineering', message: "I'd like to discuss building an agent loop for our workflows." },
    'ai-rag':        { label: 'Production RAG',           serviceName: 'AI Agent Engineering', servicesCheckbox: 'ai-engineering', message: "I'd like to discuss RAG over our private documents." },
    'ai-evals':      { label: 'Evals',                    serviceName: 'AI Agent Engineering', servicesCheckbox: 'ai-engineering', message: "I'd like to discuss an eval harness for our AI systems." },
    'ai-vector':     { label: 'Vector Databases',         serviceName: 'AI Agent Engineering', servicesCheckbox: 'ai-engineering', message: "I'd like to discuss semantic search / vector databases." },
    'ai-mcp':        { label: 'MCP server',               serviceName: 'AI Agent Engineering', servicesCheckbox: 'ai-engineering', message: "I'd like to discuss building an MCP server." },

    // Web Application Development
    'web-general':         { label: 'Web Application Development (general)', serviceName: 'Web Application Development', servicesCheckbox: 'software-dev', message: "I'd like to book a discovery session about a web application." },
    'web-discovery':       { label: 'Discovery Sprint',                      serviceName: 'Web Application Development', servicesCheckbox: 'software-dev', message: "I'd like a Discovery Sprint to scope a web product." },
    'web-product-build':   { label: 'Product Build',                         serviceName: 'Web Application Development', servicesCheckbox: 'software-dev', message: "I'd like to discuss a production web build." },
    'web-modernisation':   { label: 'Legacy Web App Modernisation',          serviceName: 'Web Application Development', servicesCheckbox: 'software-dev', message: "I'd like to modernise a legacy web application." },
    'web-retainer':        { label: 'Web Engineering Retainer',              serviceName: 'Web Application Development', servicesCheckbox: 'software-dev', message: "I'd like to discuss a web engineering retainer." },

    // Cloud Infrastructure & DevOps
    'cloud-general':              { label: 'Cloud Infrastructure & DevOps (general)', serviceName: 'Cloud Infrastructure & DevOps', servicesCheckbox: 'cloud-devops', message: "I'd like to discuss our cloud infrastructure and DevOps." },
    'cloud-architecture-review':  { label: 'Free Architecture Review',                serviceName: 'Cloud Infrastructure & DevOps', servicesCheckbox: 'cloud-devops', message: "I'd like to book a free cloud architecture review." },
    'cloud-migration':            { label: 'Cloud Migration',                         serviceName: 'Cloud Infrastructure & DevOps', servicesCheckbox: 'cloud-devops', message: "I'd like to discuss a cloud migration." },
    'cloud-kubernetes':           { label: 'Kubernetes Build/Operate',                serviceName: 'Cloud Infrastructure & DevOps', servicesCheckbox: 'cloud-devops', message: "I'd like to discuss a Kubernetes platform engagement." },
    'cloud-cicd':                 { label: 'CI/CD & IaC Setup',                       serviceName: 'Cloud Infrastructure & DevOps', servicesCheckbox: 'cloud-devops', message: "I'd like to discuss CI/CD and Infrastructure-as-Code." },
    'cloud-retainer':             { label: 'Platform Retainer',                       serviceName: 'Cloud Infrastructure & DevOps', servicesCheckbox: 'cloud-devops', message: "I'd like to discuss a platform retainer with on-call coverage." },

    // Data Analytics & Dashboards (no dedicated checkbox; mapped to software-dev as closest fit)
    'data-general':       { label: 'Data Analytics & Dashboards (general)', serviceName: 'Data Analytics & Dashboards', servicesCheckbox: 'software-dev', message: "I'd like to discuss our data and analytics." },
    'data-audit':         { label: 'Data Audit',                            serviceName: 'Data Analytics & Dashboards', servicesCheckbox: 'software-dev', message: "I'd like to book a one-day data audit." },
    'data-dashboards':    { label: 'Dashboard Build',                       serviceName: 'Data Analytics & Dashboards', servicesCheckbox: 'software-dev', message: "I'd like to discuss a dashboard build." },
    'data-pipelines':     { label: 'Data Pipelines',                        serviceName: 'Data Analytics & Dashboards', servicesCheckbox: 'software-dev', message: "I'd like to discuss multi-source data pipelines." },
    'data-ml':            { label: 'ML Categorisation / Reporting Automation', serviceName: 'Data Analytics & Dashboards', servicesCheckbox: 'software-dev', message: "I'd like to discuss ML categorisation or reporting automation." },
    'data-retainer':      { label: 'Analytics Retainer',                    serviceName: 'Data Analytics & Dashboards', servicesCheckbox: 'software-dev', message: "I'd like to discuss an analytics retainer." },

    // Digital Transformation Advisory
    'advisory-general':                       { label: 'Digital Transformation Advisory (general)', serviceName: 'Digital Transformation Advisory', servicesCheckbox: 'advisory', message: "I'd like to discuss a transformation engagement." },
    'advisory-consult':                       { label: 'Transformation Consult',                    serviceName: 'Digital Transformation Advisory', servicesCheckbox: 'advisory', message: "I'd like to schedule a transformation consult." },
    'advisory-architecture-review':           { label: 'Architecture Review',                       serviceName: 'Digital Transformation Advisory', servicesCheckbox: 'advisory', message: "I'd like an architecture review with written ADRs." },
    'advisory-cloud-migration-strategy':      { label: 'Cloud Migration Strategy',                  serviceName: 'Digital Transformation Advisory', servicesCheckbox: 'advisory', message: "I'd like a cloud migration strategy engagement." },
    'advisory-modernisation-roadmap':         { label: 'Legacy Modernisation Roadmap',              serviceName: 'Digital Transformation Advisory', servicesCheckbox: 'advisory', message: "I'd like a legacy modernisation roadmap." },
    'advisory-steering':                      { label: 'Steering Retainer',                         serviceName: 'Digital Transformation Advisory', servicesCheckbox: 'advisory', message: "I'd like to discuss a monthly steering retainer." },

    // API Development & Integration (no dedicated checkbox; mapped to software-dev)
    'api-general':       { label: 'API Development & Integration (general)', serviceName: 'API Development & Integration', servicesCheckbox: 'software-dev', message: "I'd like to discuss API development and integrations." },
    'api-assessment':    { label: 'Free Integration Assessment',             serviceName: 'API Development & Integration', servicesCheckbox: 'software-dev', message: "I'd like to book a free integration assessment." },
    'api-design':        { label: 'API Design & Build',                      serviceName: 'API Development & Integration', servicesCheckbox: 'software-dev', message: "I'd like to discuss contract-first API design and build." },
    'api-integrations':  { label: 'Third-Party Integrations',                serviceName: 'API Development & Integration', servicesCheckbox: 'software-dev', message: "I'd like to discuss third-party integrations." },
    'api-payments':      { label: 'Payment Gateway Integration',             serviceName: 'API Development & Integration', servicesCheckbox: 'software-dev', message: "I'd like to discuss payment gateway integration." },
    'api-retainer':      { label: 'Reliability Retainer',                    serviceName: 'API Development & Integration', servicesCheckbox: 'software-dev', message: "I'd like to discuss an API reliability retainer." },
  };

  const params = new URLSearchParams(window.location.search);
  const topic = params.get('topic');
  if (!topic) return;

  const config = TOPICS[topic];
  if (!config) return;

  const apply = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const subject = form.querySelector('input[name="_subject"]');
    if (subject) {
      subject.value = `${config.serviceName} — ${config.label} — engagement request`;
    }

    let topicField = form.querySelector('input[name="topic"]');
    if (!topicField) {
      topicField = document.createElement('input');
      topicField.type = 'hidden';
      topicField.name = 'topic';
      form.appendChild(topicField);
    }
    topicField.value = topic;

    if (config.servicesCheckbox) {
      const checkbox = form.querySelector(`input[name="services"][value="${config.servicesCheckbox}"]`);
      if (checkbox && !checkbox.checked) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    const challenge = form.querySelector('#ctaChallenge');
    if (challenge && !challenge.value) {
      challenge.value = config.message;
      challenge.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }
})();
