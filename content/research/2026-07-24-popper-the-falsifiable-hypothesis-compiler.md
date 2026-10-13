---
author: Daniel Kliewer
canonical_url: /blog/2026-07-24-popper-the-falsifiable-hypothesis-compiler
date: 07-24-2026
description: "The last experiment proved a knowledge-graph compiler survives scale. This one asks a harder question: are its hypotheses scientifically meaningful, or only linguistically convincing? Popper stops trying to make the compiler smarter and starts making it falsifiable — a strict hypothesis schema, source-level provenance, three negative controls, and a historical rediscovery benchmark where the discovery paper is removed and the system must reconstruct the leap from prior literature alone. Run locally on a 35B model: the compiler scored 0.89–0.97 composite against 0.00 for ungrounded generation, and reconstructed the CTLA-4 checkpoint-blockade and nucleoside-modified-mRNA discoveries from their prior literature — while honestly failing on CRISPR and refusing to confidently rebuild phlogiston."
draft: false
tags:
  - ai-agents
  - compile-time-ai
  - knowledge-compiler
  - local-first-ai
  - scientific-discovery
  - falsifiability
title: "Popper: Making the Hypothesis Compiler Falsifiable — Rediscovery Benchmarks, Negative Controls, and the Move From Plausible to Provable"
---

## The turn this experiment makes

The last post ended with a promise and a warning. The promise: the Scientific
Question & State Compiler survives scale — 6.3 million ORKG triples, distilled,
compiled locally, same-shaped output. The warning, which was the whole point:
**surviving scale is not the same as being correct.** A tool that generates and
scales has proven it is robust. It has not proven it is *right*.

So this experiment is not about adding features. It is about a single, harder
question:

> Are the generated hypotheses actually useful scientific hypotheses, or are
> they only linguistically convincing?

Large language models are extraordinarily good at producing plausible
narratives. That is exactly the danger. A system built on one could "succeed"
for the worst possible reason: it sounds right. The previous experiments showed
the system can generate and scale. This one determines whether it deserves to be
called a scientific instrument.

The name of this iteration says what changed. It is called **Popper**, after
Karl Popper, whose criterion of falsifiability is the spine of the whole design.
The instruction I gave myself was blunt:

> **Stop trying to make the compiler smarter. Start making it falsifiable.**

## A hypothesis is a compiled artifact

The compiler framing was always more than a metaphor, and here it does real
work. A traditional compiler turns source code into an executable that must pass
tests. Popper turns literature into a hypothesis that must pass validation:

```
Traditional compiler:   Source Code → Compiler → Executable → Tests
Popper:                 Literature  → Compiler → Hypothesis → Validation
```

The earlier iterations emitted *questions*. Popper emits *hypotheses* — and a
hypothesis is admitted only if it is **structurally falsifiable**. This is
enforced in code, not in prose. Every hypothesis must carry:

- an **independent variable** and a **dependent variable**;
- a **population / system** and a **measurement**;
- an **expected outcome** and an explicit **falsification condition** — what
  result would prove it wrong;
- a **mechanism** — the causal chain linking the variables;
- a **quantitative prediction** — a direction and a numeric magnitude window,
  with a unit and a confidence;
- and **evidence** — every supporting claim tagged with a real `source_id`.

Miss any of these and it is not a stylistic lapse. It is a **compile error**.
`Hypothesis.validate()` returns the list of them, and an artifact with a
non-empty list is not falsifiable by construction. This is the difference
between "investigate the relationship between inflammation and cognition" and
"blocking IL-6 signaling in aged mouse microglia will reduce hippocampal
inflammatory markers by more than 20% relative to controls." Only one of those
can be killed by an experiment. Only one of those is science.

The quantitative prediction is the sharpest upgrade. The system is no longer
allowed to say "X may influence Y." It must say "changing X produces a
measurable change of *this size* in Y" — even when the number is uncertain. An
uncertain prediction is falsifiable. A vague gesture is not.

## The claim under test — and how it can fail

The point of this project is not the claim "AI can generate hypotheses."
Everyone already knows that; it is not interesting. The claim is narrower and
riskier:

> **Structured knowledge compilation produces higher-quality, falsifiable
> scientific hypotheses than unstructured generation.**

A claim only means something if it can fail. So Popper runs four methods over the
*identical* corpus, so the only variable is the reasoning:

- **compiler** — the real method: grounded, structured compilation that looks
  for a connection the sources each partially support but none state directly.
- **llm-only** — the ablation: same model, same request for a falsifiable
  hypothesis, but with **no corpus**. Tests whether the knowledge actually helps.
- **keyword** — the statistics baseline: most frequent co-occurring concepts,
  templated, no LLM. Tests whether semantic reasoning beats co-occurrence.
- **random** — the noise floor: connect two random claims. Tests whether the
  compiler beats chance.

If the compiler is not clearly above all three controls, the claim fails — and
that is a real, publishable result either way. That symmetry is the whole ethic
of the experiment.

## The rediscovery benchmark

Novelty and grounding can be gamed by a confident model. The test that cannot be
gamed is history. For three real discoveries, I built a corpus from the
**prior literature that existed before the breakthrough**, with real papers and
real DOIs, and then **removed the discovery paper itself**. The question:

> Given only what was known *before*, does the compiler reconstruct the leap?

- **CRISPR-Cas9** as a programmable genome-editing tool (Jinek et al. 2012,
  held out) — from six prior papers on CRISPR immunity, crRNA guidance,
  tracrRNA, and Cas9's nuclease domains.
