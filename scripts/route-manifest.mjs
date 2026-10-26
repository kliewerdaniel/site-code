#!/usr/bin/env node
/**
 * Route manifest — the frozen URL contract for this site.
 *
 * Enumerates every URL this site can serve: static routes from the app
 * directory, dynamic routes expanded from their real data sources, the removed
 * sections that are now permanent redirects, and the legacy short-slug
 * redirects. The redesign must not change this list.
 *
 * History: this script used to read `src/app/fleet/page.tsx` for the /fleet
 * domains. That page was deleted (the fleet was consolidated into /concepts) and
 * the script crashed with ENOENT, so the committed manifest was stale (13 static
 * routes, 184 posts, 8 fleet domains) and every `--check` against it was
 * meaningless. The removed-section routes are now derived from the
 * REMOVED_SECTION_REDIRECTS block in next.config.ts, which is the single source
 * of truth for what was removed and where it went.
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
    }
  }
  return out;
}

/** Route handlers (feed.xml/route.ts serves /feed.xml). Not pages: they are
 *  deliberately absent from the sitemap, so they are tracked separately. */
function handlerRoutes(dir = APP, prefix = "") {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("[")) continue;
      out.push(...handlerRoutes(full, `${prefix}/${entry.name}`));
    } else if (entry.name === "route.ts") {
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

/** Slugs declared in one of the taxonomy arrays (PROJECTS / CONCEPTS / PATHS). */
function taxonomySlugs(arrayName) {
  const src = fs.readFileSync(path.join(ROOT, "src", "lib", "taxonomy.ts"), "utf8");
  const start = src.indexOf(`export const ${arrayName}`);
  if (start === -1) return [];
  const rest = src.slice(start);
  // Skip the declaration's own line before looking for the next top-level
  // export — otherwise the array matches itself at offset 0 and the body is empty.
  const from = rest.indexOf("\n");
  const end = rest.slice(from).search(/^export (const|function|interface|type) /m);
  const body = end === -1 ? rest : rest.slice(0, from + end);
  return [...body.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

/** Redirect pairs out of a named tuple block in next.config.ts. */
function redirectBlock(name) {
  const src = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  const start = src.indexOf(`const ${name}`);
  if (start === -1) return [];
  const rest = src.slice(start);
  const end = rest.indexOf("\n];");
  const body = end === -1 ? rest : rest.slice(0, end);
  return [...body.matchAll(/\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g)].map((m) => ({
    source: m[1],
    destination: m[2],
  }));
}

const legacyRedirects = redirectBlock("LEGACY_SLUG_REDIRECTS");
const removedSections = redirectBlock("REMOVED_SECTION_REDIRECTS");

const staticRts = staticRoutes().sort();
const handlers = handlerRoutes().sort();
const blogs = blogSlugs().sort();
const dynamic = [
  ...taxonomySlugs("PROJECTS").map((s) => `/projects/${s}`),
  ...taxonomySlugs("CONCEPTS").map((s) => `/concepts/${s}`),
  ...taxonomySlugs("PATHS").map((s) => `/paths/${s}`),
].sort();

const manifest = {
  generatedFrom: "scripts/route-manifest.mjs",
  counts: {
    static: staticRts.length,
    blogPosts: blogs.length,
    dynamicRoutes: dynamic.length,
    handlers: handlers.length,
    removedRoutes: removedSections.length,
    legacyRedirects: legacyRedirects.length,
  },
  static: staticRts,
  blog: blogs.map((s) => `/blog/${s}`),
  dynamic,
  handlers,
  removed: removedSections.map((r) => r.source).sort(),
  legacyRedirects,
  removedSectionRedirects: removedSections,
};

const total = staticRts.length + blogs.length + dynamic.length;
const redirects = removedSections.length + legacyRedirects.length;

const check = process.argv.includes("--check");
if (check) {
  if (!fs.existsSync(OUT)) {
    console.error(`no baseline at ${OUT} — run without --check first`);
    process.exit(2);
  }
  const base = JSON.parse(fs.readFileSync(OUT, "utf8"));
  const diffs = [];
  for (const key of ["static", "blog", "dynamic", "handlers", "removed"]) {
    const a = new Set(base[key] ?? []);
    const b = new Set(manifest[key] ?? []);
    const gone = [...a].filter((x) => !b.has(x));
    const added = [...b].filter((x) => !a.has(x));
    if (gone.length) diffs.push(`${key}: REMOVED ${gone.length} -> ${gone.slice(0, 5).join(", ")}`);
    if (added.length) diffs.push(`${key}: ADDED ${added.length} -> ${added.slice(0, 5).join(", ")}`);
  }
  if (diffs.length) {
    console.error("ROUTE MANIFEST CHANGED:");
    for (const d of diffs) console.error("  " + d);
    process.exit(1);
  }
  console.log(`route manifest UNCHANGED (${total} content URLs, ${redirects} redirects)`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote ${path.relative(ROOT, OUT)}`);
console.log(`  static routes:      ${manifest.counts.static}`);
console.log(`  blog post URLs:     ${manifest.counts.blogPosts}`);
console.log(`  dynamic URLs:       ${manifest.counts.dynamicRoutes}`);
console.log(`  route handlers:     ${manifest.counts.handlers} (not in the sitemap)`);
console.log(`  removed sections:   ${manifest.counts.removedRoutes} (308)`);
console.log(`  legacy redirects:   ${manifest.counts.legacyRedirects} (308)`);
console.log(`  TOTAL content URLs: ${total}`);
