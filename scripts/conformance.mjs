#!/usr/bin/env node
/* ============================================================
   conformance.mjs — one reproducible command over the whole corpus.

   The individual validators answer one question each. This aggregates them
   and adds the corpus-level invariants that none of them can check alone:
   schema shape, deterministic compilation, output consistency, resource
   references, publication metadata, index completeness and draft exclusion.

   Output: data/conformance-report.json with errors / warnings / info.
   Exit:   1 if there is any error (a structural violation).

   Usage:
     npm run conformance
     node scripts/conformance.mjs --quiet
   ============================================================ */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { collect as collectContent } from "./validate-content.mjs";
import { collect as collectBuild } from "./validate-build.mjs";
import { collect as collectAgents } from "./validate-agents.mjs";
import { collect as collectMarkdown } from "./validate-markdown.mjs";

import { SITE, BOOK, SOCIAL } from "../src/config.ts";
import { getAllPosts, getAllPostsIncludingDrafts } from "../src/lib/posts.ts";
import { PROJECTS, CONCEPTS, PATHS, conceptsForPost, projectsForPost } from "../src/lib/taxonomy.ts";
import { CHAPTERS } from "../src/lib/chapters.ts";
import { BOOK_LINKS } from "../src/lib/book-links.ts";
import { buildRelationGraph, RELATION_TYPES } from "../src/lib/relations-core.ts";
import {
  buildAgentResources,
  buildMarkdownMirrors,
  markdownPath,
} from "../src/lib/agent-resources-core.ts";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const APP = path.join(repo, ".next", "server", "app");
const OUT = path.join(repo, "data", "conformance-report.json");

const SIX_RESOURCES = [
  "/llms.txt",
  "/llms-full.txt",
  "/agents/index.json",
  "/agents/catalog.json",
  "/agents/graph.json",
  "/agents/book.json",
];

const sha = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");

/* ---- corpus (the same mapping src/lib/agent-resources.ts performs) ------- */

function corpus() {
  return {
    site: {
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      github: SOCIAL.github,
      x: SOCIAL.x,
      linkedin: SOCIAL.linkedin,
      email: SOCIAL.email,
    },
    book: {
      title: BOOK.title,
      subtitle: BOOK.subtitle,
      promise: BOOK.promise,
      price: BOOK.price,
      priceCurrency: "USD",
      priceNote: BOOK.priceNote,
      amazonUrl: BOOK.amazonUrl,
      asin: BOOK.asin,
      isbn: BOOK.isbn,
      datePublished: BOOK.datePublished,
      sampleUrl: BOOK.sampleUrl,
      coverFront: BOOK.coverFront,
      coverSpine: BOOK.coverSpine,
      coverBack: BOOK.coverBack,
      pages: BOOK.pages,
      format: BOOK.format,
      trim: BOOK.trim,
      chapters: BOOK.chapters,
      words: BOOK.words,
    },
    posts: getAllPosts().map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      ...(p.updated ? { updated: p.updated } : {}),
      description: p.description,
      tags: p.tags,
      readingMinutes: p.readingMinutes,
      content: p.content,
      concepts: conceptsForPost(p).map((c) => c.slug),
      projects: projectsForPost(p.slug).map((pr) => pr.slug),
    })),
    projects: PROJECTS.map((p) => ({
      slug: p.slug,
      name: p.name,
      role: p.role,
      maturity: p.maturity,
      ...(p.repo ? { repo: p.repo } : {}),
      ...(p.site ? { site: p.site } : {}),
      concepts: p.concepts,
      articles: p.articles,
    })),
    concepts: CONCEPTS.map((c) => ({
      slug: c.slug,
      name: c.name,
      oneLiner: c.oneLiner,
      tags: c.tags,
      projects: c.projects,
    })),
    paths: PATHS.map((p) => ({
      slug: p.slug,
      name: p.name,
      promise: p.promise,
      audience: p.audience,
      steps: p.steps.map((s) => ({ kind: s.kind, ref: s.ref, note: s.note })),
    })),
    chapters: CHAPTERS.map((c) => ({ n: c.n, part: c.part, title: c.title })),
    graph: buildRelationGraph({
      projects: PROJECTS,
      concepts: CONCEPTS,
      paths: PATHS,
      bookLinks: BOOK_LINKS,
    }),
    bookLinks: BOOK_LINKS.map((l) => ({
      article: l.article,
      chapter: l.chapter,
      relation: l.relation,
      reason: l.reason,
    })),
  };
}

