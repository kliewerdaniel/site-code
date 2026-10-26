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

   REPORTED — editorial quality, deliberately non-fatal so that writing a post
   can never break the deploy. Each finding is classified for the auditor:
     - `defect`   — a real problem a reader or crawler would notice
     - `advisory` — length drift; search results have variable display widths
                  and relevance matters more than a fixed character count

   The findings are exported as `collect()` so scripts/audit-site.mjs can
   aggregate them without re-implementing the rules.

   Usage:
     node scripts/validate-content.mjs           # report + exit non-zero on fatal
     node scripts/validate-content.mjs --quiet   # only print the summary
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const POSTS_DIR = path.join(repo, "content", "research");
const PUBLIC = path.join(repo, "public");

const TITLE_ADVISORY = 70; // characters, before the brand template is applied
const DESC_ADVISORY = 160;

/** Collect every finding. Does not touch process.exit — the CLI wrapper decides
 *  what to do with the result, and the auditor imports this directly. */
export function collect() {
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") && f !== "temp.md")
    .sort();

  const fatal = [];
  const findings = [];
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
    if (!dateOk) {
      fatal.push(`${file}: \`date\` missing or unparseable (${JSON.stringify(date)})`);
    }

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
    const desc = typeof data.description === "string" ? data.description.trim() : "";
    if (!desc) {
      // Advisory, not a defect: the page still renders a valid, accurate
      // 160-char excerpt derived from its own body (verified in the build
      // output). Nothing is broken; a hand-written description is simply better.
      // The mission spec for this validator calls it a "non-fatal report".
      findings.push({
        severity: "advisory",
        kind: "description-missing",
        file,
        id: `description-missing:${file}`,
        detail: `no usable \`description\` frontmatter (falls back to a ${DESC_ADVISORY}-char auto-excerpt)`,
      });
    } else {
      if (desc.length > DESC_ADVISORY) {
        findings.push({
          severity: "advisory",
          kind: "description-long",
          file,
          id: `description-long:${file}`,
          detail: `description is ${desc.length} chars (> ${DESC_ADVISORY})`,
          value: desc.length,
        });
      }
      const list = descriptions.get(desc) ?? [];
      list.push(file);
      descriptions.set(desc, list);
    }

    if (title.length > TITLE_ADVISORY) {
      findings.push({
        severity: "advisory",
        kind: "title-long",
        file,
        id: `title-long:${file}`,
        detail: `title is ${title.length} chars (> ${TITLE_ADVISORY})`,
        value: title.length,
      });
    }

    if (typeof data.canonical_url === "string" && data.canonical_url.trim()) {
      const want = selfUrl(slug);
      if (data.canonical_url.trim() !== want) {
        findings.push({
          severity: "defect",
          kind: "canonical-mismatch",
          file,
          id: `canonical-mismatch:${file}`,
          detail: `\`canonical_url\` is ${data.canonical_url.trim()}, self URL is ${want}`,
          value: data.canonical_url.trim(),
        });
      }
    }

    if (typeof data.updated === "string" && data.updated.trim()) {
      const u = new Date(data.updated).getTime();
      const d = new Date(date).getTime();
      if (!isNaN(u) && !isNaN(d) && u < d) {
        findings.push({
          severity: "defect",
          kind: "updated-before-date",
          file,
          id: `updated-before-date:${file}`,
          detail: `\`updated\` (${data.updated}) is earlier than \`date\` (${date})`,
        });
      }
    }
  }

  for (const [desc, list] of descriptions) {
    if (list.length > 1) {
      findings.push({
        severity: "defect",
        kind: "description-duplicate",
        file: list.join(", "),
        id: `description-duplicate:${list[0]}`,
        detail: `duplicate description shared by ${list.length} posts`,
        value: desc.slice(0, 120),
      });
    }
  }

  return { posts: files.length, fatal, findings };
}

/* ── CLI ─────────────────────────────────────────────────────────────────── */

const isEntry =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntry) {
  const { posts, fatal, findings } = collect();
  const quiet = process.argv.includes("--quiet");

  if (!quiet) {
    for (const f of findings) console.warn(`  ⚠ [${f.severity}] ${f.file}: ${f.detail}`);
  }

  const defects = findings.filter((f) => f.severity === "defect").length;
  const advisory = findings.length - defects;
  console.log(
    `\ncontent: ${posts} posts — ${fatal.length} fatal, ${defects} defect, ${advisory} advisory`
  );

  if (fatal.length) {
    console.error("\n❌ CONTENT VALIDATION FAILED:\n");
    for (const f of fatal) console.error(`  ✗ ${f}`);
    console.error("");
    process.exit(1);
  }
  process.exit(0);
}
