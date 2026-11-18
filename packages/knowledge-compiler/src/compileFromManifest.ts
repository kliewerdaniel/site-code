// compileFromManifest.ts — the manifest-driven compilation entry point.
//
//   manifest -> validate -> load sources -> normalize -> validate documents
//     -> propose -> approval gate -> governance assertion -> artifacts
//
// The approval gate is the frozen spine. An approval record must name a real
// proposal, and its source fingerprint must match the proposal's evidence. A
// mismatch is a hard error, not a warning: it means the approval was made
// against different source material.

import { approvalStore, type ApprovalStore } from "./approval.ts";
import { loadSources } from "./adapters.ts";
import { validateManifest, type SourceManifest } from "./manifest.ts";
import { compile, assertGoverned } from "./compile.ts";
import { emitArtifacts, writeArtifacts, type CorpusBundle, type ArtifactFile } from "./emit.ts";
import { sha256Hex } from "./normalize.ts";
import { CompilerError, type CompileResult } from "./types.ts";

export interface ManifestCompileResult {
  bundle: CorpusBundle;
  files: ArtifactFile[];
  result: CompileResult;
  approvals: ApprovalStore;
}

export function compileFromManifest(
  manifest: SourceManifest,
  opts: { write?: boolean } = {}
): ManifestCompileResult {
  const manifestErrors = validateManifest(manifest);
  if (manifestErrors.length > 0) {
    throw new CompilerError(`invalid manifest: ${manifestErrors.join("; ")}`);
  }

  const approvals = approvalStore(manifest.approvals ?? []);
  if (approvals.errors.length > 0) {
    throw new CompilerError(`invalid approvals: ${approvals.errors.join("; ")}`);
  }

  const documents = loadSources(manifest.sources);
  const result = compile({
    documents,
    approved: new Set(approvals.records.map((r) => r.proposalId)),
  });

  // Every approval must name a real proposal and rest on the same source
  // material the proposal rests on.
  for (const record of approvals.records) {
    const proposal = result.proposals.find((p) => p.id === record.proposalId);
    if (!proposal) {
      throw new CompilerError(
        `approval ${record.proposalId} does not match any proposal`
      );
    }
    const expected = sha256Hex(proposal.evidence);
    if (record.sourceFingerprint !== expected) {
      throw new CompilerError(
        `approval ${record.proposalId} sourceFingerprint mismatch (got ${record.sourceFingerprint}, want ${expected})`
      );
    }
  }

  // Attach the approval identity to the authoritative records.
  const byProposal = new Map(approvals.records.map((r) => [r.proposalId, r]));
  for (const relation of result.relations) {
    if (relation.status !== "approved") continue;
    const proposalId = `proposal:${relation.id.slice("relation:".length)}`;
    const approval = byProposal.get(proposalId);
    if (approval) {
      relation.provenance.approvedBy = approval.approvedBy;
      relation.provenance.approvedAt = approval.at;
      relation.provenance.approvalReason = approval.reason;
    }
  }
  for (const claim of result.claims) {
    if (!claim.authoritative) continue;
    const approval = byProposal.get(claim.id.slice("claim:".length));
    if (approval) {
      claim.provenance.approvedBy = approval.approvedBy;
      claim.provenance.approvedAt = approval.at;
      claim.provenance.approvalReason = approval.reason;
    }
  }

  const governanceErrors = assertGoverned(result);
  if (governanceErrors.length > 0) {
    throw new CompilerError(`governance violation: ${governanceErrors.join("; ")}`);
  }

  const { bundle, files } = emitArtifacts(result, {
    baseUrl: manifest.output.baseUrl,
    siteName: manifest.site.name,
  });

  if (opts.write) {
    writeArtifacts(files, manifest.output.directory);
  }

  return { bundle, files, result, approvals };
}
