// compile.ts — the governed compilation pipeline.
//
//   SOURCE MATERIAL
//     -> normalize
//     -> deterministic validation
//     -> proposals (never authoritative)
//     -> approval gate
//     -> artifacts
//
// The frozen-spine rule: a proposal becomes authoritative only if a human has
// approved its id AND deterministic validation passes. Everything else is
// carried as a proposal with `authoritative: false`, or rejected outright.

import { createHash } from "node:crypto";
import type {
  Claim,
  CompileOptions,
  CompileResult,
  Proposal,
  Relation,
  SourceDocument,
} from "./types.ts";
import { proposeTagOverlap } from "./propose.ts";
import { validateDocument } from "./validate.ts";

const fingerprint = (parts: string[]) =>
  createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 16);

/** A declared relation from the source, with provenance. */
export function declareRelation(
  subject: string,
  predicate: string,
  object: string,
  source: string
): Relation {
  return {
    id: `relation:${predicate}:${subject}->${object}`,
    subject,
    predicate,
    object,
    status: "declared",
    provenance: { source, fingerprint: fingerprint([subject, predicate, object]) },
  };
}

export function compile(options: CompileOptions): CompileResult {
  const propose = options.propose ?? proposeTagOverlap;
  const validate = options.validate ?? validateDocument;
  const approved = options.approved ?? new Set<string>();

  // 1. Validate. A document that fails is rejected, never repaired.
  const rejected: CompileResult["rejected"] = [];
  const valid: SourceDocument[] = [];
  for (const doc of options.documents) {
    const result = validate(doc);
    if (result.ok) valid.push(doc);
    else rejected.push({ id: doc.id, reasons: result.errors });
  }

  // 2. Drafts never reach the artifacts.
  const excludedDrafts = valid.filter((d) => d.draft).map((d) => d.id);
  const documents = valid.filter((d) => !d.draft);

  // 3. Propose. Deterministic and inspectable, but never authoritative.
  const proposals: Proposal[] = propose(documents);

  // 4. Approval gate. Only an explicit approval promotes a proposal.
  const relations: Relation[] = [];
  const claims: Claim[] = [];

  for (const proposal of proposals) {
    const isApproved = approved.has(proposal.id);
    if (isApproved) {
      relations.push({
        id: `relation:${proposal.predicate}:${proposal.subject}->${proposal.object}`,
        subject: proposal.subject,
        predicate: proposal.predicate,
        object: proposal.object,
        status: "approved",
        provenance: { source: proposal.evidence, fingerprint: fingerprint([proposal.id]) },
      });
    }
    // Every proposal is also a claim, with the assessment the evidence supports.
    claims.push({
      id: `claim:${proposal.id}`,
      statement: `${proposal.subject} ${proposal.predicate} ${proposal.object}`,
      source: proposal.evidence,
      sourceSpan: proposal.evidence,
      category: "relation",
      assessment: isApproved ? "supported" : "proposed",
      verification: isApproved ? "demonstrated" : "hypothesized",
      supportingEvidence: [proposal.id],
      contradictoryEvidence: [],
      authoritative: isApproved,
      provenance: { source: proposal.evidence, fingerprint: fingerprint([proposal.id]) },
    });
  }

  // Declared relations are always authoritative: the source stated them.
  // (The site's own taxonomy is the canonical example of a declared relation.)

  return {
    documents,
    proposals,
    relations,
    claims,
    rejected,
    excludedDrafts,
  };
}

/** The frozen-spine assertion: no proposal is authoritative unless approved. */
export function assertGoverned(result: CompileResult): string[] {
  const errors: string[] = [];
  for (const claim of result.claims) {
    if (claim.assessment === "proposed" && claim.authoritative) {
      errors.push(`claim ${claim.id} is proposed but marked authoritative`);
    }
  }
  for (const relation of result.relations) {
    if (relation.status === "approved" && !relation.provenance.source) {
      errors.push(`relation ${relation.id} is approved with no provenance`);
    }
  }
  return errors;
}
