# Security posture

What this repository can enforce, what it cannot, and what needs the owner.

## Enforced in the repo

| Control | Where | Notes |
|---|---|---|
| Runtime floor | `scripts/check-node-version.mjs` (`npm run prenode`, chained into `prebuild`) | Fails closed on unpatched/EOL Node **and** on a compromised eMudhra/emSign G3 root reintroduced into the runtime's bundled trust store. Escape hatch `DK_ALLOW_NODE_VERSION=1` warns, never silent. |
| Image references | `scripts/check-images.mjs` (`npm run prebuild`) | Fails the build if any `/images/*` reference is missing. |
| `X-Powered-By` | `next.config.ts` → `poweredByHeader: false` | The framework fingerprint is no longer sent. |
| `X-Content-Type-Options` | `next.config.ts` → `headers()` | `nosniff`. |
| `Referrer-Policy` | same | `strict-origin-when-cross-origin`. |
| `X-Frame-Options` | same | `DENY`. |
| `Permissions-Policy` | same | camera, microphone, geolocation, payment and USB all denied — the short explicit list of what the site never uses. |
| `Content-Security-Policy` | same | Enforcing. Built from what the site actually loads; the host list is commented in `next.config.ts` with the grep that produced it. |

The CSP is **enforcing**, not Report-Only. It was verified in a real browser
against `/`, `/book`, `/research`, a post carrying remote `i.imgur.com` /
`img.shields.io` images, and a project page (the three.js `BookScene` route),
with a clean console. If a future change adds a remote host, image, or script
source, the CSP will block it and the console will say so — that is the point.

## Not set here, and why

- **HSTS** — Vercel adds it at the edge. `max-age` hard-coded in `next.config.ts`
  could not be verified from the repo, and a wrong value is worse than none.
  Confirm in the Vercel dashboard under the domain's Edge/Security settings.
- **`www` vs apex redirect** — a DNS/platform setting, not a code setting. The
  canonical origin is `https://www.danielkliewer.com` (`SITE.url`); confirm the
  apex 301s to it.
- **Compression / CDN caching** — platform behaviour, not observable from here.

## Dependency supply chain

- `npm audit` is run in CI (`--omit=dev --audit-level=high`).
- `.github/dependabot.yml` opens weekly npm update PRs.
- No lockfile drift: `npm ci` is used everywhere, never `npm install`.

## Knowledge governance

The compiler and the corpus preserve the line between probabilistic
interpretation and deterministic authorization.

| Rule | Where it is enforced |
|---|---|
| A proposal is never authoritative. | `packages/knowledge-compiler/src/compile.ts` (`assertGoverned`); proposals are structurally excluded from `/agents/graph.json` and carried in `/agents/proposals.json`. |
| Only an explicit human approval promotes a proposal. | `approval.ts` records who / why / when / against which source fingerprint; `compileFromManifest.ts` verifies the fingerprint matches the proposal's evidence and fails closed on a mismatch. |
| AI may propose, never authorize. | The compiler consumes approval records; it cannot mint them. The MCP tools label a proposed claim `assessment: "proposed"`, `authoritative: false`. |
| Validation failures are never suppressed. | `validate.ts` rejects a document with reasons; `compileFromManifest` throws on any governance violation. |
| Approved records are immutable and traceable. | Every relation and claim carries provenance and a modification fingerprint; approved records add `approvedBy`, `approvedAt`, `approvalReason`. |
| Source material is untrusted. | Adapters confine paths to the declared root, hash content and never execute it. Document bodies are data, not instructions. |
| Private material cannot leak. | Drafts are excluded before artifacts are emitted; the compiler reads only the sources a manifest declares. |
| Retrieved content cannot become an instruction. | The SDK verifies a mirror against its own content hash; the MCP server returns structured JSON, not executable content; the site CSP blocks injected scripts. |

**Not enforced, and why it matters:** the site's bound layer emits proposals
without an audit log, and the MCP server cannot force a caller to treat a
proposal as non-authoritative — it can only label it. A real deployment needs
an approval workflow outside the compiler (who may approve, revocation, review
periods) and a writer that refuses to promote an unapproved id.

## Known, accepted

- `script-src` includes `'unsafe-inline'` because Next injects the RSC flight
  payload as inline bootstrap scripts. A nonce would force every page dynamic.
  Mitigated by `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`,
  an explicit `form-action 'self'`, and `default-src 'self'`.
- `public/ads.txt` still carries a Google AdSense publisher line. It is **not**
  referenced by anything on the site and no ad network runs; the privacy page
  now says so. Remove the file or the line when the owner decides.
