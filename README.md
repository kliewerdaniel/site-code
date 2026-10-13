# danielkliewer.com v2 — the sovereign workshop

Dark-first, book-first rebuild of [danielkliewer.com](https://www.danielkliewer.com),
selling _Computational Sovereignty: Building Local-First AI Systems_.

## Stack

- Next.js 16 · React 19 · Tailwind CSS v4 (TypeScript)
- `@vercel/analytics` — the only tracker. No PostHog, no pixels, no third-party scripts.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (must pass clean)
npm run lint
```

## Deploy

Push to GitHub, import into Vercel. No env vars required.

## Launch TODOs (Daniel)

- `src/config.ts`: `BOOK.amazonUrl` (currently `"#"`), `BOOK.price` (`$39.99` — confirm),
  `EMAIL.buttondownEndpoint` (paste Buttondown form endpoint).
- Email capture renders a disabled placeholder until the Buttondown endpoint is set.

## Architecture

- `src/config.ts` — central launch config (site, book, old book, email, social, nav).
  Sibling page agents read from here; do not hardcode these values elsewhere.
- `src/app/layout.tsx` — fonts (next/font/google), metadata, theme init script,
  `<Analytics/>`, `<SiteHeader/>` / `<SiteFooter/>` shell.
- `src/components/` — shared primitives: `SiteHeader`, `SiteFooter`, `ThemeToggle`,
  `EmailCapture`, `Container`, `SectionHeading`, `BookCover`, `Prose`.
- `public/images/` — blog assets copied from the a10 source (163 files, dated subdirs)
  plus `book-cover.png` (front cover rendered at 300dpi from the hardcover print wrap PDF).

## Theme

Dark is the default. `ThemeToggle` flips `documentElement.classList` (`light` | absent)
and persists to `localStorage` key `dk-theme`. A pre-hydration inline script in
`layout.tsx` applies the stored theme before first paint.
