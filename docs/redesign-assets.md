# Redesign assets

Every visual asset used by the redesign, with the prompt that produced it and the
operations applied afterwards. Generated artwork is used only where it does a job
that a diagram cannot; architecture is drawn, not generated.

## 1. Social card — `public/images/og-home.jpg`

| | |
|---|---|
| role | Open Graph / Twitter card for `/`, `/projects`, `/concepts`, `/paths` |
| final size | 1200×630, 92 KB, JPEG q88 progressive |
| generated | Qwen-Image-2.1-Turbo, `t2i`, 1280×736, seed 7702, 198 s |
| raw output | `~/Projects/qwen-image-studio/outputs/t2i_7702_1792973232_91f3a59d477d.png` |
| palette | gold #ffc370 on void #01040a — the same derivation as the site's tokens |

**Prompt (verbatim):**

> Macro photograph of a precise three-dimensional lattice made of thin machined
> brass rods, right-angled grid joints, suspended in absolute darkness, a single
> warm amber light raking from the upper left, deep navy-black background, faint
> depth of field falloff to black on the right, industrial precision instrument,
> anodised metal, no organic shapes, no branches, no leaves, no plants, no text,
> no letters, no numbers, no people, cinematic still life

**Post-processing** (Pillow, scripted — type is composited, never generated):
1. cover-fit 1280×736 → 1200×630, Lanczos
2. horizontal scrim, transparent to `#01040a` at 92 % alpha from x=34 % rightward,
   so the type has guaranteed contrast instead of hoping the render cooperates
3. gold rule + four display lines (Georgia) + two sublines, right column at x=690

**Why generated here and not elsewhere:** a social card is viewed out of context,
at small size, in a feed. Atmosphere helps it. Architecture does not — which is
why the execution-boundary diagram is hand-drawn SVG instead.

**Rejected first attempt:** seed 7701 returned a natural tree twig — atmospheric
and on-palette, but semantically unrelated to the subject. Regenerated with an
explicit geometry prompt and the organic failure mode named as an exclusion.

## 2. Execution-boundary diagram — `src/components/BoundaryDiagram.tsx`

| | |
|---|---|
| role | homepage, explaining the proposal/permission split |
| kind | programmatic SVG, no raster |
| size | 0 bytes transferred beyond the page (inline), scales indefinitely |
| accessibility | `role="img"` + `<title>` + `<desc>` describing the full flow |

Drawn rather than generated because the diagram's entire value is that its labels
are correct. A diffusion model cannot be relied on to spell "allowlist", and a
diagram that mislabels the architecture is worse than no diagram.

On viewports under ~700 px the figure scrolls horizontally (`.figure-scroll`,
`min-width: 660px`) instead of shrinking its 10–14 px labels to ~6 px.

## 3. Existing assets retained

- `book-front.png`, `book-spine.png`, `book-back.png` — book covers, unchanged.
- Article images — unchanged; every existing post keeps its `image:` frontmatter.
- `hlvs-lighthouse-hero.jpg`, `ganymede-archive-*.jpg` — article heroes, unchanged.

No generated image replaces a photograph of a real thing, and no generated image
carries text.
