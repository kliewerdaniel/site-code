// claim-evidence-core.ts — typed claim, evidence and assessment model.
//
// Pure types and functions: no clock, no randomness, no filesystem. The bound
// layer (`claim-evidence.ts`) seeds the model from the authoritative relation
// graph; `/agents/claims.json` and `/agents/evidence.json` are its output.
//
// The model makes the epistemic status of every claim explicit. Schema
// validity is never confused with factual correctness: a claim that parses and
// validates is still only as well established as its evidence, and the
// verification level says which proposition the evidence actually establishes.

import { sha256Hex, type RelationEdge } from "./relation-vocabulary.ts";

/* ── Controlled vocabularies ─────────────────────────────────────────────── */

export const ASSESSMENTS = [
  "proposed",
  "supported",
  "contested",
  "superseded",
  "unverified",
] as const;
export type Assessment = (typeof ASSESSMENTS)[number];

/** What the evidence actually establishes. Deliberately distinct from the
 *  assessment: a claim can be `supported` by evidence that only `demonstrates`
 *  it, and no claim here is `independently_verified` unless an independent
 *  party has checked it. */
export const VERIFICATION_LEVELS = [
  "implemented",
  "tested",
  "demonstrated",
  "independently_verified",
  "hypothesized",
] as const;
export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];

