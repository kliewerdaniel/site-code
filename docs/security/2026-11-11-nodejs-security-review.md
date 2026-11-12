# Node.js Security Review — November 11, 2026

**Execution date:** 2026-11-05 (review performed ahead of the scheduled release date)
**Repository:** https://github.com/kliewerdaniel/site-code
**Branch:** `security/nodejs-2026-11-11-review`

## 1. Official advisory status

Source: https://nodejs.org/en/blog/vulnerability/november-2026-security-releases

The Node.js project has *announced* security releases for the 26.x, 24.x, and 22.x
release lines to be made available on or shortly after Wednesday, November 11, 2026.
The advisory states only that:

- The highest severity issue fixed across all three lines is **HIGH**.
- End-of-life versions are always affected when a security release occurs.

As of this review, the advisory does **not** publish CVE identifiers, affected-version
ranges, or fixed version numbers. Secondary sources were not relied upon. No CVEs or
patch versions are invented in this report.

## 2. Repository inspection

- `.nvmrc`: `22.23.4`
- `package.json` `engines.node`: `22.x`
- `scripts/check-node-version.mjs`: `MIN_PATCHED` = 22: `22.23.4`, 24: `24.22.1`, 26: `26.12.1` (the 2026-10-21 security release)
- CI: `.github/workflows/ci.yml` reads `.nvmrc`, runs `npm ci`, `npm audit`, lint, tests, build (which invokes `prenode`).
- No `vercel.json` present; Vercel runtime follows `.nvmrc`/engines by default. Not independently verifiable from this repository alone — actual deployed runtime must be confirmed in the Vercel dashboard.

Local runtime used for verification: Node `v22.23.4` (via nvm).

## 3. Exposure evaluation

Current runtime `22.23.4` is the latest published patched release (2026-10-21
security release) covering CVE-2026-111943 (eMudhra/emSign G3 roots) and the TLS
hostname-check / Brotli fixes. The November 11, 2026 release is not yet published,
so its affected ranges and fixed versions are unknown. The existing `prenode` gate
cannot be evaluated against the November vulnerabilities until those details are
published; assuming the October checks cover the November issues would be incorrect
per the operating principles.

## 4. Remediation applied

**None.** Updating `MIN_PATCHED`, `.nvmrc`, or trust-store checks to a not-yet-published
version number would require inventing a patch version, which is prohibited. The
existing safeguards are preserved unchanged and fail-closed behavior is intact.

## 5. Verification

- Node version: `v22.23.4` (gate passes).
- `npm test`: 67 pass, 0 fail.
- `npm run build`: success (full SSG build).
- `npm run prenode`: passes; trust store contains no compromised eMudhra/emSign G3 roots.

## 6. Deployment safety

No deployment performed. Changes (report only) committed to dedicated branch
`security/nodejs-2026-11-11-review`. No merge or deploy without explicit authorization.

## 7. Remaining risks / unresolved questions

- The November 11, 2026 release CVEs, severity breakdown per CVE, affected versions,
  and fixed versions are unpublished as of this review.
- Once published, re-run this review: update `MIN_PATCHED` for 22/24/26, `.nvmrc`,
  `FORBIDDEN_ROOT_PATTERNS` if new compromised roots are identified, and re-verify
  Vercel's actual runtime.
- Vercel deployed runtime not independently verified from repository contents.
- `npm audit` reports 8 moderate vulnerabilities in dev/dependency tree; out of
  scope for this Node-runtime review (no production high/critical).
