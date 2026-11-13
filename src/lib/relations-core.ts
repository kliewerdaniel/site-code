// The relation graph, computed from data — never invented.
//
// This is the single implementation behind both `/agents/graph.json` and the
// site auditor. It replaces the regex parser that used to live in
// `scripts/audit-site.mjs`, so the exported graph and the audited graph cannot
// drift apart.
//
// Edge vocabulary (all optional; a type with no data source is reported in
// `absent` rather than fabricated):
//   implements        /projects/<p>  -> /concepts/<c>   project implements concept
//   documents         /blog/<post>   -> /projects/<p>   post is the write-up for a project
//   prerequisite_for  <ref>          -> <ref>            consecutive learning-path steps
//   chapter_covers    chapter:<n>    -> /blog/<post>    chapter covers the article  (VERIFIED ONLY)
//   recommends_reading /blog/<post>  -> chapter:<n>     article is further reading for the chapter
//
// `chapter_covers` is deliberately empty: the manuscript does not reproduce
// individual articles, so no such claim can be verified. See `book-links.ts`.
//
// Every edge carries a stable id, a lifecycle status, a verification status and
// provenance (declaring file, generator, reason, modification fingerprint).
// Proposed edges live in `proposed` and never enter the authoritative graph.

import {
  ABSENT_RELATIONS,
  LEGACY_ABSENT_RELATIONS,
  RELATION_TYPES,
  RELATION_VOCABULARY,
  makeEdge,
  type RelationEdge,
  type RelationProvenance,
  type RelationStatus,
  type RelationType,
  type VerificationStatus,
} from "./relation-vocabulary.ts";

export {
  ABSENT_RELATIONS,
  LEGACY_ABSENT_RELATIONS,
  RELATION_TYPES,
  RELATION_VOCABULARY,
  makeEdge,
  relationFingerprint,
  relationId,
  sha256Hex,
} from "./relation-vocabulary.ts";
export type {
  RelationEdge,
  RelationProvenance,
  RelationStatus,
  RelationType,
  VerificationStatus,
} from "./relation-vocabulary.ts";

export interface RelationGraph {
  vocabulary: readonly RelationType[];
  counts: Record<RelationType, number>;
  edges: Record<RelationType, RelationEdge[]>;
  absent: string[];
  /** Non-authoritative proposals. Never merged into `edges`. */
  proposed: RelationEdge[];
}

export interface RelationInput {
  projects: Array<{ slug: string; concepts: string[]; articles: string[] }>;
  concepts: Array<{ slug: string }>;
  paths: Array<{ slug: string; steps: Array<{ kind: string; ref: string }> }>;
  bookLinks: Array<{
    article: string;
    chapter: number;
    relation: "chapter_covers" | "recommends_reading";
    reason: string;
  }>;
}

/** Stable node id for a book chapter. */
export function chapterNode(n: number): string {
  return `chapter:${n}`;
}

export function buildRelationGraph(input: RelationInput): RelationGraph {
  const edges = Object.fromEntries(
    RELATION_TYPES.map((t) => [t, [] as RelationEdge[]])
  ) as Record<RelationType, RelationEdge[]>;

  for (const project of input.projects) {
    for (const c of project.concepts) {
      edges.implements.push(
        makeEdge("implements", `/projects/${project.slug}`, `/concepts/${c}`, {
          source: "src/lib/taxonomy.ts",
        })
      );
    }
    for (const a of project.articles) {
      edges.documents.push(
        makeEdge("documents", `/blog/${a}`, `/projects/${project.slug}`, {
          source: "src/lib/taxonomy.ts",
        })
      );
    }
  }

  for (const path of input.paths) {
    const refs = path.steps.map((s) => s.ref);
    for (let i = 0; i + 1 < refs.length; i++) {
      edges.prerequisite_for.push(
        makeEdge("prerequisite_for", refs[i], refs[i + 1], {
          source: "src/lib/taxonomy.ts",
          via: `/paths/${path.slug}`,
        })
      );
    }
  }

  for (const link of input.bookLinks) {
    if (link.relation === "chapter_covers") {
      edges.chapter_covers.push(
        makeEdge("chapter_covers", chapterNode(link.chapter), `/blog/${link.article}`, {
          source: "src/lib/book-links.ts",
          reason: link.reason,
          verification: "curated",
        })
      );
    } else {
      edges.recommends_reading.push(
        makeEdge("recommends_reading", `/blog/${link.article}`, chapterNode(link.chapter), {
          source: "src/lib/book-links.ts",
          reason: link.reason,
          verification: "curated",
        })
      );
    }
  }

  const counts = Object.fromEntries(
    RELATION_TYPES.map((t) => [t, edges[t].length])
  ) as Record<RelationType, number>;

  return {
    vocabulary: RELATION_VOCABULARY,
    counts,
    edges,
    absent: [...ABSENT_RELATIONS, ...LEGACY_ABSENT_RELATIONS],
    proposed: [],
  };
}

