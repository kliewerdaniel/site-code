#!/usr/bin/env node
/* ============================================================
   check-images.mjs — build-time image gate.
   Scans every source file for /images/* references and fails
   the build if any referenced file is missing from public/images/.
   Broken images become impossible, not just unlikely.
   Runs as `npm run prebuild` before `next build`.
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const imagesDir = path.join(repo, "public", "images");

// Known-missing refs inside byte-identical legacy posts — warn, don't fail.
// See scripts/image-gate-allowlist.json.
let allowed = new Set();
try {
  const list = JSON.parse(
    fs.readFileSync(path.join(root, "image-gate-allowlist.json"), "utf8")
  );
  allowed = new Set(list.allowlist ?? []);
} catch {
  allowed = new Set();
}

// Matches: src="...", href="...", url(...), '/images/x', "/images/x", `...`
const REF = /["'(`]\/images\/([^"'`)\s?#]+)["'`)#?]/g;

const SRC_DIRS = ["src", "content"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".md", ".mdx", ".css"]);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

const referenced = new Map(); // image -> [files]
for (const d of SRC_DIRS) {
  const dir = path.join(repo, d);
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const text = fs.readFileSync(file, "utf8");
    let m;
    REF.lastIndex = 0;
    while ((m = REF.exec(text))) {
      const img = m[1].split("?")[0];
      if (!referenced.has(img)) referenced.set(img, []);
      referenced.get(img).push(path.relative(repo, file));
    }
  }
}

const missing = [];
const grandfathered = [];
for (const [img, files] of referenced) {
  if (fs.existsSync(path.join(imagesDir, img))) continue;
  const ref = `/images/${img}`;
  if (allowed.has(ref)) {
    grandfathered.push({ img, files: [...new Set(files)] });
    continue;
  }
  missing.push({ img, files: [...new Set(files)] });
}

for (const { img, files } of grandfathered) {
  console.warn(`⚠ grandfathered missing image (legacy content): /images/${img}`);
  for (const f of files) console.warn(`    referenced in ${f}`);
}

if (missing.length > 0) {
  console.error("\n❌ IMAGE GATE FAILED — referenced images missing from public/images/:\n");
  for (const { img, files } of missing) {
    console.error(`  /images/${img}`);
    for (const f of files) console.error(`      referenced in ${f}`);
  }
  console.error("");
  process.exit(1);
}

console.log(`✓ image gate passed — ${referenced.size} referenced image(s) all present in public/images/`);
