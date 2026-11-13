#!/usr/bin/env node
/* ============================================================
   validate-agents.mjs — post-build gate for the agent interface.

   The agent resources are generated at build time, so a green `next build`
   does not prove they are correct: a builder can emit JSON that parses but
   contradicts the config, or a graph whose edges point at slugs that no
   longer exist. This reads the prerendered `.body` files and asserts the
   invariants the rest of the site depends on.

   FATAL (exit 1):
     - a resource has no build output
     - a JSON resource does not parse
     - a canonical URL is not on the site origin
     - the book record contradicts src/config.ts
     - the book record asserts availability, a live price or a review
     - a graph edge does not resolve (dangling reference)
     - a chapter relation has no stated reason
     - the index's reported byte sizes do not match the built bodies

   REPORTED (exit 0): size drift on the full-text index.

   Findings are exported as `collect()` so scripts/audit-site.mjs can
   aggregate them without re-implementing the rules.

   Usage:
     node scripts/validate-agents.mjs            # after `next build`
     node scripts/validate-agents.mjs --quiet
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BOOK, SITE } from "../src/config.ts";
import { CHAPTERS } from "../src/lib/chapters.ts";
import { BOOK_LINKS } from "../src/lib/book-links.ts";
import { danglingEdges } from "../src/lib/relations-core.ts";
import { getAllPosts, getAllPostsIncludingDrafts } from "../src/lib/posts.ts";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const APP = path.join(repo, ".next", "server", "app");

const RESOURCES = [
  { path: "/llms.txt", contentType: "text/plain; charset=utf-8" },
  { path: "/llms-full.txt", contentType: "text/plain; charset=utf-8" },
  { path: "/agents/index.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/catalog.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/graph.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/book.json", contentType: "application/json; charset=utf-8" },
];

/** URL path -> prerendered body file. */
function bodyFile(urlPath) {
  return path.join(APP, `${urlPath.replace(/^\//, "")}.body`);
}

function parseJson(file, label, fatal) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    fatal.push(`${label}: JSON does not parse (${e.message})`);
    return null;
  }
}

