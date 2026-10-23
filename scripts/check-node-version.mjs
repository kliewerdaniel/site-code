#!/usr/bin/env node
/* ============================================================
   check-node-version.mjs — build-time runtime gate.

   Runs as `npm run prenode` before `npm run prebuild` / `next build`.

   Why this exists
   ----------------
   Node.js 22.23.4 is a SECURITY release (published 2026-10-21). It:
     1. drops the compromised eMudhra/emSign roots from the bundled CA store
        (CVE-2026-111943 — eight intermediate keys generated with weak
        randomness; recoverable from public data by anyone), and
     2. patches TLS certificate hostname-check bypasses and a Brotli
        decompression flaw that allows remote code execution.

   A build must never run on an unpatched runtime: the build itself performs
   outbound HTTPS (dependency install, image/asset fetches), and a stale
   trust store is the exact attack surface the advisory describes.

   Mechanism
   ---------
   We require a version at or above the patched release for the running major.
   Node 22.23.1 still ships 4 emSign roots; 22.23.4 ships 1. We also report
   the compromised roots actually present in this runtime's store, because a
   custom/patched CA bundle could re-introduce them.

   Escape hatch
   ------------
   `DK_ALLOW_NODE_VERSION=1` skips the version check (local debugging only).
   CI should never set it. The trust-store scan still runs, but its findings
   are reported as warnings rather than failures.

   Testability
   -----------
   `check()` is exported so `tests/check-node-version.test.mjs` can exercise
   the decision logic across versions without spawning processes.
   ============================================================ */

import { execFileSync } from "node:child_process";
import tls from "node:tls";

/** Minimum patched version per major line (the 2026-10-21 security release). */
export const MIN_PATCHED = {
  18: null, // EOL — never acceptable
  20: null, // EOL — never acceptable
  22: "22.23.4",
  24: "24.22.1",
  26: "26.12.1",
};

/**
 * Roots that must NOT be trusted — the compromised eMudhra/emSign anchors.
 * The G3 generation is what Mozilla removed from its store and what the Node
 * 22.23.4 / 24.22.1 / 26.12.1 releases drop.
 */
export const FORBIDDEN_ROOT_PATTERNS = [/emSign Root CA - G3/i, /emSign ECC Root CA - G3/i];

export function parse(version) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version ?? "");
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

export function gte(a, b) {
  if (a.major !== b.major) return a.major > b.major;
  if (a.minor !== b.minor) return a.minor > b.minor;
  return a.patch >= b.patch;
}

/** Subjects of every root in this runtime's bundled trust store. */
export function bundledTrustSubjects() {
  const subjects = [];
  for (const pem of tls.rootCertificates || []) {
    try {
      subjects.push(
        execFileSync("openssl", ["x509", "-noout", "-subject"], {
          input: pem,
          stdio: ["pipe", "pipe", "ignore"],
        })
          .toString()
          .trim()
          .replace(/^subject=\s*/, ""),
      );
    } catch {
      break; // openssl unavailable — skip the content scan; version gate still applies
    }
  }
  return subjects;
}

/**
 * Decide whether a runtime may build.
 *
 * @param {object} opts
 * @param {string} opts.version          e.g. "v22.23.4"
 * @param {Record<string,string>} [opts.env]  env override (DK_ALLOW_NODE_VERSION)
 * @param {string[]} [opts.trustSubjects]  root subjects to scan; defaults to this runtime's store
 * @returns {{ok: boolean, skipped: boolean, problems: string[], warnings: string[]}}
 */
export function check({ version, env = {}, trustSubjects } = {}) {
  const cur = parse(version);
  const problems = [];
  const warnings = [];

  if (!cur) {
    return {
      ok: false,
      skipped: false,
      problems: [`cannot parse runtime version "${version}"`],
      warnings: [],
    };
  }

  const skipped = env.DK_ALLOW_NODE_VERSION === "1";

  if (skipped) {
    warnings.push("gate SKIPPED via DK_ALLOW_NODE_VERSION=1 — building on an unverified runtime.");
  } else {
    const minRaw = MIN_PATCHED[cur.major];

    if (minRaw === null || minRaw === undefined) {
      problems.push(
        `Node ${version} is end-of-life and receives no security fixes. Use 22.23.4, 24.22.1, or 26.12.1.`,
      );
    } else if (!gte(cur, parse(`v${minRaw}`))) {
      problems.push(
        `Node ${version} is vulnerable. The ${cur.major}.x security release is ${minRaw} or later.`,
      );
    }
  }

  const subjects = trustSubjects ?? bundledTrustSubjects();
  const found = subjects.filter((s) => FORBIDDEN_ROOT_PATTERNS.some((re) => re.test(s)));

  if (found.length > 0) {
    const msg = `Trust store still contains compromised eMudhra/emSign root(s): ${found.join(", ")}`;
    (skipped ? warnings : problems).push(msg);
  }

  return { ok: problems.length === 0, skipped, problems, warnings };
}

// ---- CLI ---------------------------------------------------------------
const invokedDirectly =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (invokedDirectly) {
  const res = check({ version: process.version, env: process.env });

  for (const w of res.warnings) console.warn(`⚠ node-version gate: ${w}`);

  if (!res.ok) {
    console.error("✗ node-version gate failed — refusing to build on an unpatched runtime.");
    for (const p of res.problems) console.error(`    • ${p}`);
    console.error("");
    console.error("  Fix:  nvm install 22.23.4 && nvm use 22.23.4   (or 24.22.1 / 26.12.1)");
    console.error("  This is a security release: it patches TLS hostname-check bypasses,");
    console.error("  a Brotli RCE, and drops the compromised eMudhra/emSign roots.");
    console.error("  Temporary escape hatch for local debugging only: DK_ALLOW_NODE_VERSION=1");
    process.exit(1);
  }

  console.log(`✓ node-version gate passed — Node ${process.version}`);
}
