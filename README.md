# danielkliewer.com v2 — the sovereign workshop

Dark-first, book-first rebuild of [danielkliewer.com](https://www.danielkliewer.com),
selling _Computational Sovereignty: Building Local-First AI Systems_.

## Stack

- Next.js 16 · React 19 · Tailwind CSS v4 (TypeScript)
- `@vercel/analytics` — the only tracker. No PostHog, no pixels, no third-party scripts.

## Develop

```bash
nvm use          # reads .nvmrc — Node 22.23.4, the 2026-10-21 security release
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (runs both gates first; must pass clean)
npm run test     # 20 tests over the runtime security gate
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

## Deploy

Push to GitHub, import into Vercel. No env vars required.

## Launch TODOs (Daniel)

- `src/config.ts`: `BOOK.amazonUrl` (currently `"#"`), `BOOK.price` (`$39.99` — confirm),
  `EMAIL.buttondownEndpoint` (paste Buttondown form endpoint).
- Email capture renders a disabled placeholder until the Buttondown endpoint is set.
- `npm run lint` reports 1 pre-existing `react-hooks/immutability` error in
  `src/components/BookScene.tsx` (unrelated to the security work).

## Architecture

- `src/config.ts` — central launch config (site, book, old book, email, social, nav).
  Sibling page agents read from here; do not hardcode these values elsewhere.
- `src/app/layout.tsx` — fonts (next/font/google), metadata, theme init script,
  `<Analytics/>`, `<SiteHeader/>` / `<SiteFooter/>` shell.
- `src/components/` — shared primitives: `SiteHeader`, `SiteFooter`, `ThemeToggle`,
  `EmailCapture`, `Container`, `SectionHeading`, `BookCover`, `Prose`.
- `public/images/` — blog assets copied from the a10 source (163 files, dated subdirs)
  plus `book-cover.png` (front cover rendered at 300dpi from the hardcover print wrap PDF).
- `scripts/` — build-time gates (`check-node-version.mjs`, `check-images.mjs`) and
  route tooling (`route-manifest.mjs`, `route-parity.mjs`).
- `tests/` — `node --test` suites for the gates. Zero extra dependencies by design.

## Theme

Dark is the default. `ThemeToggle` flips `documentElement.classList` (`light` | absent)
and persists to `localStorage` key `dk-theme`. A pre-hydration inline script in
`layout.tsx` applies the stored theme before first paint.
