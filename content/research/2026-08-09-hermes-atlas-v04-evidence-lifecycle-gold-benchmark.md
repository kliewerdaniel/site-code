---
author: Daniel Kliewer
canonical_url: /blog/2026-08-09-hermes-atlas-v04-evidence-lifecycle-gold-benchmark
date: 08-09-2026
description: "Hermes Atlas v0.4 proves the v0.3 evidence ledger and provable claim lifecycle with a gold-labeled benchmark. Every number was measured on a fixed, model-free corpus; two real bugs were found and fixed in the process. Everything below is reproducible."
image: /images/1103012.png
layout: post
title: 'Hermes Atlas v0.4: Proving the Evidence Ledger & Claim Lifecycle with a Gold-Labeled Benchmark'
og:description: "Hermes Atlas v0.4 proves the v0.3 evidence ledger and provable claim lifecycle with a gold-labeled benchmark. Every number was measured on a fixed, model-free corpus; two real bugs were found and fixed in the process."
og:image: /images/1103012.png
og:title: 'Hermes Atlas v0.4: Proving the Evidence Ledger & Claim Lifecycle with a Gold-Labeled Benchmark'
og:type: article
og:url: /blog/2026-08-09-hermes-atlas-v04-evidence-lifecycle-gold-benchmark
tags:
  - sovereign-ai
  - local-ai
  - knowledge-graph
  - graphrag
  - falsifiability
  - local-first
  - ai-agents
---

# Hermes Atlas v0.4: Proving the Evidence Ledger & Claim Lifecycle with a Gold-Labeled Benchmark

**August 9, 2026 · Daniel Kliewer**

---

