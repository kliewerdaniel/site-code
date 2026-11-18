#!/usr/bin/env node
/* Compile the sample corpus with the reusable compiler.
 *
 *   node examples/sample-corpus/compile.mjs
 *
 * The manifest is the only input. Relative paths in it are resolved against
 * the repository root, so the manifest stays portable.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileFromManifest } from "../../packages/knowledge-compiler/src/index.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..");

const manifest = JSON.parse(fs.readFileSync(path.join(here, "manifest.json"), "utf8"));
for (const source of manifest.sources) {
  if (source.kind === "markdown") source.root = path.resolve(repo, source.root);
  else source.file = path.resolve(repo, source.file);
}
manifest.output.directory = path.resolve(repo, manifest.output.directory);

const { bundle, files, result, approvals } = compileFromManifest(manifest, { write: true });

console.log(`documents:   ${bundle.counts.documents}`);
console.log(`rejected:    ${bundle.counts.rejected} (${result.rejected.map((r) => r.id).join(", ")})`);
console.log(`drafts:      ${bundle.counts.excludedDrafts} (${result.excludedDrafts.join(", ")})`);
console.log(`proposals:   ${bundle.counts.proposals}`);
console.log(`relations:   ${bundle.counts.relations}`);
console.log(`claims:      ${bundle.counts.claims}`);
console.log(`evidence:    ${bundle.counts.evidence}`);
console.log(`approvals:   ${approvals.records.length}`);
console.log(`artifacts:   ${files.length} files -> ${path.relative(repo, manifest.output.directory)}`);

for (const relation of result.relations) {
  console.log(`  approved:  ${relation.id} [${relation.provenance.approvedBy}, ${relation.provenance.approvedAt}]`);
}
for (const claim of result.claims.filter((c) => !c.authoritative)) {
  console.log(`  proposed:  ${claim.id}`);
}
