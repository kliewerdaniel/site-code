# Design Spec — v3 "The Instrument"

**Status:** PROPOSED — awaiting ratification. No implementation until approved.
**Supersedes:** v2 "The Sovereign Machine" (dark navy + gold).
**Scope:** visual language, layout system, components. Routes, slugs, and content are frozen.

---

## 1. Why v2 fails

Audited, not asserted. Evidence:

- **The palette is not the book's palette.** v2 uses `--color-abyss: #0b1119` and
  `--color-gold: #d9a648`. Sampling `public/images/book-front.png` (1837×3050) gives a
  different reality: the cover's gold is `#ffc370` (hue 34, sat 0.56, val 0.98) — brighter
  and far more saturated than the muddied `#d9a648`. The cover's void is `#01040a` (mean of
  its darkest decile), not `#0b1119`. v2 approximates the book instead of deriving from it.
- **One layout, repeated.** `page.tsx` has 6 `<section>`s; four are the same
  `border-b border-hairline` + `Container` + `SectionHeading` + grid-of-bordered-cards. The
  visual rhythm never changes, so nothing is emphasized. This is the single biggest reason
  it reads as a template.
- **A generic SaaS skeleton.** Hero is the standard split-screen (text left / image right).
  Cards are `border border-hairline` on flat navy. Neither says anything about local-first
  systems, measurement, or the book.
- **Competing ambient motion.** `ShaderBackground` paints a blueprint grid behind every page
  while the hero runs a 3D book and `Reveal` animates every block in. Three motions, no
  hierarchy.
- **Marginal contrast.** 6 text nodes fail WCAG AA (4.34 vs 4.5 required) — the `CH. 3–6`
  mono eyebrows in `text-bone-faint` on `bg-navy-deep`. Minor, but it is a real defect and
  v3 must not reintroduce it.

The verdict is not "dark is wrong." It is that **the dark was never given a thesis** — it
is a color scheme, not a design language.

## 2. Thesis

> **The site is a precision instrument displayed in a dark room.**

The book argues that intelligence should run on hardware you own, and that every claim
should be measured. The site should behave like the thing it describes: a working machine,
presented with museum restraint. Cinematic, not decorative — drama comes from **scale,
contrast, and emptiness**, never from added effects.

Three consequences that decide every later question:

1. **The void is structural.** Near-black is the gallery wall. Content is lit; the room is
   not. Surfaces recede, they do not decorate.
2. **Emptiness is the luxury.** Generous negative space is the premium signal. v2 fills its
   space with bordered boxes; v3 withholds.
