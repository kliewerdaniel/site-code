#!/usr/bin/env node
/* ============================================================
   validate-content.mjs — content contract check.

   Runs over every markdown file in content/research/ and enforces the
   invariants the rest of the pipeline assumes.

   FATAL (exit 1) — the build would produce something broken:
     - `date` missing or not a parseable date
     - `title` missing or empty
     - `tags` present but not an array
     - `image` set to a path that does not exist under public/

   REPORTED (exit 0) — editorial quality, deliberately non-fatal so that
   writing a post can never break the deploy:
     - missing / over-long description
     - a duplicate description shared with another post
     - `title` longer than a search-result slot
     - `canonical_url` that disagrees with this post's own URL
     - `updated` earlier than `date`

   Usage:
     node scripts/validate-content.mjs          # report + exit non-zero on fatal
     node scripts/validate-content.mjs --quiet  # only print the summary
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const POSTS_DIR = path.join(repo, "content", "research");
const PUBLIC = path.join(repo, "public");

const TITLE_SOFT_LIMIT = 70; // characters, before the brand template is applied
const DESC_SOFT_LIMIT = 160;

const files = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md") && f !== "temp.md")
  .sort();

const fatal = [];
const warnings = [];
const descriptions = new Map(); // description -> [slugs]

const selfUrl = (slug) => `/blog/${slug}`;

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data } = matter(raw);

  // ---- fatal ----
  const date = data.date;
  const dateOk =
    date instanceof Date
      ? !isNaN(date.getTime())
      : typeof date === "string" && !isNaN(new Date(date).getTime());
  if (!dateOk) fatal.push(`${file}: \`date\` missing or unparseable (${JSON.stringify(date)})`);

  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title) fatal.push(`${file}: \`title\` missing or empty`);

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    fatal.push(`${file}: \`tags\` is present but not an array`);
  }

  if (typeof data.image === "string" && data.image.trim()) {
    const img = data.image.trim().replace(/^\//, "");
    if (!fs.existsSync(path.join(PUBLIC, img))) {
      fatal.push(`${file}: \`image\` ${data.image} does not exist under public/`);
    }
  }

  // ---- reported ----
  const desc =
    typeof data.description === "string" ? data.description.trim() : "";
  if (!desc) {
    warnings.push(`${file}: no \`description\` frontmatter (falls back to a ${DESC_SOFT_LIMIT}-char auto-excerpt)`);
  } else {
    if (desc.length > DESC_SOFT_LIMIT) {
      warnings.push(`${file}: description is ${desc.length} chars (> ${DESC_SOFT_LIMIT})`);
    }
    const list = descriptions.get(desc) ?? [];
    list.push(file);
    descriptions.set(desc, list);
  }

  if (title.length > TITLE_SOFT_LIMIT) {
    warnings.push(`${file}: title is ${title.length} chars (> ${TITLE_SOFT_LIMIT})`);
  }

  if (typeof data.canonical_url === "string" && data.canonical_url.trim()) {
    const want = selfUrl(slug);
    if (data.canonical_url.trim() !== want) {
      warnings.push(
        `${file}: \`canonical_url\` is ${data.canonical_url.trim()}, self URL is ${want}`
      );
    }
  }

  if (typeof data.updated === "string" && data.updated.trim()) {
    const u = new Date(data.updated).getTime();
    const d = new Date(date).getTime();
    if (!isNaN(u) && !isNaN(d) && u < d) {
      warnings.push(`${file}: \`updated\` (${data.updated}) is earlier than \`date\` (${date})`);
    }
  }
}

for (const [desc, list] of descriptions) {
  if (list.length > 1) {
    warnings.push(`duplicate description shared by ${list.length} posts: ${list.join(", ")}`);
  }
}

const quiet = process.argv.includes("--quiet");

if (!quiet) {
  for (const w of warnings) console.warn(`  ⚠ ${w}`);
}

console.log(
  `\ncontent: ${files.length} posts — ${fatal.length} fatal, ${warnings.length} reported`
);

if (fatal.length) {
  console.error("\n❌ CONTENT VALIDATION FAILED:\n");
  for (const f of fatal) console.error(`  ✗ ${f}`);
  console.error("");
  process.exit(1);
}
process.exit(0);