export const EVIDENCE_TYPES = [
  "source_span",
  "repository",
  "external_reference",
  "measurement",
  "curation",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const CLAIM_CATEGORIES = ["relation", "property", "absence", "evaluation"] as const;
export type ClaimCategory = (typeof CLAIM_CATEGORIES)[number];

/* ── Schema ──────────────────────────────────────────────────────────────── */

export interface EvidenceVerification {
  status: "verified" | "unverified";
  /** How the evidence was established: "curated", "computed", "measured". */
  method: string;
  verifiedBy?: string;
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  /** Source document path, or an external reference. */
  source: string;
  /** Exact source span, or the external reference. */
  span?: string;
  /** Hash of the evidence content, where it is inline. */
  contentHash?: string;
  verification: EvidenceVerification;
}

export interface ClaimProvenance {
  source: string;
  generator: string;
  /** Modification fingerprint of the underlying declaration. */
  fingerprint: string;
}

export interface Claim {
  id: string;
  statement: string;
  source: string;
  /** Exact source span in the source document. */
  sourceSpan: string;
  category: ClaimCategory;
  assessment: Assessment;
  verification: VerificationLevel;
  supportingEvidence: string[];
  contradictoryEvidence: string[];
  /** Related relation ids. */
  relationships: string[];
  /** False for a proposed claim: it is never authoritative. */
  authoritative: boolean;
  provenance: ClaimProvenance;
}

export interface ClaimEvidenceBundle {
  claims: Claim[];
  evidence: Evidence[];
}

/* ── Builders ────────────────────────────────────────────────────────────── */

const STATEMENTS: Record<string, (e: RelationEdge) => string> = {
  implements: (e) => `${e.from} implements ${e.to}`,
  documents: (e) => `${e.from} is the write-up for ${e.to}`,
  prerequisite_for: (e) => `${e.from} is a prerequisite for ${e.to}`,
  chapter_covers: (e) => `${e.from} covers ${e.to}`,
  recommends_reading: (e) => `${e.from} is further reading for ${e.to}`,
};

export function statementFor(edge: RelationEdge): string {
  return (STATEMENTS[edge.type] ?? ((e) => `${e.from} ${e.type} ${e.to}`))(edge);
}

export function evidenceFromEdge(edge: RelationEdge): Evidence {
  const content = edge.reason ?? edge.id;
  return {
    id: `ev:${edge.id}`,
    type: "source_span",
    source: edge.provenance.source,
    span: edge.reason ? `${edge.id}: ${edge.reason}` : edge.id,
    contentHash: sha256Hex(content).slice(0, 16),
    verification: {
      status: edge.verification === "proposed" ? "unverified" : "verified",
      method: edge.verification,
    },
  };
}

export function claimFromEdge(edge: RelationEdge): Claim {
  const proposed = edge.status === "proposed";
  return {
    id: `claim:${edge.id}`,
    statement: statementFor(edge),
    source: edge.provenance.source,
    sourceSpan: edge.reason ?? edge.id,
    category: "relation",
    assessment: proposed ? "proposed" : "supported",
    verification: proposed ? "hypothesized" : "demonstrated",
    supportingEvidence: [`ev:${edge.id}`],
    contradictoryEvidence: [],
    relationships: [edge.id],
    authoritative: !proposed,
    provenance: {
      source: edge.provenance.source,
      generator: "src/lib/claim-evidence-core.ts",
      fingerprint: edge.provenance.fingerprint,
    },
  };
}

/** A claim about the absence of evidence — the `chapter_covers` rule. */
export function absenceClaim(): Claim {
  const statement =
    "No chapter_covers relation can be verified between the manuscript and the article archive.";
  return {
    id: "claim:chapter-covers-absence",
    statement,
    source: "src/lib/book-links.ts",
    sourceSpan: "chapter_covers is empty by evidence",
    category: "absence",
    assessment: "supported",
    verification: "demonstrated",
    supportingEvidence: ["ev:chapter-covers-absence"],
    contradictoryEvidence: [],
    relationships: [],
    authoritative: true,
    provenance: {
      source: "src/lib/book-links.ts",
      generator: "src/lib/claim-evidence-core.ts",
      fingerprint: sha256Hex(statement).slice(0, 16),
    },
  };
}

export function absenceEvidence(): Evidence {
  const span =
    "chapter_covers has no verifiable entries; verbatim phrase search returns only code boilerplate";
  return {
    id: "ev:chapter-covers-absence",
    type: "curation",
    source: "src/lib/book-links.ts",
    span,
    contentHash: sha256Hex(span).slice(0, 16),
    verification: { status: "verified", method: "curated" },
  };
}

/* ── Validation ──────────────────────────────────────────────────────────── */

export interface ClaimValidation {
  errors: string[];
  warnings: string[];
}

export function validateClaims(bundle: ClaimEvidenceBundle): ClaimValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { claims, evidence } = bundle;

  const evidenceIds = new Set(evidence.map((e) => e.id));
  const claimIds = new Set<string>();

  for (const e of evidence) {
    if (!e.id) errors.push("evidence: missing id");
    if (!EVIDENCE_TYPES.includes(e.type)) errors.push(`evidence ${e.id}: bad type ${e.type}`);
    if (!e.source) errors.push(`evidence ${e.id}: missing source`);
    if (!e.verification?.method) errors.push(`evidence ${e.id}: missing verification method`);
  }

  for (const c of claims) {
    if (!c.id) errors.push("claim: missing id");
    if (claimIds.has(c.id)) errors.push(`claim: duplicate id ${c.id}`);
    claimIds.add(c.id);
    if (!c.statement) errors.push(`claim ${c.id}: empty statement`);
    if (!c.source) errors.push(`claim ${c.id}: missing source`);
    if (!c.sourceSpan) errors.push(`claim ${c.id}: missing source span`);
    if (!CLAIM_CATEGORIES.includes(c.category)) {
      errors.push(`claim ${c.id}: bad category ${c.category}`);
    }
    if (!ASSESSMENTS.includes(c.assessment)) {
      errors.push(`claim ${c.id}: bad assessment ${c.assessment}`);
    }
    if (!VERIFICATION_LEVELS.includes(c.verification)) {
      errors.push(`claim ${c.id}: bad verification level ${c.verification}`);
    }
    for (const id of [...c.supportingEvidence, ...c.contradictoryEvidence]) {
      if (!evidenceIds.has(id)) errors.push(`claim ${c.id}: unknown evidence ${id}`);
    }
    // A proposed claim must never be authoritative.
    if (c.assessment === "proposed" && c.authoritative) {
      errors.push(`claim ${c.id}: a proposed claim cannot be authoritative`);
    }
    if (c.assessment === "supported" && !c.authoritative) {
      warnings.push(`claim ${c.id}: supported but not authoritative`);
    }
  }

  return { errors, warnings };
}