3. **Numbers are the ornament.** The subject is measurement ("recall is a number you
   measured, not a feeling"). Data display is a *design element*, not a table in a doc.

## 3. Palette — derived from the cover's actual pixels

Base values sampled from `book-front.png`, then tuned for WCAG.

| Token | Value | Role | Provenance |
|---|---|---|---|
| `--void` | `#01040a` | page ground | cover's darkest decile |
| `--void-2` | `#050a12` | recessed panels | sampled |
| `--slate` | `#0d1d28` | raised surface | cover midtone (10.2%) |
| `--slate-2` | `#152129` | mean cover color | computed mean |
| `--slate-3` | `#1a2e38` | highest surface | cover midtone (11.2%) |
| `--ink` | `#f2f4f5` | primary text | spectral, cool-tinted |
| `--ink-2` | `#b8c2c6` | secondary text | |
| `--ink-3` | `#8a979d` | tertiary / labels | AA-verified on all surfaces (4.69 on the lightest) |
| `--gold` | `#ffc370` | **singular accent** | cover's true accent |
| `--gold-2` | `#e8a94e` | pressed / hover | |
| `--rule` | `#1e2c36` | hairlines | |
| `--rule-2` | `#2c3d49` | emphasized rules | |

Rules:
- **Gold is singular.** One accent, used for emphasis and the primary action only. Never as
  a background wash, never on more than one element per viewport region.
- **No gradients as decoration.** A gradient may only be a legibility scrim over imagery.
- **Every `--ink-*` value must pass AA on `--void` AND on `--slate-3`.** This is the gate
  that v2 missed. **Verified:** all 5 inks × all 5 surfaces = 25/25 pass AA 4.5
  (worst case `--ink-3` on `--slate-3` = 4.69). Reproduce with
  `~/.hermes/cache/scratch/palette_check.py`.
- **Hairlines are not text.** `--rule` on `--void` is 1.44 — perceptible as a divider but
  not a UI boundary. Do not rely on a hairline as the only affordance for an interactive
  control; pair it with a text label or use `--rule-2`.

## 4. Typography

Keep the faces (they are right); change the **usage**. v2 sets display at `font-semibold`
700 and `text-5xl/7xl` — loud and dense. Cinematic means *large and light*.

| Role | Face | Size | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Scene title | Fraunces | `clamp(3.5rem, 9vw, 8.5rem)` | 300 | `-0.03em` | 0.92 |
| Section title | Fraunces | `clamp(2rem, 4vw, 3.25rem)` | 300 | `-0.02em` | 1.05 |
| Sub / deck | Fraunces italic | `clamp(1.15rem, 2vw, 1.6rem)` | 400 | normal | 1.4 |
| Body | Space Grotesk | 17px | 400 | `0.005em` | 1.65 |
| Label | JetBrains Mono | 11px | 500 | `0.22em` uppercase | 1 |
| Data | JetBrains Mono | varies | 500 | `-0.01em` tabular | 1 |

Principles:
- **Display is light (300).** Weight replaces shouting with confidence. This is the single
  highest-impact change from v2.
- **Extreme scale contrast.** A `clamp()` up to 8.5rem against 11px labels. The gap between
  largest and smallest *is* the cinematic quality. v2's 5xl-to-11px gap is too narrow.
- **Mono is the instrument voice.** Every label, unit, chapter number, and metric uses
  JetBrains Mono uppercase-tracked. It reads as machine output.
- **Tabular numerals** (`font-variant-numeric: tabular-nums`) on all figures so data aligns.

## 5. Layout system — three archetypes, not one grid

v2's failure is a single repeated treatment. v3 has exactly three, and every page composes
from them. A page that uses the same archetype twice in a row is a bug.

### A. SCENE — full-bleed, object in void
Full-viewport (min 92vh). The subject sits in negative space with a scrim. Text overlays;
no panels, no cards, no borders. Used for the hero and section openers. Max **one per page**.

### B. EXHIBIT — gallery pacing
Generous vertical space (12–20rem), one idea per exhibit, content in a narrow measure
(≤62ch) or an asymmetric split. Separated by hairline rules, never boxes. This replaces the
card grid. Where v2 shows 6 bordered cards, v3 shows 6 unboxed entries separated by rules —
same content, no containers.

### C. INSTRUMENT — data display
Mono labels, tabular figures, hairline-ruled rows. For the "six things you will build",
chapter data, fleet domains, post metadata. This is where the subject matter becomes
visible: the site *demonstrates* measurement instead of describing it.

### Chrome
- **Header:** transparent over SCENE, then a hairline + `--void` blur after scroll. No
  background box at rest.
- **Footer:** near-black, mono, ruled — an instrument readout, not a link farm.
- **Grain:** a single subtle film-grain/noise overlay (~3% opacity) replaces
  `ShaderBackground`'s blueprint grid. Grain is the cinematic tell; the grid was the
  template tell. Static, no animation, and it must not cost a repaint.

## 6. Motion — one signature

- **The book rotating in void is the only signature motion.** It already exists
  (`BookScene`); v3 gives it the full stage instead of a half-column.
- **Reveals become near-invisible:** opacity only, 12px rise, no per-block stagger cascade.
  v2 staggers `delay` per card up to 0.25s, which reads as a template animation.
- **`ShaderBackground` is removed.** One less competing motion, one less WebGL context.
- Everything collapses to static under `prefers-reduced-motion` — already correct via
  `src/lib/useMediaQuery.ts`.

## 7. Per-route direction

| Route | Archetypes | Notes |
|---|---|---|
| `/` | SCENE → EXHIBIT → INSTRUMENT | Hero is the book in void; replace the 3 identical card grids with EXHIBIT (what you build) + INSTRUMENT (the numbers) |
| `/book` | SCENE → INSTRUMENT → EXHIBIT | 24 chapters become an INSTRUMENT list; keep the scroll-stack but make it full-bleed |
| `/research` | EXHIBIT | Post list: ruled entries, generous space, no boxes. Search stays |
| `/sample` | EXHIBIT | Long-form reading measure, `Prose` retuned |
| `/paper` | EXHIBIT | Figures + tables must survive the token swap (theme-adaptive SVG via CSS vars) |
| `/fleet`, `/fleet/[domain]` | INSTRUMENT | Domain cards → ruled data rows |
| `/about`, `/mission`, `/press` | EXHIBIT | Editorial |
| `/blog/[slug]` | EXHIBIT | Article: 68ch measure, drop-cap optional, ruled metadata |

## 8. What must not break (hard constraints)

1. **All routes and slugs unchanged.** `/blog/<slug>` for 184 posts, all `/fleet/*`,
   the `/projects/*` → `/fleet/*` and `/blog` → `/research` redirect stubs, and
   `next.config.ts`'s 22 legacy-slug redirects. Verify with a route-parity check.
2. **Content frozen.** Post bodies, frontmatter, `canonical_url` untouched.
3. **No hydration regressions.** All client branching goes through
   `src/lib/useMediaQuery.ts` (see `references/hydration-mismatch.md`).
4. **Zero WCAG AA failures** in both `prefers-reduced-motion` states, every route.
5. **`/paper`'s 5 SVG figures still render** (they depend on CSS var tokens resolving —
   see `references/paper-svg-figures.md`).
6. **The 3D book still loads** and still degrades to `StaticCover` without WebGL.

## 9. Ratified decisions (2026-10-13)

All four were open questions; the user has answered. These are now **locked** — do not
re-litigate them during implementation.

| # | Question | Decision | Consequence for the plan |
|---|---|---|---|
| 1 | Grain overlay scope | **All pages**, 3% static | `.grain` goes on `<body>` in `layout.tsx`, not per-section. It is the unifying gallery layer. |
| 2 | `ShaderBackground` | **Remove** | Delete the component, its import, and the `.blueprint-static` fallback. One less WebGL context and one less competing motion. |
| 3 | `/book` scroll-stack | **Replace** with the INSTRUMENT list | `ChapterStack` is deleted; the 24 chapters become a ruled INSTRUMENT table. `CHAPTERS` data moves to `src/config.ts` (it is book data, and `book/page.tsx` currently imports it unused). |
| 4 | Display weight | **400**, not 300 | `.display-xl` / `.display-lg` use `font-weight: 400`. At `clamp()` scale, 400 holds up on non-retina displays where 300 thins out. |

**Note on #3:** because `ChapterStack` owned both the animation *and* the `CHAPTERS` array
(imported by `book/page.tsx`), replacing it is a data move, not a deletion. Do not delete the
array with the component. The reduced-motion `StaticList` path also disappears with it —
which is correct, since a static ruled list is what INSTRUMENT is in both motion modes, and
that removes one more client component from the hydration surface.
