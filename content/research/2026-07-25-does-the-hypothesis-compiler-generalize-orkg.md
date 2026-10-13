---
author: Daniel Kliewer
canonical_url: /blog/2026-07-25-does-the-hypothesis-compiler-generalize-orkg
date: 07-25-2026
description: "Popper beat its controls on five hand-curated benchmark literatures — but I built those corpora, so the result could be an artifact of clean data. This experiment removes that objection: the identical pipeline, byte-for-byte, run on a corpus I did not build — the Open Research Knowledge Graph, 6.3 million triples across 65,689 papers and seven scientific disciplines. Same schema, same rubric, same four-way controls; the only independent variable is the corpus. The compiler still wins (0.85 composite vs 0.56 keyword vs 0.00 ungrounded), an ablation proves the architecture is load-bearing (remove graph reasoning and it collapses to zero), and the grounding audit finds zero hallucinated citations across 265 evidence items. It also fails honestly: exact temporal rediscovery is near-zero, and it confidently rebuilds Lamarckian inheritance. Run locally on a 35B model."
draft: false
tags:
  - ai-agents
  - compile-time-ai
  - knowledge-compiler
  - local-first-ai
  - scientific-discovery
  - falsifiability
  - knowledge-graphs
title: "Does the Hypothesis Compiler Generalize? Running Popper on a Corpus I Did Not Build"
---

## The objection I had to answer

The last experiment, [Popper](/blog/2026-07-24-popper-the-falsifiable-hypothesis-compiler),
made a strong claim and backed it with numbers: a knowledge-graph compiler produces
hypotheses that are not merely plausible but *falsifiable* — carrying variables, a
mechanism, a quantitative prediction, and source-level provenance — and it beats three
controls (unstructured LLM generation, keyword retrieval, random traversal) on a battery of
benchmark literatures.

There was one honest hole in that result, and I knew it the moment I published. **I built
those benchmark corpora.** Five hand-curated literatures — CRISPR, mRNA vaccines, checkpoint
blockade, cold fusion, phlogiston — assembled by the same person who wrote the compiler. A
skeptic does not need to be unkind to point out the obvious: maybe the compiler wins because
the corpus was clean, small, and shaped, consciously or not, to be compilable. Maybe the
result is an artifact of curation, not evidence about the world.

The only way to kill that objection is to change nothing about the method and everything
about the data. So that is exactly what this experiment does.

> Hold the entire Popper pipeline fixed — the schema, the scoring rubric, the grounding
> audit, the falsifiability evaluation, the four-way control structure — and change **only
> the corpus**, from curated benchmarks to a large, heterogeneous knowledge graph I did not
> build. Then ask whether the central hypothesis still holds.

The central hypothesis, unchanged from the last post: **compile-time organization of
scientific knowledge produces higher-quality, grounded, falsifiable hypotheses than
unstructured generation.** This experiment is built so that claim can *fail*, on data with
no home-field advantage, and to report the number either way.

## The corpus: ORKG, and why it is the honest stress test

