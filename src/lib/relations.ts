// The relation graph, bound to this repo's real data.
//
// Plain relative imports on purpose: `scripts/audit-site.mjs` and the
// `node --test` suites import this module outside a Next build, where the
// `@/` alias does not resolve.

import { PROJECTS, CONCEPTS, PATHS } from "./taxonomy";
import { BOOK_LINKS } from "./book-links";
import { CHAPTERS } from "./chapters";
import { getAllPosts } from "./posts";
import {
  buildRelationGraph,
  danglingEdges,
  type DanglingEdge,
  type KnownNodes,
  type RelationGraph,
} from "./relations-core";

export function relationGraph(): RelationGraph {
  return buildRelationGraph({
    projects: PROJECTS,
    concepts: CONCEPTS,
    paths: PATHS,
    bookLinks: BOOK_LINKS,
  });
}

/** The nodes the graph is allowed to reference, read from the real sources. */
export function knownNodes(): KnownNodes {
  return {
    posts: new Set(getAllPosts().map((p) => p.slug)),
    projects: new Set(PROJECTS.map((p) => p.slug)),
    concepts: new Set(CONCEPTS.map((c) => c.slug)),
    chapters: new Set(CHAPTERS.map((c) => c.n)),
  };
}

/** Every edge that does not resolve. Empty is the invariant. */
export function graphDangling(): DanglingEdge[] {
  return danglingEdges(relationGraph(), knownNodes());
}

export { buildRelationGraph, danglingEdges } from "./relations-core";
export type { RelationEdge, RelationGraph, RelationType } from "./relations-core";
