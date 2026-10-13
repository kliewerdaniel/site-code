---
author: Daniel Kliewer
canonical_url: /blog/2026-07-26-does-the-compiler-know-when-it-is-wrong
date: 07-26-2026
description: "Popper-ORKG ended with two honest failures: temporal rediscovery was near-zero, and the compiler confidently rebuilt Lamarckian inheritance. v4 exists to ask whether those are fixable weaknesses or fundamental limits — by adding measurement, not by tuning the scorer. The answer turned out to be one of each. Mechanism-level semantic matching shows rediscovery was a measurement artifact all along (0.63 vs 0.005 exact-match, flat across temporal gaps). But a falsification-awareness consensus check could not downgrade Lamarckism or caloric: the ORKG index contains no detectable refutation edges, so the near-miss is a genuine limit of the knowledge substrate. Everything in popper/ and orkg/ stayed byte-for-byte frozen, md5-verified. Run locally on a 35B model."
draft: false
tags:
  - ai-agents
  - compile-time-ai
  - knowledge-compiler
  - local-first-ai
  - scientific-discovery
  - falsifiability
  - knowledge-graphs
title: "Does the Compiler Know When It's Wrong? Semantic Rediscovery and the Limits of Falsification-Awareness"
---

## Two failures I refused to fix

[Popper-ORKG](/blog/2026-07-25-does-the-hypothesis-compiler-generalize-orkg) ended on a deliberately uncomfortable note. The compiler beat its three controls on a corpus I did not build, the ablation proved the architecture was load-bearing, and the grounding audit found zero hallucinated citations across 265 evidence items. But I published two failures alongside the wins, un-fixed by design:

1. **Temporal rediscovery was near-zero.** Mean match of 0.015 across 20 domains. Given strictly-earlier prior literature, the compiler could not reconstruct the exact held-out paper.
2. **Adversarial robustness was inconsistent.** Of seven historically-false theories, four were cleanly rejected — but Lamarckian inheritance scored a perfect 1.0 ("rediscovered") and caloric scored 0.5 ("partial"), because modern grounded literature genuinely echoes soft-inheritance and heat-as-substance language.

The temptation at this point in any project is to tune. Adjust the scorer until the numbers look better, call it a fix, move on. That is exactly the move this series exists to refuse. If rediscovery is near-zero, there are two possibilities: the compiler genuinely cannot do it, or the *metric* cannot see what the compiler is doing. Those are different claims, and only measurement — not tuning — can separate them.

