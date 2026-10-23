/**
 * Tests for the build-time runtime security gate.
 *
 * These lock in the *fail-closed* contract: the gate must refuse to build on
 * an unpatched Node, must detect a compromised eMudhra/emSign root reintroduced
 * into the trust store, and must not be silent about either.
 *
 * Run: node --test tests/        (or `npm test`)
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  MIN_PATCHED,
  FORBIDDEN_ROOT_PATTERNS,
  bundledTrustSubjects,
  check,
  gte,
  parse,
} from "../scripts/check-node-version.mjs";

/** The root subject as node's bundled store reports it (openssl RFC2253 form). */
const G3_SUBJECT = "/C=IN/OU=emSign PKI/O=eMudhra Technologies Limited/CN=emSign ECC Root CA - G3";
const CLEAN_SUBJECT = "/C=US/O=DigiCert Inc/CN=DigiCert Global Root CA";

// ---- version parsing / ordering -----------------------------------------

test("parse: accepts v-prefixed and bare versions", () => {
  assert.deepEqual(parse("v22.23.4"), { major: 22, minor: 23, patch: 4 });
  assert.deepEqual(parse("22.23.4"), { major: 22, minor: 23, patch: 4 });
});

test("parse: rejects garbage", () => {
  assert.equal(parse("node-22"), null);
  assert.equal(parse(""), null);
  assert.equal(parse(undefined), null);
});

test("gte: orders by major, then minor, then patch", () => {
  assert.ok(gte({ major: 22, minor: 23, patch: 4 }, { major: 22, minor: 23, patch: 4 }), "equal is >= ");
  assert.ok(gte({ major: 22, minor: 23, patch: 5 }, { major: 22, minor: 23, patch: 4 }), "patch higher");
  assert.ok(gte({ major: 22, minor: 24, patch: 0 }, { major: 22, minor: 23, patch: 9 }), "minor higher");
  assert.ok(gte({ major: 24, minor: 0, patch: 0 }, { major: 22, minor: 99, patch: 99 }), "major higher");
  assert.ok(!gte({ major: 22, minor: 23, patch: 3 }, { major: 22, minor: 23, patch: 4 }), "patch lower");
});

// ---- the version gate ---------------------------------------------------

test("GATE FAILS on the vulnerable Node 22.23.1 (the pre-advisory release)", () => {
  const r = check({ version: "v22.23.1", trustSubjects: [] });
  assert.equal(r.ok, false);
  assert.match(r.problems.join(" "), /22\.23\.4/);
});

test("GATE PASSES on the patched Node 22.23.4", () => {
  const r = check({ version: "v22.23.4", trustSubjects: [] });
  assert.equal(r.ok, true);
  assert.deepEqual(r.problems, []);
});

test("GATE PASSES on later same-major releases (22.23.5, 22.24.0)", () => {
  assert.equal(check({ version: "v22.23.5", trustSubjects: [] }).ok, true);
  assert.equal(check({ version: "v22.24.0", trustSubjects: [] }).ok, true);
});

test("GATE PASSES on the patched 24.x and 26.x releases", () => {
  assert.equal(check({ version: "v24.22.1", trustSubjects: [] }).ok, true);
  assert.equal(check({ version: "v26.12.1", trustSubjects: [] }).ok, true);
});

test("GATE FAILS just below each patched release", () => {
  assert.equal(check({ version: "v24.22.0", trustSubjects: [] }).ok, false);
  assert.equal(check({ version: "v26.12.0", trustSubjects: [] }).ok, false);
});

test("GATE FAILS on end-of-life majors (18, 20) regardless of patch level", () => {
  for (const v of ["v18.20.8", "v20.18.3", "v20.99.99"]) {
    const r = check({ version: v, trustSubjects: [] });
    assert.equal(r.ok, false, `${v} must be rejected`);
    assert.match(r.problems.join(" "), /end-of-life/);
  }
});

test("GATE FAILS on an unknown/unparseable version rather than defaulting to allow", () => {
  const r = check({ version: "not-a-version", trustSubjects: [] });
  assert.equal(r.ok, false);
  assert.match(r.problems.join(" "), /cannot parse/);
});

