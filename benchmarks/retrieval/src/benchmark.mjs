#!/usr/bin/env node
/* ============================================================
   retrieval benchmark — does the compiled architecture actually
   retrieve better than crawling, and at what cost?

   Three architectures, measured over the same question set:

     A. Conventional website crawling
        Fetch the sitemap, then crawl HTML pages until five candidates
        are found. No catalog, no graph.

     B. Compiled catalog and graph
        Fetch the compact catalog and graph once, rank by metadata, then
        fetch the top five HTML pages.

     C. Compiled catalog, graph and canonical Markdown
        Same ranking, but fetch the small Markdown mirrors instead of the
        HTML pages.

   Metrics per architecture: Recall@5, Precision@5, bytes transferred,
   HTTP requests per query, local retrieval latency, citation accuracy and
   context efficiency (relevant bytes / total bytes).

   The benchmark reads the local build output. It does not hit the network,
   so "bytes transferred" is the byte count of the artifacts a real client
   would download, and latency is local processing time — a limitation stated
   in the report.

   Usage:
     node benchmarks/retrieval/src/benchmark.mjs
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = path.join(root, ".next", "server", "app");
const OUT_DIR = path.join(root, "benchmarks", "retrieval", "data");

const readBody = (p) => fs.readFileSync(p, "utf8");
const exists = (p) => fs.existsSync(p);

/* ── load the compiled corpus ────────────────────────────────────────────── */

function loadJson(rel) {
  return JSON.parse(readBody(path.join(APP, rel)));
}

const catalog = loadJson("agents/catalog.json.body");
const graph = loadJson("agents/graph.json.body");
const index = loadJson("agents/index.json.body");
const sitemapXml = readBody(path.join(APP, "sitemap.xml.body"));
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

const articleBySlug = new Map(catalog.articles.map((a) => [a.slug, a]));
const htmlBytes = new Map();
const markdownBytes = new Map();

for (const a of catalog.articles) {
  const html = path.join(APP, "blog", `${a.slug}.html`);
  if (exists(html)) htmlBytes.set(a.slug, Buffer.byteLength(readBody(html), "utf8"));
  const md = path.join(APP, "research", `${a.slug}.md.body`);
  if (exists(md)) markdownBytes.set(a.slug, Buffer.byteLength(readBody(md), "utf8"));
}

/* ── question set ────────────────────────────────────────────────────────── */

const STOP = new Set(["the", "a", "an", "of", "to", "and", "in", "on", "for", "with", "is", "are", "what", "how", "why", "when", "which", "does", "do", "of", "from", "that", "this", "it", "as", "by", "be", "or", "at"]);
const terms = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));

/** Build a deterministic question set from the published corpus. */
export function buildQuestions() {
  const questions = [];

  // 20 topical questions: the description is the query, the article is the
  // ground truth. The description is in the catalog; the body is in the page.
  const topical = [...catalog.articles]
    .filter((a) => a.description && a.description.length > 40)
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .filter((_, i) => i % 7 === 0)
    .slice(0, 20);

  for (const a of topical) {
    questions.push({
      id: `topical-${a.slug}`,
      type: "topical",
      query: a.description,
      expectedAnswer: a.title,
      relevantDocuments: [a.slug],
      relevantConcepts: [],
      relevantRelations: [],
      requiredPassages: [a.description],
      expectedCitations: [a.url],
    });
  }

  // 10 relational questions: the graph is the only place the answer exists.
  const reading = graph.edges.recommends_reading ?? [];
  const byChapter = new Map();
  for (const e of reading) {
    const chapter = Number(e.to.replace("chapter:", ""));
    if (!byChapter.has(chapter)) byChapter.set(chapter, []);
    byChapter.get(chapter).push(e.from.replace("/blog/", ""));
  }
  const chapters = [...byChapter.keys()].sort((a, b) => a - b).slice(0, 10);
  for (const chapter of chapters) {
    const slugs = byChapter.get(chapter).sort();
    questions.push({
      id: `relational-chapter-${chapter}`,
      type: "relational",
      query: `What further reading does chapter ${chapter} recommend?`,
      expectedAnswer: `Chapter ${chapter} recommends ${slugs.length} article(s).`,
      relevantDocuments: slugs,
      relevantConcepts: [],
      relevantRelations: slugs.map((s) => `recommends_reading:/blog/${s}->chapter:${chapter}`),
      requiredPassages: slugs.map((s) => `/blog/${s}`),
      expectedCitations: slugs.map((s) => `https://www.danielkliewer.com/blog/${s}`),
    });
  }

  return questions;
}

