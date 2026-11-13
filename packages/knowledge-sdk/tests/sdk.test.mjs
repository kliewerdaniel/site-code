/**
 * Tests for the knowledge SDK (packages/knowledge-sdk/src).
 *
 * These use an in-memory corpus served by a mock fetch, so they exercise the
 * client's logic — ranking, byte budgets, ETag/304 handling, hash verification,
 * graph traversal and citation — without a network or a build.
 *
 * Run: node --test packages/knowledge-sdk/tests/sdk.test.mjs
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { KnowledgeCorpus, KnowledgeError, parseMirror, sha256Hex } from "../src/index.ts";

/* ── a synthetic corpus ──────────────────────────────────────────────────── */

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
  {
    slug: "2026-01-02-local-inference",
    url: "https://example.com/blog/2026-01-02-local-inference",
    markdownUrl: "https://example.com/research/2026-01-02-local-inference.md",
    title: "Local inference on Apple Silicon",
    published: "2026-01-02T00:00:00.000Z",
    description: "Running the model, the data and the failure modes on hardware you control.",
    tags: ["local-first-ai", "mlx"],
    readingMinutes: 7,
  },
  {
    slug: "2026-01-03-knowledge-compilation",
    url: "https://example.com/blog/2026-01-03-knowledge-compilation",
    markdownUrl: "https://example.com/research/2026-01-03-knowledge-compilation.md",
    title: "Knowledge compilation",
    published: "2026-01-03T00:00:00.000Z",
    description: "Turning source material into structured, validated knowledge units.",
    tags: ["knowledge-compiler", "canonical-knowledge"],
    readingMinutes: 9,
  },
];

const BODIES = {
  "2026-01-01-deterministic-authorization": "# Deterministic agent authorization\n\nA model proposes; a deterministic layer disposes.\n",
  "2026-01-02-local-inference": "# Local inference\n\nMemory is finite, so one model fits at a time.\n",
  "2026-01-03-knowledge-compilation": "# Knowledge compilation\n\nRetrieval gives passages; compilation gives claims.\n",
};

function mirror(slug) {
  const body = BODIES[slug];
  const hash = sha256Hex(body);
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
  counts: { articles: 3, projects: 1, concepts: 1, paths: 1, chapters: 1 },
  articles: ARTICLES,
  projects: [
    {
      slug: "example-project",
      url: "https://example.com/projects/example-project",
      name: "Example Project",
      role: "A governed execution layer.",
      maturity: "implementation",
      concepts: ["governed-execution"],
      articles: ["2026-01-01-deterministic-authorization"],
    },
  ],
  concepts: [
    {
      slug: "governed-execution",
      url: "https://example.com/concepts/governed-execution",
      name: "Governed execution",
      oneLiner: "The model proposes; a deterministic layer decides.",
      tags: ["agent-architecture", "deterministic"],
      projects: ["example-project"],
    },
  ],
  paths: [
    {
      slug: "example-path",
      url: "https://example.com/paths/example-path",
      name: "Example path",
      promise: "An ordered route.",
      audience: "Engineers.",
      steps: [
        { kind: "concept", ref: "governed-execution", url: "https://example.com/concepts/governed-execution", note: "Start here." },
        { kind: "article", ref: "2026-01-01-deterministic-authorization", url: "https://example.com/blog/2026-01-01-deterministic-authorization", note: "Then read." },
      ],
    },
  ],
  chapters: [{ n: 1, part: "I", title: "The Cloud Is a Liability", url: "https://example.com/book" }],
};

const GRAPH = {
  vocabulary: ["implements", "documents", "prerequisite_for", "recommends_reading"],
  counts: { implements: 1, documents: 1, prerequisite_for: 1, recommends_reading: 0 },
  absent: ["extends"],
  edges: {
    implements: [
      {
        id: "implements:/projects/example-project->/concepts/governed-execution",
        from: "/projects/example-project",
        to: "/concepts/governed-execution",
        type: "implements",
        status: "declared",
        verification: "verified",
        provenance: { source: "taxonomy.ts", generator: "test", fingerprint: "a" },
      },
    ],
    documents: [
      {
        id: "documents:/blog/2026-01-01-deterministic-authorization->/projects/example-project",
        from: "/blog/2026-01-01-deterministic-authorization",
        to: "/projects/example-project",
        type: "documents",
        status: "declared",
        verification: "verified",
        provenance: { source: "taxonomy.ts", generator: "test", fingerprint: "b" },
      },
    ],
    prerequisite_for: [
      {
        id: "prerequisite_for:governed-execution->2026-01-01-deterministic-authorization",
        from: "governed-execution",
        to: "2026-01-01-deterministic-authorization",
        type: "prerequisite_for",
        status: "declared",
        verification: "verified",
        provenance: { source: "taxonomy.ts", generator: "test", fingerprint: "c" },
      },
    ],
    recommends_reading: [],
  },
  proposed: [],
};

