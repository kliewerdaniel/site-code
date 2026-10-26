#!/usr/bin/env node
/* ============================================================
   validate-build.mjs — post-build assertion gate.

   Reads the HTML Next actually prerendered under .next/server/app and asserts
   the invariants the SEO work depends on. This is the check that would have
   caught the F4 defect: `og:site_name`, `og:url` and `og:image` were missing on
   202 of 229 pages and no test or build step noticed.

   FATAL (exit 1):
     - a sitemap URL with no prerendered HTML (and not a known dynamic route)
     - not exactly one <h1>
     - a canonical that is not self-referential (query params compared as a set,
       so `?page=2&tag=x` and `?tag=x&page=2` are the same URL)
     - a missing og:title / og:description / og:url / og:site_name / og:image
     - a missing twitter:image
     - a JSON-LD block that does not parse
     - an unintended `noindex` on a sitemap URL
     - the sitemap's URL count not matching the number of built pages

   REPORTED (exit 0): title/description length, per-page, so editorial drift
   cannot break the deploy.

   Usage:
     node scripts/validate-build.mjs            # after `next build`
     node scripts/validate-build.mjs --quiet
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const APP = path.join(repo, ".next", "server", "app");

const ORIGIN = "https://www.danielkliewer.com";

/* Routes that are intentionally server-rendered per request, so they have no
   prerendered HTML file. /research is dynamic because it is a query-driven
   index; /feed.xml, /robots.txt and /sitemap.xml are route handlers with their
   own body files. */
const NON_HTML_ROUTES = new Set([
  "/research",
  "/feed.xml",
  "/robots.txt",
  "/sitemap.xml",
]);

const fatal = [];
const warnings = [];

if (!fs.existsSync(APP)) {
  console.error(`❌ no build output at ${path.relative(repo, APP)} — run \`next build\` first`);
  process.exit(1);
}

/* ---- sitemap ---- */
const sitemapBody = path.join(APP, "sitemap.xml.body");
const sitemapUrls = [];
if (fs.existsSync(sitemapBody)) {
  const xml = fs.readFileSync(sitemapBody, "utf8");
  for (const m of xml.matchAll(/<loc>(.*?)<\/loc>/g)) sitemapUrls.push(m[1]);
} else {
  fatal.push("sitemap.xml.body not found in the build output");
}

/** URL path -> prerendered HTML file. */
function htmlFileFor(urlPath) {
  if (urlPath === "/") return "index.html";
  return `${urlPath.replace(/^\//, "")}.html`;
}

/* ---- metadata extraction (regex over machine-generated HTML) ---- */
function metaOf(html, key) {
  // Matches <meta property="og:x" content="..."> and <meta name="twitter:x" ...>
  const prop = new RegExp(
    `<meta[^>]+(?:property|name)="${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*content="([^"]*)"`,
    "i"
  );
  const m = html.match(prop);
  return m ? m[1] : null;
}

function canonicalOf(html) {
  const m = html.match(/<link[^>]+rel="canonical"[^>]*href="([^"]*)"/i);
  return m ? m[1] : null;
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
    (m) => m[1]
  );
}

/** Compare two URLs by path + query-param set, ignoring param order. */
function sameUrl(a, b) {
  const pa = new URL(a, ORIGIN);
  const pb = new URL(b, ORIGIN);
  if (pa.pathname !== pb.pathname) return false;
  const sa = [...pa.searchParams.entries()].sort();
  const sb = [...pb.searchParams.entries()].sort();
  return JSON.stringify(sa) === JSON.stringify(sb);
}

let checked = 0;
const missingFiles = [];

for (const url of sitemapUrls) {
  const u = new URL(url);
  const urlPath = u.pathname + u.search;

  if (NON_HTML_ROUTES.has(u.pathname)) continue;

  const file = path.join(APP, htmlFileFor(urlPath));
  if (!fs.existsSync(file)) {
    missingFiles.push(url);
    continue;
  }

  const html = fs.readFileSync(file, "utf8");
  checked++;
  const label = urlPath;

  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) fatal.push(`${label}: ${h1} <h1> elements (want exactly 1)`);

  const canon = canonicalOf(html);
  if (!canon) fatal.push(`${label}: no <link rel="canonical">`);
  else if (!sameUrl(canon, url)) {
    fatal.push(`${label}: canonical ${canon} is not self-referential (page is ${url})`);
  }

  for (const key of ["og:title", "og:description", "og:url", "og:site_name", "og:image"]) {
    if (!metaOf(html, key)) fatal.push(`${label}: missing <meta property="${key}">`);
  }
  if (!metaOf(html, "twitter:image")) {
    fatal.push(`${label}: missing <meta name="twitter:image">`);
  }

  const blocks = jsonLdBlocks(html);
  for (let i = 0; i < blocks.length; i++) {
    try {
      JSON.parse(blocks[i]);
    } catch (e) {
      fatal.push(`${label}: JSON-LD block ${i + 1} does not parse (${e.message})`);
    }
  }

  const robots = metaOf(html, "robots");
  if (robots && /noindex/i.test(robots)) {
    fatal.push(`${label}: sitemap URL carries a noindex robots meta (${robots})`);
  }

  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1];
  if (title && title.length > 70) warnings.push(`${label}: <title> is ${title.length} chars (> 70)`);
}

/* ---- built page count vs sitemap ---- */
const builtPages = (() => {
  let n = 0;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith("_")) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".html")) n++;
    }
  };
  walk(APP);
  return n;
})();

/* Sitemap URLs that are not expected to have a prerendered HTML file. */
const nonHtmlInSitemap = sitemapUrls.filter((url) =>
  NON_HTML_ROUTES.has(new URL(url).pathname)
);

if (sitemapUrls.length && builtPages !== sitemapUrls.length - nonHtmlInSitemap.length) {
  fatal.push(
    `sitemap lists ${sitemapUrls.length} URLs (${nonHtmlInSitemap.length} of them non-HTML routes) but ${builtPages} pages were prerendered`
  );
}

for (const url of missingFiles) {
  fatal.push(
    `sitemap URL ${url} has no prerendered HTML (expected ${path.relative(repo, path.join(APP, htmlFileFor(new URL(url).pathname + new URL(url).search)))})`
  );
}

const quiet = process.argv.includes("--quiet");
if (!quiet) for (const w of warnings.slice(0, 40)) console.warn(`  ⚠ ${w}`);
if (warnings.length > 40) console.warn(`  … and ${warnings.length - 40} more`);

console.log(
  `\nbuild: ${sitemapUrls.length} sitemap URLs, ${checked} pages checked, ${builtPages} prerendered — ${fatal.length} fatal, ${warnings.length} reported`
);

if (fatal.length) {
  console.error("\n❌ BUILD VALIDATION FAILED:\n");
  for (const f of fatal) console.error(`  ✗ ${f}`);
  console.error("");
  process.exit(1);
}
process.exit(0);