/* ── text extraction and scoring ─────────────────────────────────────────── */

function htmlText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function scoreText(text, queryTerms) {
  let score = 0;
  for (const term of queryTerms) if (text.includes(term)) score += 1;
  return score;
}

function scoreMetadata(article, queryTerms) {
  const title = article.title.toLowerCase();
  const description = article.description.toLowerCase();
  const tags = article.tags.join(" ").toLowerCase();
  let score = 0;
  for (const term of queryTerms) {
    if (title.includes(term)) score += 6;
    if (tags.includes(term)) score += 4;
    if (description.includes(term)) score += 2;
  }
  return score;
}

/* ── architectures ───────────────────────────────────────────────────────── */

/** A: crawl every HTML page once into a local index. A conventional crawler
 *  pays this large one-time cost; answering a query from the index is then
 *  local. The index has no graph and no typed metadata. */
function buildCrawlIndex() {
  const started = performance.now();
  let bytes = Buffer.byteLength(sitemapXml, "utf8");
  let requests = 1;
  const texts = new Map();

  for (const url of sitemapUrls) {
    const slug = url.match(/\/blog\/(.+)$/)?.[1];
    if (!slug || !articleBySlug.has(slug)) continue;
    const file = path.join(APP, "blog", `${slug}.html`);
    if (!exists(file)) continue;
    const html = readBody(file);
    bytes += Buffer.byteLength(html, "utf8");
    requests += 1;
    texts.set(slug, htmlText(html));
  }

  return { texts, bytes, requests, buildMs: performance.now() - started };
}

