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
| Document expansion | `expand({ documents, relations, maxDepth, maxBytes })`. |
| Byte-budget enforcement | `search`/`expand` stop before `maxBytes` and report `truncated`. |
| Conditional HTTP | `If-None-Match` with cached ETags; a `304` reuses the body. |
| Local caching | In memory always; on disk when `cacheDir` is set. |
| Content hash verification | Every Markdown mirror is verified against the `sha256` in its frontmatter. |
| Provenance preservation | Claims, evidence and relation edges carry their source and fingerprint. |
| Citation generation | `getArticle().citation` and `cite()`. |

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

### `getEvidence(claimId)`

Returns the supporting and contradictory evidence for one claim.

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
