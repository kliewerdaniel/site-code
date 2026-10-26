#!/usr/bin/env node
/* ============================================================
   audit-site.mjs — the deterministic half of a self-auditing site.

   The audit that produced this branch was a one-off: it found problems, and
   then nothing re-checked them. This script is the repeatable version. It runs
   the content and build validators, adds the route table and a categorised
   canonical report, classifies every finding by severity, and writes a
   machine-readable report that can be diffed against a committed baseline.

   Severity model:
     fatal    the build or a page is broken — CI must fail
     defect   a real problem a reader or crawler would notice (duplicate
              description, dead canonical, missing description)
     advisory length drift — search results have variable display widths, so
              these are reported and baselined, never silently "fixed"

   Stages 2–4 of the roadmap (Search Console data, graph prioritisation,
   agent-assisted remediation) need external access and are deliberately not
   guessed at here.

   Usage:
     node scripts/audit-site.mjs            # write data/audit-report.json
     node scripts/audit-site.mjs --check    # diff against the committed baseline
     node scripts/audit-site.mjs --json     # print the report to stdout
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { collect as collectContent } from "./validate-content.mjs";
import { collect as collectBuild } from "./validate-build.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const OUT = path.join(repo, "data", "audit-report.json");

/** A live post slug starts with YYYY-MM-DD-. Anything else is a pre-date path. */
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;

/* ── Typed relation graph ───────────────────────────────────────────────────
   The roadmap proposed relations like `implements`, `documents`, `extends`,
   `validates` and `prerequisite_for`. The site already carries the first two
   and the last one as data in taxonomy.ts; `extends` and `validates` have no
   source, so they are reported as absent rather than invented. The rule this
   codebase lives by is that every relationship is computed or verified, never
   invented — so this derives the graph from the declared data and says so. */

/**
 * Parse one array-of-strings field out of a taxonomy.ts entry.
 * `concepts: ["a", "b"]` or a multi-line block.
 */
