#!/usr/bin/env node
/* ============================================================
   smoke-production.mjs — deployment smoke test against the live site.

   Verifies that the deployed corpus agrees with the locally generated
   artifacts: HTTP status, content type, caching headers, ETag handling,
   byte counts and content hashes for ALL nine machine-readable resources,
   the completeness of the master index, the integrity of the claim/evidence
   model, the exclusion of proposals from the authoritative graph, and every
   canonical Markdown mirror.

   Findings are classified:
     errors        — deployment drift: production does not match the build.
     compileErrors — the local build is missing or malformed; this is a
                     compilation problem, not a deployment problem.
     warnings      — non-fatal (a missing cache-control header, a conditional
                     request not honoured).

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

const RESOURCES = [
  { path: "/llms.txt", contentType: "text/plain; charset=utf-8" },
  { path: "/llms-full.txt", contentType: "text/plain; charset=utf-8" },
  { path: "/agents/index.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/catalog.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/graph.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/book.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/claims.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/evidence.json", contentType: "application/json; charset=utf-8" },
  { path: "/agents/proposals.json", contentType: "application/json; charset=utf-8" },
];

const MIRROR_CONCURRENCY = 8;

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

/** Run `fn` over `items` with at most `limit` concurrent calls. */
async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const errors = [];
  const compileErrors = [];
  const warnings = [];
  const info = [];

  if (!fs.existsSync(APP)) {
    console.error(`❌ no local build at ${path.relative(REPO, APP)} — run \`next build\` first`);
    process.exit(1);
  }

  info.push(`base ${BASE}`);
  info.push(`local commit ${localCommit()}`);

  // ── 1. Master index completeness ────────────────────────────────────────
  const indexRes = await get("/agents/index.json");
  if (indexRes.status !== 200) {
    errors.push(`/agents/index.json: HTTP ${indexRes.status}`);
  } else {
    const deployedIndex = JSON.parse(await indexRes.text());
    const localIndexRaw = localBody("/agents/index.json");
    if (!localIndexRaw) {
      compileErrors.push("/agents/index.json: no local build output");
    } else {
      const localIndex = JSON.parse(localIndexRaw.toString("utf8"));

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
  }

  // ── 2. All nine resources: status, type, cache, ETag, bytes, hash ───────
  const bodies = {};
  for (const r of RESOURCES) {
    const local = localBody(r.path);
    if (!local) {
      compileErrors.push(`${r.path}: no local build output`);
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
    bodies[r.path] = body;
    if (body.length !== local.length) {
      errors.push(`${r.path}: production is ${body.length} bytes, the local build is ${local.length}`);
    }
    const deployedHash = sha(body);
    const localHash = sha(local);
    if (deployedHash !== localHash) {
      errors.push(
        `${r.path}: content hash mismatch (production ${deployedHash.slice(0, 12)}, local ${localHash.slice(0, 12)})`
      );
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

  // ── 3. Claim / evidence integrity ───────────────────────────────────────
  const claimsBody = bodies["/agents/claims.json"];
  const evidenceBody = bodies["/agents/evidence.json"];
  if (claimsBody && evidenceBody) {
    try {
      const claims = JSON.parse(claimsBody.toString("utf8"));
      const evidence = JSON.parse(evidenceBody.toString("utf8"));
      const evidenceIds = new Set(evidence.evidence.map((e) => e.id));

      for (const claim of claims.claims) {
        for (const ref of claim.supportingEvidence ?? []) {
          if (!evidenceIds.has(ref)) {
            errors.push(`claims.json: claim ${claim.id} references missing evidence ${ref}`);
          }
        }
        if (claim.assessment === "proposed" && claim.authoritative === true) {
          errors.push(`claims.json: claim ${claim.id} is proposed but marked authoritative`);
        }
      }
      info.push(
        `claims: ${claims.claims.length} claims, ${evidence.evidence.length} evidence records, all references resolve`
      );
    } catch (e) {
      compileErrors.push(`claims/evidence: deployed JSON did not parse (${e.message})`);
    }
  } else if (!compileErrors.length) {
    errors.push("claims/evidence: not fetched; cannot verify integrity");
  }

  // ── 4. Proposals are excluded from the authoritative graph ──────────────
  const proposalsBody = bodies["/agents/proposals.json"];
  const graphBody = bodies["/agents/graph.json"];
  if (proposalsBody && graphBody) {
    try {
      const proposals = JSON.parse(proposalsBody.toString("utf8"));
      const graph = JSON.parse(graphBody.toString("utf8"));
      // `edges` is keyed by relation type; flatten to the authoritative id set.
      const edgeIds = new Set(
        Object.values(graph.edges ?? {}).flatMap((list) =>
          Array.isArray(list) ? list.map((e) => e.id) : []
        )
      );
      let leaked = 0;
      for (const p of proposals.proposals) {
        const edgeId = `${p.type}:${p.from}->${p.to}`;
        if (edgeIds.has(edgeId) || edgeIds.has(p.id)) leaked += 1;
      }
      if (leaked > 0) {
        errors.push(`graph.json: ${leaked} proposal(s) leaked into the authoritative graph`);
      } else {
        info.push(
          `proposals: ${proposals.proposals.length} proposals, none in the authoritative graph`
        );
      }
    } catch (e) {
      compileErrors.push(`proposals/graph: deployed JSON did not parse (${e.message})`);
    }
  }

  // ── 5. Every Markdown mirror ────────────────────────────────────────────
  const mirrors = mirrorFiles().sort();
  info.push(`checking all ${mirrors.length} markdown mirrors`);
  const mirrorResults = await mapPool(mirrors, MIRROR_CONCURRENCY, async (slug) => {
    const pathname = `/research/${slug}.md`;
    const local = localBody(`/research/${slug}.md`);
    try {
      const res = await get(pathname);
      if (res.status !== 200) return { slug, error: `${pathname}: HTTP ${res.status}` };
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.startsWith("text/markdown")) {
        return { slug, error: `${pathname}: content-type ${ct}, expected text/markdown` };
      }
      const body = Buffer.from(await res.arrayBuffer());
      if (!local) return { slug, error: `${pathname}: no local build output`, compile: true };
      if (sha(body) !== sha(local)) return { slug, error: `${pathname}: content hash mismatch` };
      return { slug, ok: true };
    } catch (e) {
      return { slug, error: `${pathname}: fetch failed (${e.message})` };
    }
  });
  for (const r of mirrorResults) {
    if (r.error) {
      if (r.compile) compileErrors.push(r.error);
      else errors.push(r.error);
    }
  }

  // ── 6. A draft must 404 in production too ───────────────────────────────
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
    ok: errors.length === 0 && compileErrors.length === 0,
    summary: {
      errors: errors.length,
      compileErrors: compileErrors.length,
      warnings: warnings.length,
      info: info.length,
    },
    errors,
    compileErrors,
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
    for (const e of compileErrors) console.error(`  ✗ compile: ${e}`);
  }
  console.log(
    `\nsmoke: ${BASE} — ${errors.length} drift, ${compileErrors.length} compile, ${warnings.length} warning(s), ${info.length} info`
  );
  console.log(`  report: ${path.relative(REPO, out)}`);

  if (errors.length || compileErrors.length) {
    console.error(
      "\n❌ SMOKE FAILED — " +
        (compileErrors.length
          ? "the local build is incomplete or malformed. Fix the build first.\n"
          : "production does not agree with the local build. If this run precedes a deploy, the drift is expected; otherwise the deploy is wrong.\n")
    );
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(`❌ smoke test crashed: ${e.message}`);
  process.exit(1);
});
