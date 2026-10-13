---
author: Daniel Kliewer
canonical_url: /blog/2026-07-16-the-sovereign-knowledge-compiler-explorer
date: 07-16-2026
description: "A fully static, prerendered knowledge explorer with zero runtime inference — built from a deterministic compile-time curriculum compiler. This is the recipe: how it was made, why it works, and how any human or AI can reconstruct it from a corpus."
layout: post
title: 'The Sovereign Knowledge Compiler Explorer: A Recipe for Compiling Knowledge Into a Static, Living Artifact'
og:description: "How to build a zero-runtime-inference knowledge explorer: a deterministic Python compiler that emits a content-hashed curriculum, and a static Next.js app that serves it. Full recipe, reproducible build, and the evolution from idea to artifact."
og:title: 'The Sovereign Knowledge Compiler Explorer: A Recipe for Compiling Knowledge Into a Static, Living Artifact'
og:type: article
og:url: /blog/2026-07-16-the-sovereign-knowledge-compiler-explorer
image: /images/ganymede.png
tags:
  - ai-agents
  - memory
  - local-first-ai
  - compile-time-ai
  - knowledge-compiler
  - knowledge-graph
  - nextjs
  - vercel
  - static-export
  - reproducible-build
draft: false
---

# The Sovereign Knowledge Compiler Explorer: A Recipe for Compiling Knowledge Into a Static, Living Artifact

Most "knowledge apps" are interpreters wearing a UI. You ask a question, they embed it, hit a vector store, pull top-k chunks, and ask a model to re-reason the answer — on *every single query*. The reasoning cost is paid again and again, and nothing compounds.

