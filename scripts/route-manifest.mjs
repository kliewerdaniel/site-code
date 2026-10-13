#!/usr/bin/env node
/**
 * Route manifest — the frozen URL contract for the v3 redesign.
 *
 * Enumerates every URL this site can serve: static routes from the app
 * directory, dynamic routes expanded from their real data sources, plus the
 * legacy redirects in next.config.ts. The redesign must not change this list.
 *
 * Usage:
 *   node scripts/route-manifest.mjs            # print + write data/route-manifest.json
 *   node scripts/route-manifest.mjs --check    # compare against the committed baseline
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP = path.join(ROOT, "src", "app");
const POSTS_DIR = path.join(ROOT, "content", "research");
const OUT = path.join(ROOT, "data", "route-manifest.json");

/** Static routes: every directory containing a page.tsx. */
function staticRoutes(dir = APP, prefix = "") {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // dynamic segments are expanded separately
      if (entry.name.startsWith("[")) continue;
      out.push(...staticRoutes(full, `${prefix}/${entry.name}`));
    } else if (entry.name === "page.tsx") {
      out.push(prefix === "" ? "/" : prefix);
    } else if (entry.name === "route.ts") {
      // A route handler in a directory named for the URL (e.g. feed.xml/route.ts
      // serves /feed.xml). A handler at app/route.ts would serve /.
      out.push(prefix === "" ? "/" : prefix);
    }
  }
  return out;
}

/** /blog/[slug] — one URL per post file. */
function blogSlugs() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") && f !== "temp.md")
    .map((f) => f.replace(/\.md$/, ""));
}

/** /fleet/[domain] — read the FLEET_LAYERS slugs straight from the source. */
function fleetDomains() {
  const src = fs.readFileSync(path.join(APP, "fleet", "page.tsx"), "utf8");
  const slugs = [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  return [...new Set(slugs)];
}

/** Legacy redirects declared in next.config.ts. */
function legacyRedirects() {
  const src = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  return [...src.matchAll(/\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g)].map((m) => ({
    source: m[1],
    destination: m[2],
  }));
}

const staticRts = staticRoutes().sort();
const blogs = blogSlugs().sort();
const domains = fleetDomains().sort();

const manifest = {
  generatedFrom: "scripts/route-manifest.mjs",
  counts: {
    static: staticRts.length,
    blogPosts: blogs.length,
    fleetDomains: domains.length,
    legacyRedirects: legacyRedirects().length,
  },
  static: staticRts,
  blog: blogs.map((s) => `/blog/${s}`),
  fleet: domains.map((d) => `/fleet/${d}`),
  legacyRedirects: legacyRedirects(),
};

const total =
  manifest.counts.static + manifest.counts.blogPosts + manifest.counts.fleetDomains;

const check = process.argv.includes("--check");
if (check) {
  if (!fs.existsSync(OUT)) {
    console.error(`no baseline at ${OUT} — run without --check first`);
    process.exit(2);
  }
  const base = JSON.parse(fs.readFileSync(OUT, "utf8"));
  const diffs = [];
  for (const key of ["static", "blog", "fleet"]) {
    const a = new Set(base[key] ?? []);
    const b = new Set(manifest[key] ?? []);
    const removed = [...a].filter((x) => !b.has(x));
    const added = [...b].filter((x) => !a.has(x));
    if (removed.length) diffs.push(`${key}: REMOVED ${removed.length} → ${removed.slice(0, 5).join(", ")}`);
    if (added.length) diffs.push(`${key}: ADDED ${added.length} → ${added.slice(0, 5).join(", ")}`);
  }
  if (diffs.length) {
    console.error("ROUTE MANIFEST CHANGED:");
    for (const d of diffs) console.error("  " + d);
    process.exit(1);
  }
  console.log(`route manifest UNCHANGED (${total} URLs across ${Object.keys(manifest.counts).length} groups)`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote ${path.relative(ROOT, OUT)}`);
console.log(`  static routes:     ${manifest.counts.static}`);
console.log(`  blog post URLs:    ${manifest.counts.blogPosts}`);
console.log(`  fleet domain URLs: ${manifest.counts.fleetDomains}`);
console.log(`  legacy redirects:  ${manifest.counts.legacyRedirects}`);
console.log(`  TOTAL content URLs: ${total}`);
console.log("\nstatic routes:");
for (const r of staticRts) console.log("  " + r);