test("GATE FAILS on an unknown future major (13, 21, 28) — fail closed", () => {
  for (const v of ["v21.0.0", "v28.1.0"]) {
    const r = check({ version: v, trustSubjects: [] });
    assert.equal(r.ok, false, `${v} must not be silently trusted`);
  }
});

// ---- the trust-store scan ----------------------------------------------

test("SCAN detects a reintroduced compromised emSign G3 root", () => {
  const r = check({ version: "v22.23.4", trustSubjects: [CLEAN_SUBJECT, G3_SUBJECT] });
  assert.equal(r.ok, false, "a compromised root must fail the build even on a patched Node");
  assert.match(r.problems.join(" "), /emSign ECC Root CA - G3/);
});

test("SCAN passes a clean store", () => {
  const r = check({ version: "v22.23.4", trustSubjects: [CLEAN_SUBJECT] });
  assert.equal(r.ok, true);
});

test("SCAN matches both compromised G3 root generations", () => {
  const rsaG3 = "/C=IN/CN=emSign Root CA - G3/O=eMudhra Technologies Limited";
  const eccG3 = "/C=IN/CN=emSign ECC Root CA - G3/O=eMudhra Technologies Limited";
  for (const s of [rsaG3, eccG3]) {
    assert.ok(
      FORBIDDEN_ROOT_PATTERNS.some((re) => re.test(s)),
      `expected ${s} to match a forbidden-root pattern`,
    );
  }
});

test("SCAN does NOT flag the unrelated emSign C1/G1/C3 roots as forbidden", () => {
  // These remain in Node 22.23.4's store; only the G3 generation is compromised
  // per the advisory, so the scan must not over-report them.
  const retained = [
    "/C=IN/CN=emSign Root CA - G1/O=eMudhra Technologies Limited",
    "/C=US/CN=emSign Root CA - C1/O=eMudhra Inc",
    "/C=US/CN=emSign ECC Root CA - C3/O=eMudhra Inc",
  ];
  for (const s of retained) {
    assert.ok(
      !FORBIDDEN_ROOT_PATTERNS.some((re) => re.test(s)),
      `${s} must not be flagged`,
    );
  }
});

// ---- escape hatch -------------------------------------------------------

test("ESCAPE HATCH: DK_ALLOW_NODE_VERSION=1 lets an old Node build, but warns", () => {
  const r = check({
    version: "v22.23.1",
    env: { DK_ALLOW_NODE_VERSION: "1" },
    trustSubjects: [],
  });
  assert.equal(r.skipped, true);
  assert.equal(r.ok, true, "the escape hatch must actually allow the build");
  assert.ok(r.warnings.some((w) => /SKIPPED/i.test(w)), "it must not be silent");
});

test("ESCAPE HATCH: downgrades a compromised-root finding to a warning, not silence", () => {
  const r = check({
    version: "v22.23.4",
    env: { DK_ALLOW_NODE_VERSION: "1" },
    trustSubjects: [G3_SUBJECT],
  });
  assert.equal(r.ok, true);
  assert.ok(r.warnings.some((w) => /emSign ECC Root CA - G3/.test(w)));
});

// ---- the real runtime (integration) ------------------------------------

test("REAL RUNTIME: this machine's Node passes its own gate", () => {
  const r = check({ version: process.version, env: process.env });
  assert.equal(r.ok, true, `expected ${process.version} to pass: ${r.problems.join("; ")}`);
});

test("REAL RUNTIME: this machine's bundled store has no compromised G3 root", () => {
  const subjects = bundledTrustSubjects();
  assert.ok(subjects.length > 50, "expected a populated trust store");
  const compromised = subjects.filter((s) => FORBIDDEN_ROOT_PATTERNS.some((re) => re.test(s)));
  assert.deepEqual(compromised, [], `compromised roots present: ${compromised.join(", ")}`);
});

// ---- declared policy is self-consistent --------------------------------

test("POLICY: every non-null MIN_PATCHED entry parses and is itself a pass", () => {
  for (const [major, min] of Object.entries(MIN_PATCHED)) {
    if (min === null) continue;
    assert.equal(parse(min).major, Number(major), `${min} must belong to major ${major}`);
    const r = check({ version: `v${min}`, trustSubjects: [] });
    assert.equal(r.ok, true, `${min} must satisfy its own gate`);
  }
});
