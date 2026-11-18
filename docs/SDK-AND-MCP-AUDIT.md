# SDK and MCP audit

Sections 4 and 5 of the integration directive: investigate the reusable SDK
and the MCP adapter before building anything.

## 4. Reusable SDK

**No `discoverable-knowledge-sdk` exists.** A search of the repository, the
git history and the documentation finds no such package or reference; it is
not a real prior artifact. The reusable client that exists is
[`packages/knowledge-sdk`](../packages/knowledge-sdk), and it is the package
the directive describes. No second SDK was created.

### What the package is

`@danielkliewer/knowledge-sdk` is a typed, **zero-dependency** TypeScript
client (`dependencies: {}`, `peerDependencies: {}`). It imports only
`node:crypto`, `node:fs` and `node:path` — no Next.js, no React, no runtime
inference, no vector database. It speaks HTTP and the filesystem.

### Can the compiler be consumed through it?

Yes. The client's surface is:

| Method | Capability |
|---|---|
| `connect({ baseUrl, cacheDir })` | corpus discovery: fetch and parse the catalog, graph, index and book record |
| `search({ query, maxDocuments, maxBytes, concepts, projects, tags })` | BM25-style ranking with metadata filters and a byte budget |
| `expand({ documents, relations })` | document expansion over the typed graph |
| `traverseGraph({ from, types, maxDepth })` | bounded breadth-first traversal |
| `getArticle(slug)` | one article: metadata, verified Markdown body, content hash, related claims |
| `getEvidence(claimId)` | evidence records for a claim |
| `getLearningPath(slug)` | a learning path and its documents |
| `getBookContext(articleSlug)` | the book's relationship to an article, the chapter list |
| `citation(article)` | a citation carrying the canonical URL and publication date |

### Requirements check

| Requirement | Status |
|---|---|
| Consumes the static corpus, not the Next.js runtime | ✓ HTTP + filesystem only |
| Typed interfaces | ✓ every method has an explicit input and output type |
| Explicit error handling | ✓ fetch failures, parse failures and hash mismatches throw typed errors |
| Conditional HTTP / ETag caching | ✓ `If-None-Match`, in-memory and on-disk cache |
| Byte-budget enforcement | ✓ retrieval stops at `maxBytes` |
| Content-hash verification | ✓ every Markdown mirror is verified against its own frontmatter hash |
| Provenance preservation | ✓ claims, evidence and graph edges carry their provenance |
| Citation generation | ✓ `citation()` emits title, author, date and canonical URL |
| No unnecessary dependencies | ✓ zero runtime dependencies |

**Verdict:** the package already satisfies the interface the directive
describes. Creating another SDK would be an overlapping package; none was
created.

## 5. MCP adapter

**The adapter already exists** as [`packages/knowledge-mcp`](../packages/knowledge-mcp).
It is a stdio JSON-RPC server: no hosted service, no database, no inference.
It reads the same static artifacts the website serves, through the SDK.

### Tools

All six required tools are exposed, with explicit input schemas:

| Tool | Input | Output |
|---|---|---|
| `search_knowledge` | `query`, `maxDocuments`, `maxBytes`, `concepts`, `projects`, `tags` | ranked documents with citations |
| `get_article` | `slug` | metadata, verified Markdown body, content hash, related claims, citation |
| `traverse_graph` | `from`, `types`, `maxDepth` | bounded node/edge set |
| `get_evidence` | `claimId` | evidence records |
| `get_learning_path` | `slug` | the path and its documents |
| `get_book_context` | `articleSlug` | the book's relationship, chapter list, citation |

### Bounded retrieval

Hard limits are enforced in the adapter as well as the SDK, and every
argument is clamped:

```
maxDocuments ≤ 20   maxBytes ≤ 500,000   maxDepth ≤ 4   maxNodes ≤ 200
```

`traverse_graph` additionally truncates the node and edge sets and reports
`truncated: true` when the limit was hit, so a caller can tell that the graph
was bounded rather than complete.

### Provenance and canonical URLs

`get_article` and `get_book_context` return citations carrying the canonical
URL and publication date; `get_evidence` returns the evidence records with
their own provenance. No tool invents a source.

### Requirements check

| Requirement | Status |
|---|---|
| Six named tools | ✓ all present |
| Clear input and output schema | ✓ JSON Schema on every tool |
| Preserve canonical source identifiers and citations | ✓ |
| Preserve provenance | ✓ |
| Reasonable retrieval limits | ✓ clamped, with a truncation flag |
| Usable by local models, Hermes, Claude | ✓ stdio, no credentials |
| Separate from the website's deployment runtime | ✓ depends only on the SDK |
| No hosted infrastructure | ✓ stdio JSON-RPC |

**Verdict:** the adapter already satisfies the directive. No hosted
component was added.

## Tests

Both packages have integration tests that run against the real build:

```bash
node --test packages/knowledge-sdk/tests/sdk.test.mjs packages/knowledge-mcp/tests/mcp.test.mjs
```

23 tests, 23 pass.
