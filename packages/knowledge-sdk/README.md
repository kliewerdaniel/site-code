# @danielkliewer/knowledge-sdk

A typed, dependency-free TypeScript client for the
[danielkliewer.com](https://www.danielkliewer.com) static knowledge corpus.
It speaks HTTP and the filesystem only — no Next.js, no runtime inference, no
vector database.

## Install

```bash
npm install @danielkliewer/knowledge-sdk
```

## Quick start

```ts
import { KnowledgeCorpus } from "@danielkliewer/knowledge-sdk";

const corpus = await KnowledgeCorpus.connect({
  baseUrl: "https://www.danielkliewer.com",
});

const results = await corpus.search({
  query: "deterministic agent authorization",
  maxDocuments: 6,
  maxBytes: 150_000,
});

for (const doc of results.documents) {
  console.log(doc.title, doc.url, doc.contentHash);
}

const expansion = await corpus.expand({
  documents: results.documents.map((d) => d.slug),
  relations: ["implements", "evaluates"],
});
```

## Capabilities

| Capability | Where |
|---|---|
| Corpus discovery | `connect()` reads `/agents/index.json` and loads the catalog, graph, book, claims and evidence. |
| Resource retrieval | `fetchResource()` with conditional requests and ETag handling. |
| Metadata filtering | `search({ concepts, projects, tags })`. |
| Search and ranking | Deterministic term weighting over title, tags, description and slug. |
| Graph traversal | `traverseGraph({ from, types, maxDepth })`, breadth-first with a depth limit. |
| Multi-start traversal | `traverse({ startingNodes, relations, maxDepth })`. |
| Document expansion | `expand({ documents, relations, maxDepth, maxBytes })`. |
| Concept lookup | `getConcept(slug)` — the concept, its projects, articles and edges. |
| Project lookup | `getProject(slug)` — the project, its articles, edges and evidence. |
| Claim retrieval | `getClaims({ documentId, authoritative })`, `getClaim(id)`. |
| Related work | `getRelatedWork(node, { types, maxDepth })`, bidirectional. |
| Citation verification | `verifyCitation({ slug, url, claimId, span })` — resolves the document and checks the span against the hash-verified body. |
| Byte-budget enforcement | `search`/`expand` stop before `maxBytes` and report `truncated`. |
| Conditional HTTP | `If-None-Match` with cached ETags; a `304` reuses the body. |
| Local caching | In memory always; on disk when `cacheDir` is set. |
| Content hash verification | Every Markdown mirror is verified against the `sha256` in its frontmatter. |
| Provenance preservation | Claims, evidence and relation edges carry their source and fingerprint. |
| Citation generation | `getArticle().citation` and `citation(metadata)`. |

## API

### `KnowledgeCorpus.connect(options)`

```ts
type ConnectOptions = {
  baseUrl: string;          // e.g. "https://www.danielkliewer.com"
  fetchFn?: typeof fetch;   // override for tests or a custom implementation
  cacheDir?: string;        // on-disk body cache
  maxBytes?: number;        // default byte budget, default 150000
  userAgent?: string;
};
```

### `search(options)`

Ranks the catalog, fetches the best mirrors within the byte budget and
verifies each one. Returns the hits with their bodies, hashes and scores, plus
`truncated` and the catalog `etag`.

### `expand(options)`

Fetches the named documents and walks the relation graph outward to `maxDepth`,
returning the documents, the edges traversed and the claims that reference
them.

### `traverseGraph(options)`

Breadth-first traversal from a node id, restricted to the requested relation
types and depth. Nodes carry the depth and the edge they were reached by.

### `getArticle(slug)`

Returns the article's metadata, verified Markdown body, content hash, related
claims and relation edges, and a ready-to-use citation.

### `getEvidence(claimId)` / `getEvidence({ claimIds })`

Returns the supporting and contradictory evidence for one claim, or the union
for several claims at once.

### `getClaims(options)` / `getClaim(id)`

`getClaims({ documentId, authoritative })` filters the claim set by the article
it touches and by authoritativeness. A proposed claim is returned with
`authoritative: false`; the caller decides whether to treat it as fact.

### `getConcept(slug)`

Returns the concept, its projects, the articles tagged for it and every
relation edge that touches it.

### `getProject(slug)`

Returns the project, its articles, its relation edges and the evidence records
for those edges.

### `traverse(options)`

The directive-shaped traversal: `startingNodes`, typed `relations` and a
bounded `maxDepth`. An empty `relations` array means all types.

### `getRelatedWork(node, options)`

The systems, concepts and research reachable from a node. Unlike `traverse`,
this follows edges in both directions, so a project's articles are related to
it even though `documents` points at the project.

### `verifyCitation(input)`

Resolves `{ slug }` or `{ url }` against the catalog and, when a `span` is
supplied, checks that the span is present in the hash-verified Markdown body.
`{ claimId }` resolves against the claim's own source span. Returns
`{ ok, url, contentHash, reason }` rather than throwing.

### `getLearningPath(slug)`

Returns a learning path with its steps resolved to titles.

### `getBookContext(articleSlug)`

Returns the book's relationships to the article, the chapter list and a
citation.

## Errors

All failures throw `KnowledgeError` with an optional `status` and `path`, so a
caller can distinguish a missing document (404) from a failed retrieval.

## Design rules

- Schema validity is never confused with factual correctness. A claim that
  validates is still only as well established as its evidence.
- A proposal is never authoritative. `/agents/proposals.json` is a question
  for an editor, not a fact.
- The byte budget is a hard stop. Retrieval never silently over-fetches.

## License

UNLICENSED — reference-implementation material.
