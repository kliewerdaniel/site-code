---
author: Daniel Kliewer
canonical_url: /blog/2026-07-21-compiling-medical-evidence-clinical-research-compiler
date: 07-21-2026
description: "How to compile medical guidelines, trials, and literature into a provenance-tracked, queryable Clinical Knowledge Artifact — and deploy a live evidence explorer to Vercel — by extending the Research Compiler Agent SDK into a Clinical Research Compiler."
layout: post
title: 'Compiling Medical Evidence: A Clinical Research Compiler That Turns Guidelines and Trials Into a Queryable Knowledge Artifact'
og:description: "Extend the Research Compiler Agent SDK into a Clinical Research Compiler: treatments, evidence grades, treatment conflicts, and guideline evolution — deployed as a live Vercel explorer."
og:title: 'Compiling Medical Evidence: A Clinical Research Compiler'
og:type: article
og:url: /blog/2026-07-21-compiling-medical-evidence-clinical-research-compiler
image: "/images/12092025/uncensored-ai-chatbot-architecture-diagram.png"
tags:
  - ai-agents
  - compile-time-ai
  - knowledge-compiler
  - knowledge-graph
  - local-first-ai
  - provenance
  - reproducible-ai
  - ollama
  - research-compiler
  - clinical-ai
  - sovereign-ai
draft: false
---

# Compiling Medical Evidence: A Clinical Research Compiler That Turns Guidelines and Trials Into a Queryable Knowledge Artifact

*By Daniel Kliewer · 2026-07-21*

