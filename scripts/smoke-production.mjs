#!/usr/bin/env node
/* ============================================================
   smoke-production.mjs — deployment smoke test against the live site.

   Verifies that the deployed corpus agrees with the locally generated
   artifacts: HTTP status, content type, caching headers, ETag handling,
   byte counts and content hashes. Also checks a deterministic sample of the
   canonical Markdown mirrors.

   This is meant to run AFTER a deploy. Before the deploy it reports the
   drift honestly: a hash mismatch means production is not serving the
   current build, not that the build is wrong.

   Usage:
     npm run smoke:production
     SMOKE_BASE=https://staging.example.com node scripts/smoke-production.mjs
   ============================================================ */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const BASE = process.env.SMOKE_BASE ?? "https://www.danielkliewer.com";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(REPO, ".next", "server", "app");

const SIX = [
  { path: "/llms.txt", contentType: "text/plain; charset=utf-8" },
  { path: "/llms-full.txt", contentType: "text/plain; charset=utf-8" },
  { path: "/agents/index.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/catalog.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/graph.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/book.json", contentType: "application/json; charset=utf-8" },
];

const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

const localBody = (urlPath) => {
  const file = path.join(APP, `${urlPath.replace(/^\//, "")}.body`);
  return fs.existsSync(file) ? fs.readFileSync(file) : null;
};

const mirrorFiles = () =>
  fs
    .readdirSync(path.join(APP, "research"), { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".md.body"))
    .map((e) => e.name.replace(/\.md\.body$/, ""));

/** Deterministic sample: first 5, last 5, and 10 evenly spaced. */
function sampleMirrors(all, n = 20) {
  if (all.length <= n) return all;
  const out = new Set();
  for (let i = 0; i < 5; i++) out.add(all[i]);
  for (let i = all.length - 5; i < all.length; i++) out.add(all[i]);
  const step = all.length / (n - 10);
  for (let i = 0; i < n - 10; i++) out.add(all[Math.floor(i * step)]);
  return [...out].sort();
}

async function get(pathname, headers = {}) {
  return fetch(`${BASE}${pathname}`, { headers });
}

function localCommit() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO })
      .toString()
      .trim()
      .slice(0, 12);
  } catch {
    return "unknown";
  }
}

