#!/usr/bin/env node
/* ============================================================
   agent experiment — does the compiled architecture actually help
   an LLM answer, or only a deterministic retriever?

   This is the second experiment category the directive requires. The
   deterministic harness (benchmark.mjs) measures which documents are
   retrieved. This harness feeds those retrieved documents to a real
   model and measures what it then says.

   Architectures (same retrieval as benchmark.mjs):
     A. Conventional crawling      — crawled HTML text as context
     B. Catalog + graph            — catalog metadata as context
     C. Catalog + graph + Markdown — canonical Markdown as context
     D. Parametric control         — no retrieval at all

   Metrics per question:
     - citationHit      the answer contains an expected canonical URL
     - fabricatedUrls   URLs in the answer that resolve to nothing in the corpus
     - abstained        the answer says the corpus does not contain the answer
     - unsupportedClaim a no_support question answered anyway, or a supported
                       question answered with a fabricated citation
     - ruleCorrect      a transparent rule-based correctness check (see grade)
     - bytes/requests   the retrieval cost of building the context
     - latencyMs/tokens the model call

   The model is local (Ollama). Model, prompt, temperature and token budget are
   recorded in the report. Nothing here is fabricated: raw answers and the
   exact prompt are committed for review.

   Usage:
     node benchmarks/retrieval/src/agent-experiment.mjs
   Environment:
     AGENT_MODEL          default lfm3-omni:latest
     OLLAMA_URL           default http://localhost:11434
     AGENT_NUM_PREDICT    default 256
     AGENT_TEMPERATURE    default 0
     AGENT_MAX_CONTEXT    default 6000 chars per document
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildAdjudicated } from "./adjudicated.mjs";
import {
  allEdges,
  articleBySlug,
  buildCrawlIndex,
  catalog,
  claims,
  documentText,
  markdownText,
  runCrawl,
  scoreMetadata,
  terms,
} from "./benchmark.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = path.join(root, ".next", "server", "app");
const OUT_DIR = path.join(root, "benchmarks", "retrieval", "data");
const REPORT_PATH = process.env.AGENT_REPORT
  ? path.resolve(process.env.AGENT_REPORT)
  : path.join(OUT_DIR, "agent-experiment-report.json");
const BOOK = JSON.parse(fs.readFileSync(path.join(APP, "agents/book.json.body"), "utf8"));

const MODEL = process.env.AGENT_MODEL ?? "lfm3-omni:latest";
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const NUM_PREDICT = Number(process.env.AGENT_NUM_PREDICT ?? 256);
const TEMPERATURE = Number(process.env.AGENT_TEMPERATURE ?? 0);
const MAX_CONTEXT_CHARS = Number(process.env.AGENT_MAX_CONTEXT ?? 6000);

const { questions: ALL_QUESTIONS } = buildAdjudicated();
const LIMIT = Number(process.env.AGENT_LIMIT ?? 0);
const questions = LIMIT > 0 ? ALL_QUESTIONS.slice(0, LIMIT) : ALL_QUESTIONS;
const crawlIndex = buildCrawlIndex();

const PROMPT_TEMPLATE = `You are answering a question from a compiled knowledge corpus.

CONTEXT:
{{context}}

QUESTION: {{query}}

Answer concisely. If the context does not contain the answer, reply exactly: "The corpus does not contain this information." Cite the URLs you used. Do not invent.`;

const PARAMETRIC_TEMPLATE = `You are answering a question. If you do not know, say so.

QUESTION: {{query}}

Answer concisely. Do not invent.`;

/* ── known URLs (for fabricated-citation detection) ──────────────────────── */

const KNOWN_URLS = new Set();
for (const a of catalog.articles) KNOWN_URLS.add(a.url.toLowerCase());
for (const p of catalog.projects) KNOWN_URLS.add(p.url.toLowerCase());
for (const c of catalog.concepts) KNOWN_URLS.add(c.url.toLowerCase());
for (const p of catalog.paths) KNOWN_URLS.add(p.url.toLowerCase());
KNOWN_URLS.add("https://www.danielkliewer.com");
KNOWN_URLS.add("https://danielkliewer.com");
KNOWN_URLS.add("https://www.amazon.com/dp/b0hmwfr6g7");

