/**
 * Timezone-reproducibility test for the compiled corpus.
 *
 * The archive mixes date formats (ISO, ISO-with-offset, US month-day-year).
 * A build that parses the US form in local time produces different artifacts
 * on different machines — the production smoke test caught exactly that
 * (06:00Z on a CST build, 00:00Z on the UTC build). This test runs the same
 * normalisation under two timezones and asserts identical output.
 *
 * Run: node --test tests/timezone-reproducibility.test.mjs   (or `npm test`)
 */

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const DATES = [
  "11-12-2026",
  "07-23-2026",
  "10-25-2026",
  "2025-11-05",
  "2024-12-19 07:42:44 -0500",
  "2026-11-12T06:00:00.000Z",
  "2026-11-12T06:00:00",
  "2026-11-12",
  "2026-11-12T00:00:00+02:00",
  "",
  "not-a-date",
];

const PROBE = `
import { normalizeDate } from "./src/lib/posts.ts";
const dates = ${JSON.stringify(DATES)};
console.log(JSON.stringify(dates.map((d) => normalizeDate(d))));
`;

function normaliseUnder(tz) {
  const res = spawnSync(process.execPath, ["--input-type=module", "-e", PROBE], {
    cwd: root,
    env: { ...process.env, TZ: tz },
    encoding: "utf8",
  });
  assert.equal(res.status, 0, res.stderr);
  return JSON.parse(res.stdout.trim());
}

test("normalizeDate: identical output under UTC and America/Chicago", () => {
  const utc = normaliseUnder("UTC");
  const cst = normaliseUnder("America/Chicago");
  assert.deepEqual(cst, utc);
});

test("normalizeDate: US month-day-year is a calendar date at UTC midnight", () => {
  const [utc] = [normaliseUnder("UTC")];
  assert.equal(utc[0], "2026-11-12T00:00:00.000Z"); // 11-12-2026
  assert.equal(utc[1], "2026-07-23T00:00:00.000Z"); // 07-23-2026
  assert.equal(utc[2], "2026-10-25T00:00:00.000Z"); // 10-25-2026
});

test("normalizeDate: ISO dates are UTC midnight; offsets are honoured", () => {
  const utc = normaliseUnder("UTC");
  assert.equal(utc[3], "2025-11-05T00:00:00.000Z"); // 2025-11-05
  assert.equal(utc[4], "2024-12-19T12:42:44.000Z"); // 2024-12-19 07:42:44 -0500
  assert.equal(utc[5], "2026-11-12T06:00:00.000Z"); // explicit Z
  assert.equal(utc[6], "2026-11-12T06:00:00.000Z"); // no timezone -> UTC
  assert.equal(utc[7], "2026-11-12T00:00:00.000Z"); // ISO date
  assert.equal(utc[8], "2026-11-11T22:00:00.000Z"); // +02:00
});

test("normalizeDate: empty and unparseable values are handled", () => {
  const utc = normaliseUnder("UTC");
  assert.equal(utc[9], "");
  // An unparseable date is reported as missing, not passed through as a
  // non-ISO string that would corrupt the artifacts.
  assert.equal(utc[10], "");
});