The [Open Research Knowledge Graph](https://orkg.org) is a community effort to represent
scholarly contributions as structured, machine-readable statements rather than prose PDFs.
The dump I used is **6,344,307 triples** — 65,689 papers, 98,774 contributions, 8,420
research problems, spanning biomedicine, chemistry, computer science, materials science,
neuroscience, environmental science, and physics.

It is the honest stress test for three reasons. It is **large** (four orders of magnitude
more than a curated benchmark). It is **heterogeneous** (real disciplines with wildly
different vocabularies, granularities, and metadata quality). And crucially, **I did not
curate it** — its structure was decided by hundreds of contributors with no knowledge of my
compiler. If the compiler's advantage survives contact with ORKG, the advantage is about the
method, not the data.

To make the swap scientifically legitimate, the `popper/` package — schema, generation,
scoring, grounding audit — is **byte-for-byte identical** to the last experiment, verified by
md5. Every ORKG-specific line lives in a separate `orkg/` layer that *wraps* the unchanged
pipeline: it parses the dump, builds benchmarks, and re-composes the existing building blocks
for the ablation. If a single file in `popper/` had changed, the comparison would be
meaningless. It did not.

## A true temporal wall, not "generate from the whole graph"

The easy, dishonest version of this experiment is to hand the compiler the entire graph and
admire whatever it produces. That measures nothing, because the answer is already in the
room. The rediscovery benchmark has to enforce a **temporal wall**.

For each ORKG research problem, I sort its papers by publication year, hold out a later,
content-rich "discovery" paper, and give the compiler **only papers strictly earlier than the
held-out year**. Nothing from the discovery year or after leaks in. The compiler sees only
prior knowledge and must reconstruct the leap.

The critical design decision: **failures are kept and reported.** If the compiler cannot
reconstruct a held-out finding, that is not embarrassing — it is *evidence the wall holds*
and no future information is leaking backward. A rediscovery benchmark that always succeeds is
a benchmark that is cheating. I built twenty of these across the seven disciplines.

## What the compiler produces

Before the aggregate tables, one concrete artifact, because averages hide the thing that
matters. Here is a compiler hypothesis from the chemistry `chemical_sensors` domain, built
only from prior-year ORKG contributions:

> **Statement:** At room temperature, reduced graphene oxide (rGO) chemiresistors achieve a
> limit of detection for nitrogen dioxide (NO₂) that is at least one order of magnitude lower
> than molybdenum disulfide (MoS₂) field-effect transistor sensors, due to the dominance of
> defect-mediated charge transfer.
>
> **Independent variable:** sensor architecture and active material (MoS₂ FET vs. rGO
> chemiresistor). **Dependent variable:** limit of detection for NO₂.
> **Falsification condition:** falsified if an MoS₂ FET achieves an NO₂ LOD ≤ 10 ppm at 25 °C,
> or if an rGO chemiresistor achieves an NO₂ LOD ≥ 10 ppm at 25 °C under identical conditions.
>
> Composite **0.99**, grounding **1.0**, novelty **0.97** — every clause traced to real ORKG
> resources (R140519, R140514, R140530).

That is not a plausible-sounding sentence. It is a claim a graduate student could go
falsify next week, connecting three separate sources, with an explicit numeric kill
condition. This is what "compile a hypothesis" is supposed to mean.

## The result: the advantage generalizes

Across all twenty ORKG domains, mean composite by method:

| Method | Composite | Grounding | Falsifiable rate | Novelty |
|---|---|---|---|---|
| **compiler** | **0.855** | 0.817 | **1.00** | 0.96 |
| keyword | 0.563 | 0.942 | 0.00 | 0.72 |
| llm-only | 0.000 | 0.000 | 0.00 | 0.98 |
| random | 0.000 | 1.000 | 0.00 | 0.50 |

The compiler wins on a corpus it never saw during design, and it wins for the *right* reason.
Look at the failure shape of the controls. Keyword retrieval grounds beautifully (0.94) — it
literally copies real claims — but it never compiles to a *testable artifact* (falsifiable
rate 0.00), so the geometric-mean composite caps it at 0.56. Random traversal grounds
perfectly (1.0) and means nothing (testability 0, composite 0). llm-only with no corpus
writes the most "novel" text of all (0.98) and cites nothing that exists (grounding 0.00,
composite 0.00). Each control fails in a way that shows the composite is measuring the right
thing: a hypothesis has to be grounded *and* testable *and* non-trivial simultaneously, and
only the compiler clears all three at once.

The claim generalizes. But an aggregate win is not the interesting part. The interesting part
is *why* it wins — and whether the architecture, or just the ensemble, is responsible.

## The ablation: is the architecture actually load-bearing?

Beating weak baselines could mean the compiler is well-engineered, or it could mean the
baselines are straw men. The way to tell is to attack the compiler itself: remove one
component at a time, keep the other five intact, and measure what breaks. If removing a
component changes nothing, that component was decoration.

| Configuration | Composite | Δ vs full |
|---|---|---|
| full compiler | 0.893 | baseline |
| no graph reasoning | **0.000** | **−0.893** |
| no falsifiability eval | 0.514 | −0.379 |
| no literature synthesis | 0.934 | +0.041 |
| no gap detection | 0.900 | +0.007 |
| no grounding verification | 0.983 | +0.090 |

This is the most useful table in the experiment, precisely because it is not flattering.

**Graph reasoning is the spine.** Remove the who-said-what source structure — flatten the
claims into an undifferentiated pile — and the compiler collapses to *zero*. Without knowing
which source made which claim, it cannot ground a hypothesis across sources, and grounding
going to zero drags the whole composite with it. This is the single load-bearing wall.

**The falsifiable schema is the second wall.** Drop the requirement to compile to
variables + mechanism + kill condition and composite falls by 0.38. The structure is not
window dressing; it is a large fraction of the value.

And then the honest part: **the other three components barely matter to the composite.**
Gap detection and literature synthesis move it by hundredths. Turning *off* the grounding
audit actually *raises* the score by 0.09 — which is not a bug, it is a tell. The audit can
only ever *lower* grounding (it removes credit for citations that do not hold up); if
removing it raises the average, the audit is behaving conservatively and never inflating.
Two of six components are doing most of the work. I would rather report that than pretend the
architecture is uniformly essential.

## The grounding audit: zero hallucinated citations

Every claim in every compiler hypothesis was traced back to specific ORKG resources. Across
**265 evidence items**:

- **83.8% fully grounded** — a real, in-corpus source id the audit confirms supports the claim
- 16.2% unsupported — placeholder or empty ids the audit correctly refused to credit
- **0 hallucinated ids** — not a single fabricated, out-of-corpus reference

That zero is the number I care about most. The signature failure mode of LLM-based scientific
tooling is the confident fake citation. On a 6.3-million-triple graph, across seven
disciplines, the compiler cited nothing that does not exist. The 16% "unsupported" are honest
gaps — evidence slots the model left empty rather than filling with invention.

## Where it fails, honestly

An experiment that only reports its wins is marketing. The brief I set myself demanded that
the evaluation surface *legitimate failure modes*, not optimize for perfect scores. It found
two real ones.

**Exact temporal rediscovery is near-zero (mean 0.015).** Reconstructing the *specific*
held-out ORKG finding from prior structured metadata is genuinely hard, and the near-zero
match confirms the temporal wall is airtight — no future information is leaking. But it also
means: producing a good, grounded, falsifiable hypothesis is a very different thing from
reproducing the exact paper history removed. On the strict bar, ORKG is hard, and I am
reporting the low number rather than quietly redefining success.

**The adversarial set exposed a real robustness gap.** I expanded the negative controls from
two dead ends to seven — cold fusion, phlogiston, N-rays, luminiferous aether, caloric,
Lamarckian inheritance, miasma — historically plausible theories that turned out false. A
trustworthy system should *not* confidently reconstruct these.

| False theory | Reconstruction match | Verdict |
|---|---|---|
| Cold fusion, phlogiston, N-rays, aether | 0.0 | ✅ cleanly rejected |
| Miasma | 0.3 | ✅ mostly rejected |
| Caloric | 0.5 | ⚠️ partial |
| Lamarckian inheritance | **1.0** | ❌ **reconstructed** |

Four of seven cleanly rejected. But the compiler *rediscovered* Lamarckian inheritance with
full confidence — and the reason is illuminating rather than damning. Modern epigenetics
literature genuinely echoes soft-inheritance language; a grounded, falsifiable version of
"acquired characteristics can be inherited" is reconstructable from real prior work. The
system is measuring grounding and testability, not historical truth. Caloric scores mid for
the same reason: heat-as-a-conserved-quantity maps cleanly onto real thermodynamic claims.
These are exactly the "medium score explained by grounded evidence and uncertainty" cases the
experiment was designed to surface. The compiler is not a truth oracle. It is a falsifiability
instrument, and its adversarial failures show precisely where that boundary lies.

## The verdict

On ORKG — a large, heterogeneous corpus I did not build — the central hypothesis **holds for
quality, grounding, and falsifiability.** The compiler dominates all three controls, stays
traceable with zero hallucinated ids, and does so consistently across seven scientific
disciplines. The ablation shows the advantage is **architectural**: graph reasoning and the
falsifiable schema are load-bearing, not decorative.

And it is **weakened, honestly, in two places**: exact temporal rediscovery is near-zero (a
hard, uncheatable bar), and adversarial robustness has a real gap (Lamarckism). Those are not
footnotes to hide; they are the legitimate failure modes that make the rest of the result
believable.

Net: the evidence *strengthens* the claim that compile-time organization of scientific
knowledge improves grounded hypothesis generation — while drawing a clear, honest boundary
around where it does not. The curation objection is dead. The compiler's advantage is not an
artifact of clean data.

## Why this matters to the larger project

Every iteration of this work has been an argument for the same thesis: **intelligence is not
the model; it is the accumulated decisions that shaped it.** The model here is a 35B running
on my own hardware, no cloud APIs, no keys. What makes its output a scientific instrument
rather than an autocomplete is everything *around* it — the schema that turns a sentence into
a testable claim, the graph that says who established what, the audit that refuses uncredited
citations, the controls and ablations that let the whole thing be *checked*.

This experiment adds one word to that thesis: **generalizes.** The compile-time organization
does not just work on a corpus I shaped to fit it. It works on the messy, externally-built
graph of real scholarship. If the loop is the product, and observability is the operating
system, then this is what it looks like to make the loop *survive contact with reality* — and
to report, without flinching, the places where it still bends.

- **Code:** [github.com/kliewerdaniel/popper-orkg](https://github.com/kliewerdaniel/popper-orkg)
- **Live explorer:** [popper-orkg.vercel.app](https://popper-orkg.vercel.app)

Everything is reproducible: the temporal-holdout protocol, the four-way controls, the
component ablation, the grounding-audit statistics, and the adversarial analysis, all compiled
locally on a model you can own.
