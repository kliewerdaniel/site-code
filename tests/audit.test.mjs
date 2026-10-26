/**
 * Tests for the deterministic site auditor (scripts/audit-site.mjs).
 *
 * The auditor's job is to turn a one-off review into something repeatable:
 * classify findings, categorise canonical mismatches, and diff a report against
 * a baseline. These lock the classification and the diff, because a mis-binned
 * canonical or a diff that hides a new defect would silently undo the point.
 *
 * Run: node --test tests/audit.test.mjs   (or `npm test`)
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { classifyCanonical, diff, relationGraph } from "../scripts/audit-site.mjs";

// ---- canonical classification --------------------------------------------

test("classifyCanonical: a different domain is cross-domain", () => {
  assert.equal(
    classifyCanonical("https://kliewerdaniel.com/blog/2025-10-25-building-your-own-uncensored-ai-overlord"),
    "cross-domain"
  );
});

test("classifyCanonical: the apex host with the same path is apex-vs-www", () => {
  assert.equal(
    classifyCanonical("https://danielkliewer.com/blog/2025-10-21-learn-programming-computer-science-youtube-roadmap"),
    "apex-vs-www"
  );
});

test("classifyCanonical: a /blog/ path with no date prefix is a dead short slug", () => {
  assert.equal(
    classifyCanonical("/blog/sovereign-agent-stack-a-local-first-compile-time-ai-agent-framework"),
    "dead-short-slug"
  );
  assert.equal(classifyCanonical("/blog/rust-native-creative-suite-installation"), "dead-short-slug");
});

test("classifyCanonical: a dated self path is NOT dead — it is the live slug", () => {
  // A /blog/ URL whose slug starts with YYYY-MM-DD- still exists, so it is only
  // a mismatch of form, not a dead reference.
  assert.equal(
    classifyCanonical("/blog/2026-09-04-sovereign-agent-stack-a-local-first-compile-time-ai-agent-framework"),
    "other"
  );
});

// ---- baseline diff -------------------------------------------------------

const base = {
  fatal: 0,
  defects: 2,
  advisory: 5,
  defectList: ["a.md: x", "b.md: y"],
  canonical: { byCategory: { "apex-vs-www": 1, "cross-domain": 1 } },
};

test("diff: an identical report produces no changes", () => {
  const { regressions, improvements } = diff(base, structuredClone(base));
  assert.deepEqual(regressions, []);
  assert.deepEqual(improvements, []);
});

test("diff: a new defect is a REGRESSION, a resolved one is an IMPROVEMENT", () => {
  const next = structuredClone(base);
  next.defectList = ["a.md: x", "c.md: z"];
  const { regressions, improvements } = diff(base, next);
  assert.ok(
    regressions.some((c) => c.startsWith("NEW defect") && c.includes("c.md")),
    regressions.join("\n")
  );
  assert.ok(
    improvements.some((c) => c.startsWith("FIXED") && c.includes("b.md")),
    improvements.join("\n")
  );
});

test("diff: fixing a defect alone must NOT be reported as a regression", () => {
  // The previous behaviour failed the gate on any change, which meant a
  // remediation looked like a regression. That teaches people to ignore the gate.
  const next = structuredClone(base);
  next.defectList = ["a.md: x"]; // b.md fixed
  next.defects = 1;
  const { regressions } = diff(base, next);
  assert.deepEqual(regressions, []);
});

test("diff: a rising defect count is a regression even when the list is unchanged", () => {
  const next = structuredClone(base);
  next.defects = 3;
  assert.ok(diff(base, next).regressions.some((c) => c.startsWith("defects: 2 -> 3")));
});

test("diff: a falling advisory count is an improvement, not a regression", () => {
  const next = structuredClone(base);
  next.advisory = 3;
  const { regressions, improvements } = diff(base, next);
  assert.deepEqual(regressions, []);
  assert.ok(improvements.some((c) => c.startsWith("advisory: 5 -> 3")));
});

test("diff: a rising canonical category is a regression, a falling one an improvement", () => {
  const up = structuredClone(base);
  up.canonical.byCategory = { "apex-vs-www": 1, "cross-domain": 1, "dead-short-slug": 4 };
  assert.ok(
    diff(base, up).regressions.some((c) => c.includes("dead-short-slug: 0 -> 4")),
    diff(base, up).regressions.join("\n")
  );

  const down = structuredClone(base);
  down.canonical.byCategory = { "apex-vs-www": 1 };
  assert.ok(diff(base, down).improvements.some((c) => c.includes("cross-domain: 1 -> 0")));
  assert.deepEqual(diff(base, down).regressions, []);
});


// ---- typed relation graph -----------------------------------------------

test("relationGraph: derives implements, documents and prerequisite_for", () => {
  const g = relationGraph();
  // 12 projects declare concepts, 16 verified post->project links exist, and the
  // three learning paths chain their steps.
  assert.ok(g.counts.implements > 0, "expected project->concept edges");
  assert.ok(g.counts.documents > 0, "expected post->project edges");
  assert.ok(g.counts.prerequisite_for > 0, "expected path step edges");
});

test("relationGraph: every edge resolves — no dangling references", () => {
  const g = relationGraph();
  const src = fs.readFileSync("src/lib/taxonomy.ts", "utf8");
  const conceptsStart = src.indexOf("export const CONCEPTS");
  const pathsStart = src.indexOf("export const PATHS");
  const concepts = new Set(
    [...src.slice(conceptsStart, pathsStart).matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1])
  );
  const projects = new Set(
    [...src.slice(0, conceptsStart).matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1])
  );
  const posts = new Set(
    fs
      .readdirSync("content/research")
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
  );

  for (const e of g.edges.implements) {
    assert.ok(projects.has(e.from.replace("/projects/", "")), `unknown project ${e.from}`);
    assert.ok(concepts.has(e.to.replace("/concepts/", "")), `unknown concept ${e.to}`);
  }
  for (const e of g.edges.documents) {
    assert.ok(posts.has(e.from.replace("/blog/", "")), `unknown post ${e.from}`);
    assert.ok(projects.has(e.to.replace("/projects/", "")), `unknown project ${e.to}`);
  }
  for (const e of g.edges.prerequisite_for) {
    const known = e.from.startsWith("20") ? posts.has(e.from) : concepts.has(e.from);
    assert.ok(known, `unknown prerequisite ref ${e.from}`);
  }
});

test("relationGraph: relations with no data source are declared absent, not invented", () => {
  const g = relationGraph();
  // `extends` and `validates` were proposed in the roadmap but the repository
  // carries no data for them. They must be reported as absent rather than
  // fabricated — the codebase rule is that relationships are never invented.
  assert.ok(g.absent.includes("extends"));
  assert.ok(g.absent.includes("validates"));
});

