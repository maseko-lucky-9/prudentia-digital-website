(() => {
  'use strict';

  const TOPICS = {
    'ai-general':    { label: 'AI Engineering (general)', message: "I'd like to book a strategy session about AI for our business." },
    'ai-agent-loop': { label: 'Agent Loops',              message: "I'd like to discuss building an agent loop for our workflows." },
    'ai-rag':        { label: 'Production RAG',           message: "I'd like to discuss RAG over our private documents." },
    'ai-evals':      { label: 'Evals',                    message: "I'd like to discuss an eval harness for our AI systems." },
    'ai-vector':     { label: 'Vector Databases',         message: "I'd like to discuss semantic search / vector databases." },
    'ai-mcp':        { label: 'MCP server',               message: "I'd like to discuss building an MCP server." },
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
      subject.value = `AI Agent Engineering — ${config.label} — strategy session request`;
    }

    let topicField = form.querySelector('input[name="topic"]');
    if (!topicField) {
      topicField = document.createElement('input');
      topicField.type = 'hidden';
      topicField.name = 'topic';
      form.appendChild(topicField);
    }
    topicField.value = topic;

    const message = form.querySelector('#ctaMessage');
    if (message && !message.value) {
      message.value = config.message;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }
})();
