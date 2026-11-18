// approval.ts — explicit approval records.
//
// The frozen-spine rule needs more than a bare set of ids. An approval is an
// act by an identified human, at a time, for a reason, against a specific
// source fingerprint. This module records that and validates the record.
//
// An approval NEVER originates here. The compiler consumes records produced by
// a human workflow; it cannot mint them.

export interface ApprovalRecord {
  /** The proposal id being approved. */
  proposalId: string;
  /** Who approved it. A name or an identity, never "system". */
  approvedBy: string;
  /** Why it was approved. */
  reason: string;
  /** ISO timestamp of the approval. */
  at: string;
  /** Fingerprint of the source material the proposal rests on. */
  sourceFingerprint: string;
}

export interface ApprovalStore {
  records: ApprovalRecord[];
  has(proposalId: string): boolean;
  /** The record that approves a proposal, or undefined. */
  get(proposalId: string): ApprovalRecord | undefined;
  errors: string[];
}

/** Build and validate an approval store. Invalid records are reported, not
 *  silently dropped, and an invalid record never approves anything. */
export function approvalStore(records: ApprovalRecord[] = []): ApprovalStore {
  const errors: string[] = [];
  const valid: ApprovalRecord[] = [];

  for (const r of records) {
    const problems: string[] = [];
    if (!r || typeof r !== "object") {
      errors.push("approval: record is not an object");
      continue;
    }
    if (!r.proposalId) problems.push("missing proposalId");
    if (!r.approvedBy || !r.approvedBy.trim()) problems.push("missing approvedBy");
    if (!r.reason || !r.reason.trim()) problems.push("missing reason");
    if (!r.at || Number.isNaN(Date.parse(r.at))) problems.push(`bad at (${r.at})`);
    if (!r.sourceFingerprint) problems.push("missing sourceFingerprint");
    if (problems.length > 0) {
      errors.push(`approval ${r.proposalId ?? "<unknown>"}: ${problems.join(", ")}`);
      continue;
    }
    valid.push(r);
  }

  const seen = new Set<string>();
  for (const r of valid) {
    if (seen.has(r.proposalId)) {
      errors.push(`approval ${r.proposalId}: duplicate record`);
      continue;
    }
    seen.add(r.proposalId);
  }

  const byId = new Map(valid.map((r) => [r.proposalId, r]));
  return {
    records: valid,
    errors,
    has: (id) => byId.has(id),
    get: (id) => byId.get(id),
  };
}
