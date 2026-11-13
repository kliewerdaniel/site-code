// relation-vocabulary.ts — the controlled semantic relation vocabulary.
//
// Pure types and constants: no clock, no randomness, no filesystem. The graph
// builder (`relations-core.ts`) and the claim/evidence layer
// (`claim-evidence-core.ts`) both read this file, so the vocabulary cannot
// drift between what is emitted and what is validated.
//
// The rule this file exists to enforce: a relation type is part of the
// vocabulary whether or not this repository currently has data for it. A type
// with no data source is reported in `absent` — never fabricated. A relation
// that is proposed but not declared is carried separately with
// `status: "proposed"` and can never enter the authoritative graph without an
// explicit approval record.

import crypto from "node:crypto";

/** The controlled vocabulary. Extend this list, never an ad-hoc string. */
export const RELATION_VOCABULARY = [
  "implements",
  "extends",
  "depends_on",
  "evaluates",
  "contradicts",
  "supersedes",
  "derived_from",
  "supports",
  "refines",
  "documents",
  "demonstrates",
  "prerequisite_for",
  "chapter_covers",
  "recommends_reading",
] as const;

export type RelationType = (typeof RELATION_VOCABULARY)[number];

export const RELATION_TYPES: RelationType[] = [...RELATION_VOCABULARY];

/** Vocabulary types with no data source in this repository. Reported, not
 *  fabricated. `chapter_covers` is NOT absent: it has a data source
 *  (book-links.ts) and is deliberately empty. */
export const ABSENT_RELATIONS: RelationType[] = [
  "extends",
  "depends_on",
  "evaluates",
  "contradicts",
  "supersedes",
  "derived_from",
  "supports",
  "refines",
  "demonstrates",
];

/** Relation types proposed in earlier roadmaps, retained in `absent` so
 *  existing graph consumers that check for them keep working. They are not
 *  part of the controlled vocabulary above. */
export const LEGACY_ABSENT_RELATIONS = [
  "validates",
  "explains",
  "expands_on",
  "related_product",
];

/** Lifecycle of a relation. `proposed` relations are never authoritative. */
export type RelationStatus = "declared" | "proposed" | "approved" | "rejected";

/** How the relation was established. */
export type VerificationStatus = "verified" | "curated" | "proposed" | "unverified";

export interface RelationProvenance {
  /** The file that declares the relation. */
  source: string;
  /** The module that emits it. */
  generator: string;
  /** Why the relation holds, when the type asserts a claim. */
  reason?: string;
  /** Hash of the relation's own fields: a modification fingerprint. */
  fingerprint: string;
}

export interface RelationEdge {
  /** Stable id: `<type>:<from>-><to>`. Unique; a duplicate is a defect. */
  id: string;
  from: string;
  to: string;
  type: RelationType;
  status: RelationStatus;
  verification: VerificationStatus;
  provenance: RelationProvenance;
  /** Path/section that carries the relation, when there is one. */
  via?: string;
  /** Why the relation holds, for the types that assert a claim. */
  reason?: string;
}

export function sha256Hex(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

/** Deterministic id for a relation edge. */
export function relationId(type: RelationType, from: string, to: string): string {
  return `${type}:${from}->${to}`;
}

/** Modification fingerprint: changes when any declared field changes. */
export function relationFingerprint(edge: {
  type: RelationType;
  from: string;
  to: string;
  via?: string;
  reason?: string;
}): string {
  return sha256Hex(
    JSON.stringify([edge.type, edge.from, edge.to, edge.via ?? "", edge.reason ?? ""])
  ).slice(0, 16);
}

/** Build a fully-provenanced edge. `source` names the declaring file. */
export function makeEdge(
  type: RelationType,
  from: string,
  to: string,
  opts: {
    source: string;
    generator?: string;
    via?: string;
    reason?: string;
    status?: RelationStatus;
    verification?: VerificationStatus;
  }
): RelationEdge {
  const status = opts.status ?? "declared";
  const verification = opts.verification ?? (status === "proposed" ? "proposed" : "verified");
  return {
    id: relationId(type, from, to),
    from,
    to,
    type,
    status,
    verification,
    provenance: {
      source: opts.source,
      generator: opts.generator ?? "src/lib/relations-core.ts",
      ...(opts.reason ? { reason: opts.reason } : {}),
      fingerprint: relationFingerprint({
        type,
        from,
        to,
        ...(opts.via ? { via: opts.via } : {}),
        ...(opts.reason ? { reason: opts.reason } : {}),
      }),
    },
    ...(opts.via ? { via: opts.via } : {}),
    ...(opts.reason ? { reason: opts.reason } : {}),
  };
}