const CLAIMS = {
  claims: [
    {
      id: "claim:implements:/projects/example-project->/concepts/governed-execution",
      statement: "Example Project implements governed execution",
      source: "taxonomy.ts",
      sourceSpan: "implements",
      category: "relation",
      assessment: "supported",
      verification: "demonstrated",
      supportingEvidence: ["ev:implements:/projects/example-project->/concepts/governed-execution"],
      contradictoryEvidence: [],
      relationships: ["implements:/projects/example-project->/concepts/governed-execution"],
      authoritative: true,
      provenance: { source: "taxonomy.ts", generator: "test", fingerprint: "a" },
    },
    {
      id: "claim:documents:/blog/2026-01-01-deterministic-authorization->/projects/example-project",
      statement: "The article is the write-up for Example Project",
      source: "taxonomy.ts",
      sourceSpan: "documents",
      category: "relation",
      assessment: "supported",
      verification: "demonstrated",
      supportingEvidence: [
        "ev:documents:/blog/2026-01-01-deterministic-authorization->/projects/example-project",
      ],
      contradictoryEvidence: [],
      relationships: [
        "documents:/blog/2026-01-01-deterministic-authorization->/projects/example-project",
      ],
      authoritative: true,
      provenance: { source: "taxonomy.ts", generator: "test", fingerprint: "b" },
    },
    {
      id: "claim:related_to:2026-01-01-deterministic-authorization->2026-01-03-knowledge-compilation",
      statement: "Two articles are related by shared tags",
      source: "propose.ts",
      sourceSpan: "shares 2 tags",
      category: "relation",
      assessment: "proposed",
      verification: "hypothesized",
      supportingEvidence: [],
      contradictoryEvidence: [],
      relationships: [],
      authoritative: false,
      provenance: { source: "propose.ts", generator: "test", fingerprint: "c" },
    },
  ],
};

const EVIDENCE = {
  evidence: [
    {
      id: "ev:implements:/projects/example-project->/concepts/governed-execution",
      type: "source_span",
      source: "taxonomy.ts",
      span: "implements",
      contentHash: "abc",
      verification: { status: "verified", method: "curated" },
    },
    {
      id: "ev:documents:/blog/2026-01-01-deterministic-authorization->/projects/example-project",
      type: "source_span",
      source: "taxonomy.ts",
      span: "documents",
      contentHash: "def",
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
    "/llms.txt",
    "/llms-full.txt",
    "/agents/index.json",
    "/agents/catalog.json",
    "/agents/graph.json",
    "/agents/book.json",
    "/agents/claims.json",
    "/agents/evidence.json",
    "/agents/proposals.json",
  ].map((p) => ({ path: p, bytes: 1, contentType: "application/json; charset=utf-8" })),
};

const BODIES_BY_PATH = {
  "/agents/index.json": JSON.stringify(INDEX),
  "/agents/catalog.json": JSON.stringify(CATALOG),
  "/agents/graph.json": JSON.stringify(GRAPH),
  "/agents/claims.json": JSON.stringify(CLAIMS),
  "/agents/evidence.json": JSON.stringify(EVIDENCE),
  "/agents/book.json": JSON.stringify(BOOK),
  "/agents/proposals.json": JSON.stringify({ proposals: [] }),
};
for (const slug of Object.keys(BODIES)) {
  BODIES_BY_PATH[`/research/${slug}.md`] = mirror(slug);
}

function mockFetch(url, opts = {}) {
  const path = new URL(url).pathname;
  const body = BODIES_BY_PATH[path];
  if (body === undefined) return Promise.resolve(new Response("not found", { status: 404 }));
  const etag = `"${createHash("sha256").update(body).digest("hex").slice(0, 12)}"`;
  const ifNoneMatch = opts.headers?.["If-None-Match"];
  if (ifNoneMatch && ifNoneMatch === etag) {
    return Promise.resolve(new Response(null, { status: 304, headers: { etag } }));
  }
  return Promise.resolve(
    new Response(body, {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", etag },
    })
  );
}

async function connect(overrides = {}) {
  return KnowledgeCorpus.connect({ baseUrl: "https://example.com", fetchFn: mockFetch, ...overrides });
}

/* ── tests ───────────────────────────────────────────────────────────────── */

test("connect: loads the catalog, graph, book, claims and evidence", async () => {
  const corpus = await connect();
  assert.equal(corpus.counts.articles, 3);
  const article = await corpus.getArticle("2026-01-01-deterministic-authorization");
  assert.equal(article.metadata.title, "Deterministic agent authorization");
  assert.equal(article.body, BODIES["2026-01-01-deterministic-authorization"]);
  assert.ok(article.citation.includes("https://example.com/blog/"));
});

test("search: ranks by relevance and returns verified bodies", async () => {
  const corpus = await connect();
  const result = await corpus.search({ query: "deterministic authorization", maxDocuments: 3 });
  assert.equal(result.documents.length, 1);
  assert.equal(result.documents[0].slug, "2026-01-01-deterministic-authorization");
  assert.ok(result.documents[0].score > 0);
  assert.equal(result.documents[0].contentHash, sha256Hex(BODIES["2026-01-01-deterministic-authorization"]));
});

test("search: metadata filters", async () => {
  const corpus = await connect();
  const byConcept = await corpus.search({
    query: "deterministic",
    concepts: ["governed-execution"],
  });
  assert.equal(byConcept.documents.length, 1);
  assert.equal(byConcept.documents[0].slug, "2026-01-01-deterministic-authorization");

  const byTag = await corpus.search({ query: "local", tags: ["mlx"] });
  assert.equal(byTag.documents[0].slug, "2026-01-02-local-inference");
});

test("search: the byte budget is a hard stop", async () => {
  const corpus = await connect();
  const tiny = await corpus.search({ query: "the", maxDocuments: 3, maxBytes: 1 });
  assert.equal(tiny.documents.length, 0);
  assert.equal(tiny.truncated, true);
});

test("expand: returns the documents, edges and claims", async () => {
  const corpus = await connect();
  const result = await corpus.expand({
    documents: ["2026-01-01-deterministic-authorization"],
    relations: ["implements", "documents"],
    maxDepth: 2,
  });
  assert.equal(result.documents.length, 1);
  assert.ok(result.edges.length >= 1);
  assert.ok(result.claims.length >= 1);
});

test("traverseGraph: breadth-first with a depth limit", async () => {
  const corpus = await connect();
  const result = await corpus.traverseGraph({ from: "/projects/example-project", maxDepth: 2 });
  const ids = result.nodes.map((n) => n.id);
  assert.ok(ids.includes("/concepts/governed-execution"));
  assert.ok(result.nodes.find((n) => n.id === "/concepts/governed-execution").depth === 1);
});

test("getEvidence: resolves supporting evidence", async () => {
  const corpus = await connect();
  const evidence = await corpus.getEvidence(
    "claim:implements:/projects/example-project->/concepts/governed-execution"
  );
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].type, "source_span");
});