[v0.1](https://danielkliewer.com/blog/2026-08-09-hermes-atlas-v01-local-first-incrementally-compiled-falsifiable-knowledge-system) built a local-first, incrementally-compiled, falsifiable knowledge system. [v0.2](https://danielkliewer.com/blog/2026-08-09-hermes-atlas-v02-claim-level-coverage-determinism-gate-knowledge-mutation-canary) closed the coverage- and determinism-honesty gaps with measurements. [v0.3](https://danielkliewer.com/blog/2026-08-09-hermes-atlas-v03-evidence-ledger-claim-lifecycle-explain) added an evidence ledger, a provable claim lifecycle (including DELETE-driven invalidation that retains history), and an `atlas explain` command.

v0.4 answers the question the last three releases left open: *does the ledger and lifecycle machinery actually behave correctly under a corpus engineered to exercise every case — or does it merely compile without crashing?*

This is still a **benchmark-and-fix release**. Same constraint as before: no new personas, no new model integrations, no prettier CLI. v0.4's job was a real, hand-labeled benchmark with measured numbers and the failure modes reported as findings. Two genuine Atlas bugs surfaced and were fixed. Everything below is reproducible by running the commands verbatim.

The code: [github.com/kliewerdaniel/hermes-atlas](https://github.com/kliewerdaniel/hermes-atlas). The v0.3 write-up: [Hermes Atlas v0.3](https://danielkliewer.com/blog/2026-08-09-hermes-atlas-v03-evidence-ledger-claim-lifecycle-explain).

## The honesty rule that governs this release

Atlas has **no truth oracle**. There is no fact-checking service that says whether a claim is *true in the world*. So `status: supported` means exactly one thing:

> *The evidence Atlas was given supports this claim* — a statement about internal coherence, **not** external truth.

The gold labels in this benchmark are **by construction** — they describe *how the corpus was built* (e.g. "source `d-strong` is reliability 0.95, so its single claim should be `supported`"), never a verdict on whether the sentence is true. This is a deliberate, load-bearing distinction. Describing Atlas as "proving knowledge" or "version control for truth" would be false. The README carries an explicit "What v0.4 does NOT claim" section; this post does too.

## The benchmark corpus (model-free by design)

v0.4 ships a fixed, deterministic corpus `bench_corpus_d.json` (12 sources) and a gold file `p4_ledger_gold.json`. No model is involved at any point — the graph is computed entirely at compile time, so the numbers are reproducible on anyone's machine, server down included.

The corpus exercises **eight construction categories**:

1. **Single-source support** — one reliable source → `supported`.
2. **Multi-source corroboration** — two independent sources asserting the same fact → two parallel `supported` records (see the "what it does NOT claim" note on fusion).
3. **Contradiction pair** — two sources making opposite assertions → both `contested`, linked by a first-class contradiction record.
4. **Delete-driven invalidation** — a claim's only source is removed → retained as `invalidated`, history preserved.
5. **Stale-evidence revalidation** — a source's text/checksum changes after extraction → claim flagged `needs_revalidation`.
6. **Paraphrase / duplicate evidence** — same fact, different wording, from two sources → two records, not fused.
7. **Held-out / negative control** — a sentence present in the corpus but not extracted as a claim (no assertion cue) → correctly absent.
8. **Derived-from** — a summary claim whose entities are a strict subset of a base claim's entities → `derived_from` points at the base claim.

The harness (`bench_d.py`) drives four measured checks and writes `bench_d_report.json`.

## Measured results (real, not rounded up)

Run:

```bash
cd hermes-atlas
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python bench_d.py
```

Output:

```
=== v0.4 Corpus-D Benchmark ===
  P2 provenance_complete_rate : 1.000 (12/12)
  P4 contradiction_preserved  : True  phases=['full', 'full-recompile', 'after-delete', 'after-stale']
  P5 lifecycle_correct_rate   : 1.000 (73/73)  derived_ok=True
  P7 determinism              : passed=True full_eq=True delta_iso=True
```

| Check | Definition | Result |
|-------|-----------|--------|
| **P2** provenance completeness | every claim's `evidence[]` resolves to a real source + a real quote span in that source's text | **1.000 (12/12)** |
| **P3** staleness | a source text/checksum change after extraction flags the claim `needs_revalidation` without changing its id | **works** (see bug #2 below) |
| **P4** contradiction preservation | a contradicted pair survives full → full-recompile → after-delete → after-stale | **True** across all 4 phases |
| **P5** lifecycle correctness | claimed status at each phase (full / delete / stale) matches gold — status, derived-from, revalidation | **1.000 (73/73)**, `derived_ok=True` |
| **P7** determinism regression | full compiles byte-identical AND an unchanged delta recompile fingerprint-isolated, on corpus D | **passed / full_eq / delta_iso = True** |

All: `python bench_d.py` → `bench_d_report.json`.

## Two real bugs the benchmark caught

A benchmark that only confirms what you expected is theater. The point of building the corpus by construction was to have an oracle for *correctness* — and it found two genuine Atlas defects.

### Bug #1 — orphaned claims silently re-derived `supported` across a delta sequence

The v0.3 DELETE-driven invalidation works on a single recompile: remove a claim's only source and it is retained as `invalidated` with history preserved. But the benchmark's `after-delete` → `after-stale` sequence exposed a regression: once a claim was already orphaned (its `source_ids` cleared by the delete), the **next** recompile treated it as an ordinary empty-source claim and re-derived `supported`.

That defeats the load-bearing guarantee: *no claim silently changes its mind without evidence*. A claim that was invalidated because its source was deleted had no business becoming `supported` just because you later recompiled the corpus for an unrelated reason.

Root cause: the 5b orphan path in `compiler.py` only fired when `source_ids` was **non-empty** and missing from the live sources. An already-orphaned claim has `source_ids: []`, so it fell through to the normal confidence path.

Fix (`compiler.py`, 5b): compute the orphan source set as `source_ids or orphaned_from_source`, and orphan whenever that set is non-empty and disjoint from the live source set. The `orphaned_from_source` audit field (added in v0.3, deliberately outside the determinism change-hash) is what makes the already-orphaned claim recoverable and re-invalidatable. Lifecycle correctness on corpus D went from **0.959 → 1.000** after this fix.

### Bug #2 — staleness detection was a no-op

`extract_source` re-stamps every evidence record's `source_checksum` with the *current* source checksum at extract time. The compiler's staleness pass then compared `e.get("source_checksum")` (just re-stamped to the current value) against the current source checksum — which was always equal. So staleness **never fired**, on any corpus, silently.

Fix (two parts):
- `compiler.py` snapshots `prior_ev_checksums` — the evidence checksums as they existed *before* the write — and the staleness pass compares against those, not the live (re-stamped) values.
- `ledger.py` adds `stale_evidence` and `needs_revalidation` to `CORE_CLAIM_FIELDS` so a staleness-only change actually triggers a write (the core-hash-gated store would otherwise see "core identical → no write" and silently keep the old `stale_evidence: 0`).

After the fix, a checksum-only change flags the claim (`stale_evidence: 1`, `needs_revalidation: True`) and the `claim_id` stays stable across the recompile.

Both fixes are covered by new regression tests (`tests/test_p3_staleness.py`, and the orphan path by `tests/test_lifecycle.py`).

## Explain fidelity (P6)

`atlas explain <claim_id>` returns a machine-readable ledger entry (`--json`, consumed by the Skeptic persona) and a human-readable rendering. The two must agree. New tests in `tests/test_p6_explain_fidelity.py` pin the contract:

- the machine entry round-trips through `json.dumps`/`json.loads` losslessly (no lurking non-serialisable types);
- every fact in the human view (status, text, confidence, every evidence quote, the "never deleted" status-history header) is present in the machine entry and vice versa.

```bash
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python -m pytest -q -p no:cacheprovider tests/test_p6_explain_fidelity.py
```

## The determinism footgun worth naming

`Compiler.compile` defaults to `summarize=True`. A full compile and a delta recompile must use the **same** `summarize` setting or the cached community summaries regenerate and the delta-isolation invariant breaks. The v0.4 `gate_delta` test initially failed for exactly this reason — my first version of the test's churn closure omitted `summarize=False`. The fix is to always pin `summarize=False` when checking determinism, and the harness documents it inline. This is a real footgun, not a bug in Atlas: the determinism gate is correct; mixing summarize settings between the two compiles is the user's error, and now it's a tested one.

## Full test suite

```bash
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python -m pytest -q -p no:cacheprovider tests/
```

**80 passed** (up from 73 in v0.3): the existing ledger/lifecycle/explain/canary/determinism suite plus the new v0.4 tests — P3 staleness (×2), P6 explain fidelity (×3), P7 corpus-D determinism (×2).

## What v0.4 does NOT claim

- **It does NOT determine whether any claim is true in the world.** No fact-checking oracle exists. `status: supported` means the given evidence supports the claim — internal coherence, not external truth. The gold labels are by construction, never by reality-checking. Do not call Atlas "version control for truth."
- **It is not production-grade incremental Leiden.** It is label propagation with a seeded, frozen-core append step; `stability()` reports the drift.
- **The benchmark is on a fixed, model-free corpus.** It proves the ledger/lifecycle machinery behaves correctly *by construction*. It is not a generalization test against arbitrary live data (that's v0.5).
- **Extraction precision is 0.667** (carried from v0.2). Rhetorical questions and metaphors produce false-positive claims; tolerated via confidence/entity gating, but a real limitation.
- **`validated` is unreachable today.** Claims are per-source, so two independent sources asserting the same fact materialize as two parallel `supported` records, not one `validated` claim. Cross-source fusion is on the v0.5 roadmap.
- **`invalidated` is DELETE-driven only.** A claim whose every source is removed is retained and marked `invalidated`; a claim that merely loses corroboration (but keeps a source) drops to `candidate`. Intentional.

## v0.5 roadmap

- Reproduction bundles (`atlas reproduce <run-id>`).
- Baseline benchmarking vs keyword / vector / RAG / graph systems, plus the dependency-policy decision (embedding model vs. the no-cloud-calls, model-free-by-default constraint).
- Corpus-scaling benchmarks (100 → 1K → 10K → 100K documents).
- Cross-source claim fusion so `validated` becomes reachable.
- Richer `derived_from` chains wired into confidence and the explain view; richer `contested→invalidated` resolution provenance.
- Any project rebrand or top-level description update — revisit only after the P2–P7 numbers are in hand.

---

*Every command in this post was run for real on Python 3.14 with a stdlib-only runtime. The benchmark is model-free; the numbers reproduce with the server down. The full source and the `bench_d_report.json` it writes are in [github.com/kliewerdaniel/hermes-atlas](https://github.com/kliewerdaniel/hermes-atlas).*
