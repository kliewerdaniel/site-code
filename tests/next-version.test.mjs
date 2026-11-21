/**
 * Regression guard for the Turbopack Google-font build failure.
 *
 * Next 16.4.2 crashes on an extensionless `/l/font?kit=...` URL returned by
 * Google Fonts: Turbopack splits the ampersands in the serialized options and
 * reports `next/font/google queries have exactly one entry`. Upstream fixed it
 * in 16.4.3 (vercel/next.js#100277, backported to the 16.4 line). A patch
 * downgrade must fail this test, not reappear as an intermittent Vercel build.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const lock = JSON.parse(readFileSync(path.join(root, "package-lock.json"), "utf8"));

const MIN_FIXED = [16, 4, 3];

function parts(version) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  assert.ok(m, `expected an exact x.y.z version, got ${version}`);
  return m.slice(1).map(Number);
}

function atLeast(version, minimum) {
  const a = parts(version);
  for (let i = 0; i < minimum.length; i += 1) {
    if (a[i] > minimum[i]) return true;
    if (a[i] < minimum[i]) return false;
  }
  return true;
}

test("next is pinned to a release with the extensionless-font fix", () => {
  const version = pkg.dependencies.next;
  assert.ok(atLeast(version, MIN_FIXED), `next ${version} predates 16.4.3`);
  assert.equal(lock.packages["node_modules/next"].version, version);
});

test("eslint-config-next tracks the pinned Next version", () => {
  assert.equal(pkg.devDependencies["eslint-config-next"], pkg.dependencies.next);
});
