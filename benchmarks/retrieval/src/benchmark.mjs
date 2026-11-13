#!/usr/bin/env node
/* ============================================================
   retrieval benchmark — does the compiled architecture actually
   retrieve better than crawling, and at what cost?

   Three architectures over a MANUALLY ADJUDICATED question set
   (benchmarks/retrieval/src/adjudicated.mjs):

     A. Conventional website crawling
        Fetch the sitemap, crawl every HTML page into a local index.
        No catalog, no graph, no claims.

     B. Compiled catalog and graph
        Fetch the compact catalog and graph once, rank by metadata, use
        the graph for relationship questions, then fetch the top five
        HTML pages.

     C. Compiled catalog, graph and canonical Markdown
        Same ranking, but fetch the small Markdown mirrors instead.

   Metrics: Recall@5, Precision@5, citation accuracy, passage recall
   (did the retrieved documents actually contain the required passage?)
   and false-support rate (did an architecture return a confident-looking
   document for a question the corpus cannot answer?).

   Cache assumptions, stated explicitly:
     - A crawls the whole site once per session and keeps a local index.
     - B/C fetch catalog.json + graph.json once per session and cache them.
     - Document bodies are fetched per query and not cached.
   These are per-session assumptions; a real deployment may cache more.

   Local simulation: "bytes transferred" is the byte count of the artifacts
   a real client would download; latency is local processing time, not
   network time. Network and agent measurements are explicitly out of scope.

   Usage:
     node benchmarks/retrieval/src/benchmark.mjs
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildAdjudicated } from "./adjudicated.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = path.join(root, ".next", "server", "app");
const OUT_DIR = path.join(root, "benchmarks", "retrieval", "data");

const readBody = (p) => fs.readFileSync(p, "utf8");
const exists = (p) => fs.existsSync(p);

const catalog = JSON.parse(readBody(path.join(APP, "agents/catalog.json.body")));
const graph = JSON.parse(readBody(path.join(APP, "agents/graph.json.body")));
const claims = JSON.parse(readBody(path.join(APP, "agents/claims.json.body")));
const sitemapXml = readBody(path.join(APP, "sitemap.xml.body"));
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

const { questions } = buildAdjudicated();

const articleBySlug = new Map(catalog.articles.map((a) => [a.slug, a]));
const htmlBytes = new Map();
const markdownBytes = new Map();
const markdownText = new Map();

for (const a of catalog.articles) {
  const html = path.join(APP, "blog", `${a.slug}.html`);
  if (exists(html)) htmlBytes.set(a.slug, Buffer.byteLength(readBody(html), "utf8"));
  const md = path.join(APP, "research", `${a.slug}.md.body`);
  if (exists(md)) {
    const body = readBody(md);
    markdownBytes.set(a.slug, Buffer.byteLength(body, "utf8"));
    markdownText.set(a.slug, body.toLowerCase());
  }
}

const allEdges = Object.values(graph.edges).flat();

/* ── text extraction and scoring ─────────────────────────────────────────── */

const STOP = new Set([
  "the", "a", "an", "of", "to", "and", "in", "on", "for", "with", "is", "are", "what", "how",
  "why", "when", "which", "does", "do", "from", "that", "this", "it", "as", "by", "be", "or",
  "at", "any", "there", "their", "its", "not", "no", "yes",
]);
const terms = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));

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
  return {
    top: ranked.map((r) => r.slug),
    bytes: 0,
    requests: 0,
    latencyMs: performance.now() - started,
  };
}

function runCompiled(query, queryTerms, question, useMarkdown) {
  const started = performance.now();
  let bytes = 0;
  let requests = 0;

  if (!runCompiled.warm) {
    bytes += fs.statSync(path.join(APP, "agents/catalog.json.body")).size;
    bytes += fs.statSync(path.join(APP, "agents/graph.json.body")).size;
    requests += 2;
    runCompiled.warm = true;
  }

  let top = [];
  // Relationship questions are answered from the structured graph index.
  if (question.answerLocation === "graph" && question.relevantRelations.length) {
    const docs = new Set();
    for (const rel of question.relevantRelations) {
      for (const e of allEdges) {
        if (e.id === rel || `${e.type}:${e.from}->${e.to}` === rel) {
          if (e.from.startsWith("/blog/")) docs.add(e.from.replace("/blog/", ""));
          if (e.to.startsWith("/blog/")) docs.add(e.to.replace("/blog/", ""));
        }
      }
    }
    top = [...docs].slice(0, 5);
  } else if (question.answerLocation === "claims") {
    // The answer lives in claims.json, not in a document; return nothing.
    top = [];
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

  return { top, bytes, requests, latencyMs: performance.now() - started };
}

/* ── metrics ─────────────────────────────────────────────────────────────── */

function documentText(slug, kind) {
  if (kind === "crawl") {
    const file = path.join(APP, "blog", `${slug}.html`);
    return exists(file) ? htmlText(readBody(file)) : "";
  }
  if (kind === "markdown") return markdownText.get(slug) ?? "";
  const a = articleBySlug.get(slug);
  return a ? `${a.title} ${a.description} ${a.tags.join(" ")}`.toLowerCase() : "";
}

function passageFound(passage, texts) {
  const need = terms(passage);
  if (need.length === 0) return true;
  for (const text of texts) {
    const hits = need.filter((t) => text.includes(t)).length;
    if (hits / need.length >= 0.6) return true;
  }
  return false;
}

function evaluate(questions, runs, kind) {
  let recallSum = 0;
  let precisionSum = 0;
  let citationSum = 0;
  let passageSum = 0;
  let falseSupport = 0;
  let docQuestions = 0;
  let passageQuestions = 0;
  let noSupportQuestions = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const run = runs[i];
    const texts = run.top.map((s) => documentText(s, kind));

    if (q.relevantDocuments.length) {
      docQuestions += 1;
      const truth = new Set(q.relevantDocuments);
      const got = new Set(run.top);
      const hits = [...truth].filter((d) => got.has(d)).length;
      recallSum += hits / truth.size;
      precisionSum += run.top.length === 0 ? 0 : hits / run.top.length;
      citationSum += run.top.some((slug) => {
        const a = articleBySlug.get(slug);
        return a && q.expectedCitations.includes(a.url);
      })
        ? 1
        : 0;
    }

    if (q.requiredPassages.length) {
      passageQuestions += 1;
      if (q.requiredPassages.every((p) => passageFound(p, texts))) passageSum += 1;
    }

    if (q.expectedOutcome === "no_support") {
      noSupportQuestions += 1;
      const check = q.falseSupportTerms ?? terms(q.query);
      if (texts.some((text) => check.some((t) => text.includes(t)))) falseSupport += 1;
    }
  }

  const n = questions.length;
  return {
    questions: n,
    documentQuestions: docQuestions,
    recallAt5: docQuestions ? recallSum / docQuestions : null,
    precisionAt5: docQuestions ? precisionSum / docQuestions : null,
    citationAccuracy: docQuestions ? citationSum / docQuestions : null,
    passageRecall: passageQuestions ? passageSum / passageQuestions : null,
    falseSupportRate: noSupportQuestions ? falseSupport / noSupportQuestions : null,
    bytes: runs.reduce((a, r) => a + r.bytes, 0),
    requestsPerQuery: runs.reduce((a, r) => a + r.requests, 0) / n,
    latencyMsPerQuery: runs.reduce((a, r) => a + r.latencyMs, 0) / n,
  };
}