The [Sovereign Knowledge Compiler Explorer](https://github.com/kliewerdaniel/sovereign-knowledge-compiler-explorer) is the opposite. It is a **static website** — 82 prerendered pages, served from a CDN — that contains **no model at runtime**. When you open a concept, the page already knows what it is, what it depends on, and where to go next. The reasoning that produced that page happened *once*, at compile time, and was frozen into files.

→ **Live demo:** [skce-explorer.vercel.app](https://skce-explorer.vercel.app/)
→ **Source:** [github.com/kliewerdaniel/sovereign-knowledge-compiler-explorer](https://github.com/kliewerdaniel/sovereign-knowledge-compiler-explorer)

This post is a **recipe**. Treat the project like a lab experiment you are reconstructing. Below is exactly what was built, why each piece exists, and how you — human or AI — can rebuild it from your own corpus. No API keys. No cloud inference. Just a corpus, a compiler, and a static site.

## How the idea evolved

This did not appear fully formed. It is the fifth step in a line of reasoning that has been running on this blog for a week.

- **2026-07-11 — [Compiling Human Knowledge Into Static Semantic Artifacts](/blog/2026-07-11-knowledge-compiler-compiling-human-knowledge-into-static-semantic-artifacts).** The seed idea: a *knowledge compiler* that parses a corpus, builds intermediate representations, runs passes, and emits static, versioned artifacts — so the runtime does cheap lookups instead of re-reasoning.
- **2026-07-12 — [Compile-Time AI: Knowledge Compiler Architecture](/blog/2026-07-12-compile-time-ai-knowledge-compiler-architecture).** The architecture crystallized: deterministic passes first, model-assisted passes second (and gracefully degrading when no model is present), content-hashed outputs, and a hard honesty rule — the build fails loudly on invalid or cyclic prerequisite graphs rather than inventing confidence.
- **2026-07-14 — [The Recursive Research Compiler SDK](/blog/2026-07-14-recursive-research-compiler-knowledge-compiler-sdk).** The compiler became a reusable SDK: a typed intermediate representation (`ConceptNode`, `RelationshipEdge`), a pass registry with a Kahn-scheduled DAG, and a batching strategy for large corpora.
- **2026-07-15 — [I Compiled My Blog Into a Decision Graph](/blog/2026-07-15-compiling-my-blog-into-a-decision-graph).** The first *visual* proof: 153 posts → 1,513 facts, 436 decisions, a live 3D graph. Compiling memory beat retrieving it. But that demo read a single `dataset.json` and leaned on a heavier runtime.
- **2026-07-16 — *This post.* The Explorer.** Take the compiler, point it at a *declared* corpus (not just scraped prose), and emit a curriculum — a structured, prerequisite-ordered map of concepts — then serve it as a **fully static, prerendered site** with **zero runtime inference**. The artifact is not just visualized; it is *navigable as a website*.

The thread is unbroken: *reason once, emit static, let the runtime be cheap, keep it sovereign and inspectable.* The Explorer is the version where "static artifact" means "a website a human can read and descend through," not just "a JSON file a graph reads."

## What it is

The Explorer is two layers:

1. **A compile-time curriculum compiler** (pure Python, no heavy dependencies). It reads a corpus of *declared concept specs* and blog posts, builds a typed intermediate representation, runs deterministic passes, and emits a **content-hashed curriculum artifact** — concept store, search index, learning paths, and graph views.
2. **A static Next.js explorer app** that consumes that artifact. Every concept page is prerendered at build time. Navigation, the knowledge graph, search, and learning paths are all computed from the artifact. Nothing calls a model when you read it.

The compiled result, deterministically, from 43 declared concept specs + 4 blog posts:

| Artifact | Count |
|---|---|
| Concepts | **74** |
| Edges (relationships) | **437** |
| Learning paths | **4** |
| Max descent depth | **8** |
| Prerequisite gaps | **0** |

Zero gaps means the compiler proved the prerequisite DAG is acyclic and every concept is reachable — a guarantee no RAG system gives you.

## The architecture, in one diagram

```
        corpus/                         compiler/                      apps/explorer/
  ┌──────────────────┐          ┌──────────────────────┐        ┌──────────────────────┐
  │ specs/*.yaml     │          │ ir.py  (typed IR)    │        │ lib/curriculum.ts    │
  │ blog/*.md        │ ───────► │ passes_framework.py  │ ─────► │   (browser fetch)    │
  └──────────────────┘          │ cli.py → emit        │   cp   │ app/** (prerendered) │
                                 └──────────────────────┘        └──────────────────────┘
                                            │                               ▲
                                            ▼                               │
                                   public/curriculum/  ◄───────────────────┘
                                   (gitignored, regenerated at build)
```

The key move: **the compiler and the app are decoupled by a static file boundary.** The compiler writes JSON; the app reads JSON. Neither imports the other. That boundary is what makes the whole thing reproducible and sovereign — you can swap the compiler, the corpus, or the frontend independently.

## The recipe (reconstruct it yourself)

### 0. Prerequisites
- Python 3.9+ (the compiler uses only the standard library — no `pip install`).
- Node 22+ (for the Next.js app).
- A corpus. Start with a handful of YAML concept specs; add prose later.

### 1. Define a typed intermediate representation
Everything flows through one contract. `ConceptNode` carries `id`, `title`, `kind`, `summary`, `contract` (what_is_it / why_exists / how_it_works / edge_cases), `prerequisite_ids`, `tags`, `abstraction_level`, `source`. `RelationshipEdge` carries `source`, `target`, `type`, `weight`. The IR is the stable anchor — change the UI or the passes, but never break the contract, or the build refuses.

### 2. Write a pass framework with a real scheduler
Passes declare their inputs and outputs as edge *types* (`KIND_PREREQ`, `KIND_RELATED`, …). A scheduler topologically sorts them (Kahn's algorithm) so a pass never runs before its inputs exist. If the graph of passes has a cycle, the build fails loudly. This is the "honesty guard": the system cannot produce a silently-wrong artifact.

### 3. Make the core deterministic; let the model degrade
Pass 01–08 run with **no model**: ingest, normalize, extract-from-specs, link, infer prerequisites, optimize the curriculum, emit. A model is *optional* enrichment (pass 03 can distill facts from blog prose if a local LLM is available). If none is present, the build still succeeds and emits the declared curriculum. Determinism first; inference second.

### 4. Emit content-hashed artifacts
The emitter writes `concept-store.json`, `search-index.json`, `learning-paths.json`, and `graph-views/*.json`. Each file is hashed into a `manifest.json`. Content-addressing means a changed corpus produces changed hashes — you can see exactly what a corpus edit moved, and you can diff artifacts in git (even though the build output itself is gitignored).

### 5. Build the static frontend that only reads
The Next.js app has two loader paths:
- **Server components** read the artifact from disk at build time (`fs`) to prerender every concept page.
- **Client components** fetch the same JSON at runtime from `/curriculum/` — but only for the interactive graph and search. No model. No API route.

Crucially, the frontend is a **consumer**, not a participant. It cannot alter the knowledge; it can only navigate it.

### 6. Regenerate the artifact inside the build
The artifact is gitignored (it is derived, not source). So the build script runs the compiler *first*, then `next build`:

```bash
python3 -m compiler.cli build --corpus corpus --out build --version v1
cp -R build/v1/. public/curriculum/
npx next build
```

This is the single most important deployment detail: **on Vercel, the corpus and compiler travel with the app, and the artifact is rebuilt from them at build time.** Nothing is hand-authored; the site is the compiled corpus.

### 7. Deploy as a normal Next.js app (not a static export)
A subtle but real trap: `output: "export"` + `trailingSlash` makes Vercel mis-serve the root (`/` 404s). The fix is to **drop the static export and let Vercel serve the app natively** — all pages are still prerendered via `generateStaticParams`, so read-time is still zero-inference, but routing works. Set the project **Root Directory = `apps/explorer`** so Vercel finds `next` in the right `package.json`.

## What it teaches

- **The loop is the product.** The Explorer is the loop — corpus → compiler → artifact → site — made visible. Open any concept and you are reading the output of a pipeline that ran once.
- **Compiling beats retrieving.** There is no vector store, no top-k, no per-query LLM call. The reasoning cost was amortized across every future reader.
- **Honesty is a build failure, not a footnote.** Invalid or cyclic prerequisite graphs abort the build. The app shows real edge counts, not synthesized confidence.
- **Sovereignty is a file boundary.** The corpus is yours, the compiler is local, the artifact is static and versioned. No cloud call is required to read your own knowledge.

## Try it

1. Clone [the repo](https://github.com/kliewerdaniel/sovereign-knowledge-compiler-explorer).
2. Run `./build.sh` (or `bash apps/explorer/scripts/build.sh`). It compiles the bundled corpus and builds the site into `apps/explorer/.next`.
3. Open [skce-explorer.vercel.app](https://skce-explorer.vercel.app/). Start at the root concept. Click a prerequisite. Descend.
4. To make it yours: edit `apps/explorer/corpus/specs/*.yaml`, rerun the build, redeploy. Your knowledge becomes a website.

The compiler that built this post's demo is open source. The corpus that fed it is in the repo. The recipe is above. Reconstruct it, point it at your own writing, and watch your arguments become a map you can walk.

*The loop is the product. This is what it looks like when the loop compiles itself into something a human can read.*