- **Nucleoside-modified mRNA** as a vaccine platform (Karikó & Weissman 2005,
  held out) — from prior work on mRNA delivery, TLR recognition of RNA, and the
  modified-nucleoside content of mammalian RNA.
- **CTLA-4 checkpoint blockade** as cancer immunotherapy (Leach, Krummel &
  Allison 1996, held out) — from prior work on CTLA-4 as a negative regulator,
  its high-affinity B7 binding, and B7-driven antitumor immunity.

And, because a discovery system must *avoid* attractive nonsense, two historical
dead ends whose narratives fit their evidence well: **cold fusion** and
**phlogiston**. A trustworthy system should *not* confidently reconstruct these.

## What the run produced

Everything below was compiled locally on a 35-billion-parameter model running on
my own hardware — no cloud APIs, no keys. Every generation, grounding audit, and
score came from that model. Composite quality is the geometric mean of novelty ×
grounding × testability; a zero in any dimension tanks it, by design.

**Compiler versus controls (mean composite quality):**

| domain               | compiler | llm-only | keyword | random |
|----------------------|:--------:|:--------:|:-------:|:------:|
| checkpoint blockade  | **0.96** | 0.00     | 0.40    | 0.00   |
| CRISPR               | **0.97** | —        | 0.50    | 0.00   |
| mRNA vaccine         | **0.92** | 0.00     | 0.50    | 0.00   |
| cold fusion (false)  | **0.89** | —        | 0.44    | 0.00   |
| phlogiston (false)   | **0.97** | 0.00     | 0.45    | 0.00   |

The compiler's **falsifiable rate was 1.0** in every domain — every artifact it
emitted passed the structural contract. Every control's falsifiable rate was
**0.0**: random has no variables, keyword has no mechanism or prediction, and
llm-only — same model, no corpus — scored **0.00 composite** because its
grounding was **0.00**. That last number is the ablation landing exactly where
the thesis predicts: without the corpus, the model writes fluent, high-novelty
hypotheses it cannot tie to a single source. Fluent and ungrounded is precisely
"articulate autocomplete." The knowledge graph is what makes it science.

**The rediscovery benchmark (best reconstruction match, 0–1):**

| discovery (paper removed)   | compiler match |
|-----------------------------|:--------------:|
| CTLA-4 checkpoint blockade  | **1.00**       |
| nucleoside-modified mRNA    | **0.90**       |
| CRISPR-Cas9                 | 0.00           |
| phlogiston (false)          | 0.00           |
| cold fusion (false)         | 0.50           |

Two reconstructions are the headline. From the prior literature alone, the
compiler produced, for mRNA:

> *Incorporating pseudouridine and N1-methylpseudouridine into in-vitro-
> transcribed mRNA will attenuate TLR7/8-mediated innate immune activation by
> 60–80% while preserving antigen-specific CD8+ T-cell priming in vivo.*

That is Karikó and Weissman's actual discovery — mechanism, direction, and a
quantitative window — assembled from papers that predate it, grounded on the
modified-nucleoside and TLR-recognition literature. For checkpoint blockade it
reconstructed the competitive-affinity mechanism (CTLA-4 outbinding CD28 for B7,
blockade restoring CD28-driven activation) and scored a perfect match against
the held-out Allison result.

And then the honesty. **CRISPR scored 0.00 on rediscovery** — the compiler
produced high-quality, falsifiable, well-grounded hypotheses, but none of them
made the specific single-guide-RNA leap. The system did not paper over the miss,
and neither will I. Meanwhile it refused to confidently rebuild **phlogiston**
(0.00) and only partially reached for **cold fusion** (0.50) — a discovery
system that reconstructs known nonsense as eagerly as known truth would be
worthless, and this one mostly declined.

Two hits, one clean miss, dead ends held down. That is not a demo. That is a
result you can argue with.

## What the audit caught

One detail matters more than it looks. On the mRNA run, grounding came in at
0.82 rather than 1.0 — because the grounding auditor, a second model pass that
checks whether a cited source actually supports a claim, flagged a citation to
`martinson1993` when the real prior paper is `martinon1993`. The model
fabricated a plausible-looking source id, and the audit caught it and docked the
score. That is the entire difference between a knowledge compiler and articulate
autocomplete: a claim that cannot name a real, supporting source does not get
credit for being well written.

## The deliverables

Per the standing convention, three artifacts:

- **Code:** [`github.com/kliewerdaniel/popper`](https://github.com/kliewerdaniel/popper)
  — the schema, the four methods, the benchmark corpora (with real DOIs), the
  scorer, and the explorer. No third-party Python dependencies; every model call
  goes through the standard library to a local endpoint.
- **Explorer:** [Pied Popper](https://popper-pied.vercel.app/) a static site with the falsifiability question, the
  compiler-versus-control table, the per-discovery rediscovery results, and every
  compiled hypothesis with its full provenance and scores.
- **This post.**

## Where this leaves the project

The compiler has now cleared three bars in sequence: it can *generate*, it can
*scale*, and — on this evidence — it produces hypotheses that are falsifiable by
construction, grounded in real sources, and, twice out of three, capable of
reconstructing a genuine scientific discovery from the literature that preceded
it. Just as important, it fails visibly when it fails, and it declines to
confidently rebuild known nonsense.

That transition — from "an interesting AI demo" to "a methodology whose claims
can be checked" — is the point where this work becomes worth taking seriously.
The tool is no longer trying to sound smart. It is trying to be wrong in ways we
can measure. That is the only kind of instrument worth owning.