/* ── run ─────────────────────────────────────────────────────────────────── */

export function run() {
  const crawlIndex = buildCrawlIndex();
  const crawlRuns = [];
  const compiledHtmlRuns = [];
  const compiledMarkdownRuns = [];

  runCompiled.warm = false;
  for (const q of questions) {
    const queryTerms = terms(q.query);
    crawlRuns.push(runCrawl(q.query, queryTerms, crawlIndex));
    compiledHtmlRuns.push(runCompiled(q.query, queryTerms, q, false));
    compiledMarkdownRuns.push(runCompiled(q.query, queryTerms, q, true));
    runCompiled.warm = true;
  }

  const catalogGraphBytes =
    fs.statSync(path.join(APP, "agents/catalog.json.body")).size +
    fs.statSync(path.join(APP, "agents/graph.json.body")).size;

  const report = {
    generatedBy: "benchmarks/retrieval/src/benchmark.mjs",
    adjudication: "benchmarks/retrieval/src/adjudicated.mjs",
    cacheAssumptions: {
      A_crawling: "crawls the whole site once per session; keeps a local full-text index; no catalog, no graph",
      B_catalog_graph_html:
        "fetches catalog.json + graph.json once per session and caches them; fetches document bodies per query",
      C_catalog_graph_markdown:
        "same as B, but fetches canonical Markdown mirrors instead of HTML bodies",
    },
    localOnly: true,
    corpus: {
      articles: catalog.articles.length,
      graphEdges: allEdges.length,
      claims: claims.claims.length,
    },
    architectures: {
      A_crawling: evaluate(questions, crawlRuns, "crawl"),
      B_catalog_graph_html: evaluate(questions, compiledHtmlRuns, "metadata"),
      C_catalog_graph_markdown: evaluate(questions, compiledMarkdownRuns, "markdown"),
    },
    oneTimeBytes: {
      A_crawling: crawlIndex.bytes,
      B_catalog_graph_html: catalogGraphBytes,
      C_catalog_graph_markdown: catalogGraphBytes,
    },
    questions,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "adjudicated-questions.json"),
    JSON.stringify(questions, null, 2) + "\n"
  );
  fs.writeFileSync(path.join(OUT_DIR, "benchmark-report.json"), JSON.stringify(report, null, 2) + "\n");

  const f = (n) => (n === null ? "n/a" : Number(n).toFixed(3));
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  console.log(`adjudicated questions: ${questions.length}  (corpus: ${report.corpus.articles} articles)\n`);
  for (const [name, m] of Object.entries(report.architectures)) {
    console.log(name);
    console.log(`  recall@5           ${f(m.recallAt5)}`);
    console.log(`  precision@5        ${f(m.precisionAt5)}`);
    console.log(`  citation accuracy  ${f(m.citationAccuracy)}`);
    console.log(`  passage recall     ${f(m.passageRecall)}`);
    console.log(`  false-support rate ${f(m.falseSupportRate)}`);
    console.log(`  one-time bytes     ${kb(report.oneTimeBytes[name])}`);
    console.log(`  total bytes        ${kb(m.bytes)}`);
    console.log(`  requests/query     ${m.requestsPerQuery.toFixed(1)}`);
    console.log(`  latency/query      ${m.latencyMsPerQuery.toFixed(1)} ms (local)`);
    console.log("");
  }
  console.log(`report: ${path.relative(root, path.join(OUT_DIR, "benchmark-report.json"))}`);
  return report;
}

export {
  allEdges,
  articleBySlug,
  buildCrawlIndex,
  catalog,
  claims,
  documentText,
  htmlBytes,
  markdownBytes,
  markdownText,
  runCompiled,
  runCrawl,
  scoreMetadata,
  terms,
};

const isEntry =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntry) run();
