#!/usr/bin/env node
/* ============================================================
   image-dimensions.mjs — build-time image dimension map.

   The markdown `img` renderer in src/app/blog/[slug]/page.tsx emits raw
   <img> tags (there is no rehype plugin, so next/image's optimizer is not
   available without restructuring the markdown pipeline). Without width and
   height the browser cannot reserve space, so every image-heavy post shifts
   layout as it loads.

   This scans every /images/* reference in src/ and content/, reads the real
   pixel dimensions off the files in public/images/ with sharp, and writes
   src/lib/image-dimensions.json. The renderer looks a reference up in that map
   and sets width/height from it. Remote images and unknown paths are left
   alone — the renderer only sets dimensions it actually knows.

   Runs as part of `npm run prebuild` so the map can never go stale.

   Usage:
     node scripts/image-dimensions.mjs            # write the map
     node scripts/image-dimensions.mjs --check    # fail if a ref has no entry
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const imagesDir = path.join(repo, "public", "images");
const OUT = path.join(repo, "src", "lib", "image-dimensions.json");

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error(
    "❌ image-dimensions.mjs needs `sharp` (a devDependency, also used by Next). Run `npm install`."
  );
  process.exit(1);
}

const REF = /["'(`]\/images\/([^"'`)\s?#]+)["'`)#?]/g;
const SRC_DIRS = ["src", "content"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".md", ".mdx", ".css"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

/** Every /images/* path referenced anywhere in src/ or content/. */
function referencedImages() {
  const refs = new Set();
  for (const d of SRC_DIRS) {
    for (const file of walk(path.join(repo, d))) {
      const text = fs.readFileSync(file, "utf8");
      REF.lastIndex = 0;
      let m;
      while ((m = REF.exec(text))) refs.add(m[1].split("?")[0]);
    }
  }
  return refs;
}

const refs = referencedImages();
const map = {};
const missing = [];
const failed = [];

for (const ref of refs) {
  const abs = path.join(imagesDir, ref);
  if (!fs.existsSync(abs)) {
    missing.push(ref);
    continue;
  }
  try {
    const meta = await sharp(abs, { failOn: "none" }).metadata();
    if (meta.width && meta.height) {
      map[`/images/${ref}`] = { width: meta.width, height: meta.height };
    }
  } catch (e) {
    failed.push({ ref, error: e.message });
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(map, null, 2) + "\n");

console.log(
  `✓ image dimensions — ${Object.keys(map).length} of ${refs.size} referenced image(s) measured`
);
for (const ref of missing) console.warn(`  ⚠ no file (grandfathered/remote-shaped ref): /images/${ref}`);
for (const f of failed) console.warn(`  ⚠ could not read /images/${f.ref}: ${f.error}`);

if (process.argv.includes("--check") && (missing.length || failed.length)) {
  console.error(
    `\n❌ ${missing.length} missing and ${failed.length} unreadable image reference(s)`
  );
  process.exit(1);
}
