---
author: Daniel Kliewer
canonical_url: /blog/2026-07-23-validating-at-scale-orkg
date: 07-23-2026
description: "We stress-tested the Scientific Question & State Compiler against real, large-scale data: 6.3M ORKG RDF triples distilled into a 300-document corpus from the 728-paper 'Empirical Research in Requirements Engineering' domain. 881 claims, 13 ranked questions, a versioned state of the field — compiled locally on a 35B model. The tool generalizes beyond the 3-doc toy corpus. Here is what broke, what we fixed, and what it means."
draft: false
tags:
  - ai-agents
  - compile-time-ai
  - knowledge-compiler
  - local-first-ai
  - scientific-state-compiler
title: "Validating at Scale: The Compiler Meets 6.3 Million RDF Triples"
---

The compiler was born on three hand-written documents. That was enough to prove
the shape of the idea — Pass 2 maps what we don't know, Pass 4 versions what we
do, and the loop closes them. But a tool that only works on toy input isn't a
tool. It's a demo.

So we pointed it at real, large-scale data. Not a curated sample — the full
**ORKG** (Open Research Knowledge Graph) RDF export: **6,344,307 triples**,
~897 MB of N-Triples describing papers, contributions, problems, and the
statements that connect them. The question we set out to answer: *does the
compiler generalize, or was the toy corpus hiding its assumptions?*

## From 6.3M triples to a corpus the compiler can read

ORKG doesn't hand you paragraphs. It hands you a knowledge graph where every
claim is a `(subject, predicate, object)` triple and every predicate is a
P-code. To turn that into a compiler-readable corpus we wrote two small,
local-first tools:

- **`orkg_ingest.py`** streams the entire 897 MB dump *once*, in bounded memory,
  and builds a queryable index: 14,128 predicates, 1.04M resources, 65,689
  papers, 98,774 contributions, 8,420 research problems.
- **`select_domain.py`** picks a research problem, walks its papers →
  contributions → statements, and renders each contribution as a markdown
  document with human-readable, label-resolved claims.

We chose the largest problem in the graph: **"Empirical Research in Requirements
Engineering"** — 728 papers, 766 contributions. From that we extracted **300
documents**, each a real, structured scientific claim-set drawn from ORKG's
curated knowledge. That is a ~100× scale-up from the three-doc toy corpus, and
every word came from a live scholarly knowledge graph rather than from us.

## What broke at scale (and what we fixed)

A compiler that assumes small input silently fails on large input. Three things
broke, and each fix is a legitimate scale adaptation of the existing tool — not a
rewrite.

**1. One model call per document = 300 sequential calls.** At ~2–5 minutes per
call on the 35B hardware, that's a 5-hour job that any single timeout would
destroy. We added **batched claims** (`KC_CLAIMS_BATCH`): N documents per call
instead of N calls, with each claim attributed back to its source document.

**2. A long job with no checkpoint is a liability.** A single timed-out batch
was crashing the whole run and losing all progress. We added **per-batch
checkpointing, resume, and retry**: the claims pass persists after every batch,
skips completed documents on restart, and retries a failed batch at half size
down to a single document. Kill it at batch 47; it resumes at 48.

**3. The contradiction detector returned zero.** On 881 claims in one shot, the
model's chain-of-thought overflowed and the JSON failed to parse — so the pass
reported 0 contradictions, which is almost never true of a real field. We added
**sharded contradiction detection** (`KC_CONTR_SHARD`): scan windowed blocks of
claims, re-base indices into the global list, and merge. After the fix, the
detector found genuine disagreements — e.g. one contribution scopes
Crowd-based RE to Elicitation/Analysis/Validation while another expands it to
include Evolution and Prioritization.

None of these were "the idea didn't work." They were the difference between a
tool and a demo.

## What the compiler actually produced

Run end-to-end, locally, on the 35B model, against the 300-document ORKG
corpus:

- **881 claims** extracted across 300 contributions
- **2 contradictions** detected (genuine scope disagreements)
- **6 gaps** and **7 silence topics** — the things the corpus implies but does
  not state
- **13 ranked questions**, 4 flagged controversial
- **Pass 4 state**: 7 accepted / 4 uncertain / 3 contested models, 3 logged
  conflicts, 12 open questions
- **The closing loop** ran one iteration: it targeted the open question *"What
  is the definitive operational scope of Crowd-based Requirements
  Engineering?"*, generated an evidence brief, added it as a new source, and
  Scientific Git committed **version 2** with a real diff.

The output is not a summary someone wrote. It is a structured, diffable,
revertible model of a research field — produced by compiling that field's own
curated knowledge graph.

## Two live artifacts, one tool

We deployed the validation run as a **new, independent Vercel project** so the
original Question Compiler explorer stays live:

- Original (3-doc toy): https://scientific-question-compiler.vercel.app
- **ORKG validation (300-doc, real data): https://scientific-question-compiler-orkg.vercel.app**

Both run the same compiler. The difference is the corpus — and that difference
is the entire point. The tool behaves the same way on 300 documents drawn from a
global knowledge graph as it did on three we wrote by hand. That is what
"generalizes" means.

## Why this matters

The thesis has been steady the whole way: *if the loop is the product,
observability becomes the operating system.* A loop that only runs on toy input
isn't an operating system — it's a screenshot. Pointing the compiler at 6.3
million real triples and watching it produce a coherent, versioned state of a
728-paper field is the first evidence that the loop can run on the world's
actual scientific record, not just on our examples.

The next horizon is unattended iteration: letting the loop run on a schedule,
reading its own open questions, pulling more of the graph, re-compiling the
field one verified step further each pass — every advance diffable and
revertible. That is observability as the OS, applied to science itself.

The code, the ingestion pipeline, and the scale-hardening fixes are all pushed
to the repository. The validation run is live. The compiler is no longer a
demo.
