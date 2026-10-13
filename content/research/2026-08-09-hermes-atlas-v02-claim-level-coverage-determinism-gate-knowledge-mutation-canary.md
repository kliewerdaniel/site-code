---
author: Daniel Kliewer
canonical_url: /blog/2026-08-09-hermes-atlas-v02-claim-level-coverage-determinism-gate-knowledge-mutation-canary
date: 08-09-2026
description: "Hermes Atlas v0.2 is a benchmark-and-fix release: claim-level coverage localisation, a determinism gate that proves compile reproducibility, and a knowledge-mutation canary. Every number below was measured, not asserted."
image: /images/1103012.png
layout: post
title: 'Hermes Atlas v0.2: Claim-Level Coverage, a Determinism Gate, and a Knowledge-Mutation Canary'
og:description: "Hermes Atlas v0.2 is a benchmark-and-fix release: claim-level coverage localisation, a determinism gate that proves compile reproducibility, and a knowledge-mutation canary. Every number below was measured, not asserted."
og:image: /images/1103012.png
og:title: 'Hermes Atlas v0.2: Claim-Level Coverage, a Determinism Gate, and a Knowledge-Mutation Canary'
og:type: article
og:url: /blog/2026-08-09-hermes-atlas-v02-claim-level-coverage-determinism-gate-knowledge-mutation-canary
tags:
  - sovereign-ai
  - local-ai
  - knowledge-graph
  - graphrag
  - falsifiability
  - local-first
  - ai-agents
---

# Hermes Atlas v0.2: Claim-Level Coverage, a Determinism Gate, and a Knowledge-Mutation Canary

**August 9, 2026 · Daniel Kliewer**

---

