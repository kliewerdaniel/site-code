// Types for the danielkliewer.com knowledge corpus SDK.
//
// These mirror the emitted artifacts exactly. They are deliberately free of
// any Next.js or site-runtime type, so the SDK can be consumed by any
// TypeScript agent runtime.

export interface SiteIdentity {
  name: string;
  url: string;
  description?: string;
}

export interface CatalogArticle {
  slug: string;
  url: string;
  markdownUrl: string;
  title: string;
  published: string;
  updated?: string;
  description: string;
  tags: string[];
  readingMinutes: number;
}

export interface CatalogProject {
  slug: string;
  url: string;
  name: string;
  role: string;
  maturity: string;
  repo?: string;
  site?: string;
  concepts: string[];
  articles: string[];
}

export interface CatalogConcept {
  slug: string;
  url: string;
  name: string;
  oneLiner: string;
  tags: string[];
  projects: string[];
}

export interface CatalogPathStep {
  kind: "concept" | "article";
  ref: string;
  url: string;
  note: string;
}

export interface CatalogPath {
  slug: string;
  url: string;
  name: string;
  promise: string;
  audience: string;
  steps: CatalogPathStep[];
}

export interface CatalogChapter {
  n: number;
  part: string;
  title: string;
  url: string;
}

export interface Catalog {
  site: SiteIdentity;
  counts: Record<string, number>;
  articles: CatalogArticle[];
  projects: CatalogProject[];
  concepts: CatalogConcept[];
  paths: CatalogPath[];
  chapters: CatalogChapter[];
}

export interface RelationProvenance {
  source: string;
  generator: string;
  reason?: string;
  fingerprint: string;
}

export interface RelationEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  status: "declared" | "proposed" | "approved" | "rejected";
  verification: "verified" | "curated" | "proposed" | "unverified";
  provenance: RelationProvenance;
  via?: string;
  reason?: string;
}

export interface RelationGraph {
  vocabulary: string[];
  counts: Record<string, number>;
  absent: string[];
  edges: Record<string, RelationEdge[]>;
  proposed: RelationEdge[];
}

export interface Evidence {
  id: string;
  type: string;
  source: string;
  span?: string;
  contentHash?: string;
  verification: { status: "verified" | "unverified"; method: string; verifiedBy?: string };
}

export interface Claim {
  id: string;
  statement: string;
  source: string;
  sourceSpan: string;
  category: string;
  assessment: "proposed" | "supported" | "contested" | "superseded" | "unverified";
  verification: "implemented" | "tested" | "demonstrated" | "independently_verified" | "hypothesized";
  supportingEvidence: string[];
  contradictoryEvidence: string[];
  relationships: string[];
  authoritative: boolean;
  provenance: { source: string; generator: string; fingerprint: string };
}

export interface BookArticleRelationship {
  article: string;
  chapter: number;
  relation: "chapter_covers" | "recommends_reading";
  reason: string;
}

export interface BookRecord {
  title: string;
  subtitle: string;
  author: string;
  asin: string;
  amazonUrl: string;
  isbn?: string;
  datePublished?: string;
  chapters: { n: number; part: string; title: string }[];
  articleRelationships: BookArticleRelationship[];
  purchase: { destination: string; merchant: string; authorizedBy: string; note: string };
}

/* ── Request/response types ──────────────────────────────────────────────── */

export interface ConnectOptions {
  baseUrl: string;
  /** Override the fetch implementation (tests, undici, Bun). */
  fetchFn?: typeof fetch;
  /** Directory for the on-disk body cache. Omit for memory-only. */
  cacheDir?: string;
  /** Default byte budget for a search. Default 150000. */
  maxBytes?: number;
  userAgent?: string;
}

export interface SearchOptions {
  query: string;
  maxDocuments?: number;
  maxBytes?: number;
  concepts?: string[];
  projects?: string[];
  tags?: string[];
}

export interface DocumentHit {
  slug: string;
  url: string;
  markdownUrl: string;
  title: string;
  published: string;
  updated?: string;
  description: string;
  tags: string[];
  score: number;
  bodyBytes: number;
  contentHash: string;
  body: string;
}

export interface SearchResult {
  query: string;
  documents: DocumentHit[];
  concepts: string[];
  graphEdges: number;
  bytes: number;
  truncated: boolean;
  etag?: string;
}

export interface ExpandOptions {
  documents: string[];
  relations?: string[];
  maxDepth?: number;
  maxBytes?: number;
}

export interface ExpansionResult {
  documents: DocumentHit[];
  edges: RelationEdge[];
  claims: Claim[];
  bytes: number;
  truncated: boolean;
}

export interface TraverseOptions {
  from: string;
  types?: string[];
  maxDepth?: number;
}

export interface GraphNode {
  id: string;
  depth: number;
  via?: RelationEdge;
}

export interface TraversalResult {
  root: string;
  nodes: GraphNode[];
  edges: RelationEdge[];
}

export interface Article {
  slug: string;
  metadata: CatalogArticle;
  body: string;
  contentHash: string;
  bytes: number;
  claims: Claim[];
  relationships: RelationEdge[];
  citation: string;
}

export interface LearningPathResult {
  path: CatalogPath;
  steps: Array<{ kind: string; ref: string; url: string; note: string; title?: string }>;
}

export interface BookContextResult {
  article: string;
  relationships: BookArticleRelationship[];
  chapters: { n: number; part: string; title: string }[];
  citation: string;
}

export class KnowledgeError extends Error {
  status?: number;
  path?: string;
  constructor(message: string, details: { status?: number; path?: string } = {}) {
    super(message);
    this.name = "KnowledgeError";
    this.status = details.status;
    this.path = details.path;
  }
}