function urlsIn(text) {
  const raw = text.match(/https?:\/\/[^\s)"'\]}]+/g) ?? [];
  const out = [];
  for (const u of raw) {
    let v = u.replace(/[.,;:]+$/, "").toLowerCase();
    // A URL with no dotted host is not a citation.
    if (!/^https?:\/\/[^/]+\.[^/]+/.test(v)) continue;
    // A prefix of a known URL is a truncated citation, not a fabricated one.
    const truncated = [...KNOWN_URLS].some(
      (k) => k.startsWith(v) && v.length >= 20
    );
    if (truncated) continue;
    out.push(v);
  }
  return out;
}

/* ── retrieval context ───────────────────────────────────────────────────── */

function rankByMetadata(queryTerms) {
  return catalog.articles
    .map((a) => ({ slug: a.slug, score: scoreMetadata(a, queryTerms) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.slug.localeCompare(a.slug))
    .slice(0, 5)
    .map((r) => r.slug);
}

function contextFor(question, kind) {
  const queryTerms = terms(question.query);

  // A conventional crawler: full text of the top pages, nothing structured.
  // The same per-document budget as C, so the comparison is about
  // representation, not about how much text each side is allowed to read.
  if (kind === "crawl") {
    const run = runCrawl(question.query, queryTerms, crawlIndex);
    return {
      top: run.top,
      parts: run.top.map((s) =>
        documentText(s, "crawl").slice(0, MAX_CONTEXT_CHARS)
      ),
      bytes: 0,
      requests: 0,
    };
  }

  // B/C: the compiled catalog, the full typed graph and the claim index.
  const top = rankByMetadata(queryTerms);
  const parts = [];

  for (const slug of top) {
    const a = articleBySlug.get(slug);
    if (!a) continue;
    parts.push(
      `[${a.title}]\nURL: ${a.url}\n${a.description}\nTags: ${a.tags.join(", ")}`
    );
  }

  parts.push(
    "RELATIONS:\n" +
      allEdges
        .map((e) => `${e.from} -${e.type}-> ${e.to} (${e.status}, ${e.verification})`)
        .join("\n")
  );

  parts.push(
    "CLAIMS:\n" +
      claims.claims
        .map(
          (c) =>
            `${c.statement} [${c.assessment}${c.authoritative ? ", authoritative" : ", proposed"}]`
        )
        .join("\n")
  );

  if (/book|chapter|isbn|computational sovereignty/i.test(question.query)) {
    parts.push(`BOOK:\n${JSON.stringify(BOOK)}`);
  }

  // C adds the canonical Markdown bodies.
  if (kind === "markdown") {
    for (const slug of top) {
      const body = (markdownText.get(slug) ?? "").slice(0, MAX_CONTEXT_CHARS);
      if (body) parts.push(`MARKDOWN ${slug}:\n${body}`);
    }
  }

  return { top, parts, bytes: 0, requests: 0 };
}

function buildPrompt(question, context, parametric) {
  if (parametric) {
    return PARAMETRIC_TEMPLATE.replace("{{query}}", question.query);
  }
  const body = context.parts.join("\n\n");
  return PROMPT_TEMPLATE.replace("{{context}}", body).replace(
    "{{query}}",
    question.query
  );
}

/* ── model ───────────────────────────────────────────────────────────────── */

async function askModel(prompt) {
  const started = performance.now();
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: { num_predict: NUM_PREDICT, temperature: TEMPERATURE },
    }),
  });
  if (!res.ok) throw new Error(`ollama returned ${res.status}`);
  const json = await res.json();
  return {
    answer: json.response ?? "",
    latencyMs: performance.now() - started,
    promptTokens: json.prompt_eval_count ?? 0,
    completionTokens: json.eval_count ?? 0,
    tokens: (json.prompt_eval_count ?? 0) + (json.eval_count ?? 0),
    promptChars: prompt.length,
  };
}

/* ── grading ─────────────────────────────────────────────────────────────── */

const ABSTENTION =
  /(does not contain|not contain|no information|not available|cannot answer|can't answer|don't know|do not know|no evidence|insufficient|not in the (context|corpus)|i don't have|unknown|not explicitly stated|not stated|not specified|not provided|not mentioned|no mention|doesn't mention|does not mention|not present|no record of)/i;

const EXPECTATION_STOP = new Set([
  "the", "a", "an", "of", "to", "and", "in", "on", "for", "with", "is", "are",
  "what", "how", "why", "when", "which", "does", "do", "from", "that", "this",
  "it", "as", "by", "be", "or", "at", "any", "there", "their", "its", "not",
  "no", "yes", "s", "article", "articles", "claim", "claims", "corpus",
]);

function expectedTerms(s) {
  return (s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0 && !EXPECTATION_STOP.has(t));
}

