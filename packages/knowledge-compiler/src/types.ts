// Types for the reusable knowledge compiler.
//
// The compiler is source-agnostic: it accepts normalized documents from any
// source (a website archive, a documentation tree, a repository, a book) and
// produces governed knowledge artifacts. The critical boundary is the frozen
// spine: probabilistic or heuristic steps may PROPOSE, but only deterministic
// validation plus an explicit approval can make a record AUTHORITATIVE.

export interface SourceDocument {
  /** Stable id within the compilation. */
  id: string;
  /** Path or external reference the document came from. */
  path: string;
  title: string;
  published?: string;
  modified?: string;
  tags: string[];
  draft: boolean;
  body: string;
  /** sha256 of the body. */
  contentHash: string;
  bytes: number;
}

export interface Proposal {
  id: string;
  kind: "relation" | "claim";
  subject: string;
  predicate: string;
  object: string;
  /** The evidence the proposal rests on. */
  evidence: string;
  status: "proposed";
  authoritative: false;
}

export interface Relation {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  status: "declared" | "approved";
  provenance: {
    source: string;
    fingerprint: string;
    approvedBy?: string;
    approvedAt?: string;
    approvalReason?: string;
  };
}

export interface Claim {
  id: string;
  statement: string;
  source: string;
  sourceSpan: string;
  category: "relation" | "property" | "absence" | "evaluation";
  assessment: "proposed" | "supported" | "contested" | "superseded" | "unverified";
  verification: "implemented" | "tested" | "demonstrated" | "independently_verified" | "hypothesized";
  supportingEvidence: string[];
  contradictoryEvidence: string[];
  authoritative: boolean;
  provenance: {
    source: string;
    fingerprint: string;
    approvedBy?: string;
    approvedAt?: string;
    approvalReason?: string;
  };
}

export interface CompileOptions {
  documents: SourceDocument[];
  /** Deterministic proposal rules. Default: tag-overlap proposals. */
  propose?: (documents: SourceDocument[]) => Proposal[];
  /** Deterministic validation. Default: structural checks. */
  validate?: (document: SourceDocument) => { ok: boolean; errors: string[] };
  /** Proposal ids that a human has explicitly approved. Everything else stays
   *  non-authoritative, no matter how confident the proposal was. */
  approved?: Set<string>;
}

export interface CompileResult {
  /** Published documents only. Drafts never reach the artifacts. */
  documents: SourceDocument[];
  /** Every proposal, including unapproved ones. */
  proposals: Proposal[];
  /** Only declared and explicitly approved relations. */
  relations: Relation[];
  claims: Claim[];
  /** Documents rejected by deterministic validation. */
  rejected: Array<{ id: string; reasons: string[] }>;
  /** Drafts excluded from the artifacts. */
  excludedDrafts: string[];
}

export class CompilerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompilerError";
  }
}