/** Everything the graph's edges are allowed to point at. */
export interface KnownNodes {
  posts: Set<string>;
  projects: Set<string>;
  concepts: Set<string>;
  chapters: Set<number>;
}

export interface DanglingEdge {
  relation: RelationType;
  edge: RelationEdge;
  why: string;
}

/**
 * Referential-integrity check. Every edge must resolve to a declared node.
 * A dangling edge is a defect: it means a slug was renamed, a post was
 * deleted, or a relation was invented.
 */
export function danglingEdges(graph: RelationGraph, known: KnownNodes): DanglingEdge[] {
  const out: DanglingEdge[] = [];
  const post = (slug: string) => known.posts.has(slug);
  const project = (slug: string) => known.projects.has(slug);
  const concept = (slug: string) => known.concepts.has(slug);
  const chapter = (n: number) => known.chapters.has(n);

  for (const e of graph.edges.implements) {
    const pf = e.from.replace(/^\/projects\//, "");
    const ct = e.to.replace(/^\/concepts\//, "");
    if (!project(pf)) out.push({ relation: "implements", edge: e, why: `unknown project ${e.from}` });
    if (!concept(ct)) out.push({ relation: "implements", edge: e, why: `unknown concept ${e.to}` });
  }
  for (const e of graph.edges.documents) {
    const p = e.from.replace(/^\/blog\//, "");
    const pr = e.to.replace(/^\/projects\//, "");
    if (!post(p)) out.push({ relation: "documents", edge: e, why: `unknown post ${e.from}` });
    if (!project(pr)) out.push({ relation: "documents", edge: e, why: `unknown project ${e.to}` });
  }
  for (const e of graph.edges.prerequisite_for) {
    const okFrom = e.from.startsWith("20") ? post(e.from) : concept(e.from);
    const okTo = e.to.startsWith("20") ? post(e.to) : concept(e.to);
    if (!okFrom) out.push({ relation: "prerequisite_for", edge: e, why: `unknown ref ${e.from}` });
    if (!okTo) out.push({ relation: "prerequisite_for", edge: e, why: `unknown ref ${e.to}` });
  }
  for (const e of graph.edges.chapter_covers) {
    const n = Number(e.from.replace(/^chapter:/, ""));
    const p = e.to.replace(/^\/blog\//, "");
    if (!chapter(n)) out.push({ relation: "chapter_covers", edge: e, why: `unknown chapter ${e.from}` });
    if (!post(p)) out.push({ relation: "chapter_covers", edge: e, why: `unknown post ${e.to}` });
  }
  for (const e of graph.edges.recommends_reading) {
    const p = e.from.replace(/^\/blog\//, "");
    const n = Number(e.to.replace(/^chapter:/, ""));
    if (!post(p)) out.push({ relation: "recommends_reading", edge: e, why: `unknown post ${e.from}` });
    if (!chapter(n)) out.push({ relation: "recommends_reading", edge: e, why: `unknown chapter ${e.to}` });
  }
  return out;
}
