import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const html = await readFile(path.join(root, "dist/index.html"), "utf8");
const editorialHtml = await readFile(path.join(root, "dist/editorial/index.html"), "utf8");
const igamingHtml = await readFile(path.join(root, "dist/igaming/index.html"), "utf8");
const eventCultureHtml = await readFile(path.join(root, "dist/event-culture/index.html"), "utf8");
const failures = [];

const count = (pattern) => (html.match(pattern) || []).length;
if (count(/<h1\b/g) !== 1) failures.push("Homepage must contain exactly one H1.");
if (!html.includes("Your Merch Partner in Malta")) failures.push("Primary positioning is missing.");
if (!html.includes("SiGMA Europe Malta") || !html.includes("SBC Summit Malta") || !html.includes("NEXT Summit Valletta")) {
  failures.push("Featured Malta conferences are missing.");
}
if (html.toLowerCase().includes("produced locally in malta")) failures.push("Disallowed Malta production claim found.");
if (!html.includes('rel="canonical" href="https://merch.mt/"')) failures.push("Canonical URL is missing.");
if (!html.includes('type="application/ld+json"')) failures.push("Structured data is missing.");
if (!html.includes('action="/api/lead"')) failures.push("Lead form endpoint is missing.");
if (html.includes('content="noindex,nofollow"')) failures.push("The base concept must remain indexable.");

for (const [name, variantHtml] of [
  ["Editorial", editorialHtml],
  ["iGaming", igamingHtml],
  ["Event Culture", eventCultureHtml]
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

const sitemap = await readFile(path.join(root, "dist/sitemap.xml"), "utf8");
if (sitemap.includes("/editorial/") || sitemap.includes("/igaming/") || sitemap.includes("/event-culture/")) {
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

console.log(`Checks passed: all four concepts share content, metadata, schema and form behavior.`);
