// claim-evidence.ts — the bound claim/evidence layer.
//
// Seeds the typed model from the authoritative relation graph and from the
// deterministic proposal pass. Proposed claims are carried with
// `authoritative: false` and are never merged into the authoritative graph.

import { relationGraph } from "./relations.ts";
import { RELATION_TYPES, makeEdge, type RelationEdge } from "./relation-vocabulary.ts";
import { getAllPosts } from "./posts.ts";
import { PROJECTS, conceptsForPost } from "./taxonomy.ts";
import {
  absenceClaim,
  absenceEvidence,
  claimFromEdge,
  evidenceFromEdge,
  type Claim,
  type ClaimEvidenceBundle,
  type Evidence,
} from "./claim-evidence-core.ts";

/** Cap on deterministic proposals, so the list stays inspectable. The cap is
 *  explicit: a proposal is a question for an editor, not a fact. */
export const PROPOSAL_LIMIT = 10;

/** Deterministic, evidence-linked, NON-AUTHORITATIVE relation proposals.
 *  A post that shares two or more concepts with a project but is not declared
 *  as that project's write-up is proposed as a `documents` edge. Nothing here
 *  enters `/agents/graph.json`; approval is an explicit human act. */
export function buildProposals(): RelationEdge[] {
  const posts = getAllPosts();
  const perProject = new Map<string, number>();
  const out: RelationEdge[] = [];
  for (const project of PROJECTS) {
    const declared = new Set(project.articles);
    const conceptSet = new Set(project.concepts);
    for (const post of posts) {
      if (declared.has(post.slug)) continue;
      const shared = conceptsForPost(post).filter((c) => conceptSet.has(c.slug));
      if (shared.length < 2) continue;
      // At most two proposals per project, so the capped list stays diverse
      // instead of being filled by whichever project shares the most tags.
      const seen = perProject.get(project.slug) ?? 0;
      if (seen >= 2) continue;
      perProject.set(project.slug, seen + 1);
      out.push(
        makeEdge("documents", `/blog/${post.slug}`, `/projects/${project.slug}`, {
          source: "src/lib/claim-evidence.ts",
          reason: `shares ${shared.length} concepts (${shared
            .map((c) => c.slug)
            .join(", ")}) with ${project.slug}`,
          status: "proposed",
          verification: "proposed",
        })
      );
      if (out.length >= PROPOSAL_LIMIT) break;
    }
    if (out.length >= PROPOSAL_LIMIT) break;
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

export function buildClaimsAndEvidence(): ClaimEvidenceBundle {
  const graph = relationGraph();
  const edges = RELATION_TYPES.flatMap((t) => graph.edges[t]);

  const claims: Claim[] = edges.map(claimFromEdge);
  const evidence: Evidence[] = edges.map(evidenceFromEdge);

  // The absence claim: the strongest negative statement the repo makes.
  claims.push(absenceClaim());
  evidence.push(absenceEvidence());

  // Proposed claims, clearly flagged. They are part of the model so an agent
  // can see what was proposed and what was established, but they are not
  // authoritative.
  for (const proposal of buildProposals()) {
    claims.push(claimFromEdge(proposal));
    evidence.push(evidenceFromEdge(proposal));
  }

  return { claims, evidence };
}