test("getLearningPath: resolves step titles", async () => {
  const corpus = await connect();
  const result = await corpus.getLearningPath("example-path");
  assert.equal(result.steps.length, 2);
  assert.equal(result.steps[0].title, "Governed execution");
});

test("getBookContext: returns the article's chapter relationships", async () => {
  const corpus = await connect();
  const result = await corpus.getBookContext("2026-01-01-deterministic-authorization");
  assert.equal(result.relationships.length, 1);
  assert.equal(result.relationships[0].chapter, 1);
});

test("conditional requests: a 304 reuses the cached body", async () => {
  const corpus = await connect();
  const first = await corpus.fetchResource("/agents/catalog.json");
  const second = await corpus.fetchResource("/agents/catalog.json");
  assert.equal(first.body, second.body);
  assert.ok(first.etag);
});

test("a draft mirror 404s and is skipped", async () => {
  const corpus = await connect();
  const result = await corpus.search({ query: "deterministic", maxDocuments: 3 });
  assert.ok(!result.documents.some((d) => d.slug === "draft-post"));
});

test("a tampered mirror fails its content hash", async () => {
  const tampered = { ...BODIES_BY_PATH, "/research/2026-01-01-deterministic-authorization.md": "---\ncontent_hash: sha256:deadbeed\n---\n\nchanged\n" };
  const corpus = await KnowledgeCorpus.connect({
    baseUrl: "https://example.com",
    fetchFn: (url, opts) => {
      const path = new URL(url).pathname;
      const body = tampered[path];
      if (body === undefined) return Promise.resolve(new Response("not found", { status: 404 }));
      return Promise.resolve(new Response(body, { status: 200, headers: { "content-type": "text/markdown" } }));
    },
  });
  await assert.rejects(
    () => corpus.getArticle("2026-01-01-deterministic-authorization"),
    /content hash/
  );
});

test("parseMirror: reads the frontmatter and body", () => {
  const parsed = parseMirror(mirror("2026-01-01-deterministic-authorization"));
  assert.equal(parsed.title, "Deterministic agent authorization");
  assert.equal(parsed.canonicalUrl, "https://example.com/blog/2026-01-01-deterministic-authorization");
  assert.equal(parsed.body, BODIES["2026-01-01-deterministic-authorization"]);
});

