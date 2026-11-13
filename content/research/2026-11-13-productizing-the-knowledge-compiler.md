---
author: Daniel Kliewer
canonical_url: /blog/2026-11-13-productizing-the-knowledge-compiler
date: 11-13-2026
description: "A reusable knowledge compiler with a human approval gate, a typed SDK, an MCP server, a graph explorer, and a benchmark that measures what actually works."
image: /images/ComfyUI_00200_.png
layout: post
title: "Productizing the Knowledge Compiler: A Reusable Engine, an SDK, an MCP Server, and a Graph Explorer"
tags:
  - blog
  - knowledge-compiler
  - agent-architecture
  - provenance
  - knowledge-graph

---
# Productizing the Knowledge Compiler: A Reusable Engine, an SDK, an MCP Server, and a Graph Explorer

> **Editor's note (2026-11-13).** The figures in this article are point-in-time
> as of the deploy described in §10. The corpus has **198 published articles**
> (200 source files, 2 drafts excluded), **nine** machine-readable resources,
> **98** typed relation edges, **109** claims with **109** evidence records and
> **10** non-authoritative proposals. Authoritative, build-generated counts:
> [docs/STATISTICS.md](https://github.com/kliewerdaniel/site-code/blob/main/docs/STATISTICS.md).

The previous post, *[Compiling a Website for Agents](/blog/2026-11-12-compiling-a-website-for-agents)*,
turned this site into a static knowledge corpus: one registry, nine generated
files, a typed relation graph, and a retrieval path that costs kilobytes instead
of megabytes. What it did not do is make any of that reusable. The compiler was
still the site's bound layer. It knew about `content/research`, about the
concepts file, about the book config. It could compile this website and nothing
else.

This post is about the extraction. The goal was not to build a framework. It was
to answer a narrower question: what is the smallest clean separation between the
compilation engine and one particular website, such that the engine can compile a
second, independent corpus without being told anything about the first?

The answer, shipped on `main` and live at
[danielkliewer.com](https://www.danielkliewer.com), is five things:

1. A **manifest-driven compiler** (`packages/knowledge-compiler`) with an
   explicit human approval gate.
2. A **typed, dependency-free SDK** (`packages/knowledge-sdk`).
3. A **standalone MCP server** (`packages/knowledge-mcp`) with eleven tools.
4. An **interactive graph explorer** at [`/graph`](https://www.danielkliewer.com/graph).
5. A **benchmark** that measures retrieval and actual model behaviour, with the
   raw answers committed for review.

## The audit: what was actually there

Before extracting anything, I re-measured the repository and the live corpus
rather than trusting the previous post's numbers. The audit is in
[docs/PRODUCTIZATION-AUDIT-2026-11-13.md](https://github.com/kliewerdaniel/site-code/blob/main/docs/PRODUCTIZATION-AUDIT-2026-11-13.md).
Seven gaps were recorded:

| Gap | What it meant |
| --- | --- |
| G1 | No interactive way to explore the graph a human could follow. |
| G2 | The MCP server exposed six tools; the directive asked for eleven. |
| G3 | The SDK could search and traverse, but not look up concepts, projects, claims or citations. |
| G4 | The retrieval benchmark was lexical only; nothing measured what a model actually did with the context. |
| G5 | The compiler had never compiled anything but this site. |
| G6 | Proposals were excluded from the graph, but there was no record of who authorized the ones that were in. |
| G7 | The site's build still used its bound layer, not the extracted compiler. |

One finding shaped the whole extraction: the real
`@kliewerdaniel/discoverable-knowledge-sdk` is a **site generator**, not a corpus
consumer. It produces a discoverable-knowledge site from content; it does not
read a compiled corpus. There was no duplicate project to fold in, and no
existing API to match. The SDK described here is a new package with a different
job.

## The extraction: a manifest-driven compiler

The proposed package layout was `knowledge-core`, `knowledge-schema`,
`knowledge-compiler`, `knowledge-sdk`, `knowledge-mcp`. I did not create
`knowledge-core` or `knowledge-schema`. The compiler and the SDK already own
those boundaries, and a separate schema package would duplicate the emitted
types. The shipped structure is:

```text
packages/
  knowledge-compiler/   # manifest -> artifacts, no Next.js
  knowledge-sdk/        # typed HTTP/filesystem client
  knowledge-mcp/        # stdio MCP adapter over the SDK
examples/
  sample-corpus/        # a second, independent corpus
benchmarks/retrieval/   # adjudicated dataset + two harnesses
src/lib/explorer-core.ts  # pure model + layout for /graph
```

The pipeline is the one the directive specified, and it is enforced in code:

```text
MANIFEST
  -> validate manifest
  -> load sources        (markdown, structured JSON)
  -> normalize           (source format -> SourceDocument)
  -> validate            (deterministic; a failure rejects, never repairs)
  -> propose             (deterministic rules; proposals only)
  -> approval gate       (an explicit human approval promotes a proposal)
  -> governance assertion
  -> static artifacts    (corpus bundle, Markdown mirrors, resource index)
```

### The manifest is the only input

```ts
// packages/knowledge-compiler/src/manifest.ts
export const MANIFEST_SCHEMA = "knowledge-source/1";

export interface SourceManifest {
  schema: typeof MANIFEST_SCHEMA;
  site: { name: string; url: string; description?: string };
  sources: SourceSpec[];
  approvals?: ApprovalRecord[];
  output: { directory: string; baseUrl: string };
}

export type SourceSpec =
  | { kind: "markdown"; root: string; pattern?: string; exclude?: string[]; draftField?: string }
  | { kind: "json"; file: string; documents?: string };
```

Nothing in the compiler knows about Next.js, a content directory, or this
website. A manifest names the site, lists the sources, and carries the approval
records a human produced. That is the whole interface.

### Adapters: the only code that knows a source format

Adapters are where source formats are handled, and they are the only place that
touches the filesystem. Three properties matter:

1. **Paths are confined.** A source path that resolves outside the declared root
   throws.
2. **Content is hashed, never executed.** A document body is text.
3. **Nothing is fetched.** The compiler is offline by construction.

```ts
// packages/knowledge-compiler/src/adapters.ts
function safeJoin(root: string, relative: string): string {
  const resolved = path.resolve(root, relative);
  const base = path.resolve(root);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error(`path escapes the source root: ${relative}`);
  }
  return resolved;
}

export function readMarkdownSource(spec: Extract<SourceSpec, { kind: "markdown" }>): SourceDocument[] {
  const pattern = spec.pattern ?? ".md";
  const exclude = spec.exclude ?? [];
  const root = path.resolve(spec.root);
  const documents: SourceDocument[] = [];

  for (const file of walk(root)) {
    const relative = path.relative(root, file);
    if (!file.endsWith(pattern)) continue;
    if (exclude.some((needle) => relative.includes(needle))) continue;
    const raw = fs.readFileSync(safeJoin(root, relative), "utf8");
    documents.push(normalizeDocument(raw, relative));
  }
  return documents;
}
```

The JSON adapter does the same for a structured source: it reads one file,
finds the document array, and normalizes each entry. It never evaluates the
body.

### The approval gate: the frozen spine, made explicit

The previous design had a frozen-spine rule: a proposal is never authoritative.
The gap was that the rule was a set of ids. An id is not evidence. The compiler
now consumes **approval records**:

```ts
// packages/knowledge-compiler/src/approval.ts
export interface ApprovalRecord {
  proposalId: string;
  approvedBy: string;        // a name or identity, never "system"
  reason: string;
  at: string;                // ISO timestamp
  sourceFingerprint: string; // fingerprint of the proposal's own evidence
}
```

An approval is an act by an identified human, at a time, for a reason, against a
specific source fingerprint. The compiler verifies the fingerprint against the
proposal's evidence and **fails closed on a mismatch**:

```ts
// packages/knowledge-compiler/src/compileFromManifest.ts
for (const record of approvals.records) {
  const proposal = result.proposals.find((p) => p.id === record.proposalId);
  if (!proposal) {
    throw new CompilerError(`approval ${record.proposalId} does not match any proposal`);
  }
  const expected = sha256Hex(proposal.evidence);
  if (record.sourceFingerprint !== expected) {
    throw new CompilerError(
      `approval ${record.proposalId} sourceFingerprint mismatch ` +
      `(got ${record.sourceFingerprint}, want ${expected})`
    );
  }
}
```

An approval made against different source material must not promote anything.
The compiler consumes approvals; it cannot mint them. That distinction is the
whole point: probabilistic interpretation proposes, deterministic validation
checks, a human authorizes.

### Determinism and artifacts

`emitArtifacts` is a pure function of the compile result. No clock, no
randomness, no network. The same manifest always produces byte-identical files.
The artifacts are:

| Artifact | Purpose |
| --- | --- |
| `corpus.json` | Versioned bundle (`knowledge-corpus/1`): documents, relations, claims, proposals, evidence, counts. |
| `mirrors/<slug>.md` | Canonical Markdown mirror per published document, with a verifying `content_hash`. |
| `index.json` | Every artifact with its byte size, content type and SHA-256. |

```ts
// packages/knowledge-compiler/src/emit.ts (excerpt)
export function emitArtifacts(result: CompileResult, opts: EmitOptions) {
  const documents = [...result.documents].sort((a, b) => a.id.localeCompare(b.id))
    .map((d) => ({ id: d.id, path: d.path, title: d.title, url: `${opts.baseUrl}/${slugify(d.id)}`,
      ...(d.published ? { published: d.published } : {}), tags: d.tags,
      bytes: d.bytes, contentHash: d.contentHash }));

  const bundle: CorpusBundle = {
    schema: CORPUS_SCHEMA,
    site: { name: opts.siteName, url: opts.baseUrl },
    counts: { documents: documents.length, relations: relations.length,
      claims: claims.length, proposals: proposals.length,
      evidence: evidence.length, rejected: result.rejected.length,
      excludedDrafts: result.excludedDrafts.length },
    documents, relations, claims, proposals, evidence,
  };
  // ... corpus.json, mirrors/<slug>.md, index.json
}
```

Two compilations of the same manifest are byte-identical; the test asserts it.

## The second corpus: proving the abstraction

One source proves the concept; two prove the abstraction.
[`examples/sample-corpus`](https://github.com/kliewerdaniel/site-code/tree/main/examples/sample-corpus)
is a second, independent documentation archive: six Markdown sources, one
structured JSON source, one draft, one deliberately invalid record, and one human
approval. Its manifest is 24 lines:

```json
{
  "schema": "knowledge-source/1",
  "site": { "name": "Sample Knowledge Corpus", "url": "https://example.com" },
  "sources": [
    { "kind": "markdown", "root": "examples/sample-corpus/docs" },
    { "kind": "json", "file": "examples/sample-corpus/knowledge.json" }
  ],
  "approvals": [
    {
      "proposalId": "proposal:related_to:governed-execution.md->json:architecture",
      "approvedBy": "Daniel Kliewer",
      "reason": "The architecture notes and the governed-execution article describe the same deterministic authorization layer.",
      "at": "2026-11-13T00:00:00.000Z",
      "sourceFingerprint": "95f1b0e081d46bd776777bd4743b2b6ac3c5ca7acfbc3d45551ad25f51489e78"
    }
  ],
  "output": { "directory": "examples/sample-corpus/dist", "baseUrl": "https://example.com/knowledge" }
}
```

Compiling it produces:

```text
documents:   6
rejected:    1 (broken.md)
drafts:      1 (draft-post.md)
proposals:   2
relations:   1
claims:      2
evidence:    2
approvals:   1
artifacts:   8 files
  approved:  relation:related_to:governed-execution.md->json:architecture [Daniel Kliewer, 2026-11-13T00:00:00.000Z]
  proposed:  claim:proposal:related_to:knowledge-compilation.md->provenance.md
```

The invalid record is rejected with reasons, never repaired. The draft never
reaches the artifacts. One proposal is promoted because a human approved it; the
other remains a proposal. The output is byte-identical across runs. That is the
abstraction working on a corpus the compiler has never seen.

## The SDK: a typed client over the compiled artifacts

[`packages/knowledge-sdk`](https://github.com/kliewerdaniel/site-code/tree/main/packages/knowledge-sdk)
is a typed, dependency-free client. It speaks HTTP and the filesystem: no
Next.js, no runtime inference, no vector database. The surface:

```ts
const corpus = await KnowledgeCorpus.connect({ baseUrl: "https://www.danielkliewer.com" });

const results = await corpus.search({ query: "deterministic agent authorization",
  maxDocuments: 6, maxBytes: 150_000 });

const article = await corpus.getArticle(results.documents[0].id);
const claims  = await corpus.getClaims({ documentId: article.id });
const evidence = await corpus.getEvidence({ claimIds: claims.map((c) => c.id) });
const graph   = await corpus.traverse({ startingNodes: ["frozen-spine"],
  relations: ["implements", "evaluates"], maxDepth: 2 });
const related = corpus.getRelatedWork("/projects/ganymede", { maxDepth: 1 });
const citation = await corpus.verifyCitation({ slug: article.slug, span: "frozen spine" });
```

The properties that matter:

- **Conditional requests and two-level caching.** Every fetch sends
  `If-None-Match` when it has an ETag, and caches in memory and on disk. A
  repeat visit is a `304`, not a re-download.
- **A byte budget that stops retrieval.** `search` ranks the catalog, then fetches
  mirrors only until the budget is exhausted, and reports `truncated: true`.
- **Content-hash verification.** Every Markdown mirror is verified against the
  `content_hash` in its own frontmatter before the body is returned.

```ts
// packages/knowledge-sdk/src/client.ts (excerpt)
private async fetchMirror(slug: string) {
  let raw: CachedBody;
  try {
    raw = await this.fetchResource(`/research/${slug}.md`);
  } catch (e) {
    if ((e as KnowledgeErrorType).status === 404) return null; // draft/unknown
    throw e;
  }
  const { body, contentHash, bytes } = parseMirror(raw.body);
  if (contentHash !== sha256Hex(body)) {
    throw new KnowledgeError(`mirror ${slug} fails its content hash`,
      { path: `/research/${slug}.md` });
  }
  return { body, bytes, contentHash };
}
```

- **Bounded traversal.** `traverse`, `traverseGraph` and `getRelatedWork` take a
  depth and a relation filter. An empty filter means *all* relations, not none —
  a bug I hit and fixed, because an empty array silently disabling every type is
  the kind of defect that makes a graph API look empty.
- **Citation verification.** `verifyCitation` checks that a citation resolves to
  a real document and, when a span is supplied, that the span is present in the
  hash-verified body.

## The MCP server: eleven tools, hard limits

[`packages/knowledge-mcp`](https://github.com/kliewerdaniel/site-code/tree/main/packages/knowledge-mcp)
is a standalone stdio JSON-RPC server. It has no hosted component, no database
and no inference; it reads the same static artifacts through the SDK. The tools:

| Tool | Returns |
| --- | --- |
| `search_knowledge` | Ranked documents with verified Markdown bodies, within a byte budget. |
| `get_article` | One article: metadata, verified body, content hash, claims, citation. |
| `get_concept` | A concept with its projects, articles and typed relationships. |
| `get_project` | A project with its articles, relationships and the evidence for them. |
| `get_claim` | A claim and its assessment. A proposed claim is labelled `proposed`. |
| `get_evidence` | Supporting and contradictory evidence for one or several claims. |
| `verify_citation` | Whether a citation resolves to a real document and a valid span. |
| `traverse_graph` | Breadth-first traversal limited by relation type and depth. |
| `get_related_work` | Related systems, concepts and research, following edges both ways. |
| `get_learning_path` | A learning path with its steps resolved to titles. |
| `get_book_context` | The book's relationships to an article, chapters and a citation. |

Limits are enforced in the server as well as the SDK, so a tool call can never
pull an unbounded graph:

```ts
// packages/knowledge-mcp/src/server.ts
const LIMITS = { maxDocuments: 20, maxBytes: 500_000, maxDepth: 4, maxNodes: 200 };
```

A proposed claim is returned as `assessment: "proposed"`, `authoritative: false`.
The server never promotes a proposal. It can label it, and it does.

The server is configured by pointing it at any compatible corpus:

```yaml
# Hermes mcp_servers
danielkliewer-knowledge:
  command: node
  args:
    - /Users/danielkliewer/Projects/site-code/packages/knowledge-mcp/src/server.ts
  env:
    KNOWLEDGE_BASE_URL: https://www.danielkliewer.com
    KNOWLEDGE_CACHE_DIR: /Users/danielkliewer/.cache/knowledge-mcp
```

I verified it over a real stdio handshake against the live corpus:
`initialize` → `tools/list` → `tools/call` with real ids. Search, concept lookup,
an authoritative claim, a proposed claim, citation-span verification and related
work all resolved real documents. The unit mock proves the handler shape; only
the live handshake proves the server resolves real knowledge.

## The graph explorer: `/graph`

The compiled graph was machine-readable but not human-readable. The explorer at
[https://www.danielkliewer.com/graph](https://www.danielkliewer.com/graph) closes
that gap. It renders the generated catalog and relation graph — no second,
hand-authored graph.

The design constraints:

- **Static-first.** The entity list is server-rendered as 244 real links, so it
  works with JavaScript disabled.
- **Bounded.** The rendered node set is capped at 80; the client reports when it
  was bounded.
- **Lazy.** Claims and evidence are fetched on selection, not up front.
- **Accessible.** Labelled controls, keyboard-focusable nodes, an `aria-live`
  detail panel, and a mobile layout that stacks.
- **Deterministic.** The layout is a pure radial function of the selection and
  depth: no physics, no randomness, so the server and the client agree.

```ts
// src/lib/explorer-core.ts (excerpt)
export function computeLayout(start, nodes, edges, maxDepth, width = 720, height = 560) {
  const { nodeIds, edges: kept, truncated } = neighborhood(start, edges, maxDepth);
  // ... BFS rings, then a circle per ring, nodes ordered by type then label
  for (const [depth, ring] of rings) {
    const n = ring.length;
    const radius = depth === 0 ? 0 : baseRadius * depth * (1 + Math.max(0, n - 10) * 0.02);
    ring.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, n) + (depth * Math.PI) / Math.max(1, n);
      positions[node.id] = { id: node.id, x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle), depth };
    });
  }
  return { positions, edges: renderedEdges, truncated };
}
```

A visitor can search, filter by entity type and relation type, select a node,
follow typed relations, open the claims that rest on an edge, and read the
evidence. Every edge, claim and evidence record shows its provenance and
verification status. In a real browser against production: 8 nodes on load, the
`article` filter narrows the list 244 → 197 (245 → 198 once this post is
published), the `implements` filter narrows the graph to 7 nodes, and the detail
panel shows provenance.

## The benchmark: does it actually work?

The previous benchmark was lexical. It proved the catalog retrieves the right
documents; it said nothing about what a model does with them. The new benchmark
has two categories.

### Deterministic retrieval

Thirty adjudicated questions, three architectures, ground truth computed from the
artifacts:

| Metric | A · crawling | B · catalog + graph | C · catalog + graph + Markdown |
| --- | --- | --- | --- |
| Recall@5 | 0.146 | **1.000** | **1.000** |
| Precision@5 | 0.050 | **0.671** | **0.671** |
| Citation accuracy | 0.250 | **1.000** | **1.000** |
| Passage recall | **0.857** | 0.286 | 0.571 |
| False-support rate | 1.000 | **0.333** | 0.500 |
| One-time bytes | 31,754 KB | **266 KB** | **266 KB** |
| Total bytes | 31,754 KB | 10,679 KB | **1,826 KB** |

The compiled catalog retrieves at Recall@5 1.000 against a crawler's 0.146, at
266 KB one-time cost against 31.8 MB. The cost is representation: metadata alone
does not carry the answer (B's passage recall is 0.286), so C adds the Markdown
bodies and raises it to 0.571.

A note on the crawler's number, because it is self-referential: before this post
was added, A's Recall@5 was 0.313. Adding one broad-topic article — this one —
dropped it to 0.146, because the new page ranks highly for several queries and
pushes relevant pages out of the top five. B and C did not move. A crawler's
ranking is a function of the whole archive; the catalog's is a function of the
query. The benchmark measured its own author's effect on the corpus, and the
catalog was the representation that absorbed it.

### Actual model behaviour

The second harness feeds each architecture's retrieved context to a real local
model and measures what it then says. Four architectures: A crawls, B gets the
catalog metadata plus the full typed graph and the claim index, C adds the
Markdown bodies, and D is a parametric control with no retrieval. Every
architecture gets the same per-document context budget, so the comparison is
about representation, not about how much text each side may read.

I ran it on two local model families, temperature 0, 256-token budget, cold and
warm passes. Cold results, rule-based correctness:

| Architecture | lfm3-omni rule / cite / abstain / unsup | llama3.2:3b rule / cite / abstain / unsup |
| --- | --- | --- |
| A · crawling | 33.3 / 0.0 / 100 / 0.0 | 20.0 / 0.0 / 83.3 / 16.7 |
| B · catalog + graph | 66.7 / 26.7 / 83.3 / 33.3 | **70.0 / 30.0** / 83.3 / 16.7 |
| C · + Markdown | 63.3 / 26.7 / **100** / **0.0** | 60.0 / 26.7 / 33.3 / 33.3 |
| D · parametric | 23.3 / 0.0 / 0.0 / 16.7 | 20.0 / 0.0 / 66.7 / 16.7 |

`rule` = rule-correct, `cite` = citation accuracy, `abstain` = abstention on
no-support questions, `unsup` = unsupported-claim rate.

Across both families, the compiled catalog + graph is the most robust
representation: highest rule-correct and citation accuracy, lowest fabricated
citations. Crawling never produces a canonical citation and fabricates the most.
Markdown bodies improve the stronger model's epistemic discipline — 100%
abstention, zero unsupported claims — but the weaker model is confused by the
longer context. That is a representation/length trade-off, not a universal win.

**What this does not establish:** that the architecture improves reasoning in
general. It is two local model families, one machine, one corpus, a rule-based
correctness metric, and one hallucinated claim from B. The raw answers are
committed in
[`benchmarks/retrieval/data`](https://github.com/kliewerdaniel/site-code/tree/main/benchmarks/retrieval/data)
for review. The correctness rule is transparent and category-aware, but it is not
human adjudication.

## Governance and security

The compiler and the corpus preserve the line between probabilistic
interpretation and deterministic authorization. The rules, and where they are
enforced:

| Rule | Where |
| --- | --- |
| A proposal is never authoritative. | `compile.ts` (`assertGoverned`); proposals are excluded from `graph.json` and carried in `proposals.json`. |
| Only an explicit human approval promotes a proposal. | `approval.ts` records who / why / when / against which fingerprint; `compileFromManifest.ts` verifies the fingerprint and fails closed. |
| AI may propose, never authorize. | The compiler consumes approval records; it cannot mint them. |
| Validation failures are never suppressed. | `validate.ts` rejects with reasons; the manifest entry point throws on any governance violation. |
| Approved records are immutable and traceable. | Every relation and claim carries provenance and a modification fingerprint; approved records add `approvedBy`, `approvedAt`, `approvalReason`. |
| Source material is untrusted. | Adapters confine paths, hash content and never execute it. |
| Private material cannot leak. | Drafts are excluded before emission; the compiler reads only declared sources. |

**Not enforced, and worth saying plainly:** the site's bound layer emits
proposals without an audit log, and the MCP server cannot force a caller to
treat a proposal as non-authoritative — it can only label it. A real deployment
needs an approval workflow outside the compiler (who may approve, revocation,
review periods) and a writer that refuses to promote an unapproved id.

## Deployment and verification

The branch was merged to `main` and pushed; Vercel deployed within two minutes.

- `npm run smoke:production` — **0 drift, 0 compile, 0 warning(s), 24 info**:
  all nine agent resources match the local build by byte hash, conditional
  requests return 304, 197 Markdown mirrors resolve (198 with this post), the
  draft mirror correctly
  404s, 109 claims / 109 evidence records resolve, and none of the 10 proposals
  appears in the authoritative graph.
- `/graph` — 200, in the sitemap, 244 server-rendered entity links (245 with
  this post).
- Real-browser check of production: 8 nodes on load, the `article` filter
  narrows 244 → 197 (245 → 198 with this post), the `implements` filter narrows
  to 7, reset restores 8, provenance rendered in the detail panel.
- 183 tests pass under the pinned Node 22.23.4; build, validators, conformance
  (0 errors) and route parity (243/243) are clean.

## Trade-offs and what is still open

| Trade-off | Consequence |
| --- | --- |
| The site build still uses its bound layer, not the extracted compiler (G7). | Two compilation paths exist. Rewiring is a separate, riskier change. |
| Only Markdown and JSON adapters exist. | Documentation websites, Git repositories, research archives and book manuscripts are not implemented. |
| The approval store is an input, not a workflow. | No audit log, revocation or identity provider. |
| Two local model families, no frontier model. | The benchmark shows what these models did, not what a larger model would do. |
| Rule-based correctness grading. | A transparent proxy for quality, not human adjudication. |
| The MCP server is protocol-verified but not wired into the live Hermes profile. | Configuring it needs the user's consent to edit `config.yaml`. |

The next phase, in order: wire the site's build to the extracted compiler so
there is one path; add an approval workflow; add the remaining source adapters
against real archives; and run the benchmark on a third model family with human
adjudication of the answers.

## The principle underneath

The expensive part of serving knowledge to machines is rarely the knowledge. It
is the format, the access pattern, and the boundary between what a system can
propose and what a human has authorized. Compile the structure once, publish it
as plain cacheable files, make every claim carry its evidence, and make every
promotion carry a name. Then the marginal cost of the next thousand readers,
human or otherwise, drops to nearly nothing — and the graph you publish is one
you can stand behind.

---

**Source:** [github.com/kliewerdaniel/site-code](https://github.com/kliewerdaniel/site-code)
· **Live corpus:** [danielkliewer.com/agents](https://www.danielkliewer.com/agents)
· **Graph explorer:** [danielkliewer.com/graph](https://www.danielkliewer.com/graph)
· **Engineering report:** [docs/ENGINEERING-REPORT.md](https://github.com/kliewerdaniel/site-code/blob/main/docs/ENGINEERING-REPORT.md)
· **Benchmark:** [benchmarks/retrieval](https://github.com/kliewerdaniel/site-code/tree/main/benchmarks/retrieval)
