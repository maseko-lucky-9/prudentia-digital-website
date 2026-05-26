/**
 * Contact form — client-side handler
 * Intercepts native POST to /contact-submit, renders inline success/error.
 * No-JS fallback: native POST still works (function returns JSON).
 */
(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const feedback = document.getElementById('ctaFeedback');
  const submitBtn = document.getElementById('ctaSubmit');
  if (!feedback || !submitBtn) return;

  const labelEl = submitBtn.querySelector('span');
  const iconEl = submitBtn.querySelector('svg');
  const originalLabel = labelEl ? labelEl.textContent : '';

  function setFeedback(state, message) {
    feedback.classList.remove('success', 'error');
    if (state) feedback.classList.add(state);
    feedback.textContent = message || '';
  }

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (labelEl) labelEl.textContent = busy ? 'Sending…' : originalLabel;
    if (iconEl) iconEl.style.display = busy ? 'none' : '';
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    setFeedback(null, '');
    setBusy(true);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.ok && payload && payload.ok) {
        setFeedback(
          'success',
          'Thanks — your message is in. We respond within 24 hours, usually sooner.'
        );
        form.reset();
        document.dispatchEvent(new CustomEvent('contact:submitted'));
      } else {
        const message =
          (payload && payload.error) ||
          'Something went wrong on our end. Please email masekolt@prudentiadigital.co.za directly.';
        setFeedback('error', message);
      }
    } catch (err) {
      setFeedback(
        'error',
        'Network error — please check your connection or email masekolt@prudentiadigital.co.za directly.'
      );
    } finally {
      setBusy(false);
    }
  });
})();
