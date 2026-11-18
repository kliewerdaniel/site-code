// KnowledgeCorpus — a typed, dependency-free client for a compiled knowledge
// corpus. It speaks only HTTP and the filesystem: no Next.js, no runtime
// inference, no vector database.
//
// The client is intentionally explicit about cost and provenance:
//   - conditional requests (If-None-Match) and ETag caching, in memory and on
//     disk;
//   - a byte budget that stops document retrieval instead of over-fetching;
//   - content-hash verification of every Markdown mirror against the hash in
//     its own frontmatter;
//   - citations that carry the canonical URL and publication date.

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type {
  Article,
  BookContextResult,
  BookRecord,
  Catalog,
  CatalogArticle,
  CatalogPath,
  CitationInput,
  CitationVerification,
  Claim,
  ConceptDetail,
  ConnectOptions,
  DocumentHit,
  Evidence,
  ExpandOptions,
  ExpansionResult,
  GetClaimsOptions,
  GetEvidenceOptions,
  KnowledgeError as KnowledgeErrorType,
  LearningPathResult,
  ProjectDetail,
  RelatedWorkResult,
  RelationEdge,
  RelationGraph,
  SearchOptions,
  SearchResult,
  TraversalResult,
  TraverseManyOptions,
  TraverseOptions,
} from "./types.ts";
import { KnowledgeError } from "./types.ts";

interface CachedBody {
  body: string;
  etag?: string;
  contentType?: string;
}

interface GraphNodeLite {
  id: string;
  depth: number;
  via?: RelationEdge;
}

const DEFAULT_MAX_BYTES = 150_000;
const DEFAULT_MAX_DOCUMENTS = 6;

export class KnowledgeCorpus {
  readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;
  private readonly cacheDir?: string;
  private readonly maxBytes: number;
  private readonly userAgent: string;

  private catalog?: Catalog;
  private graph?: RelationGraph;
  private book?: BookRecord;
  private evidence: Evidence[] = [];
  private claims: Claim[] = [];
  private readonly memory = new Map<string, CachedBody>();

  private constructor(opts: ConnectOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
    this.fetchFn = opts.fetchFn ?? fetch;
    this.cacheDir = opts.cacheDir;
    this.maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;
    this.userAgent = opts.userAgent ?? "@danielkliewer/knowledge-sdk/0.1";
  }

  /** Fetch the index, catalog and graph. Returns the connected client. */
  static async connect(opts: ConnectOptions): Promise<KnowledgeCorpus> {
    const corpus = new KnowledgeCorpus(opts);
    await corpus.load();
    return corpus;
  }

  private async load(): Promise<void> {
    const index = await this.fetchJson<Record<string, unknown>>("/agents/index.json");
    const resources = new Set(
      ((index.resources ?? []) as Array<{ path: string }>).map((r) => r.path)
    );
    this.catalog = await this.fetchJson<Catalog>("/agents/catalog.json");
    this.graph = await this.fetchJson<RelationGraph>("/agents/graph.json");
    if (resources.has("/agents/book.json")) {
      this.book = await this.fetchJson<BookRecord>("/agents/book.json");
    }
    if (resources.has("/agents/evidence.json")) {
      const bundle = await this.fetchJson<{ evidence: Evidence[] }>("/agents/evidence.json");
      this.evidence = bundle.evidence ?? [];
    }
    if (resources.has("/agents/claims.json")) {
      const bundle = await this.fetchJson<{ claims: Claim[] }>("/agents/claims.json");
      this.claims = bundle.claims ?? [];
    }
  }

  get site(): string {
    return this.catalog?.site?.url ?? this.baseUrl;
  }

  get counts(): Record<string, number> {
    return this.catalog?.counts ?? {};
  }

  /* ── retrieval ─────────────────────────────────────────────────────────── */

  private cacheKey(urlPath: string): string {
    return createHash("sha256").update(urlPath).digest("hex").slice(0, 24);
  }

