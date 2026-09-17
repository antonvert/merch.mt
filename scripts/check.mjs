import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const html = await readFile(path.join(root, "dist/index.html"), "utf8");
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

console.log(`Checks passed: 1 H1, ${assetMatches.length} local asset references, lead form, metadata and conference copy.`);
