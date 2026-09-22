import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const html = await readFile(path.join(root, "dist/index.html"), "utf8");
const editorialHtml = await readFile(path.join(root, "dist/editorial/index.html"), "utf8");
const igamingHtml = await readFile(path.join(root, "dist/igaming/index.html"), "utf8");
const eventCultureHtml = await readFile(path.join(root, "dist/event-culture/index.html"), "utf8");
const productionHtml = await readFile(path.join(root, "dist/production/index.html"), "utf8");
const productionCss = await readFile(path.join(root, "dist/assets/themes/production.css"), "utf8");
const wranglerConfig = await readFile(path.join(root, "wrangler.jsonc"), "utf8");
const workerSource = await readFile(path.join(root, "src/_worker.js"), "utf8");
const failures = [];

const count = (pattern) => (html.match(pattern) || []).length;
if (count(/<h1\b/g) !== 1) failures.push("Homepage must contain exactly one H1.");
if (!html.includes("Your Merch Partner in Malta")) failures.push("Primary positioning is missing.");
if (!html.includes("SiGMA Europe Malta") || !html.includes("SBC Summit Malta") || !html.includes("NEXT Summit Valletta")) {
  failures.push("Featured Malta conferences are missing.");
}
if (html.toLowerCase().includes("produced locally in malta")) failures.push("Disallowed Malta production claim found.");
if (!html.includes('rel="canonical" href="https://merch.mt/"')) failures.push("Canonical URL is missing.");
if (!html.includes('og:image" content="https://merch.mt/assets/images/og-swaggy-merchandise-malta-social-v6.jpg"')) {
  failures.push("Updated SWAGGY social preview image is missing.");
}
if (!html.includes('og:image:type" content="image/jpeg"') || !html.includes('og:image:width" content="600"') || !html.includes('og:image:height" content="315"')) {
  failures.push("Social preview Open Graph image metadata is incomplete.");
}
if (!html.includes('type="application/ld+json"')) failures.push("Structured data is missing.");
if (!html.includes('https://www.googletagmanager.com/gtag/js?id=G-YRCP7PXYYE')) {
  failures.push("GA4 Google tag is missing from the production homepage.");
}
if (!html.includes('/assets/script.js')) failures.push("Production analytics bootstrap script is missing.");
if (!html.includes('action="/api/lead"')) failures.push("Lead form endpoint is missing.");
if (html.includes('content="noindex,nofollow"')) failures.push("The root production homepage must remain indexable.");
if (!html.includes('/assets/themes/production.css')) failures.push("The root homepage must use the production theme stylesheet.");
if (!html.includes('class="theme-production"')) failures.push("The root homepage must render the production theme.");
if (!wranglerConfig.includes('"name": "merch-mt"')) failures.push("Production Worker must be named merch-mt.");
if (!wranglerConfig.includes('"pattern": "merch.mt"') || !wranglerConfig.includes('"pattern": "www.merch.mt"')) {
  failures.push("Production custom domains merch.mt and www.merch.mt must be configured.");
}
if (!workerSource.includes('url.hostname === "www.merch.mt"')) {
  failures.push("www.merch.mt canonical redirect is missing.");
}
const clientScript = await readFile(path.join(root, "dist/assets/script.js"), "utf8");
if (!clientScript.includes('G-YRCP7PXYYE') || !clientScript.includes('window.gtag("config", GA_MEASUREMENT_ID)')) {
  failures.push("Production JS must initialize GA4 with G-YRCP7PXYYE.");
}
if (!clientScript.includes('window.gtag("event", event, details)')) {
  failures.push("Custom site events must be forwarded to GA4.");
}
if (!wranglerConfig.includes('"name": "LEAD_EMAIL"') || !wranglerConfig.includes('"destination_address": "order@swaggy.agency"')) {
  failures.push("Lead email binding must target order@swaggy.agency.");
}
if (!workerSource.includes("env.LEAD_EMAIL") || !workerSource.includes("leads@merch.mt")) {
  failures.push("Lead form must deliver by Cloudflare Email Service.");
}
if (workerSource.includes("TELEGRAM_BOT_TOKEN") || workerSource.includes("FORM_WEBHOOK_URL")) {
  failures.push("Legacy Telegram/webhook lead delivery should not remain in production.");
}
if (!productionCss.includes("--blue: #2638cf") || !productionCss.includes("background: #1d1e20")) {
  failures.push("Production palette must use the approved blue + charcoal system.");
}
if (
  productionCss.includes("--lime:") ||
  productionCss.includes("#c9ff3f") ||
  productionCss.includes("#91bd13") ||
  productionCss.includes("#f2ffd0") ||
  productionCss.includes("#5657e9") ||
  productionCss.includes("#ff5b2e")
) {
  failures.push("Legacy lime/orange/periwinkle production colors are still present.");
}
for (const timingLabel of ['content: "T–21+"', 'content: "T–14"', 'content: "<T–14"']) {
  if (!productionCss.includes(timingLabel)) failures.push(`Production timing marker missing: ${timingLabel}`);
}
if (!html.includes("Let's Make Merch") && !html.includes("Let’s Make Merch")) failures.push("Production CTA copy is missing.");
if (html.includes("Get a Quote")) failures.push("Legacy Get a Quote CTA is still present on the production homepage.");
if (!html.includes('name="need"') || !html.includes('<textarea name="need"')) failures.push("Simplified required brief textarea is missing.");
for (const removedField of ['name="eventDate"', 'name="quantity"', 'name="budget"', 'name="message"']) {
  if (html.includes(removedField)) failures.push(`Legacy form field remains on production homepage: ${removedField}`);
}