> This is a working build of the [**Clinical Research Compiler**](https://github.com/kliewerdaniel/clinical-research-compiler-sdk): the
> [Research Compiler Agent SDK](https://github.com/kliewerdaniel/research-compiler-agent-sdk)
> evolved into a medicine-specific tool. It compiles real guidelines, trials, and
> reviews into one provenance-tracked **Clinical Knowledge Artifact**, and
> renders it as a live explorer at
> [clinical-evidence-explorer](https://clinical-evidence-explorer.vercel.app).

## 1. The shift: from "retrieve papers" to "compile evidence"

Traditional medical AI looks like this:

```bash
Question → Retrieve Papers → Generate Answer
```

That works once. The next question re-reads the web from scratch, re-embeds
the same PDFs, and re-derives what was already known — and nothing is
auditable, because the "answer" has no citeable substrate.

The Research Compiler flips the shape:

```bash
Medical Literature → Knowledge Compilation → Evidence Graph → Research Agent → New Discoveries → Updated Knowledge
```

The goal is **not** to replace doctors or researchers. It is to *reduce the
cost of understanding the knowledge they need* — and to make that
understanding **auditable**: every fact traces to a source, and every source
carries an authority score. This is the same "Compile-Time Intelligence"
move I wrote about for general research, specialized for the clinical domain.

## 2. Why clinical evidence is the right first vertical

The clinical literature is a near-perfect target for a compiler:

- It is **structured by convention** — guidelines, trials,
  systematic reviews, case reports — so extraction is tractable.
- It already speaks in **grades and strengths** (GRADE, strength-of-evidence),
  which a compiler can make *explicit and queryable*.
- **Conflicts are the product.** HbA1c targets differ between NICE, WHO,
  ADA, and CDC. First-line therapy recommendations shift as SGLT2
  inhibitors and GLP-1 agonists accumulate outcome data. A compiler that
  surfaces those conflicts *with provenance* is genuinely useful.
- It rewards **provenance** more than any other domain — a claim without a
  citable guideline is clinically worthless.

So we picked a solvable, high-value, well-scoped problem: **Type 2 diabetes
management** — compile the guidelines and literature into a graph of
treatments, evidence grades, treatment conflicts, and guideline evolution.

## 3. Two repos, one pipeline

The deliverable is split the way a real toolchain should be:

- **Repo A — `clinical-research-compiler-sdk`**
  ([github](https://github.com/kliewerdaniel/clinical-research-compiler-sdk)):
  the *evolved* SDK. It keeps the v1 engine (pass registry, orchestrator,
  content-hashed artifact store, local-first inference client) and adds a
  **heavily customized clinical layer**.
- **Repo B — `clinical-evidence-explorer`**
  ([github](https://github.com/kliewerdaniel/clinical-evidence-explorer),
  [live](https://clinical-evidence-explorer.vercel.app)): the generated
  Next.js app that *renders* the compiled artifact. It is rebuilt from
  Repo A's explorer generator on every compile. The app is a window; the
  artifact is the product.

This separation matters: the *intelligence* lives in the compiled
`clinical-knowledge-artifact.json`, not in the UI. You can re-skin, re-deploy,
or query the artifact without touching the compiler.

## 4. What the clinical layer adds over v1

| Pass | Produces | Type | Clinical purpose |
|------|----------|------|----------------|
| `discovery` (patched) | `provenance-ir` | **deterministic** | medical source-authority overlay + evidence-angled discovery queries |
| `pass-c1-therapies` | `treatment-ir` | model | treatment/drug/class/procedure database |
| `pass-c2-evidence` | `evidence-ir` | model | A–D evidence grades + 5-dimension rubric |
| `pass-c3-guideline-timeline` | `guideline-timeline-ir` | model | dated recommendation deltas |
| `pass-c4-treatment-conflicts` | `treatment-conflict-ir` | model | conflicts *between* treatments |
| `pass-r9-clinical-assemble` | `clinical-knowledge-artifact` | **deterministic** | re-label + `clinical_summary` |
| `pass-r10-explore-clinical` | `clinical-evidence-explorer` | **deterministic** | specialized Next.js app |

Every clinical pass is **declared, not hardcoded**. Drop a directory with a
`pass.yaml`, and the existing `PassRegistry` discovers it and the
`Orchestrator` plans the dependency graph around it. Adding another clinical
dimension — biomarker↔outcome links, rare-disease case clustering — is one
more directory, zero core edits.

The evidence grade uses a transparent, decomposable rubric rather than a
black-box score:

```bash
grade = f(study_design, consistency, population_size, guideline_alignment, safety_margin)
```

so a grade of **A** means "multiple guideline bodies + RCT support," not
"the model felt confident."

## 5. The run (copy-paste)

> Local-first. Inference runs on **Ollama** (`llama3.1:8b` for chat,
> `nomic-embed-text` for embeddings) at `localhost:11434`. No cloud API,
> no key.

```bash
# 0. dodge a shell PYTHONPATH leak (agent/host envs preload a venv)
export SDK=~/Projects/clinical-research-compiler-sdk
cd "$SDK"

# 1. venv + pinned deps (jsonschema==4.17.3 avoids the referencing/rpds conflict)
/opt/homebrew/bin/python3.12 -m venv .venv
env -u PYTHONPATH .venv/bin/python -m pip install -r requirements.txt

# 2. DISCOVER real clinical sources (--clinical = medical authority overlay)
env -u PYTHONPATH .venv/bin/python researchc.py discover build-t2d \
  --objective "Type 2 diabetes management" \
  --seeds "https://www.nice.org.uk/guidance/ng28" \
  --clinical --max 10

# 3. COMPILE to the clinical artifact (Ollama model passes)
env -u PYTHONPATH .venv/bin/python researchc.py compile build-t2d --local

# 4. EXPLORE -> generates the Next.js app
env -u PYTHONPATH .venv/bin/python researchc.py explore build-t2d
# -> build-t2d/clinical-evidence-explorer/

# 5. sanity-check
env -u PYTHONPATH .venv/bin/python -c \
  "import json;d=json.load(open('build-t2d/clinical-knowledge-artifact.json'));print(d['clinical_summary'])"
```

## 6. What the real run produced

Objective: *Type 2 diabetes management* — 10 live sources (NICE, NIDDK,
ADA, AACE, PMC, EMJ, Wikipedia) discovered with the clinical authority
overlay, compiled on `llama3.1:8b`:

- **6 treatments** extracted and stratified: Metformin (first-line, grade A),
  SGLT2 inhibitors (grade A), GLP-1 receptor agonists (grade A),
  sulfonylureas / DPP-4 inhibitors / TZDs (grade B).
- **5 treatment conflicts**, including a **high-severity head-to-head**:
  *SGLT2 inhibitors vs GLP-1 receptor agonists are both recommended
  first-line* — the kind of tension a clinician actually needs surfaced.
- **Guideline evolution**: the HbA1c target shifted
  (`<7%` → `less than 7%`), and SGLT2 inhibitors / Metformin were
  promoted to first-line in recent editions.
- **Corpus confidence 0.581** — a *number*, not a vibe, computed from
  authority × corroboration × recency × (1 − contradiction-rate).

That is the whole point: the compiler did not "summarize papers." It built a
structured, graded, conflict-aware evidence graph that a human can audit and
query — and it is reproducible. Re-running with the same URLs and model
reuses every unchanged artifact.

## 7. Deploying the explorer to Vercel (Repo B)

```bash
# clone the empty Vercel repo and drop the generated app in
git clone https://github.com/kliewerdaniel/clinical-evidence-explorer
cp -R build-t2d/clinical-evidence-explorer/* clinical-evidence-explorer/
cd clinical-evidence-explorer
git add -A && git commit -m "explorer" && git push -u origin main

# deploy (the app's scripts/copy-artifact.mjs copies the artifact into data/ at build time)
vercel deploy --prod --project clinical-evidence-explorer --archive tgz
```

The explorer embeds `clinical-knowledge-artifact.json` (no server, no API
at runtime) — it is a static renderer of a compiled artifact.

> **Build gotcha worth recording:** Next 14 / SWC rejects `return <div>`
> on a single line and chokes on a block-element close immediately followed
> by a map/arrow `))` (`</div>))`). The generator writes attributes with
> single quotes and splits the `))` onto its own line; the build transform
> (`_jsx_attr_to_double_quotes` + `_split_block_close_parens`) fixes both.
> `framer-motion`'s `<motion.div>` as a block element also fails this build
> config, so the explorer drops it (animations are cosmetic).

## 8. Reproducibility is the product

- Every artifact is **content-hash cached**; `compile --incremental` reuses
  unchanged work.
- Every fact carries a `source_id` that joins back to the provenance
  table (URL, author, fetch timestamp, content hash).
- The citation-quality pass turns that into a **measurable corpus confidence**.
The compiled `clinical-knowledge-artifact.json` *is* the auditable
substrate. The explorer is just a renderer.

## 8b. Iteration 2: from 58% to 76% confidence, and a real UI

The first compile landed at **0.58 corpus confidence** — not because the
evidence was weak, but because two design choices in the confidence pass
were *over-punishing*, plus one model-output bug:

1. **Corroboration was exact-string only.** Differently-phrased
   recommendations from different guidelines (NICE "Metformin is
   first-line" vs ADA "Metformin is the main first-line medication")
   never matched, so corroboration sat at 0.00 on 8 of 10 sources —
   with a 0.35 weight, that alone capped confidence.
2. **Contradiction was scored at the source level.** A source with a
   single claim was marked 100% "contradicted" if that one claim's text
   matched *either side* of *any* contradiction pair.
3. **`pass-r2` emitted false contradictions** — unrelated sentence pairs
   ("Type 2 diabetes is chronic…" vs "Metformin is a biguanide…") that
   poisoned the contradiction term.

The fix was a legitimate SDK iteration, not a fudge:

- **Paraphrase-aware corroboration** (token-Jaccard ≥ 0.5) so
  re-worded recommendations from different guidelines corroborate.
- **Claim-level contradiction attribution** — only a source's claims
  that are *actually in* a real contradiction count, not all-or-nothing.
- **Treatment-agreement corroboration** — a source that backs a
  treatment other guideline sources *also* back (Metformin first-line in
  NICE + ADA + AACE) earns high corroboration. This is the honest signal
  a richer corpus was meant to surface.
- A **same-subject filter on `pass-r2`** dropped the false positives, and
  a **tightened `pass-c4` prompt** stopped co-recommended treatments
  being reported as conflicts (65 false positives → 7 real ones).

We also **enriched the corpus to 16 high-authority sources** (added WHO,
AHA-professional, Medscape, BMJ Best Practice, EMJ ×2, Ovid, ADA
Standards) so recommendations genuinely converge. Result: **0.58 → 0.76**,
all 16 sources at 0.00 contradiction rate, with 13 treatments and 7
real treatment conflicts.

### The UI: Meta's Astryx design system

The original explorer was hand-rolled Tailwind. For the upgrade I adopted
[`facebook/astryx`](https://github.com/facebook/astryx) — Meta's
open-source design system (150+ accessible components, brand-level
theming, dark mode, MIT). Crucially, Astryx **ships pre-built CSS and
typed React components**, so there is no StyleX build plugin to wire up:
the app imports three CSS files and wraps the tree in `<Theme>` +
`<LinkProvider>`.

Because Astryx requires React 19, I bumped the explorer from Next 14 /
React 18 to **Next 15 / React 19** (the clean path its own example uses).
The generator (`pass-r10-explore-clinical`) now emits the Astryx app
directly — `SideNav`, `Card`, `Badge` (with semantic
`success`/`info`/`warning`/`error` variants for grades and severity),
`Button` grade filters, `TextInput` search, `Heading`/`Text`/`Grid`. The
compile loop now yields a polished, accessible UI automatically, keeping
the "the loop is the product" architecture. The deployed explorer is live
at `clinical-evidence-explorer.vercel.app`.

> **Build gotcha (Iteration 2):** `@astryxdesign/core` peer-requires
> `react >= 19` and `@stylexjs/stylex`. Stay on Next 15 / React 19 — a
> `--legacy-peer-deps` force-install onto React 18 is fragile. Astryx's
> `Badge` takes a `label` prop (not children) and `Card` has no
> `CardHeader` subcomponent (use `<Heading>` inside), and `TextInput`
> requires a `label` prop; these are the three import-API details that
> will break a blind port.

## 9. The pattern, restated

> **Compile-Time Intelligence** — move semantic computation from runtime
> inference into reusable, queryable knowledge artifacts.

We stopped re-parsing source code on every program run. We should stop
re-reading the medical literature on every clinical question. Compile it once.
Grade it. Surface the conflicts. Recompile only when the guideline frontier
moves.

The Clinical Research Compiler is a working instance of that pattern for
medicine — local-first, provenance-tracked, reproducible, and deployed.

## 10. Try it / replicate it

- SDK (Repo A): `github.com/kliewerdaniel/clinical-research-compiler-sdk`
- Live explorer (Repo B): `clinical-evidence-explorer.vercel.app`
- The SDK ships a bundled `skills/clinical-research-compiler/SKILL.md`
  that reproduces this entire run for a new agent or human.

---

*This project extends the [Research Compiler Agent SDK](https://github.com/kliewerdaniel/research-compiler-agent-sdk) (v1) and the [Knowledge Compiler SDK](https://github.com/kliewerdaniel/knowledge-compiler-sdk), and builds on the "intelligence is the accumulated decisions" philosophy from Sovereign AI.*
