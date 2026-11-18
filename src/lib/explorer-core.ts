// explorer-core.ts — pure model and layout for the interactive knowledge graph.
//
// No React, no clock, no randomness, no filesystem. The page binds this to the
// generated catalog and graph; the client component renders it. Every function
// is deterministic so the same corpus always produces the same layout.

export type ExplorerNodeType =
  | "concept"
  | "project"
  | "article"
  | "path"
  | "chapter"
  | "external";

export interface ExplorerNode {
  id: string;
  label: string;
  type: ExplorerNodeType;
  url: string;
  degree: number;
}

export interface ExplorerEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  status: string;
  verification: string;
  source: string;
  fingerprint: string;
}

export interface ExplorerInput {
  articles: Array<{ slug: string; title: string; url: string }>;
  projects: Array<{ slug: string; name: string; url: string }>;
  concepts: Array<{ slug: string; name: string; url: string }>;
  paths: Array<{ slug: string; name: string; url: string }>;
  chapters: Array<{ n: number; title: string; url: string }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    type: string;
    status: string;
    verification: string;
    provenance?: { source?: string; generator?: string; fingerprint?: string };
  }>;
}

export interface ExplorerData {
  nodes: ExplorerNode[];
  edges: ExplorerEdge[];
  relationTypes: string[];
  nodeTypes: ExplorerNodeType[];
}

export const NODE_TYPE_ORDER: ExplorerNodeType[] = [
  "concept",
  "project",
  "article",
  "path",
  "chapter",
  "external",
];

export function nodeType(id: string): ExplorerNodeType {
  if (id.startsWith("/blog/")) return "article";
  if (id.startsWith("/projects/")) return "project";
  if (id.startsWith("/concepts/")) return "concept";
  if (id.startsWith("/paths/")) return "path";
  if (id.startsWith("chapter:")) return "chapter";
  return "external";
}

/** Resolve a raw graph reference (a bare slug) to a canonical node id. A ref
 *  that matches no catalog entry is kept verbatim and rendered as external. */
function normalizeRef(
  ref: string,
  articles: Map<string, string>,
  concepts: Map<string, string>
): string {
  if (ref.startsWith("/") || ref.startsWith("chapter:")) return ref;
  const article = articles.get(ref);
  if (article) return article;
  const concept = concepts.get(ref);
  if (concept) return concept;
  return ref;
}

/** Build the render model from the catalog and the authoritative graph. */
export function buildExplorerData(input: ExplorerInput): ExplorerData {
  const articles = new Map(input.articles.map((a) => [a.slug, `/blog/${a.slug}`]));
  const concepts = new Map(input.concepts.map((c) => [c.slug, `/concepts/${c.slug}`]));

  const nodes = new Map<string, ExplorerNode>();
  const add = (id: string, label: string, url: string) => {
    if (!id) return;
    const existing = nodes.get(id);
    if (existing) {
      if (label && existing.label === existing.id) existing.label = label;
      return;
    }
    nodes.set(id, { id, label: label || id, type: nodeType(id), url, degree: 0 });
  };

  for (const a of input.articles) add(`/blog/${a.slug}`, a.title, a.url);
  for (const p of input.projects) add(`/projects/${p.slug}`, p.name, p.url);
  for (const c of input.concepts) add(`/concepts/${c.slug}`, c.name, c.url);
  for (const p of input.paths) add(`/paths/${p.slug}`, p.name, p.url);
  for (const c of input.chapters) add(`chapter:${c.n}`, c.title, c.url);

  const edges: ExplorerEdge[] = [];
  for (const e of input.edges) {
    const from = normalizeRef(e.from, articles, concepts);
    const to = normalizeRef(e.to, articles, concepts);
    add(from, "", "");
    add(to, "", "");
    edges.push({
      id: e.id,
      from,
      to,
      type: e.type,
      status: e.status,
      verification: e.verification,
      source: e.provenance?.source ?? "",
      fingerprint: e.provenance?.fingerprint ?? "",
    });
  }

  for (const e of edges) {
    const a = nodes.get(e.from);
    const b = nodes.get(e.to);
    if (a) a.degree += 1;
    if (b) b.degree += 1;
  }

  const sorted = [...nodes.values()].sort(
    (a, b) =>
      NODE_TYPE_ORDER.indexOf(a.type) - NODE_TYPE_ORDER.indexOf(b.type) ||
      a.label.localeCompare(b.label)
  );

  const counts = new Map<string, number>();
  for (const e of edges) counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
  const relationTypes = [...counts.keys()].sort(
    (a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b)
  );

  const present = new Set(sorted.map((n) => n.type));
  const nodeTypes = NODE_TYPE_ORDER.filter((t) => present.has(t));

  return { nodes: sorted, edges, relationTypes, nodeTypes };
}

/** The default selection: the highest-degree concept, else the highest-degree
 *  node. Deterministic, so the server and the client agree. */
export function defaultSelection(data: ExplorerData): string | null {
  const byDegree = (a: ExplorerNode, b: ExplorerNode) =>
    b.degree - a.degree || a.label.localeCompare(b.label);
  const concepts = data.nodes.filter((n) => n.type === "concept").sort(byDegree);
  if (concepts.length > 0) return concepts[0].id;
  const all = [...data.nodes].sort(byDegree);
  return all[0]?.id ?? null;
}