  private async readDiskCache(key: string): Promise<CachedBody | undefined> {
    if (!this.cacheDir) return undefined;
    try {
      const body = await fs.promises.readFile(path.join(this.cacheDir, `${key}.body`), "utf8");
      const etag = await fs.promises
        .readFile(path.join(this.cacheDir, `${key}.etag`), "utf8")
        .catch(() => undefined);
      return { body, etag: etag || undefined };
    } catch {
      return undefined;
    }
  }

  private async writeDiskCache(key: string, entry: CachedBody): Promise<void> {
    if (!this.cacheDir) return;
    await fs.promises.mkdir(this.cacheDir, { recursive: true });
    await fs.promises.writeFile(path.join(this.cacheDir, `${key}.body`), entry.body);
    if (entry.etag) {
      await fs.promises.writeFile(path.join(this.cacheDir, `${key}.etag`), entry.etag);
    }
  }

  /** Fetch a resource with conditional requests and two-level caching. */
  async fetchResource(urlPath: string): Promise<CachedBody> {
    const cached = this.memory.get(urlPath) ?? (await this.readDiskCache(this.cacheKey(urlPath)));
    const headers: Record<string, string> = { "User-Agent": this.userAgent };
    if (cached?.etag) headers["If-None-Match"] = cached.etag;

    const res = await this.fetchFn(`${this.baseUrl}${urlPath}`, { headers });
    if (res.status === 304 && cached) return { ...cached, contentType: cached.contentType };
    if (!res.ok) {
      throw new KnowledgeError(`GET ${urlPath} failed with ${res.status}`, {
        status: res.status,
        path: urlPath,
      });
    }
    const body = await res.text();
    const entry: CachedBody = {
      body,
      etag: res.headers.get("etag") ?? undefined,
      contentType: res.headers.get("content-type") ?? undefined,
    };
    this.memory.set(urlPath, entry);
    await this.writeDiskCache(this.cacheKey(urlPath), entry);
    return entry;
  }

  private async fetchJson<T>(urlPath: string): Promise<T> {
    const { body } = await this.fetchResource(urlPath);
    try {
      return JSON.parse(body) as T;
    } catch (e) {
      throw new KnowledgeError(`${urlPath} did not parse as JSON: ${(e as Error).message}`, {
        path: urlPath,
      });
    }
  }

  /* ── search ────────────────────────────────────────────────────────────── */

