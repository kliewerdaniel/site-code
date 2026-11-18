#!/usr/bin/env node
/* ============================================================
   validate-markdown.mjs — post-build gate for the canonical Markdown mirrors.

   Every published article must have a prerendered `/research/<slug>.md`
   whose frontmatter metadata, content hash and byte count verify against the
   bytes actually emitted, and whose body is exactly the source article body.
   A draft must have no mirror at all.

   FATAL (exit 1):
     - a published post with no build output
     - a mirror whose hash or byte count does not verify
     - a mirror whose body differs from the source article body
     - a mirror that does not match the deterministic render
     - a draft with a published mirror

   Findings are exported as `collect()` so scripts/audit-site.mjs can
   aggregate them without re-implementing the rules.

   Usage:
     node scripts/validate-markdown.mjs            # after `next build`
     node scripts/validate-markdown.mjs --quiet
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SITE } from "../src/config.ts";
import { getAllPosts, getAllPostsIncludingDrafts } from "../src/lib/posts.ts";
import { conceptsForPost, projectsForPost } from "../src/lib/taxonomy.ts";
import {
  markdownPath,
  renderMarkdownMirror,
  verifyMarkdownMirror,
} from "../src/lib/markdown-core.ts";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const APP = path.join(repo, ".next", "server", "app");

/** URL path -> prerendered body file. */
function bodyFile(urlPath) {
  return path.join(APP, `${urlPath.replace(/^\//, "")}.body`);
}

/** The deterministic mirror for one post, built from the same sources the
 *  route handler uses (config, posts, taxonomy). */
function expectedMirror(post) {
  return renderMarkdownMirror(SITE.url, {
    slug: post.slug,
    title: post.title,
    date: post.date,
    updated: post.updated,
    concepts: conceptsForPost(post).map((c) => c.slug),
    projects: projectsForPost(post.slug).map((p) => p.slug),
    content: post.content,
  });
}

/** Collect every finding. Returns `null` if there is no build output. */
export function collect() {
  if (!fs.existsSync(APP)) return null;

  const fatal = [];
  const findings = [];
  const mirrors = [];

  const published = getAllPosts();
  const draftSlugs = new Set(
    getAllPostsIncludingDrafts()
      .filter((p) => p.draft)
      .map((p) => p.slug)
  );

  for (const post of published) {
    const rel = markdownPath(post.slug);
    const file = bodyFile(rel);
    if (!fs.existsSync(file)) {
      fatal.push(`${rel}: no build output (expected ${path.relative(repo, file)})`);
      continue;
    }
    const body = fs.readFileSync(file, "utf8");
    const verification = verifyMarkdownMirror(body, post.content);
    for (const problem of verification.problems) {
      fatal.push(`${rel}: ${problem}`);
    }
    if (body !== expectedMirror(post)) {
      fatal.push(`${rel}: emitted mirror does not match the deterministic render`);
    }
    mirrors.push({ path: rel, bytes: Buffer.byteLength(body, "utf8") });
  }

  for (const slug of draftSlugs) {
    const rel = markdownPath(slug);
    if (fs.existsSync(bodyFile(rel))) {
      fatal.push(`${rel}: draft has a published Markdown mirror`);
    }
  }

  return { mirrors, fatal, findings };
}

/* ── CLI ─────────────────────────────────────────────────────────────────── */

const isEntry =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntry) {
  const result = collect();
  if (result === null) {
    console.error(
      `❌ no build output at ${path.relative(repo, APP)} — run \`next build\` first`
    );
    process.exit(1);
  }
  const quiet = process.argv.includes("--quiet");
  if (!quiet) {
    for (const m of result.mirrors.slice(0, 10)) {
      console.log(`  ${(m.bytes / 1024).toFixed(1).padStart(7)} KB  ${m.path}`);
    }
    if (result.mirrors.length > 10) {
      console.log(`  … and ${result.mirrors.length - 10} more`);
    }
  }
  console.log(
    `\nmarkdown: ${result.mirrors.length} mirrors — ${result.fatal.length} fatal, ${result.findings.length} reported`
  );
  if (result.fatal.length) {
    console.error("\n❌ MARKDOWN VALIDATION FAILED:\n");
    for (const f of result.fatal) console.error(`  ✗ ${f}`);
    console.error("");
    process.exit(1);
  }
  process.exit(0);
}