export interface Neighborhood {
  nodeIds: string[];
  edges: ExplorerEdge[];
  truncated: boolean;
}

/** Bounded breadth-first neighborhood over the undirected form of the visible
 *  edges. The node set is capped; the caller can tell it was bounded. */
export function neighborhood(
  start: string,
  edges: ExplorerEdge[],
  maxDepth: number,
  maxNodes = 80
): Neighborhood {
  const adjacency = new Map<string, Set<string>>();
  const addPair = (a: string, b: string) => {
    const set = adjacency.get(a) ?? new Set<string>();
    set.add(b);
    adjacency.set(a, set);
  };
  for (const e of edges) {
    addPair(e.from, e.to);
    addPair(e.to, e.from);
  }

  const nodeIds: string[] = [start];
  const seen = new Set([start]);
  let frontier = [start];
  const keptEdges: ExplorerEdge[] = [];
  const edgeSeen = new Set<string>();

  for (let depth = 0; depth < maxDepth; depth++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const other of adjacency.get(id) ?? []) {
        if (!seen.has(other) && nodeIds.length < maxNodes) {
          seen.add(other);
          nodeIds.push(other);
          next.push(other);
        }
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }

  for (const e of edges) {
    if (seen.has(e.from) && seen.has(e.to) && !edgeSeen.has(e.id)) {
      edgeSeen.add(e.id);
      keptEdges.push(e);
    }
  }

  return { nodeIds, edges: keptEdges, truncated: nodeIds.length >= maxNodes };
}

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  depth: number;
}

export interface Layout {
  positions: Record<string, PositionedNode>;
  edges: ExplorerEdge[];
  truncated: boolean;
}

/** Deterministic radial layout: the selection at the centre, each BFS ring on
 *  a circle, nodes ordered by type then label. No physics, no randomness. */
export function computeLayout(
  start: string,
  nodes: ExplorerNode[],
  edges: ExplorerEdge[],
  maxDepth: number,
  width = 720,
  height = 560
): Layout {
  const { nodeIds, edges: kept, truncated } = neighborhood(start, edges, maxDepth);
  const keptSet = new Set(nodeIds);
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const adjacency = new Map<string, Set<string>>();
  const addPair = (a: string, b: string) => {
    const set = adjacency.get(a) ?? new Set<string>();
    set.add(b);
    adjacency.set(a, set);
  };
  for (const e of kept) {
    addPair(e.from, e.to);
    addPair(e.to, e.from);
  }

  const depthOf = new Map<string, number>([[start, 0]]);
  let frontier = [start];
  for (let d = 1; d <= maxDepth; d++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const other of adjacency.get(id) ?? []) {
        if (!depthOf.has(other) && keptSet.has(other)) {
          depthOf.set(other, d);
          next.push(other);
        }
      }
    }
    frontier = next;
  }

  const rings = new Map<number, ExplorerNode[]>();
  for (const id of nodeIds) {
    const node = byId.get(id);
    if (!node) continue;
    const d = depthOf.get(id) ?? maxDepth;
    const ring = rings.get(d) ?? [];
    ring.push(node);
    rings.set(d, ring);
  }
  for (const ring of rings.values()) {
    ring.sort(
      (a, b) =>
        NODE_TYPE_ORDER.indexOf(a.type) - NODE_TYPE_ORDER.indexOf(b.type) ||
        a.label.localeCompare(b.label)
    );
  }

  const cx = width / 2;
  const cy = height / 2;
  const baseRadius = Math.min(width, height) * 0.31;
  const positions: Record<string, PositionedNode> = {};

  for (const [depth, ring] of rings) {
    const n = ring.length;
    const radius = depth === 0 ? 0 : baseRadius * depth * (1 + Math.max(0, n - 10) * 0.02);
    const offset = depth === 0 ? 0 : (depth * Math.PI) / Math.max(1, n);
    ring.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, n) + offset;
      positions[node.id] = {
        id: node.id,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        depth,
      };
    });
  }

  const renderedEdges = kept.filter(
    (e) => positions[e.from] && positions[e.to]
  );

  return { positions, edges: renderedEdges, truncated };
}

/** Filter nodes by a query and a set of types. An empty type set means all. */
export function filterNodes(
  nodes: ExplorerNode[],
  query: string,
  types: Set<string>
): ExplorerNode[] {
  const q = query.trim().toLowerCase();
  return nodes.filter((n) => {
    if (types.size > 0 && !types.has(n.type)) return false;
    if (!q) return true;
    return (
      n.label.toLowerCase().includes(q) ||
      n.id.toLowerCase().includes(q)
    );
  });
}

/** Filter edges by relation type and by whether both endpoints are visible. */
export function filterEdges(
  edges: ExplorerEdge[],
  types: Set<string>,
  visibleNodeIds: Set<string>
): ExplorerEdge[] {
  return edges.filter((e) => {
    if (types.size > 0 && !types.has(e.type)) return false;
    if (visibleNodeIds.size > 0 && (!visibleNodeIds.has(e.from) || !visibleNodeIds.has(e.to)))
      return false;
    return true;
  });
}
