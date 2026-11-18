/**
 * Tests for manifest-driven compilation (packages/knowledge-compiler/src).
 *
 * Uses the sample corpus under examples/sample-corpus, which is a second,
 * independent archive — the point is that the compiler is not tied to the
 * website's own content directory.
 *
 * Run: node --test packages/knowledge-compiler/tests/manifest.test.mjs
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

import {
  approvalStore,
  compileFromManifest,
  CompilerError,
  readJsonSource,
  readMarkdownSource,
  slugify,
  validateManifest,
} from "../src/index.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..", "..");
const sample = path.join(repo, "examples", "sample-corpus");

function loadManifest() {
  const manifest = JSON.parse(fs.readFileSync(path.join(sample, "manifest.json"), "utf8"));
  for (const source of manifest.sources) {
    if (source.kind === "markdown") source.root = path.resolve(repo, source.root);
    else source.file = path.resolve(repo, source.file);
  }
  manifest.output.directory = path.resolve(repo, manifest.output.directory);
  return manifest;
}

test("the sample corpus compiles: drafts excluded, broken rejected", () => {
  const { bundle, result } = compileFromManifest(loadManifest());
  assert.equal(bundle.counts.documents, 6);
  assert.equal(bundle.counts.rejected, 1);
  assert.equal(result.rejected[0].id, "broken.md");
  assert.equal(bundle.counts.excludedDrafts, 1);
  assert.ok(result.excludedDrafts.includes("draft-post.md"));
  assert.ok(!bundle.documents.some((d) => d.id === "draft-post.md"));
});

test("the approval gate: one relation approved, one proposal still proposed", () => {
  const { bundle, result } = compileFromManifest(loadManifest());
  assert.equal(bundle.proposals.length, 2);
  assert.equal(bundle.relations.length, 1);
  assert.equal(bundle.claims.length, 2);

  const approved = bundle.relations[0];
  assert.equal(approved.status, "approved");
  assert.equal(approved.provenance.approvedBy, "Daniel Kliewer");
  assert.equal(approved.provenance.approvedAt, "2026-11-13T00:00:00.000Z");
  assert.ok(approved.provenance.approvalReason);

  const proposedClaim = bundle.claims.find((c) => !c.authoritative);
  assert.equal(proposedClaim.assessment, "proposed");
  assert.equal(proposedClaim.verification, "hypothesized");
  assert.ok(!bundle.relations.some((r) => r.id.includes("knowledge-compilation")));

  const approvedClaim = bundle.claims.find((c) => c.authoritative);
  assert.equal(approvedClaim.provenance.approvedBy, "Daniel Kliewer");
});

test("compilation is deterministic: identical artifacts across runs", () => {
  const a = compileFromManifest(loadManifest());
  const b = compileFromManifest(loadManifest());
  const serial = (r) => r.files.map((f) => `${f.path}:${f.body}`).join("\n");
  assert.equal(serial(a), serial(b));
  assert.equal(JSON.stringify(a.bundle), JSON.stringify(b.bundle));
});

test("an approval against different source material is a hard error", () => {
  const manifest = loadManifest();
  manifest.approvals[0].sourceFingerprint = "0".repeat(64);
  assert.throws(() => compileFromManifest(manifest), /sourceFingerprint mismatch/);
});

test("an approval naming an unknown proposal is a hard error", () => {
  const manifest = loadManifest();
  manifest.approvals[0].proposalId = "proposal:related_to:nope->nope";
  assert.throws(() => compileFromManifest(manifest), /does not match any proposal/);
});

test("an invalid approval record is rejected", () => {
  const manifest = loadManifest();
  manifest.approvals[0].approvedBy = "";
  assert.throws(() => compileFromManifest(manifest), /invalid approvals/);
});

test("emitted mirrors carry a verifying content hash", () => {
  const { bundle, files } = compileFromManifest(loadManifest());
  const mirrors = files.filter((f) => f.path.startsWith("mirrors/"));
  assert.equal(mirrors.length, bundle.counts.documents);

  for (const mirror of mirrors) {
    assert.ok(mirror.body.startsWith("---\n"));
    const end = mirror.body.indexOf("\n---\n", 4);
    const frontmatter = mirror.body.slice(4, end);
    const body = mirror.body.slice(end + 5).replace(/^\n/, "");
    const hash = /^content_hash: sha256:([0-9a-f]+)$/m.exec(frontmatter)?.[1];
    assert.ok(hash, `mirror ${mirror.path} has no content hash`);
    const actual = createHash("sha256").update(body, "utf8").digest("hex");
    assert.equal(hash, actual);
  }
});

test("the resource index records every artifact with a sha256", () => {
  const { files } = compileFromManifest(loadManifest());
  const index = files.find((f) => f.path === "index.json");
  assert.ok(index);
  const parsed = JSON.parse(index.body);
  assert.equal(parsed.schema, "knowledge-corpus/1");
  // the index describes every artifact except itself
  assert.equal(parsed.resources.length, files.length - 1);
  for (const resource of parsed.resources) {
    assert.match(resource.sha256, /^[0-9a-f]{64}$/);
    assert.ok(resource.bytes > 0);
  }
});

test("approvalStore validates records and reports problems", () => {
  const store = approvalStore([
    {
      proposalId: "p1",
      approvedBy: "A human",
      reason: "Because",
      at: "2026-11-13T00:00:00.000Z",
      sourceFingerprint: "abc",
    },
    { proposalId: "p2", approvedBy: "", reason: "x", at: "nope", sourceFingerprint: "" },
  ]);
  assert.equal(store.records.length, 1);
  assert.equal(store.errors.length, 1);
  assert.equal(store.has("p1"), true);
  assert.equal(store.has("p2"), false);
});

test("adapters: markdown exclusion and JSON loading", () => {
  const docs = readMarkdownSource({
    kind: "markdown",
    root: path.join(sample, "docs"),
    exclude: ["broken", "draft-"],
  });
  assert.equal(docs.length, 4);
  assert.ok(!docs.some((d) => d.id.includes("broken")));

  const json = readJsonSource({ kind: "json", file: path.join(sample, "knowledge.json") });
  assert.equal(json.length, 2);
  assert.equal(json[0].id, "json:architecture");
  assert.equal(json[0].tags.length, 2);
});

test("validateManifest reports structural problems", () => {
  assert.deepEqual(validateManifest(loadManifest()), []);
  assert.ok(validateManifest({ ...loadManifest(), schema: "nope" }).length > 0);
  assert.ok(validateManifest({ ...loadManifest(), sources: [] }).length > 0);
});

test("slugify is stable and safe", () => {
  assert.equal(slugify("docs/Governed Execution!.md"), "docs-governed-execution-md");
  assert.equal(slugify("!!!"), "document");
});

test("CompilerError is a typed error", () => {
  assert.ok(new CompilerError("x") instanceof Error);
});