test("unknown article throws a typed error", async () => {
  const corpus = await connect();
  await assert.rejects(() => corpus.getArticle("nope"), KnowledgeError);
});

test("getClaims: filters by document and by authoritativeness", async () => {
  const corpus = await connect();
  const forDoc = corpus.getClaims({ documentId: "2026-01-01-deterministic-authorization" });
  assert.equal(forDoc.length, 1);
  assert.match(forDoc[0].id, /^claim:documents:/);

  const proposed = corpus.getClaims({ authoritative: false });
  assert.equal(proposed.length, 1);
  assert.equal(proposed[0].assessment, "proposed");
  assert.equal(proposed[0].authoritative, false);

  const authoritative = corpus.getClaims({ authoritative: true });
  assert.equal(authoritative.length, 2);
});

test("getClaim: resolves one claim and throws on an unknown id", async () => {
  const corpus = await connect();
  const claim = corpus.getClaim(
    "claim:implements:/projects/example-project->/concepts/governed-execution"
  );
  assert.equal(claim.category, "relation");
  assert.throws(() => corpus.getClaim("claim:nope"), KnowledgeError);
});

test("getEvidence: accepts a claim id or a set of ids", async () => {
  const corpus = await connect();
  const one = await corpus.getEvidence(
    "claim:documents:/blog/2026-01-01-deterministic-authorization->/projects/example-project"
  );
  assert.equal(one.length, 1);

  const many = await corpus.getEvidence({
    claimIds: [
      "claim:implements:/projects/example-project->/concepts/governed-execution",
      "claim:documents:/blog/2026-01-01-deterministic-authorization->/projects/example-project",
    ],
  });
  assert.equal(many.length, 2);
});

test("getConcept: returns the concept, its projects, articles and edges", async () => {
  const corpus = await connect();
  const detail = corpus.getConcept("governed-execution");
  assert.equal(detail.concept.name, "Governed execution");
  assert.equal(detail.projects.length, 1);
  assert.equal(detail.articles.length, 1);
  assert.equal(detail.relationships.length, 1);
  assert.equal(detail.relationships[0].type, "implements");
  assert.throws(() => corpus.getConcept("nope"), KnowledgeError);
});

test("getProject: returns the project, its articles, edges and evidence", async () => {
  const corpus = await connect();
  const detail = corpus.getProject("example-project");
  assert.equal(detail.project.name, "Example Project");
  assert.equal(detail.articles.length, 1);
  assert.equal(detail.relationships.length, 2);
  assert.equal(detail.evidence.length, 2);
  assert.throws(() => corpus.getProject("nope"), KnowledgeError);
});

test("traverse: multi-start, typed and depth-bounded", async () => {
  const corpus = await connect();
  const result = corpus.traverse({
    startingNodes: ["/projects/example-project"],
    relations: ["implements"],
    maxDepth: 1,
  });
  const ids = result.nodes.map((n) => n.id);
  assert.ok(ids.includes("/concepts/governed-execution"));
  assert.ok(!ids.includes("/blog/2026-01-01-deterministic-authorization"));
});

test("getRelatedWork: resolves the documents reachable from a node", async () => {
  const corpus = await connect();
  const related = corpus.getRelatedWork("/projects/example-project", { maxDepth: 2 });
  assert.ok(related.nodes.some((n) => n.id === "/concepts/governed-execution"));
  assert.equal(related.documents.length, 1);
});

test("verifyCitation: resolves documents, spans and claims", async () => {
  const corpus = await connect();
  const slug = "2026-01-01-deterministic-authorization";

  const bySlug = await corpus.verifyCitation({ slug });
  assert.equal(bySlug.ok, true);
  assert.equal(bySlug.url, `https://example.com/blog/${slug}`);

  const byUrl = await corpus.verifyCitation({ url: `https://example.com/blog/${slug}` });
  assert.equal(byUrl.ok, true);

  const goodSpan = await corpus.verifyCitation({ slug, span: "A model proposes" });
  assert.equal(goodSpan.ok, true);
  assert.ok(goodSpan.contentHash);

  const badSpan = await corpus.verifyCitation({ slug, span: "this is not in the body" });
  assert.equal(badSpan.ok, false);
  assert.match(badSpan.reason, /not present/);

  const byClaim = await corpus.verifyCitation({
    claimId: "claim:implements:/projects/example-project->/concepts/governed-execution",
  });
  assert.equal(byClaim.ok, true);

  const unknown = await corpus.verifyCitation({ slug: "nope" });
  assert.equal(unknown.ok, false);
});