/** Collect every finding. Returns `null` if there is no build output. */
export function collect() {
  if (!fs.existsSync(APP)) return null;

  const fatal = [];
  const findings = [];
  const bodies = {};
  const resources = [];

  for (const r of RESOURCES) {
    const file = bodyFile(r.path);
    if (!fs.existsSync(file)) {
      fatal.push(`${r.path}: no build output (expected ${path.relative(repo, file)})`);
      continue;
    }
    const body = fs.readFileSync(file, "utf8");
    bodies[r.path] = body;
    resources.push({ path: r.path, bytes: Buffer.byteLength(body, "utf8"), contentType: r.contentType });
  }

  const catalog = bodies["/agents/catalog.json"]
    ? parseJson(bodyFile("/agents/catalog.json"), "/agents/catalog.json", fatal)
    : null;
  const graph = bodies["/agents/graph.json"]
    ? parseJson(bodyFile("/agents/graph.json"), "/agents/graph.json", fatal)
    : null;
  const book = bodies["/agents/book.json"]
    ? parseJson(bodyFile("/agents/book.json"), "/agents/book.json", fatal)
    : null;
  const index = bodies["/agents/index.json"]
    ? parseJson(bodyFile("/agents/index.json"), "/agents/index.json", fatal)
    : null;

  /* ---- catalog ---- */
  // The published-post source is posts.ts, the same loader the pages and the
  // agent resources use. Reading the directory instead would let a draft leak
  // through and would make this validator disagree with the catalog.
  const publishedSlugs = new Set(getAllPosts().map((p) => p.slug));
  const draftSlugs = new Set(
    getAllPostsIncludingDrafts()
      .filter((p) => p.draft)
      .map((p) => p.slug)
  );

  if (catalog) {
    if (catalog.counts?.articles !== publishedSlugs.size) {
      fatal.push(
        `/agents/catalog.json: counts.articles is ${catalog.counts?.articles}, the published archive has ${publishedSlugs.size} (${draftSlugs.size} drafts excluded)`
      );
    }
    for (const a of catalog.articles ?? []) {
      if (a.url !== `${SITE.url}/blog/${a.slug}`) {
        fatal.push(`/agents/catalog.json: article ${a.slug} has a non-canonical URL ${a.url}`);
      }
      if (!publishedSlugs.has(a.slug)) {
        fatal.push(
          `/agents/catalog.json: article ${a.slug} is not in the published archive`
        );
      }
      if (draftSlugs.has(a.slug)) {
        fatal.push(`/agents/catalog.json: draft ${a.slug} leaked into the corpus`);
      }
      if (typeof a.published !== "string" || a.published.length === 0) {
        fatal.push(`/agents/catalog.json: article ${a.slug} has no publication date`);
      }
    }
    for (const p of catalog.projects ?? []) {
      if (p.url !== `${SITE.url}/projects/${p.slug}`) {
        fatal.push(`/agents/catalog.json: project ${p.slug} has a non-canonical URL ${p.url}`);
      }
    }
    for (const c of catalog.concepts ?? []) {
      if (c.url !== `${SITE.url}/concepts/${c.slug}`) {
        fatal.push(`/agents/catalog.json: concept ${c.slug} has a non-canonical URL ${c.url}`);
      }
    }
    for (const p of catalog.paths ?? []) {
      if (p.url !== `${SITE.url}/paths/${p.slug}`) {
        fatal.push(`/agents/catalog.json: path ${p.slug} has a non-canonical URL ${p.url}`);
      }
      for (const s of p.steps ?? []) {
        const want = s.kind === "concept" ? `/concepts/${s.ref}` : `/blog/${s.ref}`;
        if (s.url !== `${SITE.url}${want}`) {
          fatal.push(
            `/agents/catalog.json: path ${p.slug} step ${s.ref} has a non-canonical URL ${s.url}`
          );
        }
      }
    }
  }

  /* ---- graph ---- */
  let graphCounts = null;
  let dangling = [];
  if (graph) {
    graphCounts = graph.counts ?? {};
    const edgeTotal = Object.values(graphCounts).reduce((a, b) => a + b, 0);
    const actualTotal = Object.values(graph.edges ?? {}).reduce(
      (a, list) => a + (Array.isArray(list) ? list.length : 0),
      0
    );
    if (edgeTotal !== actualTotal) {
      fatal.push(
        `/agents/graph.json: counts sum to ${edgeTotal} but ${actualTotal} edges are present`
      );
    }
    const known = {
      posts: publishedSlugs,
      projects: new Set((catalog?.projects ?? []).map((p) => p.slug)),
      concepts: new Set((catalog?.concepts ?? []).map((c) => c.slug)),
      chapters: new Set(CHAPTERS.map((c) => c.n)),
    };
    dangling = danglingEdges(graph, known);
    for (const d of dangling) {
      fatal.push(`/agents/graph.json: ${d.relation} ${d.edge.from} -> ${d.edge.to}: ${d.why}`);
    }
    for (const type of ["chapter_covers", "recommends_reading"]) {
      for (const e of graph.edges?.[type] ?? []) {
        if (typeof e.reason !== "string" || e.reason.trim().length === 0) {
          fatal.push(
            `/agents/graph.json: ${type} ${e.from} -> ${e.to} states no reason`
          );
        }
      }
    }
    if (!Array.isArray(graph.absent) || !graph.absent.includes("extends")) {
      fatal.push("/agents/graph.json: `absent` does not declare the unused relation types");
    }
  }

  /* ---- book ---- */
  if (book) {
    const expect = {
      title: BOOK.title,
      subtitle: BOOK.subtitle,
      author: SITE.name,
      asin: BOOK.asin,
      amazonUrl: BOOK.amazonUrl,
      pages: BOOK.pages,
      chapterCount: BOOK.chapters,
    };
    for (const [key, want] of Object.entries(expect)) {
      if (book[key] !== want) {
        fatal.push(
          `/agents/book.json: ${key} is ${JSON.stringify(book[key])}, config says ${JSON.stringify(want)}`
        );
      }
    }
    if (book.isbn !== BOOK.isbn) {
      fatal.push(`/agents/book.json: isbn is ${book.isbn}, config says ${BOOK.isbn}`);
    }
    if (book.availability !== undefined) {
      fatal.push("/agents/book.json: asserts `availability`, a live stock claim the repo cannot verify");
    }
    if (book.rating ?? book.review ?? book.reviews) {
      fatal.push("/agents/book.json: asserts a rating or review, which would be invented");
    }
    if (book.price?.amount !== BOOK.price.replace(/[^0-9.]/g, "")) {
      fatal.push("/agents/book.json: price.amount does not match the configured price");
    }
    if (typeof book.price?.note !== "string" || book.price.note.length === 0) {
      fatal.push("/agents/book.json: price.note is missing, so the price could read as live");
    }
    if (book.purchase?.destination !== BOOK.amazonUrl) {
      fatal.push("/agents/book.json: purchase.destination is not the configured Amazon URL");
    }
    if (!book.purchase?.authorizedBy) {
      fatal.push("/agents/book.json: purchase.authorizedBy is missing");
    }
    const chapterTitles = new Map(CHAPTERS.map((c) => [c.n, c.title]));
    for (const ch of book.chapters ?? []) {
      if (chapterTitles.get(ch.n) !== ch.title) {
        fatal.push(
          `/agents/book.json: chapter ${ch.n} is "${ch.title}", the manifest says "${chapterTitles.get(ch.n)}"`
        );
      }
    }
    if ((book.chapters ?? []).length !== CHAPTERS.length) {
      fatal.push(
        `/agents/book.json: lists ${book.chapters?.length} chapters, the manifest has ${CHAPTERS.length}`
      );
    }
  }

  /* ---- declared book links resolve ---- */
  const catalogSlugs = new Set((catalog?.articles ?? []).map((a) => a.slug));
  for (const link of BOOK_LINKS) {
    if (!catalogSlugs.has(link.article)) {
      fatal.push(`book-links.ts: article ${link.article} is not in the archive`);
    }
    if (!CHAPTERS.some((c) => c.n === link.chapter)) {
      fatal.push(`book-links.ts: chapter ${link.chapter} is not in the manifest`);
    }
    if (typeof link.reason !== "string" || link.reason.trim().length === 0) {
      fatal.push(`book-links.ts: ${link.article} -> chapter ${link.chapter} states no reason`);
    }
  }

  /* ---- index ---- */
  if (index) {
    const sizeOf = new Map(resources.map((r) => [r.path, r.bytes]));
    for (const r of index.resources ?? []) {
      const actual = sizeOf.get(r.path);
      if (actual === undefined) {
        fatal.push(`/agents/index.json: lists ${r.path}, which has no build output`);
      } else if (r.bytes !== actual) {
        fatal.push(
          `/agents/index.json: ${r.path} reports ${r.bytes} bytes, the body is ${actual}`
        );
      }
    }
    if (index.counts?.articles !== publishedSlugs.size) {
      fatal.push("/agents/index.json: counts.articles does not match the published archive");
    }
    if (index.markdown?.count !== publishedSlugs.size) {
      fatal.push(
        `/agents/index.json: markdown.count is ${index.markdown?.count}, the published archive has ${publishedSlugs.size}`
      );
    }
  }

  /* ---- bandwidth guard ---- */
  const full = resources.find((r) => r.path === "/llms-full.txt");
  if (full && full.bytes > 512 * 1024) {
    findings.push({
      severity: "advisory",
      kind: "llms-full-large",
      file: "/llms-full.txt",
      id: "llms-full-large",
      detail: `the full-text index is ${(full.bytes / 1024).toFixed(1)} KB (> 512 KB)`,
      value: full.bytes,
    });
  }

  return {
    resources,
    counts: {
      articles: publishedSlugs.size,
      drafts: draftSlugs.size,
      projects: catalog?.counts?.projects ?? null,
      concepts: catalog?.counts?.concepts ?? null,
      chapters: CHAPTERS.length,
      verifiedChapterLinks: graphCounts?.chapter_covers ?? null,
      recommendedReading: graphCounts?.recommends_reading ?? null,
    },
    graphCounts,
    dangling: dangling.length,
    fatal,
    findings,
  };
}

/* ── CLI ─────────────────────────────────────────────────────────────────── */

const isEntry =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntry) {
  const result = collect();
  if (result === null) {
    console.error(
      `❌ no build output at ${path.relative(repo, APP)} — run \`next build\` first`
    );
    process.exit(1);
  }
  const quiet = process.argv.includes("--quiet");
  if (!quiet) for (const f of result.findings) console.warn(`  ⚠ ${f.detail}`);
  console.log(
    `\nagents: ${result.resources.length} resources, ${result.counts.articles} articles, ` +
      `${result.graphCounts ? Object.values(result.graphCounts).reduce((a, b) => a + b, 0) : 0} graph edges, ` +
      `${result.dangling} dangling — ${result.fatal.length} fatal, ${result.findings.length} reported`
  );
  for (const r of result.resources) {
    console.log(`  ${(r.bytes / 1024).toFixed(1).padStart(7)} KB  ${r.path}`);
  }
  if (result.fatal.length) {
    console.error("\n❌ AGENT VALIDATION FAILED:\n");
    for (const f of result.fatal) console.error(`  ✗ ${f}`);
    console.error("");
    process.exit(1);
  }
  process.exit(0);
}
