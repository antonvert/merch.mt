# merch.mt

One-page, SEO-first lead-generation website for international teams ordering event merchandise for conferences in Malta.

## Project structure

- `src/content.mjs` — editable copy, conferences, categories, FAQ, project gallery and contact details
- `src/styles.css` — complete responsive design system
- `src/themes/editorial.css` — Concept B, the light editorial art direction
- `src/themes/igaming.css` — Concept C, the dark iGaming event-tech art direction
- `src/themes/event-culture.css` — Concept D, the editorial × event-tech hybrid art direction
- `src/themes/production.css` — consolidated production candidate
- `src/script.js` — navigation, analytics events and lead form states
- `src/assets/images` — optimized WebP project photography
- `src/_worker.js` — Cloudflare Worker for lead validation, delivery and static assets
- `scripts/build.mjs` — dependency-free static build
- `dist` — generated Cloudflare Pages output

## Documentation

- [`docs/seo-geo-implementation-report.md`](docs/seo-geo-implementation-report.md) — code-based SEO, GEO/AI Search and post-launch measurement report

## Local development

```bash
npm install
npm run build
npm run check
npm run dev
```

The local Cloudflare preview includes the form function. Without a configured destination, the form intentionally shows a clear preview-mode message and directs the visitor to Telegram or email.

Three visual concepts are generated from the same content and markup:

- `/` — Concept A / Base
- `/editorial/` — Concept B / Editorial Merch
- `/igaming/` — Concept C / iGaming Event Tech
- `/event-culture/` — Concept D / Event Culture
- `/production/` — consolidated production candidate

The three comparison routes and the production candidate include `noindex,nofollow`, share the production canonical, and are intentionally excluded from the sitemap while approval is in progress.

## Lead delivery configuration

Configure at least one destination in Cloudflare Pages. Keep all secrets server-side.

### Generic webhook

- `FORM_WEBHOOK_URL` — destination URL
- `FORM_WEBHOOK_SECRET` — optional bearer token

### Telegram bot

- `TELEGRAM_BOT_TOKEN` — Telegram bot token (secret)
- `TELEGRAM_CHAT_ID` — destination chat ID

The endpoint validates required fields, uses a honeypot and form-age check, applies a lightweight per-IP cooldown, and returns explicit success/error states to the frontend.

## Analytics

The frontend pushes these events to `window.dataLayer`, ready for GA4/GTM once the production measurement setup is approved:

- `hero_cta_click`
- `form_start`
- `form_submit`
- `telegram_click`
- `email_click`
- `project_gallery_view`
- `conference_section_view`

No analytics script or cookie banner is loaded in the preview.

## Cloudflare Workers

The project uses Cloudflare's current Workers static-assets architecture, the modern equivalent recommended for new Pages-style projects. `wrangler.jsonc` serves `dist` globally and sends only `/api/*` through the Worker.

```bash
npm run deploy:preview
npm run deploy:production
```

The temporary preview is deployed to a `workers.dev` address. Connect `merch.mt` only after approval. The canonical URL and sitemap are already prepared for the final domain.

## Before production launch

1. Confirm and configure the final form destination.
2. Connect the `merch.mt` domain and verify the canonical redirect policy in Cloudflare.
3. Add the approved GA4/GTM measurement setup and EU consent implementation.
4. Verify Google Search Console ownership and submit `/sitemap.xml`.
5. Run a final end-to-end form test with the real destination.
