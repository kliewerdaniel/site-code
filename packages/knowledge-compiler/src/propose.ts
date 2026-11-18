// propose.ts — deterministic proposal rules.
//
// These rules may only PROPOSE. A proposal is a question for an editor, not a
// fact, and never becomes authoritative without an explicit approval.

import type { Proposal, SourceDocument } from "./types.ts";

/** Propose `related_to` relations between documents that share two or more
 *  tags. Deterministic and inspectable; the evidence names the shared tags. */
export function proposeTagOverlap(documents: SourceDocument[]): Proposal[] {
  const published = documents.filter((d) => !d.draft);
  const proposals: Proposal[] = [];
  for (let i = 0; i < published.length; i++) {
    for (let j = i + 1; j < published.length; j++) {
      const a = published[i];
      const b = published[j];
      const shared = a.tags.filter((t) => b.tags.includes(t));
      if (shared.length < 2) continue;
      proposals.push({
        id: `proposal:related_to:${a.id}->${b.id}`,
        kind: "relation",
        subject: a.id,
        predicate: "related_to",
        object: b.id,
        evidence: `shares ${shared.length} tags (${shared.join(", ")})`,
        status: "proposed",
        authoritative: false,
      });
    }
  }
  return proposals.sort((a, b) => a.id.localeCompare(b.id));
}