/* ---- checks ------------------------------------------------------------- */

function checkSchemas(c, errors, warnings, info) {
  const catalog = JSON.parse(c.catalog.body);
  const graph = JSON.parse(c.graph.body);
  const index = JSON.parse(c.index.body);
  const book = JSON.parse(c.book.body);

  for (const key of ["site", "counts", "articles", "projects", "concepts", "paths", "chapters"]) {
    if (!(key in catalog)) errors.push(`catalog.json: missing top-level \`${key}\``);
  }
  for (const a of catalog.articles ?? []) {
    for (const key of ["slug", "url", "markdownUrl", "title", "published", "description", "tags"]) {
      if (!(key in a)) errors.push(`catalog.json: article ${a.slug ?? "?"} missing \`${key}\``);
    }
  }
  for (const key of ["counts", "edges", "absent"]) {
    if (!(key in graph)) errors.push(`graph.json: missing top-level \`${key}\``);
  }
  for (const t of RELATION_TYPES) {
    if (!(t in (graph.counts ?? {}))) errors.push(`graph.json: counts missing relation type \`${t}\``);
    if (!(t in (graph.edges ?? {}))) errors.push(`graph.json: edges missing relation type \`${t}\``);
  }
  for (const key of ["site", "resources", "routes", "counts", "markdown"]) {
    if (!(key in index)) errors.push(`index.json: missing top-level \`${key}\``);
  }
  for (const key of ["title", "asin", "amazonUrl", "chapters", "articleRelationships", "purchase"]) {
    if (!(key in book)) errors.push(`book.json: missing top-level \`${key}\``);
  }
  if (!Array.isArray(graph.absent)) errors.push("graph.json: `absent` is not an array");
}

function checkDeterminismAndOutput(c, errors, info) {
  const a = buildAgentResources(c);
  const b = buildAgentResources(c);
  if (a.map((r) => r.body).join("\n") !== b.map((r) => r.body).join("\n")) {
    errors.push("agent resources are not deterministic across two builds");
  }
  const ma = buildMarkdownMirrors(c);
  const mb = buildMarkdownMirrors(c);
  if (ma.map((r) => r.body).join("\n") !== mb.map((r) => r.body).join("\n")) {
    errors.push("markdown mirrors are not deterministic across two builds");
  }

  // Output consistency: the prerendered bodies must equal a fresh render.
  for (const r of a) {
    const file = path.join(APP, `${r.path.replace(/^\//, "")}.body`);
    if (!fs.existsSync(file)) {
      errors.push(`${r.path}: no prerendered body`);
      continue;
    }
    const body = fs.readFileSync(file, "utf8");
    if (body !== r.body) {
      errors.push(`${r.path}: prerendered body differs from the deterministic render`);
    }
    info.push(`${r.path}: ${Buffer.byteLength(body, "utf8")} bytes, sha256:${sha(body).slice(0, 12)}`);
  }

  const mirrorPaths = [];
  for (const r of ma) {
    const file = path.join(APP, `${r.path.replace(/^\//, "")}.body`);
    if (!fs.existsSync(file)) {
      errors.push(`${r.path}: no prerendered body`);
      continue;
    }
    const body = fs.readFileSync(file, "utf8");
    if (body !== r.body) {
      errors.push(`${r.path}: prerendered body differs from the deterministic render`);
    }
    mirrorPaths.push(r.path);
  }
  info.push(`${mirrorPaths.length} markdown mirrors verified against the deterministic render`);
}

