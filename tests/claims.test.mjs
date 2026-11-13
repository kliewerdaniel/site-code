/**
 * Tests for the relation vocabulary and the claim/evidence model
 * (src/lib/relation-vocabulary.ts, src/lib/relations-core.ts,
 * src/lib/claim-evidence-core.ts, src/lib/claim-evidence.ts).
 *
 * The invariants that matter are the epistemic ones: every edge has a stable
 * id and provenance, a proposed claim is never authoritative, every evidence
 * reference resolves, and a proposal never enters the authoritative graph.
 *
 * Run: node --test tests/claims.test.mjs   (or `npm test`)
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  ABSENT_RELATIONS,
  RELATION_TYPES,
  RELATION_VOCABULARY,
  makeEdge,
  relationFingerprint,
  relationId,
} from "../src/lib/relation-vocabulary.ts";
import { buildRelationGraph } from "../src/lib/relations-core.ts";
import {
  ASSESSMENTS,
  CLAIM_CATEGORIES,
  EVIDENCE_TYPES,
  VERIFICATION_LEVELS,
  absenceClaim,
  claimFromEdge,
  evidenceFromEdge,
  validateClaims,
} from "../src/lib/claim-evidence-core.ts";
import {
  PROPOSAL_LIMIT,
  buildClaimsAndEvidence,
  buildProposals,
} from "../src/lib/claim-evidence.ts";
import { relationGraph } from "../src/lib/relations.ts";

/* ── vocabulary ──────────────────────────────────────────────────────────── */

test("vocabulary: every type is unique and the absent list is declared", () => {
  assert.equal(new Set(RELATION_VOCABULARY).size, RELATION_VOCABULARY.length);
  assert.equal(RELATION_TYPES.length, RELATION_VOCABULARY.length);
  for (const t of ABSENT_RELATIONS) {
    assert.ok(RELATION_VOCABULARY.includes(t), `${t} is absent but not in the vocabulary`);
  }
});

test("buildRelationGraph: every edge carries an id, status, verification and provenance", () => {
  const g = buildRelationGraph({
    projects: [{ slug: "p", concepts: ["c"], articles: ["2026-01-01-a"] }],
    concepts: [{ slug: "c" }],
    paths: [{ slug: "path", steps: [{ kind: "article", ref: "2026-01-01-a" }] }],
    bookLinks: [
      {
        article: "2026-01-01-a",
        chapter: 1,
        relation: "recommends_reading",
        reason: "Chapter 1 §1.1.",
      },
    ],
  });
  const all = RELATION_TYPES.flatMap((t) => g.edges[t]);
  assert.ok(all.length > 0);
  const ids = new Set();
  for (const e of all) {
    assert.equal(e.id, relationId(e.type, e.from, e.to));
    assert.ok(!ids.has(e.id), `duplicate edge id ${e.id}`);
    ids.add(e.id);
    assert.ok(e.provenance.source.length > 0);
    assert.ok(e.provenance.fingerprint.length > 0);
    assert.equal(e.status, "declared");
    assert.equal(e.verification, e.reason ? "curated" : "verified");
  }
  assert.deepEqual(g.proposed, []);
});

test("buildRelationGraph: absent types are declared with zero edges", () => {
  const g = buildRelationGraph({ projects: [], concepts: [], paths: [], bookLinks: [] });
  for (const t of ABSENT_RELATIONS) {
    assert.equal(g.counts[t], 0);
    assert.deepEqual(g.edges[t], []);
  }
  assert.ok(g.absent.includes("extends"));
  assert.ok(g.absent.includes("validates"));
});

test("makeEdge: the fingerprint changes when a declared field changes", () => {
  const a = makeEdge("implements", "/projects/p", "/concepts/c", {
    source: "src/lib/taxonomy.ts",
  });
  const b = makeEdge("implements", "/projects/p", "/concepts/c", {
    source: "src/lib/taxonomy.ts",
    reason: "a reason",
  });
  assert.notEqual(a.provenance.fingerprint, b.provenance.fingerprint);
  assert.equal(a.provenance.fingerprint, relationFingerprint(a));
});

/* ── claim/evidence builders ─────────────────────────────────────────────── */

const edge = makeEdge("recommends_reading", "/blog/2026-01-01-a", "chapter:1", {
  source: "src/lib/book-links.ts",
  reason: "Chapter 1 §1.1 prices the liability.",
  verification: "curated",
});

test("claimFromEdge / evidenceFromEdge: ids, statement and references", () => {
  const claim = claimFromEdge(edge);
  const evidence = evidenceFromEdge(edge);

  assert.equal(claim.id, `claim:${edge.id}`);
  assert.equal(claim.source, edge.provenance.source);
  assert.equal(claim.sourceSpan, edge.reason);
  assert.equal(claim.category, "relation");
  assert.equal(claim.assessment, "supported");
  assert.equal(claim.verification, "demonstrated");
  assert.equal(claim.authoritative, true);
  assert.deepEqual(claim.supportingEvidence, [evidence.id]);
  assert.equal(evidence.id, `ev:${edge.id}`);
  assert.equal(evidence.verification.status, "verified");
});

test("claimFromEdge: a proposed edge becomes a non-authoritative proposed claim", () => {
  const proposal = makeEdge("documents", "/blog/a", "/projects/p", {
    source: "src/lib/claim-evidence.ts",
    status: "proposed",
    verification: "proposed",
    reason: "shares 2 concepts",
  });
  const claim = claimFromEdge(proposal);
  assert.equal(claim.assessment, "proposed");
  assert.equal(claim.verification, "hypothesized");
  assert.equal(claim.authoritative, false);
});

