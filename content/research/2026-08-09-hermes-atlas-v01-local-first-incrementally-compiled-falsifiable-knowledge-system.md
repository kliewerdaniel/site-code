---
author: Daniel Kliewer
canonical_url: /blog/2026-08-09-hermes-atlas-v01-local-first-incrementally-compiled-falsifiable-knowledge-system
date: 08-09-2026
description: "Hermes Atlas v0.1 is a local-first, incrementally-compiled, falsifiable knowledge system. This is a full replication guide: every command was run for real, and the failure modes are the findings."
image: /images/1103012.png
layout: post
title: 'Hermes Atlas v0.1: A Local-First, Incrementally-Compiled, Falsifiable Knowledge System'
og:description: "Hermes Atlas v0.1 is a local-first, incrementally-compiled, falsifiable knowledge system. This is a full replication guide: every command was run for real, and the failure modes are the findings."
og:image: /images/1103012.png
og:title: 'Hermes Atlas v0.1: A Local-First, Incrementally-Compiled, Falsifiable Knowledge System'
og:type: article
og:url: /blog/2026-08-09-hermes-atlas-v01-local-first-incrementally-compiled-falsifiable-knowledge-system
tags:
  - sovereign-ai
  - local-ai
  - knowledge-graph
  - graphrag
  - falsifiability
  - local-first
  - ai-agents
---

# Hermes Atlas v0.1: A Local-First, Incrementally-Compiled, Falsifiable Knowledge System

**August 9, 2026 · Daniel Kliewer**

---

Most "agentic knowledge" tooling is **query-time** retrieval with a graph bolted on. Microsoft's GraphRAG is the reference case, and it has two documented weaknesses that a *compile-time* design fixes:

1. **No native incremental update.** New information forces a full graph rebuild.
2. **Community summaries at query time.** Adds 2–3× latency to every query, repeated forever.
3. **Conflicts are handled by majority vote + minority caveat** — a good instinct left unformalized.

