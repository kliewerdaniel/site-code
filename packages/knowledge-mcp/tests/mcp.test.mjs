/**
 * Integration test for the MCP adapter (packages/knowledge-mcp/src/server.ts).
 *
 * Spawns the real stdio server against a local HTTP corpus, so it exercises
 * the JSON-RPC protocol, the tool dispatch, the retrieval limits and the SDK
 * end to end — no network, no build artefact required.
 *
 * Run: node --test packages/knowledge-mcp/tests/mcp.test.mjs
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

const ARTICLES = [
  {
    slug: "2026-01-01-deterministic-authorization",
    url: "https://example.com/blog/2026-01-01-deterministic-authorization",
    markdownUrl: "https://example.com/research/2026-01-01-deterministic-authorization.md",
    title: "Deterministic agent authorization",
    published: "2026-01-01T00:00:00.000Z",
    description: "A deterministic layer decides whether a proposal may run.",
    tags: ["agent-architecture", "deterministic"],
    readingMinutes: 5,
  },
];

const BODIES = {
  "2026-01-01-deterministic-authorization":
    "# Deterministic agent authorization\n\nA model proposes; a deterministic layer disposes.\n",
};

function mirror(slug) {
  const body = BODIES[slug];
  const hash = createHash("sha256").update(body, "utf8").digest("hex");
  const article = ARTICLES.find((a) => a.slug === slug);
  return [
    "---",
    `doc_id: danielkliewer.com/article/${slug}`,
    `canonical_url: ${article.url}`,
    `title: ${JSON.stringify(article.title)}`,
    `published: ${article.published}`,
    `modified: ${article.published}`,
    "type: article",
    "concepts: []",
    "projects: []",
    `content_hash: sha256:${hash}`,
    `bytes: ${Buffer.byteLength(body, "utf8")}`,
    "provenance:",
    `  source: content/research/${slug}.md`,
    "  generator: test",
    "  site: https://example.com",
    "---",
    "",
    body,
  ].join("\n");
}

const CATALOG = {
  site: { name: "Test Author", url: "https://example.com" },
  counts: { articles: 1, projects: 0, concepts: 0, paths: 1, chapters: 1 },
  articles: ARTICLES,
  projects: [],
  concepts: [],
  paths: [
    {
      slug: "example-path",
      url: "https://example.com/paths/example-path",
      name: "Example path",
      promise: "An ordered route.",
      audience: "Engineers.",
      steps: [
        {
          kind: "article",
          ref: "2026-01-01-deterministic-authorization",
          url: "https://example.com/blog/2026-01-01-deterministic-authorization",
          note: "Read.",
        },
      ],
    },
  ],
  chapters: [{ n: 1, part: "I", title: "The Cloud Is a Liability", url: "https://example.com/book" }],
};

const GRAPH = {
  vocabulary: ["recommends_reading"],
  counts: { recommends_reading: 0 },
  absent: [],
  edges: { recommends_reading: [] },
  proposed: [],
};

const CLAIMS = {
  claims: [
    {
      id: "claim:test",
      statement: "A test claim",
      source: "test.ts",
      sourceSpan: "test",
      category: "relation",
      assessment: "supported",
      verification: "demonstrated",
      supportingEvidence: ["ev:test"],
      contradictoryEvidence: [],
      relationships: [],
      authoritative: true,
      provenance: { source: "test.ts", generator: "test", fingerprint: "f" },
    },
  ],
};

const EVIDENCE = {
  evidence: [
    {
      id: "ev:test",
      type: "source_span",
      source: "test.ts",
      span: "test",
      contentHash: "abc",
      verification: { status: "verified", method: "curated" },
    },
  ],
};

const BOOK = {
  title: "Test Book",
  subtitle: "A Test",
  author: "Test Author",
  asin: "B0TEST",
  amazonUrl: "https://amazon.com/dp/B0TEST",
  datePublished: "2026-01-01",
  chapters: [{ n: 1, part: "I", title: "The Cloud Is a Liability" }],
  articleRelationships: [
    {
      article: "https://example.com/blog/2026-01-01-deterministic-authorization",
      chapter: 1,
      relation: "recommends_reading",
      reason: "Chapter 1 §1.1.",
    },
  ],
  purchase: { destination: "https://amazon.com/dp/B0TEST", merchant: "Amazon", authorizedBy: "A human", note: "Do not purchase." },
};

const INDEX = {
  site: { name: "Test Author", url: "https://example.com" },
  resources: [
    "/agents/index.json",
    "/agents/catalog.json",
    "/agents/graph.json",
    "/agents/book.json",
    "/agents/claims.json",
    "/agents/evidence.json",
    "/agents/proposals.json",
  ].map((p) => ({ path: p, bytes: 1, contentType: "application/json; charset=utf-8" })),
};

const BY_PATH = {
  "/agents/index.json": JSON.stringify(INDEX),
  "/agents/catalog.json": JSON.stringify(CATALOG),
  "/agents/graph.json": JSON.stringify(GRAPH),
  "/agents/claims.json": JSON.stringify(CLAIMS),
  "/agents/evidence.json": JSON.stringify(EVIDENCE),
  "/agents/book.json": JSON.stringify(BOOK),
  "/agents/proposals.json": JSON.stringify({ proposals: [] }),
  "/research/2026-01-01-deterministic-authorization.md": mirror(
    "2026-01-01-deterministic-authorization"
  ),
};

let server;
let child;
let nextId = 1;
const pending = new Map();
let buffer = "";

function request(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, resolve);
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`timeout waiting for ${method}`));
      }
    }, 10_000);
  });
}

function parseText(result) {
  return JSON.parse(result.content[0].text);
}

test.before(async () => {
  server = http.createServer((req, res) => {
    const body = BY_PATH[new URL(req.url, "http://x").pathname];
    if (body === undefined) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      etag: `"${createHash("sha256").update(body).digest("hex").slice(0, 12)}"`,
    });
    res.end(body);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;

  child = spawn(
    process.execPath,
    [path.resolve("packages/knowledge-mcp/src/server.ts")],
    {
      env: {
        ...process.env,
        KNOWLEDGE_BASE_URL: `http://127.0.0.1:${port}`,
      },
      stdio: ["pipe", "pipe", "pipe"],
    }
  );
  child.stdout.on("data", (d) => {
    buffer += d.toString();
    let idx;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (!line.trim()) continue;
      const msg = JSON.parse(line);
      if (msg.id !== undefined && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    }
  });
  child.stderr.on("data", () => {});
  await request("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test", version: "0" },
  });
});

test.after(async () => {
  child?.kill("SIGKILL");
  await new Promise((resolve) => server?.close(resolve));
});

test("MCP: initialize reports the server and tool capability", async () => {
  const init = await request("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test", version: "0" },
  });
  assert.equal(init.result.serverInfo.name, "danielkliewer-knowledge");
  assert.ok(init.result.capabilities.tools);
});

test("MCP: tools/list exposes the six corpus tools", async () => {
  const res = await request("tools/list");
  const names = res.result.tools.map((t) => t.name).sort();
  assert.deepEqual(names, [
    "get_article",
    "get_book_context",
    "get_evidence",
    "get_learning_path",
    "search_knowledge",
    "traverse_graph",
  ]);
});

test("MCP: search_knowledge returns a verified document", async () => {
  const res = await request("tools/call", {
    name: "search_knowledge",
    arguments: { query: "deterministic authorization" },
  });
  assert.equal(res.result.isError, undefined);
  const result = parseText(res.result);
  assert.equal(result.documents.length, 1);
  assert.equal(result.documents[0].slug, "2026-01-01-deterministic-authorization");
});

test("MCP: get_article returns metadata, body and citation", async () => {
  const res = await request("tools/call", {
    name: "get_article",
    arguments: { slug: "2026-01-01-deterministic-authorization" },
  });
  const article = parseText(res.result);
  assert.equal(article.metadata.title, "Deterministic agent authorization");
  assert.ok(article.body.startsWith("# Deterministic agent authorization"));
  assert.ok(article.citation.includes("https://example.com/blog/"));
});

test("MCP: get_evidence resolves the claim's evidence", async () => {
  const res = await request("tools/call", {
    name: "get_evidence",
    arguments: { claimId: "claim:test" },
  });
  const evidence = parseText(res.result);
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].id, "ev:test");
});

test("MCP: get_learning_path resolves steps", async () => {
  const res = await request("tools/call", {
    name: "get_learning_path",
    arguments: { slug: "example-path" },
  });
  const result = parseText(res.result);
  assert.equal(result.steps.length, 1);
});

test("MCP: get_book_context returns the chapter relationship", async () => {
  const res = await request("tools/call", {
    name: "get_book_context",
    arguments: { slug: "2026-01-01-deterministic-authorization" },
  });
  const result = parseText(res.result);
  assert.equal(result.relationships.length, 1);
});

test("MCP: an unknown tool returns an error result", async () => {
  const res = await request("tools/call", { name: "nope", arguments: {} });
  assert.equal(res.result.isError, true);
});

test("MCP: a tool failure returns an error result, not a crash", async () => {
  const res = await request("tools/call", {
    name: "get_article",
    arguments: { slug: "missing-article" },
  });
  assert.equal(res.result.isError, true);
  assert.match(res.result.content[0].text, /unknown article/);
});
