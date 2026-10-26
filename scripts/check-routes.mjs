#!/usr/bin/env node
/* ============================================================
   check-routes.mjs — one-shot route parity, server included.

   `npm run check:routes` has to do three things in order: regenerate the
   manifest from the real route table, serve the build, then prove every URL
   in the manifest resolves. Doing that by hand means remembering the port and
   leaving a server running. This does all three and always kills the server,
   even on failure.

   Flow:
     1. node scripts/route-manifest.mjs          (regenerate data/route-manifest.json)
     2. next start -p PORT                      (spawned, waited for "Ready")
     3. node scripts/route-parity.mjs URL --check
     4. kill the server; exit with the parity result

   PORT defaults to 3100 so it never collides with `npm start` on 3000.

   Usage:
     npm run check:routes              # uses the committed baseline
     node scripts/check-routes.mjs --save   # first run: write the baseline
   ============================================================ */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, "..");
const PORT = Number(process.env.PORT ?? 3100);
const BASE = `http://localhost:${PORT}`;
const save = process.argv.includes("--save");

const run = (cmd, args, opts = {}) =>
  new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd: repo, stdio: ["ignore", "pipe", "pipe"], ...opts });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("exit", (code) => resolve({ code: code ?? 1, out }));
    p.on("error", (e) => resolve({ code: 1, out: String(e) }));
  });

console.log("1/3 regenerating the route manifest");
const m = await run("node", ["scripts/route-manifest.mjs"]);
process.stdout.write(m.out);
if (m.code !== 0) {
  console.error(`route-manifest.mjs failed (exit ${m.code})`);
  process.exit(m.code);
}

console.log(`\n2/3 starting the build on ${BASE}`);
const server = spawn("npm", ["run", "start", "--", "-p", String(PORT)], {
  cwd: repo,
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOut = "";
server.stdout.on("data", (d) => (serverOut += d));
server.stderr.on("data", (d) => (serverOut += d));

const deadline = Date.now() + 60_000;
let up = false;
while (Date.now() < deadline) {
  if (/Ready in|started server|Local:/i.test(serverOut)) {
    up = true;
    break;
  }
  await new Promise((r) => setTimeout(r, 250));
}
if (!up) {
  console.error(`server did not become ready:\n${serverOut.slice(-2000)}`);
  server.kill("SIGKILL");
  process.exit(1);
}
// Give Next a moment to warm the first render.
await new Promise((r) => setTimeout(r, 800));

console.log(`\n3/3 checking every URL in the manifest against ${BASE}`);
const parity = await run(
  "node",
  ["scripts/route-parity.mjs", BASE, save ? "--save" : "--check"].filter(Boolean)
);
process.stdout.write(parity.out);

server.kill("SIGKILL");
await new Promise((r) => setTimeout(r, 200));

process.exit(parity.code);
