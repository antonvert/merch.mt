# merch.mt — Production handoff

## Production
- Domain: https://merch.mt
- Canonical host: merch.mt
- www redirects to apex
- Cloudflare Worker: `merch-mt`
- Cloudflare account owner: Anton / SWAGGY
- Deployment: GitHub Actions → Cloudflare Workers via Wrangler

## Lead delivery
- Form endpoint: `/api/lead`
- Destination: `order@swaggy.agency`
- Delivery: Cloudflare Email Service / Email Routing
- Worker binding: `LEAD_EMAIL`
- Sender: `leads@merch.mt`
- Existing validation, honeypot and rate limiting are enabled

## Analytics
- Google Analytics 4 Measurement ID: `G-YRCP7PXYYE`
- Existing site events are forwarded to GA4

## SEO / social
- Canonical: `https://merch.mt/`
- Sitemap: `https://merch.mt/sitemap.xml`
- Robots: `https://merch.mt/robots.txt`
- Structured data: Organization, WebSite, WebPage, Service, FAQPage
- Social preview uses the dedicated SWAGGY Open Graph image in `src/assets/images/`

## GitHub Actions secrets
These repository secrets are required for deployment:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

GitHub states repository secrets remain associated with the repository after a transfer, but run one control deployment after ownership transfer.

## Local commands
```bash
npm ci
npm run build
npm run check
npx wrangler deploy
```

## Ownership / operations
After repository transfer to `antonvert`:
1. Accept the transfer from Anton's GitHub email.
2. Confirm Actions are enabled.
3. Confirm repository secrets are still present.
4. Run or trigger one production deployment.
5. Do not recreate a repository at the old owner/name path, because GitHub uses that path for redirects after transfer.
