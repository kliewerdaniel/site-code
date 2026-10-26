# danielkliewer.com v2 — the sovereign workshop

Dark-first rebuild of [danielkliewer.com](https://www.danielkliewer.com), selling
_Computational Sovereignty: Building Local-First AI Systems_.

There is no light theme: the machine runs at night. Dark is the only mode, and
there is no `ThemeToggle`, no `dk-theme` key and no pre-hydration theme script.

## Stack

- Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · TypeScript
- `@vercel/analytics` — the only tracker. No PostHog, no pixels, no third-party
  scripts, no cookies, no consent banner, no accounts.

## Develop

```bash
nvm use          # reads .nvmrc — Node 22.23.4, the 2026-10-21 security release
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (runs both gates first; must pass clean)
npm run test     # node --test — the runtime security gate + the SEO/feed logic
npm run lint
```

## Security gates

`npm run build` runs two gates before compiling anything, and both fail closed:

- **`prenode`** (`scripts/check-node-version.mjs`) — refuses to build on an unpatched
  or end-of-life Node, and independently scans the runtime's *bundled* trust store
  for a compromised eMudhra/emSign G3 root. Node bundles its own CA store, so an
  OS-level patch is not sufficient. Escape hatch: `DK_ALLOW_NODE_VERSION=1`
  (warns; never silent).
- **`check-images.mjs`** — fails the build if any `/images/*` reference is missing.

Runtime floor: Node **22.23.4** / 24.22.1 / 26.12.1 (see `.nvmrc`). Bump
`MIN_PATCHED` in `scripts/check-node-version.mjs` when a new security release lands.

Full write-up: **<https://danielkliewer.com/blog/2026-10-23-patching-the-trust-store-emudhra-nodejs-and-the-build-gate>**

## Validation

Beyond the build gates, three checks run over the content and the built output:

- `npm run validate:content` (`scripts/validate-content.mjs`) — every post must
  parse: ISO `date`, non-empty `title`, array `tags`, and an `image` that exists.
  Length, duplicate-description and `canonical_url`-mismatch findings are reported
  as warnings so editorial drift cannot break the deploy.
- `npm run validate:build` (`scripts/validate-build.mjs`, run after `next build`) —
  asserts over the prerendered HTML: exactly one `<h1>`, a self-referential
  canonical on every sitemap URL, complete OG/Twitter metadata, parseable
  JSON-LD, and no unintended `noindex`.
- `npm run check:routes` — regenerates `data/route-manifest.json`, starts the
  production server, and diffs `data/route-status.json` against the committed
  baseline. The baseline reflects the intended state: removed sections are 308.
- `npm run audit` (`scripts/audit-site.mjs`) — the deterministic auditor. It runs
  the two validators, adds the route table and a categorised canonical report,
  classifies every finding as **fatal / defect / advisory**, and writes
  `data/audit-report.json`.

## Site audit workflow

The auditor turns a one-off review into a repeatable gate.

```bash
npm run audit                    # write data/audit-report.json
npm run audit -- --summary       # compact human-readable report
npm run audit -- --check         # diff against the committed baseline
npm run audit -- --update-baseline
```

Severity model:

| Level | Meaning | Fails CI |
|---|---|---|
| `fatal` | the build or a page is broken | yes |
| `defect` | wrong data or a broken page a change could surface | yes, if new |
| `advisory` | suboptimal but not broken (length drift, auto-excerpt) | no |

`--check` fails only on **regressions**: a new defect, or a rising count.
Fixing a defect is reported as an *improvement* and exits 0 — a gate that fails on
remediation teaches people to ignore it. When improvements accumulate, run
`--update-baseline` deliberately so the baseline move is a reviewed commit rather
than a silent drift.

Every finding carries a stable id (`kind:file`), so it can be referenced in a
review or an issue without quoting its text.

Current baseline: 0 fatal · 11 defects (all inert `canonical_url` frontmatter) ·
343 advisory · 55 relation edges with 0 dangling references.


## Deploy

Push to GitHub, import into Vercel. No env vars required. `.github/workflows/ci.yml`
runs the full gate locally-equivalent on every push.

## Architecture

- `src/config.ts` — central launch config (site, book, old book, social, nav).
  Sibling page agents read from here; do not hardcode these values elsewhere.
- `src/app/layout.tsx` — fonts (next/font/google), metadata, `<Analytics/>`,
  `<SiteHeader/>` / `<SiteFooter/>` shell, skip link.
- `src/lib/seo.ts` + `src/lib/seo-core.ts` — the metadata layer. `seo-core.ts` is
  the alias-free pure half (merge, JSON-LD escaping, `updated` fallback, RSS
  rendering) so `node --test` can reach it without a build.
- `src/components/` — shared primitives: `SiteHeader`, `SiteFooter`, `Container`,
  `SectionHeading`, `Prose`, `Archetypes`, `HeroBand`, `HeroFilm`, `HeroBook`,
  `Reveal`, `AmazonCta`, `Logotype`, `BoundaryDiagram`.
- `public/images/` — editorial assets (blog figures, hero plates and loops) plus
  the book cover set (`book-front.png`, `book-spine.png`, `book-back.png`).
- `scripts/` — build-time gates (`check-node-version.mjs`, `check-images.mjs`),
  validators (`validate-content.mjs`, `validate-build.mjs`) and route tooling
  (`route-manifest.mjs`, `route-parity.mjs`).
- `tests/` — `node --test` suites. Zero extra dependencies by design.