function checkReferences(c, errors) {
  const catalog = JSON.parse(c.catalog.body);
  const index = JSON.parse(c.index.body);
  const origin = SITE.url;

  for (const a of catalog.articles ?? []) {
    if (a.url !== `${origin}/blog/${a.slug}`) errors.push(`article ${a.slug}: bad url ${a.url}`);
    if (a.markdownUrl !== `${origin}${markdownPath(a.slug)}`) {
      errors.push(`article ${a.slug}: bad markdownUrl ${a.markdownUrl}`);
    }
  }
  for (const p of catalog.projects ?? []) {
    if (p.url !== `${origin}/projects/${p.slug}`) errors.push(`project ${p.slug}: bad url ${p.url}`);
  }
  for (const k of catalog.concepts ?? []) {
    if (k.url !== `${origin}/concepts/${k.slug}`) errors.push(`concept ${k.slug}: bad url ${k.url}`);
  }
  for (const p of catalog.paths ?? []) {
    if (p.url !== `${origin}/paths/${p.slug}`) errors.push(`path ${p.slug}: bad url ${p.url}`);
  }

  const listed = new Set((index.resources ?? []).map((r) => r.path));
  for (const p of SIX_RESOURCES) {
    if (!listed.has(p)) errors.push(`index.json: does not list ${p}`);
  }
  if (listed.size !== SIX_RESOURCES.length) {
    errors.push(`index.json: lists ${listed.size} resources, expected ${SIX_RESOURCES.length}`);
  }
  if (index.markdown?.count !== catalog.counts?.articles) {
    errors.push("index.json: markdown.count does not match catalog.counts.articles");
  }
}

function checkMetadata(c, errors, warnings) {
  const catalog = JSON.parse(c.catalog.body);
  const iso = /^\d{4}-\d{2}-\d{2}/;
  for (const a of catalog.articles ?? []) {
    if (typeof a.published !== "string" || !iso.test(a.published)) {
      errors.push(`article ${a.slug}: published is not an ISO date (${JSON.stringify(a.published)})`);
    }
    if (a.updated !== undefined) {
      if (!iso.test(a.updated)) {
        errors.push(`article ${a.slug}: updated is not an ISO date (${JSON.stringify(a.updated)})`);
      } else if (a.published && a.updated < a.published) {
        errors.push(`article ${a.slug}: updated (${a.updated}) precedes published (${a.published})`);
      }
    }
    if (!Array.isArray(a.tags)) errors.push(`article ${a.slug}: tags is not an array`);
  }
}

function checkDrafts(c, errors, info) {
  const catalog = JSON.parse(c.catalog.body);
  const drafts = getAllPostsIncludingDrafts().filter((p) => p.draft).map((p) => p.slug);
  const slugs = new Set((catalog.articles ?? []).map((a) => a.slug));
  for (const slug of drafts) {
    if (slugs.has(slug)) errors.push(`draft ${slug} leaked into catalog.json`);
    const mirror = path.join(APP, `research/${slug}.md.body`);
    if (fs.existsSync(mirror)) errors.push(`draft ${slug} has a published markdown mirror`);
  }
  info.push(`${drafts.length} draft${drafts.length === 1 ? "" : "s"} excluded from the corpus`);
}

function checkIndexCompleteness(c, errors) {
  const catalog = JSON.parse(c.catalog.body);
  const count = catalog.counts ?? {};
  const arrays = {
    articles: catalog.articles,
    projects: catalog.projects,
    concepts: catalog.concepts,
    paths: catalog.paths,
    chapters: catalog.chapters,
  };
  for (const [key, arr] of Object.entries(arrays)) {
    if (!Array.isArray(arr)) {
      errors.push(`catalog.json: \`${key}\` is not an array`);
      continue;
    }
    if (count[key] !== arr.length) {
      errors.push(`catalog.json: counts.${key} is ${count[key]}, the array has ${arr.length}`);
    }
  }
}