const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || "";
const metaDescription = html.match(/<meta name="description" content="([^"]+)">/)?.[1] || "";
if (title.length < 30 || title.length > 60) failures.push("SEO title should stay between 30 and 60 characters.");
if (metaDescription.length < 120 || metaDescription.length > 160) {
  failures.push("Meta description should stay between 120 and 160 characters.");
}

const searchableHtml = html.toLowerCase();
for (const phrase of [
  "event &amp; conference merchandise malta",
  "branded event merchandise",
  "promotional products",
  "igaming conference merchandise",
  "sigma malta merchandise",
  "sbc malta merchandise",
  "next valletta merchandise",
  "merchandise supplier in malta",
  "order merch for a malta event"
]) {
  if (!searchableHtml.includes(phrase)) failures.push(`SEO topic is missing from the page: ${phrase}`);
}

for (const [name, variantHtml] of [
  ["Editorial", editorialHtml],
  ["iGaming", igamingHtml],
  ["Event Culture", eventCultureHtml],
  ["Production", productionHtml]
]) {
  if ((variantHtml.match(/<h1\b/g) || []).length !== 1) failures.push(`${name} must contain exactly one H1.`);
  if (!variantHtml.includes('<meta name="robots" content="noindex,nofollow">')) {
    failures.push(`${name} must be excluded from search indexing.`);
  }
  if (!variantHtml.includes('rel="canonical" href="https://merch.mt/"')) {
    failures.push(`${name} must keep the production canonical.`);
  }
  if (!variantHtml.includes('type="application/ld+json"')) failures.push(`${name} structured data is missing.`);
  if (!variantHtml.includes('action="/api/lead"')) failures.push(`${name} lead form endpoint is missing.`);
  const themeSlug = name.toLowerCase().replaceAll(" ", "-");
  if (!variantHtml.includes(`/assets/themes/${themeSlug}.css`)) failures.push(`${name} theme stylesheet is missing.`);
  for (const text of ["Your Merch Partner in Malta", "SiGMA Europe Malta", "SBC Summit Malta", "NEXT Summit Valletta"]) {
    if (!variantHtml.includes(text)) failures.push(`${name} is missing shared content: ${text}`);
  }
}

const productionCount = (pattern) => (productionHtml.match(pattern) || []).length;
if (productionCount(/<h2\b/g) !== 6) failures.push("Production must contain exactly six H2 sections.");
if (productionCount(/class="production-proof__card"/g) !== 6) {
  failures.push("Production proof gallery must contain exactly six projects.");
}
if (productionCount(/class="category-card"/g) !== 6) {
  failures.push("Production merchandise section must contain exactly six categories.");
}
if (productionCount(/class="benefit-card"/g) !== 4) {
  failures.push("Production operations scene must contain exactly four benefits.");
}
if (productionCount(/class="timeline__item/g) !== 3) {
  failures.push("Production operations scene must contain exactly three lead-time rows.");
}
if (productionCount(/data-observe-event="project_gallery_view"/g) !== 1) {
  failures.push("Production must contain exactly one project gallery.");
}
if (productionCount(/class="faq-item"/g) !== 6 || productionCount(/<details[^>]*\sopen(?:\s|>)/g) !== 0) {
  failures.push("Production FAQ must contain six collapsed questions.");
}
for (const requiredClass of ["merch-process-line", "production-event-scene", "production-ops-scene", "production-process-line"]) {
  if (!productionHtml.includes(`class="${requiredClass}`)) {
    failures.push(`Production compact scene is missing: ${requiredClass}`);
  }
}
for (const removedCopy of ["More real work.", "You focus on the event.", "Built with iGaming pace."]) {
  if (productionHtml.includes(removedCopy)) failures.push(`Production still contains removed duplicate scene: ${removedCopy}`);
}
for (const anchor of ['id="projects"', 'id="merchandise"', 'id="conferences"', 'id="process"', 'id="quote"']) {
  if (!productionHtml.includes(anchor)) failures.push(`Production navigation anchor is missing: ${anchor}`);
}

const sitemap = await readFile(path.join(root, "dist/sitemap.xml"), "utf8");
if (sitemap.includes("/editorial/") || sitemap.includes("/igaming/") || sitemap.includes("/event-culture/") || sitemap.includes("/production/")) {
  failures.push("Noindex variants must not appear in the sitemap.");
}

const assetMatches = [...html.matchAll(/(?:src|href)="(\/(?:assets\/[^"?#]+|favicon\.svg|apple-touch-icon\.png))"/g)];
for (const [, asset] of assetMatches) {
  try {
    await access(path.join(root, "dist", asset));
  } catch {
    failures.push(`Missing local asset: ${asset}`);
  }
}

if (failures.length) {
  console.error(failures.map((item) => `• ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Checks passed: the production homepage and review variants share content, metadata, schema and form behavior.`);