function listItems(expectedAnswer) {
  const afterColon = expectedAnswer.includes(":")
    ? expectedAnswer.split(":").slice(1).join(":")
    : expectedAnswer;
  return afterColon
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function valueHit(question, a) {
  const expected = (question.expectedAnswer ?? "").toLowerCase();
  if (!expected) return false;
  if (a.includes(expected)) return true;
  const iso = /^(\d{4}-\d{2}-\d{2})t/.exec(expected);
  if (iso && a.includes(iso[1])) return true;
  return false;
}

function grade(question, answer) {
  const a = answer.toLowerCase();
  const abstained = ABSTENTION.test(a);
  const citationHit = (question.expectedCitations ?? []).some((u) =>
    a.includes(u.toLowerCase())
  );
  const fabricated = urlsIn(answer).filter((u) => !KNOWN_URLS.has(u));
  const contradictory = abstained && citationHit;

  if (question.expectedOutcome === "no_support") {
    const falseTerms = question.falseSupportTerms ?? terms(question.query);
    const falseHit = !abstained && falseTerms.some((t) => a.includes(t));
    return {
      correct: abstained || (!falseHit && fabricated.length === 0),
      unsupportedClaim: falseHit || fabricated.length > 0,
      abstained,
      contradictory,
      citationHit,
      fabricated,
      expectedFraction: 0,
    };
  }

  // A question whose adjudicated answer is "not found" is a negative question.
  if ((question.expectedAnswer ?? "").toLowerCase() === "not found") {
    const saysNone = /\b(no|none|not found|not present|no prerequisite)\b/.test(a);
    return {
      correct: saysNone || abstained,
      unsupportedClaim: !saysNone && !abstained,
      abstained,
      contradictory,
      citationHit,
      fabricated,
      expectedFraction: 0,
    };
  }

  let correct = false;
  let expectedFraction = 0;

  if (question.category === "direct-factual") {
    const hit = valueHit(question, a);
    correct = hit || citationHit;
    expectedFraction = hit ? 1 : 0;
  } else if (question.category === "cross-document") {
    const items = listItems(question.expectedAnswer);
    const hits = items.filter((i) => a.includes(i)).length;
    expectedFraction = items.length ? hits / items.length : 0;
    correct =
      !abstained && citationHit && expectedFraction >= 0.6 && fabricated.length === 0;
  } else if (question.category === "relationship-traversal") {
    const items = listItems(question.expectedAnswer).map((i) =>
      i.replace(/[()]/g, "").split(" ")[0]
    );
    const hits = items.filter((i) => i.length > 2 && a.includes(i)).length;
    expectedFraction = items.length ? hits / items.length : 0;
    correct = !abstained && expectedFraction >= 0.6 && fabricated.length === 0;
  } else if (question.category === "claim-verification") {
    const expected = (question.expectedAnswer ?? "").toLowerCase();
    let hit = false;
    if (/^yes/.test(expected)) hit = /\byes\b/.test(a);
    else if (/^no\b/.test(expected)) hit = /\bno\b/.test(a);
    else if (/^\d+$/.test(expected.trim())) hit = a.includes(expected.trim());
    else if (expected.includes("assessment:")) {
      const word = expected.split("assessment:")[1].trim().split(/[^a-z]/)[0];
      hit = a.includes(word);
    } else hit = valueHit(question, a);
    correct = !abstained && hit && fabricated.length === 0;
    expectedFraction = hit ? 1 : 0;
  } else {
    const expected = expectedTerms(question.expectedAnswer);
    const hits = expected.filter((t) => a.includes(t)).length;
    expectedFraction = expected.length ? hits / expected.length : 0;
    correct =
      !abstained && (citationHit || expectedFraction >= 0.6) && fabricated.length === 0;
  }

  // An answer that both abstains and cites is contradictory: it did not answer.
  if (contradictory) correct = false;

  return {
    correct,
    unsupportedClaim: fabricated.length > 0,
    abstained,
    contradictory,
    citationHit,
    fabricated,
    expectedFraction,
  };
}

/* ── run ─────────────────────────────────────────────────────────────────── */

const ARCHITECTURES = [
  { key: "A_crawling", kind: "crawl", parametric: false },
  { key: "B_catalog_graph", kind: "metadata", parametric: false },
  { key: "C_catalog_graph_markdown", kind: "markdown", parametric: false },
  { key: "D_parametric_control", kind: null, parametric: true },
];

/** Recompute the grades and summaries from the stored raw answers. Used after
 *  the grader changes, so the model does not have to be called again. */
export function regrade(report) {
  for (const arch of Object.values(report.architectures)) {
    for (const pass of ["cold", "warm"]) {
      const rows = arch[`${pass}Results`];
      for (const row of rows) {
        const q = report.questions.find((x) => x.id === row.id);
        Object.assign(row, grade(q, row.answer));
      }
      arch[pass] = summarize(rows);
    }
  }
  return report;
}

const contextCache = new Map();

async function runPass(label, useCache) {
  const results = {};
  for (const arch of ARCHITECTURES) results[arch.key] = [];

  let done = 0;
  for (const q of questions) {
    for (const arch of ARCHITECTURES) {
      const cacheKey = `${arch.key}:${q.id}`;
      let context;
      if (useCache && contextCache.has(cacheKey)) {
        context = contextCache.get(cacheKey);
      } else {
        context = arch.parametric
          ? { top: [], parts: [], bytes: 0, requests: 0 }
          : contextFor(q, arch.kind);
        if (useCache) contextCache.set(cacheKey, context);
      }
      const prompt = buildPrompt(q, context, arch.parametric);
      const model = await askModel(prompt);
      const graded = grade(q, model.answer);
      results[arch.key].push({
        id: q.id,
        category: q.category,
        expectedOutcome: q.expectedOutcome,
        ...graded,
        bytes: context.bytes,
        requests: context.requests,
        latencyMs: Math.round(model.latencyMs),
        tokens: model.tokens,
        promptChars: model.promptChars,
        answer: model.answer,
      });
      done += 1;
      if (done % 20 === 0) {
        process.stdout.write(`  ${label}: ${done}/${questions.length * ARCHITECTURES.length}\n`);
      }
    }
  }
  return results;
}

function summarize(rows) {
  const n = rows.length;
  const supported = rows.filter((r) => r.expectedOutcome === "supported");
  const noSupport = rows.filter((r) => r.expectedOutcome === "no_support");
  const sum = (f) => rows.reduce((a, r) => a + f(r), 0);
  const withCitations = supported.filter((r) => r.citationHit);
  return {
    questions: n,
    supported: supported.length,
    noSupport: noSupport.length,
    ruleCorrectRate: sum((r) => (r.correct ? 1 : 0)) / n,
    citationAccuracy: withCitations.length / n,
    abstentionRateOnNoSupport:
      noSupport.length === 0
        ? null
        : noSupport.reduce((a, r) => a + (r.abstained ? 1 : 0), 0) / noSupport.length,
    unsupportedClaimRate:
      noSupport.length === 0
        ? null
        : noSupport.reduce((a, r) => a + (r.unsupportedClaim ? 1 : 0), 0) /
          noSupport.length,
    fabricatedCitationRate: sum((r) => (r.fabricated.length > 0 ? 1 : 0)) / n,
    contradictoryRate: sum((r) => (r.contradictory ? 1 : 0)) / n,
    bytes: sum((r) => r.bytes),
    requestsPerQuery: sum((r) => r.requests) / n,
    latencyMsPerQuery: sum((r) => r.latencyMs) / n,
    tokensPerQuery: sum((r) => r.tokens) / n,
    promptCharsPerQuery: sum((r) => r.promptChars) / n,
  };
}

export async function run() {
  process.stdout.write(`model: ${MODEL} @ ${OLLAMA_URL}\n`);
  process.stdout.write(`questions: ${questions.length}\n\n`);

  const cold = await runPass("cold", false);
  const warm = await runPass("warm", true);

  const report = {
    generatedBy: "benchmarks/retrieval/src/agent-experiment.mjs",
    adjudication: "benchmarks/retrieval/src/adjudicated.mjs",
    model: {
      name: MODEL,
      endpoint: OLLAMA_URL,
      temperature: TEMPERATURE,
      numPredict: NUM_PREDICT,
      maxContextChars: MAX_CONTEXT_CHARS,
      promptTemplate: PROMPT_TEMPLATE,
      parametricTemplate: PARAMETRIC_TEMPLATE,
    },
    cacheAssumptions: {
      cold: "retrieval context built fresh for every question (no context cache)",
      warm: "retrieval context reused across the pass (in-process cache); the model is still called per question",
      note: "the warm pass repeats identical prompts, so the model's KV cache is warm; the large latency drop is a model-cache effect, not a retrieval-cache effect",
    },
    architectures: {},
    questions,
  };

  for (const arch of ARCHITECTURES) {
    report.architectures[arch.key] = {
      cold: summarize(cold[arch.key]),
      warm: summarize(warm[arch.key]),
      coldResults: cold[arch.key],
      warmResults: warm[arch.key],
    };
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

  const pct = (n) => (n === null ? "n/a" : `${(n * 100).toFixed(1)}%`);
  for (const [name, a] of Object.entries(report.architectures)) {
    const s = a.cold;
    console.log(name);
    console.log(`  rule-correct (cold)      ${pct(s.ruleCorrectRate)}`);
    console.log(`  citation accuracy        ${pct(s.citationAccuracy)}`);
    console.log(`  abstention on no-support ${pct(s.abstentionRateOnNoSupport)}`);
    console.log(`  unsupported-claim rate   ${pct(s.unsupportedClaimRate)}`);
    console.log(`  fabricated citations     ${pct(s.fabricatedCitationRate)}`);
    console.log(`  tokens/query (cold)      ${s.tokensPerQuery.toFixed(0)}`);
    console.log(`  latency/query (cold)     ${s.latencyMsPerQuery.toFixed(0)} ms`);
    console.log("");
  }
  console.log(`report: ${REPORT_PATH}`);
  return report;
}

const isEntry =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntry) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
