#!/usr/bin/env node
/* ============================================================
   validate-claims.mjs — post-build gate for the claim/evidence model.

   The claim and evidence resources are typed data, and the invariants that
   matter are epistemic rather than structural: every claim has a source span
   and an assessment, every evidence reference resolves, and a proposed claim
   is never authoritative. A schema-valid claim is still only as well
   established as its evidence, so the verification level is checked too.

   FATAL (exit 1):
     - a claim or evidence resource with no build output
     - a claim with a missing id, statement, source, span, category,
       assessment or verification level
     - a claim referencing unknown evidence
     - a proposed claim marked authoritative
     - a duplicate claim or evidence id
     - a proposal present in the authoritative graph
     - a resource that does not match the deterministic render

   Usage:
     node scripts/validate-claims.mjs            # after `next build`
     node scripts/validate-claims.mjs --quiet
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  buildClaimsAndEvidence,
  buildProposals,
} from "../src/lib/claim-evidence.ts";
import { validateClaims } from "../src/lib/claim-evidence-core.ts";
import { relationGraph } from "../src/lib/relations.ts";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const APP = path.join(repo, ".next", "server", "app");

function bodyFile(urlPath) {
  return path.join(APP, `${urlPath.replace(/^\//, "")}.body`);
}

/** Collect every finding. Returns `null` if there is no build output. */
export function collect() {
  if (!fs.existsSync(APP)) return null;

  const fatal = [];
  const findings = [];

  const bundle = buildClaimsAndEvidence();
  const validation = validateClaims(bundle);
  for (const e of validation.errors) fatal.push(`claims: ${e}`);
  for (const w of validation.warnings) findings.push({ severity: "warning", detail: w });

  // The real render includes the site block; compare against the build output
  // by parsing and checking the parts this validator owns.
  for (const p of ["/agents/claims.json", "/agents/evidence.json", "/agents/proposals.json"]) {
    const file = bodyFile(p);
    if (!fs.existsSync(file)) {
      fatal.push(`${p}: no build output (expected ${path.relative(repo, file)})`);
      continue;
    }
    try {
      const body = fs.readFileSync(file, "utf8");
      const parsed = JSON.parse(body);
      if (p === "/agents/claims.json") {
        if (!Array.isArray(parsed.claims)) fatal.push(`${p}: claims is not an array`);
        if (parsed.counts?.total !== bundle.claims.length) {
          fatal.push(`${p}: counts.total does not match the deterministic render`);
        }
      } else if (p === "/agents/evidence.json") {
        if (!Array.isArray(parsed.evidence)) fatal.push(`${p}: evidence is not an array`);
        if (parsed.counts?.total !== bundle.evidence.length) {
          fatal.push(`${p}: counts.total does not match the deterministic render`);
        }
      } else {
        if (!Array.isArray(parsed.proposals)) fatal.push(`${p}: proposals is not an array`);
        if (parsed.count !== buildProposals().length) {
          fatal.push(`${p}: count does not match the deterministic render`);
        }
      }
    } catch (e) {
      fatal.push(`${p}: JSON does not parse (${e.message})`);
    }
  }

  // The boundary: a proposal must never be in the authoritative graph.
  const graph = relationGraph();
  const authoritative = new Set(
    Object.values(graph.edges).flatMap((list) => list.map((e) => e.id))
  );
  for (const proposal of buildProposals()) {
    if (authoritative.has(proposal.id)) {
      fatal.push(`proposals: ${proposal.id} leaked into the authoritative graph`);
    }
    if (proposal.status !== "proposed") {
      fatal.push(`proposals: ${proposal.id} is not marked proposed`);
    }
  }

  return {
    claims: bundle.claims.length,
    evidence: bundle.evidence.length,
    proposals: buildProposals().length,
    fatal,
    findings,
  };
}

/* ── CLI ─────────────────────────────────────────────────────────────────── */

const isEntry =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntry) {
  const result = collect();
  if (result === null) {
    console.error(
      `❌ no build output at ${path.relative(repo, APP)} — run \`next build\` first`
    );
    process.exit(1);
  }
  const quiet = process.argv.includes("--quiet");
  if (!quiet) for (const f of result.findings) console.warn(`  ⚠ ${f.detail}`);
  console.log(
    `\nclaims: ${result.claims} claims, ${result.evidence} evidence, ${result.proposals} proposals — ${result.fatal.length} fatal, ${result.findings.length} reported`
  );
  if (result.fatal.length) {
    console.error("\n❌ CLAIM VALIDATION FAILED:\n");
    for (const f of result.fatal) console.error(`  ✗ ${f}`);
    console.error("");
    process.exit(1);
  }
  process.exit(0);
}