/* ── validation ──────────────────────────────────────────────────────────── */

function bundle(overrides = {}) {
  const evidence = [
    {
      id: "ev:1",
      type: "source_span",
      source: "src/lib/taxonomy.ts",
      span: "implements:/projects/p->/concepts/c",
      contentHash: "abc",
      verification: { status: "verified", method: "curated" },
    },
  ];
  const claims = [
    {
      id: "claim:1",
      statement: "/projects/p implements /concepts/c",
      source: "src/lib/taxonomy.ts",
      sourceSpan: "implements:/projects/p->/concepts/c",
      category: "relation",
      assessment: "supported",
      verification: "demonstrated",
      supportingEvidence: ["ev:1"],
      contradictoryEvidence: [],
      relationships: ["implements:/projects/p->/concepts/c"],
      authoritative: true,
      provenance: { source: "src/lib/taxonomy.ts", generator: "test", fingerprint: "f" },
    },
  ];
  return { claims, evidence, ...overrides };
}

test("validateClaims: a well-formed bundle passes", () => {
  const { errors, warnings } = validateClaims(bundle());
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test("validateClaims: a proposed claim cannot be authoritative", () => {
  const b = bundle({
    claims: [
      { ...bundle().claims[0], assessment: "proposed", authoritative: true },
    ],
  });
  const { errors } = validateClaims(b);
  assert.match(errors.join("\n"), /cannot be authoritative/);
});

test("validateClaims: an unknown evidence reference is caught", () => {
  const b = bundle({
    claims: [{ ...bundle().claims[0], supportingEvidence: ["ev:ghost"] }],
  });
  const { errors } = validateClaims(b);
  assert.match(errors.join("\n"), /unknown evidence/);
});

test("validateClaims: duplicate ids and bad enum values are caught", () => {
  const b = bundle({
    claims: [bundle().claims[0], bundle().claims[0]],
  });
  const { errors } = validateClaims(b);
  assert.match(errors.join("\n"), /duplicate id/);

  const bad = bundle({
    claims: [{ ...bundle().claims[0], assessment: "certain" }],
  });
  assert.match(validateClaims(bad).errors.join("\n"), /bad assessment/);

  const badCat = bundle({
    claims: [{ ...bundle().claims[0], category: "vibes" }],
  });
  assert.match(validateClaims(badCat).errors.join("\n"), /bad category/);

  const badVer = bundle({
    claims: [{ ...bundle().claims[0], verification: "proven" }],
  });
  assert.match(validateClaims(badVer).errors.join("\n"), /bad verification/);
});

test("controlled vocabularies: the directive's sets are complete", () => {
  for (const a of ["proposed", "supported", "contested", "superseded", "unverified"]) {
    assert.ok(ASSESSMENTS.includes(a));
  }
  for (const v of ["implemented", "tested", "demonstrated", "independently_verified", "hypothesized"]) {
    assert.ok(VERIFICATION_LEVELS.includes(v));
  }
  for (const c of ["relation", "property", "absence", "evaluation"]) {
    assert.ok(CLAIM_CATEGORIES.includes(c));
  }
  for (const e of ["source_span", "repository", "external_reference", "measurement", "curation"]) {
    assert.ok(EVIDENCE_TYPES.includes(e));
  }
});

/* ── the real corpus ─────────────────────────────────────────────────────── */

test("buildClaimsAndEvidence: every claim resolves its evidence", () => {
  const { claims, evidence } = buildClaimsAndEvidence();
  const ids = new Set(evidence.map((e) => e.id));
  assert.ok(claims.length > 0);
  assert.ok(evidence.length > 0);
  for (const c of claims) {
    for (const id of [...c.supportingEvidence, ...c.contradictoryEvidence]) {
      assert.ok(ids.has(id), `${c.id} references missing evidence ${id}`);
    }
  }
  const { errors } = validateClaims({ claims, evidence });
  assert.deepEqual(errors, [], errors.join("\n"));
});

test("buildClaimsAndEvidence: the chapter_covers absence is an explicit claim", () => {
  const { claims, evidence } = buildClaimsAndEvidence();
  const absence = claims.find((c) => c.id === "claim:chapter-covers-absence");
  assert.ok(absence, "absence claim missing");
  assert.equal(absence.category, "absence");
  assert.equal(absence.assessment, "supported");
  assert.ok(evidence.some((e) => e.id === absence.supportingEvidence[0]));
});

test("buildProposals: deterministic, capped, and never authoritative", () => {
  const a = buildProposals();
  const b = buildProposals();
  assert.deepEqual(a, b);
  assert.ok(a.length <= PROPOSAL_LIMIT);
  for (const p of a) {
    assert.equal(p.status, "proposed");
    assert.equal(p.verification, "proposed");
  }

  // The boundary: no proposal may appear in the authoritative graph.
  const graph = relationGraph();
  const authoritative = new Set(
    RELATION_TYPES.flatMap((t) => graph.edges[t]).map((e) => e.id)
  );
  for (const p of a) {
    assert.equal(authoritative.has(p.id), false, `${p.id} leaked into the graph`);
  }
});

test("buildClaimsAndEvidence: the absence claim is authoritative; proposals are not", () => {
  const { claims } = buildClaimsAndEvidence();
  assert.ok(claims.find((c) => c.id === "claim:chapter-covers-absence").authoritative);
  for (const c of claims.filter((x) => x.assessment === "proposed")) {
    assert.equal(c.authoritative, false);
  }
});