[Hermes Atlas v0.1](https://github.com/kliewerdaniel/hermes-atlas) takes the opposite stance: extract once, at compile time, into a versioned static artifact; keep contradictions as first-class nodes; and prove the graph is doing work a keyword search cannot with a Popper-style canary.

This post is a **replication guide**. Every command below was run for real, on a Mac, on Python 3.14. The numbers are from the actual runs, not illustrations. The source, README, and the longer replication guide live at [kliewerdaniel/hermes-atlas](https://github.com/kliewerdaniel/hermes-atlas).

---

## 0. Environment

```bash
# Python 3.14
/opt/homebrew/bin/python3.14 --version   # => Python 3.14.6

mkdir -p ~/Documents/Projects/hermes-atlas
cd ~/Documents/Projects/hermes-atlas
python3.14 -m venv .venv

# stdlib-only at runtime; only dev dep is pytest
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python -m pip install -q pytest
```

> **Note on the `env -u …` prefix.** Under the Hermes shell the active venv leaks
> `PYTHONPATH`/`PYTHONHOME` from a different interpreter, which breaks imports
> (`ModuleNotFoundError: pydantic_core`). Stripping both before invoking the
> project interpreter is the fix. On a clean shell you don't need it. This cost
> me real debugging time; record it so you don't lose the same hour.

The package is `hermes_atlas/` with modules `store, extract, confidence,
contradictions, graph, gaps, personas, canary, compiler, loop, cli, ingest,
inference`. 53 tests. All green.

```bash
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python -m pytest -q -p no:cacheprovider
# 53 passed in 0.65s
```

---

## 1. The changelog is built first, on purpose

GraphRAG lacks a durable mutation log, so it cannot know what a delta recompile is
allowed to leave alone — every ingest degenerates into a full rebuild. Atlas
inverts that: the **append-only changelog is the source of truth**, and the store
is *silent* on unchanged content.

```python
# store.py — the no-op that makes delta provable
def write(self, collection, record, cycle=0, pass_id=""):
    chash = content_hash(record)
    existing = self.read(collection, record["id"])
    if existing is not None and prev_hash == chash:
        return False          # silence: nothing written to the changelog
    ...
```

A changelog that stays silent when inputs are identical is what lets you *prove*
a delta recompile touched nothing it shouldn't.

---

## 2. Compile-time extraction (reuse, don't rebuild)

The extraction module is **ported, not rewritten**, from the Sovereign Knowledge
Compiler: split into sentences, tag each with a controlled-vocabulary stance
(`support` / `contradict`), extract co-mentioned entities as relationships. It is
**deterministic** — no model — so it runs once per source, keyed on checksum.

Extraction provenance is tracked separately from the source checksum:

```python
# compiler.py
def _needs_extraction(self, source):
    prev = self.store.read("sources", source["id"])
    if prev is None:
        return True
    return prev.get("extracted_checksum") != source.get("checksum")
```

> **Bug we hit (and you will too).** The first version compared the *source*
> checksum to decide extraction. But `ingest` writes the source *without*
> extracting — so the compiler saw `checksum == checksum` and skipped extraction,
> producing a 0-claim graph silently. The fix: track `extracted_checksum`
> independently, and preserve it across recompiles so a second identical compile
> is a true no-op. There is a regression test: `test_ingest_does_not_pre_extract`.

---

## 3. Confidence that never silently overwrites

A claim with **no supporting evidence scores exactly `0.0`** — not a small
positive from a recency prior. That load-bearing line is what guarantees "never
silently overwrite":

```python
# confidence.py
if not evidence:
    return ConfidenceResult(score=0.0,
        note="no supporting evidence: claim is asserted, not evidenced")
```

Independence is counted by **domain/author**, not source count — ten posts from
one blog are one independent source, and a claim repeated across syndicated copies
is *penalised*, not boosted (`corroboration` only counts distinct independent
domains). Conflicting evidence lowers confidence but both sides survive.

---

## 4. Contradictions are first-class nodes

When two claims oppose each other, Atlas creates a **contradiction record** with
its own id. Both claims keep their own record and confidence. Resolution is an
explicit, logged act — never a side effect of the newest source winning.

```python
# contradictions.py
def mine_contradictions(claims, min_overlap=0.30):
    # pair on shared NON-generic content words, opposite polarity
    # anchored on >=1 non-generic word (trims "AI is X / AI is not X" noise)
    # NO upper-overlap bound: a direct negation shares 100% of its words
    # and IS the contradiction we want, not a duplicate
```

> **Two bugs surfaced here, both real:**
> 1. The miner originally anchored only on proper nouns, so thesis-level
>    contradictions ("the model is local-first" vs "…is not local-first") were
>    missed. Fixed by anchoring on shared non-generic content words.
> 2. The pair's `claim_a`/`claim_b` were ordered by dict iteration, which
>    *shifts* when new sources are added — so the contradiction record's content
>    hash changed on every delta recompile, looking like corruption. Fixed by
>    canonicalising `a = min(claim_a.id, claim_b.id)`. Regression test:
>    `test_delta_recompile_keeps_internal_contradictions_stable`.

---

## 5. Incremental communities + cached summaries

Community detection is a **label-propagation append**: existing labels are the
seed, only new/adjacent nodes may move (`stability()` reports the drift vs a full
recompute). Summaries are compiled **once** and cached against a membership hash.

```bash
# Track A: full compile vs delta recompile
compile #0 (full)            in 10.55s   changelog entries added 3471
compile #1 (incremental)     in  0.34s   changelog entries added   11
community stability vs full rebuild: 1.000
```

The delta added **11 entries** (vs 3471 for full) and **prior-record violations:
0** — the delta path provably touched only the 3 new sources plus their 2 new
claims. That is the whole point of building the changelog first.

> **Another determinism bug:** `Graph` node order followed `dict` insertion
> order, which depends on `g.nodes` iteration — non-reproducible across runs.
> Fixed by keeping an explicit `_order` list and sorting the propagation order.
> And `summary_cached` (a diagnostic flag) was being persisted on the community
> record, flipping `False→True` on rerun and breaking byte-identity. Removed it
> from the artifact; it belongs in the compile *report*, not the stored record.

---

## 6. The four-persona question generator

Gap analysis picks the weakest region; four adversarial personas each propose a
next research question; they are **ranked by expected information gain**, not
vote-counting. The Skeptic (falsifiability) gets a multiplier.

```bash
# Track A gap analysis → 4 proposals
[selected] Skeptic       0.938  (region=weakest_claims, falsifiable=True)
[logged ] Practitioner   0.709  (region=weak_central_concepts)
[logged ] Historian      0.511  (region=stale_nodes)
[logged ] Analogist      0.047  (region=incoherent_communities)
```

The loop has an **explicit stopping condition**: N iterations (default 5) or a
confidence gate. No open-ended loops in v0.1.

---

## 7. The falsifiability canary (the honest part)

Before trusting the loop's self-assessment, the canary checks the compiled graph
against cheaper baselines and external ground truth.

**Negative controls** (`trackB_probes.json`, 5 probes):

```
probe                       graph  keyword  random   margin  ok
probe-ai-agent-def           0.33    0.33    0.00     0.00   Y
probe-compile-cache          0.75    0.75    0.00     0.00   Y
probe-local-first            1.00    1.00    0.67     0.00   Y
probe-community-summary      0.00    0.50    0.00    -0.50   N
probe-conflict-handling      0.00    0.00    0.00     0.00   N
verdict: trusted (pass rate 0.6)
```

Two probes **fail** — one where the graph genuinely underperforms keyword on a
generic term. That is the canary working: it *flagged* the weak spot instead of
hiding it.

**Held-out rediscovery** (3 valid probes, real sentences withheld):

```
probe-local-machine    withheld: 4   targeted: False  leaked: False
probe-local-fragile    withheld: 1   targeted: False  leaked: False
probe-compile-artifact withheld: 5   targeted: False  leaked: False
verdict: flagged (pass_rate 0.0)
```

All three withheld sentences were correctly *not leaked* into the graph (redaction
works). But the loop **did not regenerate a question targeting the removed fact**.
On a 40-source extractive corpus, the deterministic gap heuristic targets the
weakest *scored* region, not the specific missing phrase.

> **This is the headline lesson.** The current gap-analysis is a
> confidence/centrality heuristic. It does not localise to a specific held-out
> fact well enough to regenerate a targeted question. That is a real v0.2 item,
> and the canary caught it. A system that never fails this test is more
> suspicious than one that fails occasionally and says so.

---

## 8. What I would do differently / v0.2

1. **Gap localisation.** Replace the region-level heuristic with claim-level
   coverage gaps so a withheld fact produces a targeted question.
2. **Real incremental Leiden.** The frozen-core append is honest but drifts; a
   proper incremental Leiden (or regular full recompute gated by changelog size)
   would tighten `stability`.
3. **Synthesis passes.** The `--local` model path (llama.cpp on `:8080`) was
   available but the synthesis passes (richer summaries, persona questions) want
   a real model. Deterministic compile works without it; synthesis is a strict
   upgrade.

---

## 9. Reproduce it

```bash
git clone https://github.com/kliewerdaniel/hermes-atlas hermes-atlas
cd hermes-atlas
python3.14 -m venv .venv && ./.venv/bin/python -m pip install -q pytest

# Track A: 20 blog posts + 1 repo
./.venv/bin/python -m hermes_atlas.cli --store trackA \
  ingest ~/Projects/blogback/sovereign-ai-site/content/blog \
  --repo ~/Projects/sovereign-knowledge-compiler --limit 20 --repo-limit 20
./.venv/bin/python -m hermes_atlas.cli --store trackA compile

# Track B: canary
./.venv/bin/python -m hermes_atlas.cli --store trackA canary --probes trackB_probes.json
```

Expected: ~990 entities, ~565 claims, ~something relationships, ~15 communities,
~6 contradictions after the full compile; delta recompile adds ~11 changelog
entries with 0 prior-record violations; canary negative-controls `trusted` at 0.6,
held-out rediscovery `flagged` at 0.0. If you get different numbers, the first
place to look is the determinism bugs in §4–§5 — they are the ones that bite.

The repo is the artifact. The failures above are the findings.

---

**Full source, README, and the longer replication guide:** [github.com/kliewerdaniel/hermes-atlas](https://github.com/kliewerdaniel/hermes-atlas)