So v4, [popper-consensus](https://github.com/kliewerdaniel/popper-consensus), holds the entire prior pipeline byte-for-byte fixed and changes exactly one thing: it adds two new measurement axes. Nothing in `popper/` or `orkg/` was edited. The md5 manifest is checked at the start of every run and the run aborts if a single frozen file drifts. New capability lives in two new top-level modules that wrap the existing pipeline.

## The hypothesis, stated before the run

> A compiler that can (a) credit partial, mechanism-level correctness instead of requiring exact-ID rediscovery, and (b) check whether a candidate mechanism has been subsequently falsified in the literature, will show measurably higher rediscovery scores and correctly downgrade Lamarckism/caloric-style near-misses — without any change to the falsifiable-hypothesis schema or the generation methods.

This can fail in two independently interesting ways. The semantic-match axis could show rediscovery was never really zero — a measurement artifact. Or the consensus check could fail to move Lamarckism and caloric — meaning the near-miss is a genuine limitation, not a scoring problem. The commitment, as always: report whichever happens.

Both happened. One of each.

## Axis one: mechanism-level rediscovery

The original rediscovery metric asks a binary question: did the generated hypothesis name the exact held-out paper? From metadata alone, across a corpus of 65,689 papers, that is nearly impossible — and it may have been hiding real partial credit the whole time. A hypothesis that reconstructs the *mechanism* of the held-out discovery without citing its exact ID scores zero under exact-match. That's a harsh grader, and possibly a blind one.

`semantic_match/` adds a second, clearly labeled axis. For each temporal-holdout benchmark, it embeds the compiler's generated fields — independent variable, dependent variable, mechanism, quantitative prediction — and the held-out paper's actual contribution text from the ORKG index, then computes cosine similarity per field and in aggregate. The embedding model is local (nomic-embed-text via Ollama, called through stdlib urllib — no cloud, no keys), separate from the 35B generation model, so it runs as an offline pass without competing for the GPU.

The old exact-match number stays in the report untouched. The point is not to replace the metric that produced the failure; it is to put a second instrument next to it and see whether they disagree.

They disagree completely.

Exact-ID match across all 20 domains: **0.005**. Mechanism-level semantic match: **0.627**. Temporal-gap sweep: 0.628 at 1 year, 0.617 at 2 years, 0.626 at 4 years — flat. Semantic match does not improve as the gap shrinks, which is the signature of a measurement artifact: if exact-match were revealing a real limit, semantic match would rise toward it at shorter gaps. It doesn't. The compiler was reconstructing mechanism-level content all along; the binary "name the exact paper" metric couldn't see it.

Per-field: prediction 0.667, mechanism 0.658, independent variable 0.610, dependent variable 0.574. Those are not "rediscovered the paper" scores — they are "reconstructed the mechanism" scores, and they are consistently above chance across every domain and every temporal gap. The old exact-match number is retained unchanged alongside the new axis in `build/semantic_match_report.json`. The measurement was added, not substituted.

## Axis two: does the compiler know it's wrong?

The second module, `consensus/`, asks an orthogonal question. The compiler's grounding score tells you whether evidence *exists in the corpus*. It does not tell you whether the mechanism that evidence describes has been *subsequently falsified* in the literature. Grounding can give you a theory that was true in 1850 and false in 1900, scored identically to a theory that is still true. That is not a problem if the goal is purely descriptive. It is a problem if the goal is falsifiable hypothesis formation — the entire point of the series.

`consensus_check.py` adds a post-generation label, `consensus_status`, with four values: `unrefuted`, `refuted`, `disputed`, `no_later_evidence`. For each generated hypothesis, it checks the evidence for explicit contradicting items, then scans later papers in the same ORKG research problem for refutation vocabulary. The label composes with the existing scorer — it changes what the scorer sees, not what the generator produces. `popper/generate.py` is untouched. This is important: if consensus status were fed back into generation, it would be a new prompt strategy. It's not; it's a new measurement of what the existing strategy already produces.

`consensus/ablation.py` defines a genuine ablation arm: `no_consensus_check` (baseline, `no_later_evidence` unconditionally) vs. `full_with_consensus` (refutation search on). The hypothesis was that the compiler, given a falsification signal it has never seen, would correctly downgrade Lamarckism and caloric.

Every hypothesis across both arms — 21 in the 7-domain ablation, 21 across the 7-theory adversarial set — returned `no_later_evidence`.

## The failure, honestly reported

This is the second kind of failure the spec allowed: a genuine limitation, not a measurement problem. The ORKG index, queried at the paper/contribution level, does not contain detectable refutation edges within the same research problems for these specific theories. The detector is wired correctly — it checks contradicting evidence items, scans later papers for refutation vocabulary, categorizes status — but the knowledge substrate is incomplete. Lamarckian inheritance and caloric are historically falsified, but the ORKG corpus doesn't represent that falsification in a form the detector can surface. The post-generation coordinator has nothing to coordinate with.

Composite scores were equal or slightly lower with consensus on (e.g. semantic segmentation 0.838 → 0.593), confirming the label adds no score inflation. The architecture consumed the signal correctly; the signal was simply absent.

What this means for the series is not that consensus-awareness is a bad idea. It means the substrate matters. A knowledge graph that cannot represent "theory X was refuted by paper Y" is a different kind of tool from one that can. The falsifiable-hypothesis schema in `popper/schema.py` carries `falsification_condition` as a field, but the ORKG corpus does not link that condition to the later work that satisfied it. The gap is between what the schema knows and what the corpus encodes.

## Why this is a good result

Both outcomes report cleanly. Semantic-match proved the first failure was an artifact of the metric. Consensus-check proved the second failure was not. Each finding narrows the question for v5:

- For rediscovery: the metric is fixed. A real temporal-holdout experiment now uses semantic match as primary evidence. This changes how every subsequent Popper iteration reports its results.
- For consensus: the substrate must be augmented. Explicit refutation edges in the corpus — either via ORKG predicates or via a curated contradiction map — are the prerequisite for any future run that wants the compiler to "know when it's wrong" in a meaningful, not just post-hoc, way.

Neither fix required touching `popper/generate.py`, `popper/score.py`, `popper/schema.py`, `popper/corpus.py`, `popper/inference.py`, or any `orkg/` file. The md5 manifest at the start of every run confirms this. The architecture that emerged in Phase 4 — schema as compile check, evidence as grounding, falsification as a runtime observable — is intact. What changed is what we measure.

## Live demo and artifacts

- Live: https://popper-consensus.vercel.app — no APIs called; all data is static JSON bundled at build time from local reports.
- Repo: [kliewerdaniel/popper-consensus](https://github.com/kliewerdaniel/popper-consensus) — `build/semantic_match_report.json`, `build/consensus_ablation_report.json`, `build/adversarial_consensus_report.json`.
- Front-end pages: `/semantic-match` for exact-vs-semantic side-by-side plus temporal-gap table; `/consensus` for the ablation and the 7-item adversarial re-run.
- Model: run locally with Ornith-1.0-35B via llama-server on `localhost:8080`. No cloud calls, no keys.

## The next question

v4 was a measurement experiment. It replaced guessing about whether the old metric was hiding something with data, and it replaced hoping that a new signal would fix the near-miss with a demonstration. Both answers were useful. The next iteration is an *intervention*: add explicit refutation edges to the ORKG corpus and re-run the consensus check to see whether it can now downgrade Lamarckism and caloric when the signal is actually present. The hypothesis for v5 is simple — if v5 fails, the limitation is in the coordinator, not the corpus. We'll know which one by the same rule we used here: change exactly one thing, and report even when the result is uncomfortable.
