/**
 * worker.js — Cloudflare Workers Static Assets entrypoint.
 *
 * This project uses Workers Static Assets (wrangler.toml `[assets]`) rather
 * than Cloudflare Pages. In that deploy mode, the `functions/` directory is
 * NOT auto-routed by Cloudflare; only static asset files under `dist/` are
 * served. This worker is the single Worker entrypoint declared via
 * `main = "worker.js"` in wrangler.toml. wrangler bundles this file + its
 * imports (the route handlers under functions/) into a single deployed
 * Worker script. Anything the Worker doesn't match falls through to
 * `env.ASSETS.fetch(request)` — the static-asset binding.
 *
 * NOTE: the folder name `functions/` is preserved for minimal diff. The
 * files there are now Worker route handlers, not Pages Functions, but their
 * named exports (`onRequestPost`, `onRequestGet`) are unchanged so the
 * imports below stay clean.
 */

import { onRequestPost as contactSubmitPost } from './functions/contact-submit.js';
import { onRequestGet as emailHealthGet } from './functions/api/email-health.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const ctxArg = { request, env, ctx };

    if (url.pathname === '/contact-submit' && request.method === 'POST') {
      return contactSubmitPost(ctxArg);
    }
    if (url.pathname === '/api/email-health' && request.method === 'GET') {
      return emailHealthGet(ctxArg);
    }

    // Fall through to the static-asset binding for everything else.
    // This respects `_headers`, serves `dist/404.html` for unknown paths,
    // and handles the regular HTML/CSS/JS/asset serving.
    return env.ASSETS.fetch(request);
  },
};