/* ---- aggregate ---------------------------------------------------------- */

function main() {
  if (!fs.existsSync(APP)) {
    console.error(`❌ no build output at ${path.relative(repo, APP)} — run \`next build\` first`);
    process.exit(1);
  }

  const content = collectContent();
  const build = collectBuild();
  const agents = collectAgents();
  const markdown = collectMarkdown();

  const c = corpus();
  const resources = buildAgentResources(c);
  const byPath = Object.fromEntries(resources.map((r) => [r.path, r]));
  const catalogBody = byPath["/agents/catalog.json"].body;
  const graphBody = byPath["/agents/graph.json"].body;
  const indexBody = byPath["/agents/index.json"].body;
  const bookBody = byPath["/agents/book.json"].body;

  const errors = [];
  const warnings = [];
  const info = [];

  // Map the individual validators into the three severity buckets.
  for (const f of content.fatal) errors.push(`content: ${f}`);
  for (const f of content.findings) {
    (f.severity === "defect" ? warnings : info).push(`content: ${f.file}: ${f.detail}`);
  }
  for (const f of build.fatal) errors.push(`build: ${f}`);
  for (const f of build.findings) info.push(`build: ${f.file}: ${f.detail}`);
  for (const f of agents.fatal) errors.push(`agents: ${f}`);
  for (const f of agents.findings) warnings.push(`agents: ${f.detail}`);
  for (const f of markdown.fatal) errors.push(`markdown: ${f}`);
  for (const f of markdown.findings) warnings.push(`markdown: ${f.detail}`);

  checkSchemas({ catalog: { body: catalogBody }, graph: { body: graphBody }, index: { body: indexBody }, book: { body: bookBody } }, errors, warnings, info);
  checkDeterminismAndOutput(c, errors, info);
  checkReferences({ catalog: { body: catalogBody }, index: { body: indexBody } }, errors);
  checkMetadata({ catalog: { body: catalogBody } }, errors, warnings);
  checkDrafts({ catalog: { body: catalogBody } }, errors, info);
  checkIndexCompleteness({ catalog: { body: catalogBody } }, errors);

  const report = {
    generatedBy: "scripts/conformance.mjs",
    site: SITE.url,
    ok: errors.length === 0,
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      info: info.length,
      articles: c.posts.length,
      graphEdges: Object.values(c.graph.counts).reduce((a, b) => a + b, 0),
      mirrors: c.posts.length,
    },
    errors,
    warnings,
    info,
    checks: {
      content: { fatal: content.fatal.length, findings: content.findings.length },
      build: { fatal: build.fatal.length, findings: build.findings.length },
      agents: { fatal: agents.fatal.length, findings: agents.findings.length },
      markdown: { fatal: markdown.fatal.length, findings: markdown.findings.length },
    },
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");

  const quiet = process.argv.includes("--quiet");
  if (!quiet) {
    for (const e of errors) console.error(`  ✗ ${e}`);
    for (const w of warnings.slice(0, 20)) console.warn(`  ⚠ ${w}`);
    if (warnings.length > 20) console.warn(`  … and ${warnings.length - 20} more warnings`);
  }
  console.log(
    `\nconformance: ${report.summary.articles} articles, ${report.summary.graphEdges} edges, ${report.summary.mirrors} mirrors — ${errors.length} error(s), ${warnings.length} warning(s), ${info.length} info`
  );
  console.log(`  report: ${path.relative(repo, OUT)}`);

  if (errors.length) {
    console.error("\n❌ CONFORMANCE FAILED — structural violations present");
    process.exit(1);
  }
  process.exit(0);
}

const isEntry =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntry) main();