async function main() {
  const errors = [];
  const warnings = [];
  const info = [];

  if (!fs.existsSync(APP)) {
    console.error(`❌ no local build at ${path.relative(REPO, APP)} — run \`next build\` first`);
    process.exit(1);
  }

  info.push(`base ${BASE}`);
  info.push(`local commit ${localCommit()}`);

  const indexRes = await get("/agents/index.json");
  if (indexRes.status !== 200) {
    errors.push(`/agents/index.json: HTTP ${indexRes.status}`);
  } else {
    const deployedIndex = JSON.parse(await indexRes.text());
    const localIndex = JSON.parse(localBody("/agents/index.json").toString("utf8"));

    const deployedPaths = new Set(deployedIndex.resources.map((r) => r.path));
    const localPaths = new Set(localIndex.resources.map((r) => r.path));
    for (const p of localPaths) {
      if (!deployedPaths.has(p)) errors.push(`index.json: production is missing ${p}`);
    }
    for (const p of deployedPaths) {
      if (!localPaths.has(p)) warnings.push(`index.json: production lists an unknown resource ${p}`);
    }
    for (const r of deployedIndex.resources) {
      const local = localIndex.resources.find((x) => x.path === r.path);
      if (local && r.bytes !== local.bytes) {
        errors.push(
          `${r.path}: production is ${r.bytes} bytes, the local build is ${local.bytes}`
        );
      }
    }
    if (deployedIndex.counts?.articles !== localIndex.counts?.articles) {
      errors.push(
        `catalog counts: production has ${deployedIndex.counts?.articles} articles, the local build has ${localIndex.counts?.articles}`
      );
    }
    if (deployedIndex.markdown?.count !== localIndex.markdown?.count) {
      errors.push(
        `markdown counts: production has ${deployedIndex.markdown?.count}, the local build has ${localIndex.markdown?.count}`
      );
    }
  }

  for (const r of SIX) {
    const local = localBody(r.path);
    if (!local) {
      errors.push(`${r.path}: no local build output`);
      continue;
    }
    let res;
    try {
      res = await get(r.path);
    } catch (e) {
      errors.push(`${r.path}: fetch failed (${e.message})`);
      continue;
    }
    if (res.status !== 200) {
      errors.push(`${r.path}: HTTP ${res.status}`);
      continue;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith(r.contentType)) {
      errors.push(`${r.path}: content-type ${ct}, expected ${r.contentType}`);
    }
    if (!res.headers.get("cache-control")) warnings.push(`${r.path}: no cache-control header`);
    const etag = res.headers.get("etag");
    if (!etag) warnings.push(`${r.path}: no etag header`);

    const body = Buffer.from(await res.arrayBuffer());
    if (body.length !== local.length) {
      errors.push(`${r.path}: production is ${body.length} bytes, the local build is ${local.length}`);
    }
    const deployedHash = sha(body);
    const localHash = sha(local);
    if (deployedHash !== localHash) {
      errors.push(`${r.path}: content hash mismatch (production ${deployedHash.slice(0, 12)}, local ${localHash.slice(0, 12)})`);
    } else {
      info.push(`${r.path}: ${body.length} bytes, hash matches`);
    }

    if (etag) {
      const conditional = await get(r.path, { "If-None-Match": etag });
      if (conditional.status !== 304) {
        warnings.push(`${r.path}: conditional request returned ${conditional.status}, expected 304`);
      } else {
        info.push(`${r.path}: conditional request honoured (304)`);
      }
    }
  }

  const mirrors = mirrorFiles().sort();
  const sample = sampleMirrors(mirrors);
  info.push(`checking ${sample.length} of ${mirrors.length} markdown mirrors`);
  for (const slug of sample) {
    const pathname = `/research/${slug}.md`;
    const local = localBody(`/research/${slug}.md`);
    let res;
    try {
      res = await get(pathname);
    } catch (e) {
      errors.push(`${pathname}: fetch failed (${e.message})`);
      continue;
    }
    if (res.status !== 200) {
      errors.push(`${pathname}: HTTP ${res.status}`);
      continue;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("text/markdown")) {
      errors.push(`${pathname}: content-type ${ct}, expected text/markdown`);
    }
    const body = Buffer.from(await res.arrayBuffer());
    if (local && sha(body) !== sha(local)) {
      errors.push(`${pathname}: content hash mismatch`);
    } else if (!local) {
      warnings.push(`${pathname}: no local build output to compare`);
    }
  }

  // A draft must 404 in production too.
  const draft = "2026-07-22-if-the-loop-is-the-product";
  const draftRes = await get(`/research/${draft}.md`);
  if (draftRes.status !== 404) {
    errors.push(`/research/${draft}.md: draft returned HTTP ${draftRes.status}, expected 404`);
  } else {
    info.push("draft mirror correctly 404s");
  }

  const report = {
    generatedBy: "scripts/smoke-production.mjs",
    base: BASE,
    localCommit: localCommit(),
    ok: errors.length === 0,
    summary: { errors: errors.length, warnings: warnings.length, info: info.length },
    errors,
    warnings,
    info,
  };
  const out = path.join(REPO, "data", "smoke-report.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2) + "\n");

  const quiet = process.argv.includes("--quiet");
  if (!quiet) {
    for (const i of info) console.log(`  · ${i}`);
    for (const w of warnings) console.warn(`  ⚠ ${w}`);
    for (const e of errors) console.error(`  ✗ ${e}`);
  }
  console.log(
    `\nsmoke: ${BASE} — ${errors.length} error(s), ${warnings.length} warning(s), ${info.length} info`
  );
  console.log(`  report: ${path.relative(REPO, out)}`);

  if (errors.length) {
    console.error(
      "\n❌ SMOKE FAILED — production does not agree with the local build. If this run precedes a deploy, the drift is expected; otherwise the deploy is wrong."
    );
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(`❌ smoke test crashed: ${e.message}`);
  process.exit(1);
});
