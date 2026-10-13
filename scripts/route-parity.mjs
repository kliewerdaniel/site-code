#!/usr/bin/env node
/**
 * Route parity check — proves every URL in the manifest actually resolves.
 *
 * Usage:
 *   node scripts/route-parity.mjs http://localhost:3000           # report
 *   node scripts/route-parity.mjs http://localhost:3000 --save    # write baseline
 *   node scripts/route-parity.mjs http://localhost:3000 --check   # diff vs baseline
 *
 * Legacy redirects are expected to 308. Redirect stubs are expected to 200.
 */
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2];
if (!base) {
  console.error("usage: node scripts/route-parity.mjs <baseUrl> [--save|--check]");
  process.exit(2);
}
const save = process.argv.includes("--save");
const check = process.argv.includes("--check");

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "data", "route-manifest.json");
const STATUS_FILE = path.join(ROOT, "data", "route-status.json");

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const urls = [...manifest.static, ...manifest.blog, ...manifest.fleet];

async function statusOf(url) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    return res.status;
  } catch (e) {
    return `ERR:${e.code ?? e.message}`;
  }
}

const results = {};
// bounded concurrency so we do not open 200 sockets at once
const LIMIT = 12;
let i = 0;
async function worker() {
  while (i < urls.length) {
    const url = urls[`${i++}`];
    results[url] = await statusOf(base + url);
  }
}
await Promise.all(Array.from({ length: LIMIT }, worker));

const bad = Object.entries(results).filter(([, s]) => s !== 200);
console.log(`checked ${urls.length} URLs against ${base}`);
console.log(`  200: ${urls.length - bad.length}`);
console.log(`  not-200: ${bad.length}`);
for (const [u, s] of bad.slice(0, 20)) console.log(`    ${s}  ${u}`);

// legacy redirects: must answer 308 to their destination
console.log(`\nlegacy redirects (${manifest.legacyRedirects.length}):`);
let redirBad = 0;
for (const { source, destination } of manifest.legacyRedirects) {
  try {
    const res = await fetch(base + source, { redirect: "manual" });
    const loc = res.headers.get("location") ?? "";
    const ok = (res.status === 308 || res.status === 301) && loc.endsWith(destination);
    if (!ok) {
      redirBad++;
      console.log(`    FAIL ${res.status} ${source} -> ${loc || "(none)"} (want ${destination})`);
    }
  } catch (e) {
    redirBad++;
    console.log(`    ERR ${source}: ${e.message}`);
  }
}
console.log(`  ${manifest.legacyRedirects.length - redirBad}/${manifest.legacyRedirects.length} correct`);

if (save) {
  fs.mkdirSync(path.dirname(STATUS_FILE), { recursive: true });
  fs.writeFileSync(STATUS_FILE, JSON.stringify(results, null, 2) + "\n");
  console.log(`\nwrote baseline ${path.relative(ROOT, STATUS_FILE)}`);
  process.exit(bad.length || redirBad ? 1 : 0);
}

if (check) {
  if (!fs.existsSync(STATUS_FILE)) {
    console.error(`no baseline at ${STATUS_FILE}`);
    process.exit(2);
  }
  const prev = JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
  const diffs = [];
  for (const url of Object.keys(prev)) {
    if (!(url in results)) diffs.push(`MISSING  ${url} (was ${prev[url]})`);
    else if (results[url] !== prev[url])
      diffs.push(`CHANGED  ${url}  ${prev[url]} -> ${results[url]}`);
  }
  if (diffs.length) {
    console.error(`ROUTE PARITY FAILED (${diffs.length}):`);
    for (const d of diffs.slice(0, 30)) console.error("  " + d);
    process.exit(1);
  }
  console.log(`\nroute parity OK — all ${Object.keys(prev).length} URLs match baseline`);
  process.exit(0);
}

process.exit(bad.length || redirBad ? 1 : 0);
