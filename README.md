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
- `npm run validate:agents` (`scripts/validate-agents.mjs`, run after
  `next build`) — the agent knowledge interface: all nine resources exist and
  parse, every canonical URL is on the site origin, the book record matches
  `src/config.ts`, no invented availability/rating, no dangling graph edge, the
  index's byte sizes match the built bodies, and no draft leaked into the
  catalog.
- `npm run validate:markdown` (`scripts/validate-markdown.mjs`, run after
  `next build`) — the canonical Markdown mirrors: one per published article,
  each with a verifying content hash and byte count, a body identical to the
  source article, and a deterministic render; drafts have no mirror.
- `npm run validate:claims` (`scripts/validate-claims.mjs`, run after
  `next build`) — the claim/evidence model: every claim has a source span, an
  assessment and a verification level; every evidence reference resolves; a
  proposed claim is never authoritative; no proposal leaks into the
  authoritative graph.
- `npm run conformance` (`scripts/conformance.mjs`) — one reproducible command
  over the whole corpus. It aggregates the four validators and adds schema
  shape, deterministic compilation, output consistency, resource references,
  publication metadata, index completeness and draft exclusion, then writes
  `data/conformance-report.json` with errors / warnings / info. It exits
  non-zero on any structural violation.
- `npm run smoke:production` (`scripts/smoke-production.mjs`) — deployment smoke
  test against the live site: HTTP status, content type, caching, ETag/304,
  byte counts, content hashes and a sample of the Markdown mirrors, compared
  with the local build. Runs after a deploy (see
  `.github/workflows/smoke.yml`). **Currently passes with 0 errors** —
  production and the local build are byte-identical.
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

Current baseline: 0 fatal · 10 defects (all inert `canonical_url` frontmatter) ·
350 advisory · 98 relation edges with 0 dangling references · 9 agent resources ·
197 published articles (2 drafts excluded) · 197 Markdown mirrors · 109 claims ·
109 evidence records · 10 non-authoritative proposals · production smoke test
passing with 0 errors. Every figure is generated from the build by
[`npm run stats`](docs/STATISTICS.md); none is hand-maintained.

## Agent interface

The site is a statically compiled knowledge corpus, not a blog with an API
bolted on. Nine machine-readable resources are generated at build time from the
same source the pages render — see **[docs/AGENT-RESOURCES.md](docs/AGENT-RESOURCES.md)**
and the authoritative counts in **[docs/STATISTICS.md](docs/STATISTICS.md)**:

| Path | Purpose |
|---|---|
| `/llms.txt` | Entry point: identity, domains, navigation, book, pointers. |
| `/llms-full.txt` | Full catalog as text (~145 KB, not the 6.8 MB of bodies). |
| `/agents` | Human guide to the corpus and its graph. |
| `/agents/index.json` | Master index with byte sizes and content types. |
| `/agents/catalog.json` | Articles, projects, concepts, paths, chapters. |
| `/agents/graph.json` | Typed relation graph with provenance. |
| `/agents/book.json` | The book as a product record (no invented availability). |
| `/agents/claims.json` | Typed claims with source spans, assessments and evidence references. |
| `/agents/evidence.json` | Evidence records supporting or contradicting each claim. |
| `/agents/proposals.json` | Non-authoritative relation proposals (never in the graph). |
| `/research/{slug}.md` | Canonical Markdown mirror of every published article. |

Relationships are computed or verified, never invented. `chapter_covers` is
withheld rather than inferred from keyword overlap — the manuscript does not
reproduce individual articles — and the remaining unused relation types are
reported as `absent`. Every published article also has a canonical Markdown
mirror at `/research/<slug>.md`, generated from the same source the page
renders and verified by content hash; drafts have none. Traffic and bandwidth
policy: **[docs/TRAFFIC.md](docs/TRAFFIC.md)**.

## SDK and MCP

Two standalone packages consume the compiled corpus without the website's
Next.js runtime:

- **`packages/knowledge-sdk`** — `@danielkliewer/knowledge-sdk`. A typed,
  dependency-free TypeScript client: corpus discovery, conditional HTTP with
  ETag caching, byte-budget enforcement, content-hash verification, BM25-style
  ranking, graph traversal, document expansion, evidence lookup and citation
  generation. See [its README](packages/knowledge-sdk/README.md).
- **`packages/knowledge-mcp`** — `@danielkliewer/knowledge-mcp`. A stdio MCP
  adapter exposing `search_knowledge`, `get_article`, `traverse_graph`,
  `get_evidence`, `get_learning_path` and `get_book_context`, with hard
  retrieval limits. See [its README](packages/knowledge-mcp/README.md).
- **`packages/knowledge-compiler`** — `@danielkliewer/knowledge-compiler`. The
  reusable compile-time knowledge compiler: source normalization, deterministic
  validation, governed proposal approval and artifact emission. See
  [its README](packages/knowledge-compiler/README.md) and the
  [extraction evaluation](docs/KNOWLEDGE-COMPILER-EXTRACTION.md).

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