[v0.1](https://danielkliewer.com/blog/2026-08-09-hermes-atlas-v01-local-first-incrementally-compiled-falsifiable-knowledge-system) built a local-first, incrementally-compiled, falsifiable knowledge system. It worked. But under honest evaluation it had two real weaknesses, and a third that the canary couldn't even *measure* yet.

v0.2 is a **benchmark-and-fix release**. The spec was explicit: *no new personas, no new model integrations, no prettier CLI.* Just close the honesty gaps with measurements. Here is what changed and — more importantly — the numbers, including the ones that did **not** reach 1.0.

The code is public: [github.com/kliewerdaniel/hermes-atlas](https://github.com/kliewerdaniel/hermes-atlas). The README reproduces this post's claims and links back here.

## The three weaknesses v0.1 left open

1. **The gap analysis could not localise.** v0.1 `gaps.py` only reported *aggregate* health rates — `unsupported_rate`, `thin_rate`, `contested_rate`, `mean_confidence` — and returned a single "weakest region" string. When the held-out rediscovery canary ran, it reported `flagged (pass_rate 0.0)`: the loop never leaked the withheld fact, but it also never generated a question *targeting* it. The canary couldn't say "this specific fact is missing" because nothing in the pipeline could.
2. **Determinism was asserted, not proven.** v0.1 claimed reproducible compiles. Nothing in the code actually *checked* that two full compiles were identical, or that a delta recompile left existing records untouched.
3. **No contradiction-update probe.** The canary could test negative controls and held-out rediscovery. It could not test the most important honesty property of a falsifiable system: *when a correction arrives, does the graph notice it and propagate it?*

## What I built

### P1 — claim-level coverage localisation

A new module, `coverage_gaps.py`, localises a missing fact at the **entity-pair / relationship level**. The rule: two entities co-mentioned in a corpus sentence but with **no relationship and no claim linking them** in the compiled graph = a coverage gap. That gap names the specific missing link.

The wiring is minimal and defensive:
- `gaps.analyse(question, corpus)` now calls `coverage_gaps_for_question` only when both are supplied, wrapped in `try/except` so a coverage failure never breaks the aggregate report.
- `personas.py` Skeptic, when `coverage_gaps` has open gaps, emits `f"What evidence would establish the missing link: {spec}?"` with `target: "coverage_gaps"`, `falsifiable: True`.
- `loop.py` forwards the standing question + corpus into `gap_analysis` so the skeleton drives the loop.

The extractor constraints that dictated the design (learned the hard way):
- Entities come **only** from backtick tokens (`` `GraphRAG` ``), acronyms, mid-sentence proper nouns, and a vocabulary list. Lowercase terms are *never* entities.
- Sentence-initial capitals are skipped (deliberate "not an entity" rule).
- A sentence is a *claim* only with an assertion cue (`is/are/requires/lacks/has/...`). "Python runs on Linux." (19 chars) is not a claim.

> **Bug we hit.** The first smoke test returned `[]` for every gap. Root cause was *not* the code — it was the test corpus: sentences about "Local-first AI" and "The machine" contain no recognised entity head, so `extract_entities` returned nothing and the index was empty. The design was correct; the corpus was invalid. Validating against a real compile with recognised entities (backtick-wrapped) confirmed the layer works.

### P2 — the determinism gate

`AtlasStore.fingerprint()` hashes every record by content, **excluding only `_meta.updated_at`** (the one field that legitimately differs between runs). `determinism.gate_delta()` proves two things:
1. Two fresh full compiles → identical fingerprints.
2. A delta recompile leaves every pre-existing record's content untouched (the changelog goes silent on unchanged records).

Exposed as `atlas gate`. The gate is why the v0.1 "we're deterministic" claim is now a *proof* rather than a hope.

### P3 — knowledge-mutation canary + dual-corpus probes

A third probe type, `knowledge_mutation`, injects a contradictory claim and measures two metrics:
- **contradiction recall** — did the recompiled graph mine a contradiction linking both claims?
- **update propagation** — did the affected claim's state change between pre/post mutation compiles? (Either the confidence number moves, *or* its `contradiction_ids` back-link appears — a claim sitting at floor confidence of 0.0 cannot move numerically downward, but recording the contradiction is itself the propagation.)

The probe set grew to **50 probes across two fixed deterministic corpora** (`bench_corpus_b.json`, `bench_corpus_c.json`): 10 negative-control + 10 held-out + 5 knowledge-mutation each. Fixed corpora replace the unreproducible blog scrape so the numbers are real and repeatable. The harness is model-free (`llm_baseline_available: false`) — everything is computed at compile time.

> **Contradiction-miner rules the probes had to respect.** `contradictions.py` only mines a pair when (a) the two claims have *opposite* polarity (one has a negation cue, the other doesn't) and (b) content-word overlap ≥ 0.30. The first mutation probes I wrote *failed* the canary — not because the system was broken, but because my injected sentences shared the original's polarity or drifted below overlap. A knowledge-mutation probe must inject a *real* contradiction. Once the mutations were genuinely opposing (e.g. original "`assistant` REQUIRES the `model` to run locally… data never leaves it" → injected "`assistant` HAS a remote `model`… data lives off the `user` machine"), recall went from 0.4 to 1.0.

## The benchmark (real numbers)

`python bench.py` → `bench_report.json`. Two corpora, 50 probes, model-free.

| Probe group          | Corpus B   | Corpus C   |
|----------------------|------------|------------|
| negative_controls    | 1.0 trusted| 1.0 trusted|
| held_out_rediscovery | 0.7 trusted| 0.5 trusted|
| knowledge_mutation   | 1.0 trusted| 1.0 trusted|

Negative controls at 1.0 on both corpora: the graph beats the keyword baseline because the claims are actually in the graph. Good.

**Held-out rediscovery is 0.5–0.7, not 1.0. That is the honest result.** The metric is *loop-targeted-the-hole*: the loop passes when it identifies the withheld fact and generates a question targeting it. It is lower than 1.0 because the coverage layer localises a hole best when the withheld fact is the **sole co-mention** of its entity pair (a unique link-carrier). In densely-interconnected regions the gap dissolves and the loop doesn't target it. This is real system behavior — the canary reports it as `trusted` (it does target most of the time) with the residual documented, not papered over.

**Knowledge-mutation reached 1.0 on both corpora** after the polarity/overlap fixes — the graph reliably notices an injected contradiction and propagates the change to the affected claim.

## P4 — extraction precision/recall (hand-annotated)

`p4_eval.py` samples real Track A sentences, shows the current `is_claim` verdict, and scores against a hand-labeled gold set. On 50 sentences:

```
precision = 0.667   recall = 1.000   f1 = 0.800
```

The only error class is **false positives**: rhetorical "What is…?" / "Are you…?" questions and metaphors ("It is a rope stretched between…") slip through the `is/are/has` cue. The loop's confidence function down-weights low-reliability sources and the gap analysis ignores claims with no entity backing, so these don't poison the graph. High recall, modest precision — a deliberate, accepted tradeoff. It is reported here as a measured limitation, not a claim of perfection.

## How to replicate

```bash
# clone + venv (Python 3.14)
git clone https://github.com/kliewerdaniel/hermes-atlas
cd hermes-atlas
python3.14 -m venv .venv
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python -m pip install -q pytest

# run the suite (60 tests)
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python -m pytest -q -p no:cacheprovider

# run the dual-corpus canary benchmark
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python bench.py
# -> writes bench_report.json

# measure extraction precision/recall against hand-annotated gold
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python p4_eval.py score

# prove compile reproducibility
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python -m hermes_atlas.cli --store atlas gate
```

> The `env -u PYTHONPATH -u PYTHONHOME` prefix strips a leaked venv from the shell when running under Hermes. On a clean shell it is unnecessary.

## What v0.2 still does NOT claim

- Not production-grade incremental Leiden (label propagation + frozencore append; `stability()` reports the drift).
- Does not beat retrieval baselines on generic terms on a small corpus.
- **Coverage localisation is strongest on unique link-carriers.** Held-out rediscovery is 0.5–0.7 in dense regions.
- **Extraction precision is 0.667.** Rhetorical questions and metaphors produce false positives, tolerated via confidence/entity gating.

## Why this matters

A falsifiable system is only as honest as its canary. v0.1 had a canary that *couldn't fail on the thing that mattered most* — whether the graph notices a correction. v0.2 closes that: it measures contradiction recall and update propagation, and it reports the numbers that didn't hit 1.0 right alongside the ones that did. A canary that never fails is not measuring anything.

Full write-up and replication commands: [README on GitHub](https://github.com/kliewerdaniel/hermes-atlas). The v0.1 post is [here](https://danielkliewer.com/blog/2026-08-09-hermes-atlas-v01-local-first-incrementally-compiled-falsifiable-knowledge-system).