function runCrawl(query, queryTerms, index) {
  const started = performance.now();
  const ranked = [...index.texts.entries()]
    .map(([slug, text]) => ({ slug, score: scoreText(text, queryTerms) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const top = ranked.map((r) => r.slug);
  return {
    top,
    bytes: 0,
    requests: 0,
    latencyMs: performance.now() - started,
    relevantBytes: 0,
  };
}

/** B/C: rank by catalog metadata, then fetch the chosen documents. */
function runCompiled(query, queryTerms, queryType, useMarkdown) {
  const started = performance.now();
  let bytes = 0;
  let requests = 0;

  // The catalog and graph are fetched once per process; the harness models
  // that as a warm cache after the first question.
  if (!runCompiled.warm) {
    bytes += Buffer.byteLength(readBody(path.join(APP, "agents/catalog.json.body")), "utf8");
    bytes += Buffer.byteLength(readBody(path.join(APP, "agents/graph.json.body")), "utf8");
    requests += 2;
    runCompiled.warm = true;
  }

  let top = [];
  if (queryType === "relational") {
    const chapter = Number(query.match(/chapter (\d+)/)?.[1]);
    top = (graph.edges.recommends_reading ?? [])
      .filter((e) => e.to === `chapter:${chapter}`)
      .map((e) => e.from.replace("/blog/", ""));
  } else {
    const ranked = catalog.articles
      .map((a) => ({ slug: a.slug, score: scoreMetadata(a, queryTerms) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    top = ranked.map((r) => r.slug);
  }

  const sizeOf = useMarkdown ? markdownBytes : htmlBytes;
  for (const slug of top) bytes += sizeOf.get(slug) ?? 0;
  requests += top.length;

  return {
    top,
    bytes,
    requests,
    latencyMs: performance.now() - started,
    relevantBytes: top.reduce((n, s) => n + (sizeOf.get(s) ?? 0), 0),
  };
}

/* ── metrics ─────────────────────────────────────────────────────────────── */

function metrics(questions, runs, oneTime = { bytes: 0, requests: 0 }, sizeOf = () => 0) {
  let recallSum = 0;
  let precisionSum = 0;
  let citationSum = 0;
  let bytes = oneTime.bytes;
  let requests = oneTime.requests;
  let latency = 0;
  let relevantBytes = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const run = runs[i];
    const truth = new Set(q.relevantDocuments);
    const got = new Set(run.top);
    const hits = [...truth].filter((d) => got.has(d));
    recallSum += truth.size === 0 ? 0 : hits.length / truth.size;
    precisionSum += run.top.length === 0 ? 0 : hits.length / run.top.length;
    citationSum += run.top.some((slug) => {
      const a = articleBySlug.get(slug);
      return a && q.expectedCitations.includes(a.url);
    })
      ? 1
      : 0;
    for (const hit of hits) relevantBytes += sizeOf(hit) ?? 0;
    bytes += run.bytes;
    requests += run.requests;
    latency += run.latencyMs;
  }

  const n = questions.length;
  return {
    questions: n,
    recallAt5: recallSum / n,
    precisionAt5: precisionSum / n,
    citationAccuracy: citationSum / n,
    oneTimeBytes: oneTime.bytes,
    oneTimeRequests: oneTime.requests,
    bytes,
    requestsPerQuery: requests / n,
    latencyMsPerQuery: latency / n,
    contextEfficiency: bytes === 0 ? 0 : relevantBytes / bytes,
  };
}

/* ── run ─────────────────────────────────────────────────────────────────── */

export function run() {
  const questions = buildQuestions();

  const crawlRuns = [];
  const compiledHtmlRuns = [];
  const compiledMarkdownRuns = [];

  // Architecture A pays a large one-time crawl; B and C pay a small one-time
  // catalog+graph fetch and cache it. A has no catalog and no graph.
  const crawlIndex = buildCrawlIndex();
  runCompiled.warm = false;
  for (const q of questions) {
    const queryTerms = terms(q.query);
    crawlRuns.push(runCrawl(q.query, queryTerms, crawlIndex));
    compiledHtmlRuns.push(runCompiled(q.query, queryTerms, q.type, false));
    compiledMarkdownRuns.push(runCompiled(q.query, queryTerms, q.type, true));
    runCompiled.warm = true;
  }

  const catalogGraphBytes =
    fs.statSync(path.join(APP, "agents/catalog.json.body")).size +
    fs.statSync(path.join(APP, "agents/graph.json.body")).size;

  const report = {
    generatedBy: "benchmarks/retrieval/src/benchmark.mjs",
    corpus: {
      articles: catalog.articles.length,
      graphEdges: Object.values(graph.counts).reduce((a, b) => a + b, 0),
      sitemapUrls: sitemapUrls.length,
      htmlBytes: [...htmlBytes.values()].reduce((a, b) => a + b, 0),
      markdownBytes: [...markdownBytes.values()].reduce((a, b) => a + b, 0),
      catalogBytes: fs.statSync(path.join(APP, "agents/catalog.json.body")).size,
      graphBytes: fs.statSync(path.join(APP, "agents/graph.json.body")).size,
    },
    architectures: {
      A_crawling: metrics(
        questions,
        crawlRuns,
        { bytes: crawlIndex.bytes, requests: crawlIndex.requests },
        (slug) => htmlBytes.get(slug) ?? 0
      ),
      B_catalog_graph_html: metrics(
        questions,
        compiledHtmlRuns,
        { bytes: catalogGraphBytes, requests: 2 },
        (slug) => htmlBytes.get(slug) ?? 0
      ),
      C_catalog_graph_markdown: metrics(
        questions,
        compiledMarkdownRuns,
        { bytes: catalogGraphBytes, requests: 2 },
        (slug) => markdownBytes.get(slug) ?? 0
      ),
    },
    questions,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "questions.json"), JSON.stringify(questions, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT_DIR, "benchmark-report.json"), JSON.stringify(report, null, 2) + "\n");

  const f = (n, d = 3) => Number(n).toFixed(d);
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  console.log(`questions: ${questions.length}  (corpus: ${report.corpus.articles} articles)\n`);
  for (const [name, m] of Object.entries(report.architectures)) {
    console.log(name);
    console.log(`  recall@5           ${f(m.recallAt5)}`);
    console.log(`  precision@5        ${f(m.precisionAt5)}`);
    console.log(`  citation accuracy  ${f(m.citationAccuracy)}`);
    console.log(`  one-time bytes     ${kb(m.oneTimeBytes)}  (${m.oneTimeRequests} requests)`);
    console.log(`  total bytes        ${kb(m.bytes)}`);
    console.log(`  requests/query     ${f(m.requestsPerQuery, 1)}`);
    console.log(`  latency/query      ${f(m.latencyMsPerQuery, 1)} ms (local)`);
    console.log(`  context efficiency ${f(m.contextEfficiency)}`);
    console.log("");
  }
  console.log(`report: ${path.relative(root, path.join(OUT_DIR, "benchmark-report.json"))}`);
  return report;
}

const isEntry =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntry) run();
