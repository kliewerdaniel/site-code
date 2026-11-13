/**
 * Tests for the reusable knowledge compiler
 * (packages/knowledge-compiler/src).
 *
 * The invariants that matter are the frozen-spine rules: a draft never
 * reaches the artifacts, an invalid document is rejected rather than repaired,
 * and a proposal is never authoritative without an explicit approval.
 *
 * Run: node --test packages/knowledge-compiler/tests/compiler.test.mjs
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  assertGoverned,
  compile,
  declareRelation,
  normalizeDocument,
  proposeTagOverlap,
  sha256Hex,
  validateDocument,
} from "../src/index.ts";

function doc(path, overrides = {}) {
  return normalizeDocument(
    [
      "---",
      `title: ${JSON.stringify(overrides.title ?? "A document")}`,
      `date: ${overrides.date ?? "2026-01-01"}`,
      `tags: [${(overrides.tags ?? ["a", "b"]).join(", ")}]`,
      overrides.draft ? "draft: true" : "",
      "---",
      "",
      overrides.body ?? "Body text.",
    ]
      .filter(Boolean)
      .join("\n"),
    path
  );
}

test("normalizeDocument: parses frontmatter and hashes the body", () => {
  const d = doc("a.md", { title: "Hello: a title", tags: ["x", "y"] });
  assert.equal(d.title, "Hello: a title");
  assert.deepEqual(d.tags, ["x", "y"]);
  assert.equal(d.draft, false);
  assert.equal(d.contentHash, sha256Hex(d.body));
  assert.equal(d.bytes, Buffer.byteLength(d.body, "utf8"));
});

test("normalizeDocument: a draft is marked and later excluded", () => {
  const d = doc("draft.md", { draft: true });
  assert.equal(d.draft, true);
});

test("validateDocument: rejects a document with no title or date", () => {
  const d = doc("bad.md");
  d.title = "";
  const result = validateDocument(d);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /title is empty/);
});

test("validateDocument: rejects a modified date before the published date", () => {
  const d = doc("bad.md", { date: "2026-02-01" });
  d.modified = "2026-01-01";
  const result = validateDocument(d);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /precedes published/);
});

test("validateDocument: catches a tampered body", () => {
  const d = doc("ok.md");
  d.body = "tampered";
  const result = validateDocument(d);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /content hash/);
});

test("compile: drafts are excluded and invalid documents rejected", () => {
  const result = compile({
    documents: [
      doc("ok.md"),
      doc("draft.md", { draft: true }),
      (() => {
        const d = doc("invalid.md");
        d.title = "";
        return d;
      })(),
    ],
  });
  assert.deepEqual(result.documents.map((d) => d.id), ["ok.md"]);
  assert.deepEqual(result.excludedDrafts, ["draft.md"]);
  assert.deepEqual(result.rejected.map((r) => r.id), ["invalid.md"]);
});

test("compile: a proposal is never authoritative without approval", () => {
  const result = compile({
    documents: [doc("a.md", { tags: ["x", "y"] }), doc("b.md", { tags: ["x", "y"] })],
  });
  assert.equal(result.proposals.length, 1);
  assert.equal(result.proposals[0].authoritative, false);
  assert.equal(result.relations.length, 0);
  assert.equal(result.claims.length, 1);
  assert.equal(result.claims[0].authoritative, false);
  assert.equal(result.claims[0].assessment, "proposed");
  assert.deepEqual(assertGoverned(result), []);
});

test("compile: an explicit approval promotes the proposal", () => {
  const proposals = proposeTagOverlap([doc("a.md", { tags: ["x", "y"] }), doc("b.md", { tags: ["x", "y"] })]);
  const result = compile({
    documents: [doc("a.md", { tags: ["x", "y"] }), doc("b.md", { tags: ["x", "y"] })],
    approved: new Set([proposals[0].id]),
  });
  assert.equal(result.relations.length, 1);
  assert.equal(result.relations[0].status, "approved");
  assert.equal(result.claims[0].authoritative, true);
  assert.equal(result.claims[0].assessment, "supported");
  assert.deepEqual(assertGoverned(result), []);
});

test("compile: a declared relation is authoritative with provenance", () => {
  const relation = declareRelation("/projects/p", "implements", "/concepts/c", "taxonomy.ts");
  assert.equal(relation.status, "declared");
  assert.ok(relation.provenance.fingerprint.length > 0);
});

test("compile: deterministic across runs", () => {
  const docs = [doc("a.md", { tags: ["x", "y"] }), doc("b.md", { tags: ["x", "y"] })];
  const a = compile({ documents: docs });
  const b = compile({ documents: docs });
  assert.deepEqual(a, b);
});