  private tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 1);
  }

  private score(article: CatalogArticle, terms: string[]): number {
    const title = article.title.toLowerCase();
    const description = article.description.toLowerCase();
    const tags = article.tags.join(" ").toLowerCase();
    const slug = article.slug.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 6;
      if (tags.includes(term)) score += 4;
      if (description.includes(term)) score += 2;
      if (slug.includes(term)) score += 1;
    }
    return score;
  }

  /** Rank the catalog, fetch the best documents within the byte budget, and
   *  verify each mirror's content hash. */
  async search(opts: SearchOptions): Promise<SearchResult> {
    if (!this.catalog || !this.graph) throw new KnowledgeError("corpus is not connected");
    const terms = this.tokenize(opts.query);
    const maxDocuments = opts.maxDocuments ?? DEFAULT_MAX_DOCUMENTS;
    const maxBytes = opts.maxBytes ?? this.maxBytes;

    const conceptSet = new Set((opts.concepts ?? []).map((c) => c.toLowerCase()));
    const projectSet = new Set((opts.projects ?? []).map((p) => p.toLowerCase()));
    const tagSet = new Set((opts.tags ?? []).map((t) => t.toLowerCase()));

    const bySlug = new Map(this.catalog.articles.map((a) => [a.slug, a]));
    const ranked = this.catalog.articles
      .map((a) => ({ article: a, score: this.score(a, terms) }))
      .filter(({ article, score }) => {
        if (score === 0) return false;
        if (conceptSet.size > 0) {
          const concepts = this.conceptsForSlug(article.slug);
          if (!concepts.some((c) => conceptSet.has(c.toLowerCase()))) return false;
        }
        if (projectSet.size > 0) {
          const projects = this.projectsForSlug(article.slug);
          if (!projects.some((p) => projectSet.has(p.toLowerCase()))) return false;
        }
        if (tagSet.size > 0 && !article.tags.some((t) => tagSet.has(t.toLowerCase()))) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score || b.article.published.localeCompare(a.article.published))
      .slice(0, maxDocuments);

    const documents: DocumentHit[] = [];
    let bytes = 0;
    let truncated = false;

    for (const { article, score } of ranked) {
      if (bytes >= maxBytes) {
        truncated = true;
        break;
      }
      const mirror = await this.fetchMirror(article.slug);
      if (!mirror) continue;
      if (bytes + mirror.bytes > maxBytes) {
        truncated = true;
        continue;
      }
      bytes += mirror.bytes;
      documents.push({
        slug: article.slug,
        url: article.url,
        markdownUrl: article.markdownUrl,
        title: article.title,
        published: article.published,
        updated: article.updated,
        description: article.description,
        tags: article.tags,
        score,
        bodyBytes: mirror.bytes,
        contentHash: mirror.contentHash,
        body: mirror.body,
      });
    }

    const edgeCount = Object.values(this.graph.counts).reduce((a, b) => a + b, 0);
    return {
      query: opts.query,
      documents,
      concepts: [...conceptSet],
      graphEdges: edgeCount,
      bytes,
      truncated,
      etag: this.memory.get("/agents/catalog.json")?.etag,
    };
  }

  /* ── document expansion ────────────────────────────────────────────────── */

  async expand(opts: ExpandOptions): Promise<ExpansionResult> {
    if (!this.catalog || !this.graph) throw new KnowledgeError("corpus is not connected");
    const maxBytes = opts.maxBytes ?? this.maxBytes;
    const maxDepth = opts.maxDepth ?? 2;
    const wanted = new Set(opts.relations ?? []);

    const documents: DocumentHit[] = [];
    let bytes = 0;
    let truncated = false;
    const seen = new Set<string>();

    for (const slug of opts.documents) {
      const article = this.catalog.articles.find((a) => a.slug === slug);
      if (!article || seen.has(slug)) continue;
      const mirror = await this.fetchMirror(slug);
      if (!mirror) continue;
      if (bytes + mirror.bytes > maxBytes) {
        truncated = true;
        continue;
      }
      seen.add(slug);
      bytes += mirror.bytes;
      documents.push({
        slug,
        url: article.url,
        markdownUrl: article.markdownUrl,
        title: article.title,
        published: article.published,
        updated: article.updated,
        description: article.description,
        tags: article.tags,
        score: 0,
        bodyBytes: mirror.bytes,
        contentHash: mirror.contentHash,
        body: mirror.body,
      });
    }

    const docNodes = new Set([...seen].map((s) => `/blog/${s}`));
    const edges: RelationEdge[] = [];
    const visited = new Set<string>();
    let frontier = new Set(docNodes);

    for (let depth = 0; depth < maxDepth; depth++) {
      const next = new Set<string>();
      for (const type of Object.keys(this.graph.edges)) {
        if (wanted.size > 0 && !wanted.has(type)) continue;
        for (const edge of this.graph.edges[type] ?? []) {
          if (frontier.has(edge.from) || frontier.has(edge.to)) {
            if (!visited.has(edge.id)) {
              visited.add(edge.id);
              edges.push(edge);
              next.add(edge.from);
              next.add(edge.to);
            }
          }
        }
      }
      frontier = next;
      if (frontier.size === 0) break;
    }

    const edgeIds = new Set(edges.map((e) => e.id));
    const claims = this.claims.filter((c) => c.relationships.some((r) => edgeIds.has(r)));

    return { documents, edges, claims, bytes, truncated };
  }

  /* ── graph traversal ───────────────────────────────────────────────────── */

  async traverseGraph(opts: TraverseOptions): Promise<TraversalResult> {
    if (!this.graph) throw new KnowledgeError("corpus is not connected");
    const maxDepth = opts.maxDepth ?? 2;
    const wanted = new Set(
      opts.types && opts.types.length > 0 ? opts.types : Object.keys(this.graph.edges)
    );
    const nodes = new Map<string, GraphNodeLite>();
    const edges: RelationEdge[] = [];
    const edgeSeen = new Set<string>();

    nodes.set(opts.from, { id: opts.from, depth: 0 });
    let frontier = new Set([opts.from]);

    for (let depth = 0; depth < maxDepth; depth++) {
      const next = new Set<string>();
      for (const type of Object.keys(this.graph.edges)) {
        if (!wanted.has(type)) continue;
        for (const edge of this.graph.edges[type] ?? []) {
          if (!frontier.has(edge.from)) continue;
          if (!edgeSeen.has(edge.id)) {
            edgeSeen.add(edge.id);
            edges.push(edge);
          }
          if (!nodes.has(edge.to)) {
            nodes.set(edge.to, { id: edge.to, depth: depth + 1, via: edge });
            next.add(edge.to);
          }
        }
      }
      frontier = next;
      if (frontier.size === 0) break;
    }

    return { root: opts.from, nodes: [...nodes.values()], edges };
  }

  /* ── single article ────────────────────────────────────────────────────── */

  async getArticle(slug: string): Promise<Article> {
    if (!this.catalog) throw new KnowledgeError("corpus is not connected");
    const metadata = this.catalog.articles.find((a) => a.slug === slug);
    if (!metadata) throw new KnowledgeError(`unknown article ${slug}`, { path: `/blog/${slug}` });
    const mirror = await this.fetchMirror(slug);
    if (!mirror) throw new KnowledgeError(`no mirror for ${slug}`, {
      path: `/research/${slug}.md`,
    });

    const edges = this.edgesForSlug(slug);
    const edgeIds = new Set(edges.map((e) => e.id));
    const claims = this.claims.filter((c) => c.relationships.some((r) => edgeIds.has(r)));

    return {
      slug,
      metadata,
      body: mirror.body,
      contentHash: mirror.contentHash,
      bytes: mirror.bytes,
      claims,
      relationships: edges,
      citation: this.citation(metadata),
    };
  }

  /* ── evidence, paths, book ──────────────────────────────────────────────── */

  /* ── claims and evidence ────────────────────────────────────────────────── */

  /** Claims, optionally restricted to one document and/or authoritativeness.
   *  A proposed claim is returned too: the caller decides whether to treat it
   *  as authoritative, and `authoritative` is always present on the record. */
  getClaims(opts: GetClaimsOptions = {}): Claim[] {
    if (!this.catalog) throw new KnowledgeError("corpus is not connected");
    let claims = this.claims;
    if (opts.documentId) {
      const edgeIds = new Set(this.edgesForSlug(opts.documentId).map((e) => e.id));
      claims = claims.filter(
        (c) =>
          c.relationships.some((r) => edgeIds.has(r)) ||
          c.source.includes(opts.documentId as string)
      );
    }
    if (opts.authoritative !== undefined) {
      claims = claims.filter((c) => c.authoritative === opts.authoritative);
    }
    return claims;
  }

  getClaim(id: string): Claim {
    const claim = this.claims.find((c) => c.id === id);
    if (!claim) throw new KnowledgeError(`unknown claim ${id}`, { path: "/agents/claims.json" });
    return claim;
  }

  /** Evidence for one claim id, or for several at once. */
  async getEvidence(claimId: string): Promise<Evidence[]>;
  async getEvidence(opts: GetEvidenceOptions): Promise<Evidence[]>;
  async getEvidence(arg: string | GetEvidenceOptions): Promise<Evidence[]> {
    const ids = typeof arg === "string" ? [arg] : arg.claimIds;
    const evidenceIds = new Set<string>();
    for (const id of ids) {
      const claim = this.claims.find((c) => c.id === id);
      if (!claim) throw new KnowledgeError(`unknown claim ${id}`, { path: "/agents/claims.json" });
      for (const e of [...claim.supportingEvidence, ...claim.contradictoryEvidence]) {
        evidenceIds.add(e);
      }
    }
    return this.evidence.filter((e) => evidenceIds.has(e.id));
  }

  async getLearningPath(slug: string): Promise<LearningPathResult> {
    if (!this.catalog) throw new KnowledgeError("corpus is not connected");
    const path = this.catalog.paths.find((p) => p.slug === slug);
    if (!path) throw new KnowledgeError(`unknown learning path ${slug}`);
    const bySlug = new Map(this.catalog.articles.map((a) => [a.slug, a]));
    const byConcept = new Map(this.catalog.concepts.map((c) => [c.slug, c]));
    const steps = path.steps.map((s) => {
      const title = s.kind === "article" ? bySlug.get(s.ref)?.title : byConcept.get(s.ref)?.name;
      return { ...s, title };
    });
    return { path, steps };
  }

  async getBookContext(articleSlug: string): Promise<BookContextResult> {
    if (!this.book) throw new KnowledgeError("the corpus has no book record");
    const articleUrl = `${this.site}/blog/${articleSlug}`;
    const relationships = this.book.articleRelationships.filter((r) => r.article === articleUrl);
    return {
      article: articleSlug,
      relationships,
      chapters: this.book.chapters,
      citation: `${this.book.author}, ${this.book.title}: ${this.book.subtitle}. ${this.book.datePublished ?? ""}. ${this.book.amazonUrl}`,
    };
  }

  /* ── provenance helpers ────────────────────────────────────────────────── */

  citation(metadata: CatalogArticle): string {
    return `${this.site.replace("https://www.", "")} — ${metadata.title}. By ${this.catalog?.site?.name ?? "Daniel Kliewer"}. ${metadata.published.slice(0, 10)}. ${metadata.url}.`;
  }

  private conceptsForSlug(slug: string): string[] {
    const article = this.catalog?.articles.find((a) => a.slug === slug);
    if (!article) return [];
    return (this.catalog?.concepts ?? [])
      .filter((c) => c.tags.some((t) => article.tags.some((at) => at.toLowerCase() === t.toLowerCase())))
      .map((c) => c.slug);
  }

  private projectsForSlug(slug: string): string[] {
    return (this.catalog?.projects ?? [])
      .filter((p) => p.articles.includes(slug))
      .map((p) => p.slug);
  }

  private edgesForSlug(slug: string): RelationEdge[] {
    if (!this.graph) return [];
    const node = `/blog/${slug}`;
    return Object.values(this.graph.edges)
      .flat()
      .filter((e) => e.from === node || e.to === node);
  }

  /** Fetch and verify one Markdown mirror. Returns null for a draft/unknown
   *  slug, where the mirror correctly 404s. */
  private async fetchMirror(slug: string): Promise<{
    body: string;
    bytes: number;
    contentHash: string;
  } | null> {
    let raw: CachedBody;
    try {
      raw = await this.fetchResource(`/research/${slug}.md`);
    } catch (e) {
      if ((e as KnowledgeErrorType).status === 404) return null;
      throw e;
    }
    const { body, contentHash, bytes } = parseMirror(raw.body);
    if (contentHash !== sha256Hex(body)) {
      throw new KnowledgeError(`mirror ${slug} fails its content hash`, {
        path: `/research/${slug}.md`,
      });
    }
    return { body, bytes, contentHash };
  }

  /* ── concepts, projects, related work ───────────────────────────────────── */

  private allEdges(): RelationEdge[] {
    if (!this.graph) return [];
    return Object.values(this.graph.edges).flat();
  }

  /** A concept with its projects, the articles tagged for it, and every
   *  relation edge that touches it. */
  getConcept(slug: string): ConceptDetail {
    if (!this.catalog) throw new KnowledgeError("corpus is not connected");
    const concept = this.catalog.concepts.find((c) => c.slug === slug);
    if (!concept) throw new KnowledgeError(`unknown concept ${slug}`, { path: "/agents/catalog.json" });
    const node = `/concepts/${slug}`;
    const relationships = this.allEdges().filter((e) => e.from === node || e.to === node);
    const tagSet = new Set(concept.tags.map((t) => t.toLowerCase()));
    const articles = this.catalog.articles.filter((a) =>
      a.tags.some((t) => tagSet.has(t.toLowerCase()))
    );
    const projects = this.catalog.projects.filter((p) => p.concepts.includes(slug));
    return { concept, articles, projects, relationships };
  }

  /** A project with its articles, its relation edges and the evidence that
   *  supports those edges. */
  getProject(slug: string): ProjectDetail {
    if (!this.catalog) throw new KnowledgeError("corpus is not connected");
    const project = this.catalog.projects.find((p) => p.slug === slug);
    if (!project) throw new KnowledgeError(`unknown project ${slug}`, { path: "/agents/catalog.json" });
    const node = `/projects/${slug}`;
    const relationships = this.allEdges().filter((e) => e.from === node || e.to === node);
    const articleSet = new Set(project.articles);
    const articles = this.catalog.articles.filter((a) => articleSet.has(a.slug));
    const edgeIds = new Set(relationships.map((e) => e.id));
    const evidence = this.evidence.filter((e) => edgeIds.has(e.id.replace(/^ev:/, "")));
    return { project, articles, relationships, evidence };
  }

  /** Directive-shaped traversal: several starting nodes, typed relations, a
   *  bounded depth. The node set is bounded by the graph itself and by depth. */
  traverse(opts: TraverseManyOptions): TraversalResult {
    if (!this.graph) throw new KnowledgeError("corpus is not connected");
    const maxDepth = opts.maxDepth ?? 2;
    const wanted = new Set(
      opts.relations && opts.relations.length > 0 ? opts.relations : Object.keys(this.graph.edges)
    );
    const nodes = new Map<string, GraphNodeLite>();
    const edges: RelationEdge[] = [];
    const edgeSeen = new Set<string>();
    for (const start of opts.startingNodes) nodes.set(start, { id: start, depth: 0 });
    let frontier = new Set(opts.startingNodes);

    for (let depth = 0; depth < maxDepth; depth++) {
      const next = new Set<string>();
      for (const type of Object.keys(this.graph.edges)) {
        if (!wanted.has(type)) continue;
        for (const edge of this.graph.edges[type] ?? []) {
          if (!frontier.has(edge.from)) continue;
          if (!edgeSeen.has(edge.id)) {
            edgeSeen.add(edge.id);
            edges.push(edge);
          }
          if (!nodes.has(edge.to)) {
            nodes.set(edge.to, { id: edge.to, depth: depth + 1, via: edge });
            next.add(edge.to);
          }
        }
      }
      frontier = next;
      if (frontier.size === 0) break;
    }
    return { root: opts.startingNodes[0] ?? "", nodes: [...nodes.values()], edges };
  }

  /** Related systems, concepts and research reachable from a node. Unlike
   *  `traverse`, this follows edges in both directions: a project's articles
   *  are related to it even though `documents` points at the project. */
  getRelatedWork(
    node: string,
    opts: { types?: string[]; maxDepth?: number } = {}
  ): RelatedWorkResult {
    const maxDepth = opts.maxDepth ?? 1;
    const wanted = new Set(
      opts.types && opts.types.length > 0 ? opts.types : Object.keys(this.graph?.edges ?? {})
    );
    const nodes = new Map<string, GraphNodeLite>();
    const edges: RelationEdge[] = [];
    const edgeSeen = new Set<string>();
    nodes.set(node, { id: node, depth: 0 });
    let frontier = new Set<string>([node]);

    for (let depth = 0; depth < maxDepth; depth++) {
      const next = new Set<string>();
      for (const type of Object.keys(this.graph?.edges ?? {})) {
        if (!wanted.has(type)) continue;
        for (const edge of this.graph?.edges[type] ?? []) {
          if (!frontier.has(edge.from) && !frontier.has(edge.to)) continue;
          if (!edgeSeen.has(edge.id)) {
            edgeSeen.add(edge.id);
            edges.push(edge);
          }
          for (const id of [edge.from, edge.to]) {
            if (!nodes.has(id)) {
              nodes.set(id, { id, depth: depth + 1, via: edge });
              next.add(id);
            }
          }
        }
      }
      frontier = next;
      if (frontier.size === 0) break;
    }

    const slugs = new Set<string>();
    for (const n of nodes.keys()) {
      const m = /^\/blog\/(.+)$/.exec(n);
      if (m) slugs.add(m[1]);
    }
    const documents = (this.catalog?.articles ?? []).filter((a) => slugs.has(a.slug));
    return { node, nodes: [...nodes.values()], edges, documents };
  }

  /* ── citation verification ──────────────────────────────────────────────── */

  /** Check whether a citation resolves to a real document and, when a span is
   *  supplied, that the span is present in the hash-verified body. A claim id
   *  resolves against the claim's own source span. */
  async verifyCitation(input: CitationInput): Promise<CitationVerification> {
    if (input.claimId) {
      const claim = this.claims.find((c) => c.id === input.claimId);
      if (!claim) return { ok: false, reason: `unknown claim ${input.claimId}` };
      return { ok: true, slug: claim.source, span: claim.sourceSpan, url: claim.source };
    }
    let slug = input.slug;
    if (!slug && input.url) {
      const m = /\/blog\/([^/?#]+)/.exec(input.url);
      if (m) slug = m[1];
    }
    if (!slug) return { ok: false, reason: "no slug or recognizable url" };
    const metadata = this.catalog?.articles.find((a) => a.slug === slug);
    if (!metadata) return { ok: false, slug, reason: `unknown document ${slug}` };
    const base: CitationVerification = { ok: true, slug, url: metadata.url };
    if (!input.span) return base;
    const mirror = await this.fetchMirror(slug);
    if (!mirror) return { ...base, ok: false, span: input.span, reason: "no verified mirror" };
    const found = mirror.body.includes(input.span);
    return {
      ...base,
      ok: found,
      span: input.span,
      contentHash: mirror.contentHash,
      reason: found ? undefined : "span not present in the document body",
    };
  }
}

/* ── mirror parsing ──────────────────────────────────────────────────────── */

export interface ParsedMirror {
  body: string;
  bytes: number;
  contentHash: string;
  canonicalUrl: string;
  title: string;
}

/** Split a canonical mirror and verify its structure. The hash is checked
 *  separately against the body, because a document cannot contain a hash of
 *  itself. */
export function parseMirror(doc: string): ParsedMirror {
  if (!doc.startsWith("---\n")) throw new KnowledgeError("mirror: missing frontmatter");
  const end = doc.indexOf("\n---\n", 4);
  if (end === -1) throw new KnowledgeError("mirror: missing frontmatter close");
  const frontmatter = doc.slice(4, end);
  const body = doc.slice(end + 5).replace(/^\n/, "");

  const fields: Record<string, string> = {};
  for (const line of frontmatter.split("\n")) {
    const m = /^([A-Za-z_]+):\s*(.*)$/.exec(line);
    if (m) fields[m[1]] = m[2].trim();
  }
  const hashRaw = fields.content_hash ?? "";
  return {
    body,
    bytes: Buffer.byteLength(body, "utf8"),
    contentHash: hashRaw.startsWith("sha256:") ? hashRaw.slice(7) : hashRaw,
    canonicalUrl: fields.canonical_url ?? "",
    title: (fields.title ?? "").replace(/^"|"$/g, ""),
  };
}

export function sha256Hex(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}