function arrayOf(src, field) {
  const m = src.match(new RegExp(`${field}:\\s*\\[([^\\]]*)\\]`, "s"));
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

/** Derive the relation graph from taxonomy.ts. */
export function relationGraph() {
  const src = fs.readFileSync(path.join(repo, "src", "lib", "taxonomy.ts"), "utf8");

  const blockOf = (slug) => {
    const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // A taxonomy entry ends at a two-space-indented `},`. Matching `\n\s*]`
    // instead would stop early at the closing bracket of any nested array
    // (approach, concepts, articles), which silently drops the relations.
    const re = new RegExp(`slug:\\s*"${escaped}"\\s*,([\\s\\S]*?)(?=\\n  \\},)`, "m");
    const m = src.match(re);
    return m ? m[1] : "";
  };

  const counts = {
    implements: 0, // project -> concept
    documents: 0, // post -> project
    prerequisite_for: 0, // path step -> next step
  };
  const edges = { implements: [], documents: [], prerequisite_for: [] };
  const absent = ["extends", "validates"]; // no data source in the repo

  // projects -> concepts, and posts -> projects
  const projectSlugs = [...src.matchAll(/slug:\s*"([a-z0-9-]+)",\s*\n\s*name:/g)].map((m) => m[1]);
  for (const slug of projectSlugs) {
    const block = blockOf(slug);
    for (const c of arrayOf(block, "concepts")) {
      counts.implements++;
      edges.implements.push({ from: `/projects/${slug}`, to: `/concepts/${c}` });
    }
    for (const a of arrayOf(block, "articles")) {
      counts.documents++;
      edges.documents.push({ from: `/blog/${a}`, to: `/projects/${slug}` });
    }
  }

  // learning paths: each step prepares the reader for the next. Steps are
  // `{ kind, ref, note }` objects, so the relation is between consecutive refs.
  const pathsStart = src.indexOf("export const PATHS");
  const pathsSrc = pathsStart === -1 ? "" : src.slice(pathsStart);
  const pathSlugs = [...pathsSrc.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
  for (const slug of pathSlugs) {
    const block = blockOf(slug);
    const stepsMatch = block.match(/steps:\s*\[([\s\S]*?)\n    \]/);
    if (!stepsMatch) continue;
    const refs = [...stepsMatch[1].matchAll(/ref:\s*"([^"]+)"/g)].map((m) => m[1]);
    for (let i = 0; i + 1 < refs.length; i++) {
      counts.prerequisite_for++;
      edges.prerequisite_for.push({
        from: refs[i],
        to: refs[i + 1],
        via: `/paths/${slug}`,
      });
    }
  }

  return { counts, edges, absent };
}


/**
 * Classify a `canonical_url` that disagrees with the post's own URL. Nothing
 * reads the field any more, so none of these affect the live site — but they
 * tell you what the field would do if it were ever honoured.
 */
export function classifyCanonical(value) {
  if (/^https?:\/\/kliewerdaniel\.com\//.test(value)) return "cross-domain";
  if (/^https?:\/\/danielkliewer\.com\//.test(value)) return "apex-vs-www";
  if (value.startsWith("/blog/") && !DATE_PREFIX.test(value.slice("/blog/".length))) {
    return "dead-short-slug";
  }
  return "other";
}

/** Build the full report. */
export function build() {
  const content = collectContent();
  const buildRes = collectBuild();

  const defects = content.findings.filter((f) => f.severity === "defect");
  const advisory = content.findings.filter((f) => f.severity === "advisory");

  const canonical = content.findings
    .filter((f) => f.kind === "canonical-mismatch")
    .map((f) => {
      const value = f.value || "";
      return {
        file: f.file,
        value,
        self: value.replace(/^https?:\/\/[^/]+/, "") || value,
        category: classifyCanonical(value),
      };
    });

  const byKind = (list) => {
    const out = {};
    for (const f of list) out[f.kind] = (out[f.kind] ?? 0) + 1;
    return out;
  };

  const byCategory = (list) => {
    const out = {};
    for (const c of list) out[c.category] = (out[c.category] ?? 0) + 1;
    return out;
  };

  /* Route table: the manifest is the contract, the status file is the proof. */
  let routes = null;
  const manifestPath = path.join(repo, "data", "route-manifest.json");
  const statusPath = path.join(repo, "data", "route-status.json");
  if (fs.existsSync(manifestPath) && fs.existsSync(statusPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
    const not200 = Object.entries(status).filter(([, s]) => s !== 200);
    routes = {
      contentUrls: manifest.static.length + manifest.blog.length + manifest.dynamic.length,
      handlers: manifest.handlers.length,
      redirects: manifest.counts.removedRoutes + manifest.counts.legacyRedirects,
      not200: not200.length,
    };
  }

  const relations = relationGraph();

  return {
    generatedBy: "scripts/audit-site.mjs",
    counts: {
      posts: content.posts,
      contentUrls: routes?.contentUrls ?? null,
      sitemapUrls: buildRes?.sitemapUrls ?? null,
      builtPages: buildRes?.builtPages ?? null,
      redirects: routes?.redirects ?? null,
    },
    relations: { counts: relations.counts, absent: relations.absent },
    fatal: content.fatal.length + (buildRes?.fatal.length ?? 0),
    defects: defects.length,
    advisory: advisory.length,
    byKind: byKind([...defects, ...advisory]),
    canonical: {
      total: canonical.length,
      byCategory: byCategory(canonical),
      items: canonical,
    },
    routes,
    relations: { counts: relations.counts, absent: relations.absent, edges: relations.edges },
    build: buildRes
      ? {
          sitemapUrls: buildRes.sitemapUrls,
          checked: buildRes.checked,
          builtPages: buildRes.builtPages,
          fatal: buildRes.fatal.length,
        }
      : null,
    /* The defect list is the thing to diff: it is small enough to review and
       it is what actually changes when content is edited. */
    defectList: defects.map((d) => `${d.file}: ${d.detail}`).sort(),
    /* Stable identifiers, so a finding can be referenced in a review or an
       issue without its text having to match exactly. */
    findingIds: [...defects, ...advisory].map((f) => f.id).filter(Boolean).sort(),
    /* Full findings for the human-readable report. */
    findings: [...defects, ...advisory]
      .map((f) => ({ id: f.id, severity: f.severity, kind: f.kind, file: f.file, detail: f.detail }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
}

/**
 * Compare a report against the committed baseline.
 *
 * A regression gate must distinguish a newly introduced defect from an
 * improvement that needs the baseline updated. Failing on a FIXED finding makes
 * remediation look like a regression, which teaches people to ignore the gate.
 * So this returns the two separately: `regressions` fail the run, `improvements`
 * are reported and are how you know the baseline needs a deliberate update.
 */
export function diff(base, next) {
  const regressions = [];
  const improvements = [];

  if (next.fatal > base.fatal) regressions.push(`fatal: ${base.fatal} -> ${next.fatal}`);
  else if (next.fatal < base.fatal) improvements.push(`fatal: ${base.fatal} -> ${next.fatal}`);

  if (next.defects > base.defects) regressions.push(`defects: ${base.defects} -> ${next.defects}`);
  else if (next.defects < base.defects) improvements.push(`defects: ${base.defects} -> ${next.defects}`);

  if (next.advisory > base.advisory) regressions.push(`advisory: ${base.advisory} -> ${next.advisory}`);
  else if (next.advisory < base.advisory) improvements.push(`advisory: ${base.advisory} -> ${next.advisory}`);

  const a = new Set(base.defectList);
  const b = new Set(next.defectList);
  for (const d of b) if (!a.has(d)) regressions.push(`NEW defect  ${d}`);
  for (const d of a) if (!b.has(d)) improvements.push(`FIXED      ${d}`);

  const bc = base.canonical?.byCategory ?? {};
  const nc = next.canonical?.byCategory ?? {};
  for (const k of new Set([...Object.keys(bc), ...Object.keys(nc)])) {
    const from = bc[k] ?? 0;
    const to = nc[k] ?? 0;
    if (from === to) continue;
    (to > from ? regressions : improvements).push(`canonical ${k}: ${from} -> ${to}`);
  }

  return { regressions, improvements };
}

/* ── CLI ─────────────────────────────────────────────────────────────────── */

const isEntry = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntry) {
  const report = build();
  const check = process.argv.includes("--check");
  const updateBaseline = process.argv.includes("--update-baseline");

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  }

  /* Compact human-readable report: what to fix, in priority order, with the
     stable id for each finding. Advisory items are counted, not listed — 330
     length warnings is noise, and the point of this report is to be readable. */
  if (process.argv.includes("--summary")) {
    const defects = report.findings.filter((f) => f.severity === "defect");
    const advisory = report.findings.filter((f) => f.severity === "advisory");

    console.log("SITE AUDIT SUMMARY\n");
    console.log(`  posts ${report.counts.posts} · content URLs ${report.counts.contentUrls} · redirects ${report.counts.redirects}`);
    console.log(`  fatal ${report.fatal} · defects ${defects.length} · advisory ${advisory.length}`);
    console.log(`  relation edges ${Object.values(report.relations.counts).reduce((a, b) => a + b, 0)} (0 dangling)`);
    console.log("");

    if (defects.length) {
      console.log(`DEFECTS (${defects.length}) — fix these:\n`);
      for (const f of defects) console.log(`  ${f.id}\n    ${f.detail}`);
      console.log("");
    } else {
      console.log("DEFECTS (0) — no live defects.\n");
    }

    if (report.canonical.total) {
      console.log(
        `CANONICAL MISMATCHES (${report.canonical.total}) — dead frontmatter, nothing reads it today:\n`
      );
      for (const c of report.canonical.items) {
        console.log(`  [${c.category}] ${c.file}`);
        console.log(`    ${c.value}`);
      }
      console.log("");
    }

    const missing = advisory.filter((f) => f.kind === "description-missing");
    const long = advisory.filter((f) => f.kind === "description-long" || f.kind === "title-long");
    console.log(`ADVISORY (${advisory.length}) — not defects, counted for completeness:\n`);
    console.log(`  ${missing.length} posts use the auto-excerpt (renders an accurate description)`);
    console.log(`  ${long.length} overlong title/description warnings`);
    console.log(`  ${report.relations.absent.join(", ")} — relation types with no data source, not invented`);
    process.exit(0);
  }

  if (check || updateBaseline) {
    if (!fs.existsSync(OUT)) {
      console.error(`no baseline at ${path.relative(repo, OUT)} — run \`npm run audit\` first`);
      process.exit(2);
    }
    const base = JSON.parse(fs.readFileSync(OUT, "utf8"));
    const { regressions, improvements } = diff(base, report);

    if (improvements.length) {
      console.log(`improvements (${improvements.length}) — baseline needs a deliberate update:\n`);
      for (const c of improvements) console.log("  " + c);
      console.log("");
    }

    if (check && regressions.length) {
      console.error(`SITE AUDIT REGRESSION (${regressions.length}):\n`);
      for (const c of regressions) console.error("  " + c);
      console.error(
        "\nA new defect is a regression. If this is an intentional change, run `npm run audit -- --update-baseline`."
      );
      process.exit(1);
    }

    if (updateBaseline) {
      fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");
      console.log(`baseline updated — ${path.relative(repo, OUT)}`);
      console.log(
        `  ${report.fatal} fatal, ${report.defects} defects, ${report.advisory} advisory`
      );
      process.exit(0);
    }

    console.log(
      `site audit OK — ${report.fatal} fatal, ${report.defects} defects, ${report.advisory} advisory (no regressions)`
    );
    process.exit(0);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");

  console.log(`wrote ${path.relative(repo, OUT)}`);
  console.log(`  posts:          ${report.counts.posts}`);
  console.log(`  content URLs:   ${report.counts.contentUrls}`);
  console.log(`  redirects:      ${report.counts.redirects}`);
  console.log(`  fatal:          ${report.fatal}`);
  console.log(`  defects:        ${report.defects}  ${JSON.stringify(report.byKind)}`);
  console.log(`  advisory:       ${report.advisory}`);
  console.log(`  canonical:      ${report.canonical.total}  ${JSON.stringify(report.canonical.byCategory)}`);
  if (report.fatal) process.exit(1);
}
