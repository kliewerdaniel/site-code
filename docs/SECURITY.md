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

## Known, accepted

- `script-src` includes `'unsafe-inline'` because Next injects the RSC flight
  payload as inline bootstrap scripts. A nonce would force every page dynamic.
  Mitigated by `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`,
  an explicit `form-action 'self'`, and `default-src 'self'`.
- `public/ads.txt` still carries a Google AdSense publisher line. It is **not**
  referenced by anything on the site and no ad network runs; the privacy page
  now says so. Remove the file or the line when the owner decides.
