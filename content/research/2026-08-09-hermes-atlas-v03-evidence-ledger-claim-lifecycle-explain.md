---
author: Daniel Kliewer
canonical_url: /blog/2026-08-09-hermes-atlas-v03-evidence-ledger-claim-lifecycle-explain
date: 08-09-2026
description: "Hermes Atlas v0.3 adds an evidence ledger to every claim, a provable claim lifecycle (including DELETE-driven invalidation that retains history), and an `atlas explain` command. Every number below was measured, not asserted."
image: /images/1103012.png
layout: post
title: 'Hermes Atlas v0.3: An Evidence Ledger, a Provable Claim Lifecycle, and an Explain Command'
og:description: "Hermes Atlas v0.3 adds an evidence ledger to every claim, a provable claim lifecycle (including DELETE-driven invalidation that retains history), and an `atlas explain` command. Every number below was measured, not asserted."
og:image: /images/1103012.png
og:title: 'Hermes Atlas v0.3: An Evidence Ledger, a Provable Claim Lifecycle, and an Explain Command'
og:type: article
og:url: /blog/2026-08-09-hermes-atlas-v03-evidence-ledger-claim-lifecycle-explain
tags:
  - sovereign-ai
  - local-ai
  - knowledge-graph
  - graphrag
  - falsifiability
  - local-first
  - ai-agents
---

# Hermes Atlas v0.3: An Evidence Ledger, a Provable Claim Lifecycle, and an Explain Command

**August 9, 2026 · Daniel Kliewer**

---

[v0.1](https://danielkliewer.com/blog/2026-08-09-hermes-atlas-v01-local-first-incrementally-compiled-falsifiable-knowledge-system) built a local-first, incrementally-compiled, falsifiable knowledge system. [v0.2](https://danielkliewer.com/blog/2026-08-09-hermes-atlas-v02-claim-level-coverage-determinism-gate-knowledge-mutation-canary) closed the coverage- and determinism-honesty gaps with measurements. v0.3 answers the question both releases left open: *when the system says it believes something, can you see why — and can you watch it change its mind without it lying about having done so?*

v0.3 is still a **benchmark-and-fix release**. Same constraint as before: no new personas, no new model integrations, no prettier CLI. The spec asked for three things, each backed by a real, runnable benchmark:

1. An **evidence ledger** on every claim — what it believes, why, and what would change its mind.
2. A **provable claim lifecycle** — including the DELETE-driven transition the spec explicitly named: when a claim's only source is deleted, the record must be **retained and marked `invalidated`**, never silently dropped.
3. An **`atlas explain <claim_id>`** command that surfaces the full ledger for a human, and a `--json` API the Skeptic persona consumes to target a *specific* contested claim.

The code is public: [github.com/kliewerdaniel/hermes-atlas](https://github.com/kliewerdaniel/hermes-atlas). The README reproduces every claim here and links back.

## Why this release exists

A falsifiable system is not one that is right. It is one whose beliefs are *auditable* and whose corrections are *observable*. v0.2 could prove its compiles were reproducible and that corrections propagated — but it could not *show you* the chain of evidence behind any single belief, and it had no notion of a claim's state over time. If a claim vanished because its source was deleted, you'd never know it had ever existed. That is a falsifiability hole: an opinion that silently disappeared is indistinguishable from an opinion that was never held.

v0.3 closes both.

## What shipped (and how it's proven)

### 1. The evidence ledger (`ledger.py`)

Every claim record now carries:

- `subject / predicate / object` — the parsed assertion triple.
- `status` — the current lifecycle state.
- `evidence[]` — each piece of supporting/contradicting evidence, pointing at the exact source span (`source_id`, `span_start`, `span_end`).
- `contradictions[]` — the other-side claim ids.
- `derived_from[]` — (v0.4 will wire this; reserved).
- `compiler_version`, `source_hash`, `created`, `last_validated`.
- `history[]` — **every state the claim has ever held, retained forever.**

**The hard part — migration without rewriting history.** The append-only store's `write` is content-hash-gated: unchanged content is a silent no-op (that silence is what makes the determinism gate work). For the `claims` collection, the change hash covers only the **core** fields (`text`, `source_ids`, `confidence`, `contradiction_ids`, …). The additive v0.3 ledger fields are *not* part of that hash. So a v0.2 store, delta-recompiled under v0.3, keeps its old records at schema 1 **byte-for-byte**; only claims that actually change — or are newly created — get stamped schema 2.

That is proven, not assumed: `tests/test_ledger.py::test_mixed_version_store_passes_determinism_gate` seeds a v0.2-shaped store, recompiles it under the v0.3 compiler, and asserts (a) the old records' content hashes are unchanged and (b) the determinism gate still passes. It does.

### 2. The provable claim lifecycle (`lifecycle.py`)

States: `candidate → supported → validated → contested → invalidated → superseded`.

The load-bearing design choice: **`status` is a pure function of the evidence**, recomputed from evidence on every compile (`ledger._initial_status`). It is never a free variable. That is precisely why the lifecycle gate *can* be proven — there is no hidden state to drift.

```python
def _initial_status(confidence, independent_sources, contradiction_ids) -> str:
    if contradiction_ids:
        return "contested"
    if independent_sources >= 2 and confidence >= 0.5:
        return "validated"
    if confidence >= 0.5:
        return "supported"
    return "candidate"
```

The `atlas gate --lifecycle` command enforces three invariants:

1. **No-op stability** — recompiling the *same* sources (the delta path) moves no claim's state.
2. **No illegal skips** — every written status equals what the evidence dictates.
3. **Invalidations are justified** — a claim becomes `invalidated` *only* if its supporting evidence was deleted (the DELETE-driven transition) or it is contradicted. And critically: **the record is retained, with its history, never silently dropped.**

The DELETE transition is real. In `compiler.py`, after the normal claims pass, any claim whose `source_ids` are all gone from the current corpus is re-written as `invalidated` with a cleared `source_ids`/`evidence` so the content hash actually changes (otherwise the core-hash-gated write would treat the invalidated record as identical to the stored one and keep the old status). Its `history[]` survives, so you can see it went `candidate → … → invalidated`.

### 3. `atlas explain <claim_id>` (`explain.py`)

```bash
# human-readable audit
python -m hermes_atlas.cli --store atlas explain clm-14a794a222ad8638

# machine-readable ledger entry (what the Skeptic consumes)
python -m hermes_atlas.cli --store atlas explain clm-14a794a222ad8638 --json
```

The `--json` form emits the stable `ledger_entry` shape: evidence chain resolved to source domain/author/quote, every contradiction with the other side's text + status resolved, and the retained `history`. The Skeptic persona (`personas.py::skeptic_target_claim`) pulls the most-informed contested/invalidated claim's full ledger entry and asks *that specific claim* to be falsified — not a generic "explore weak claims" prompt.

## The benchmarks (measured, not asserted)

Run with `python bench.py` on two fixed deterministic corpora (`bench_corpus_b.json`, `bench_corpus_c.json`). The harness is **model-free by design** (`llm_baseline_available: false`) — the graph is computed entirely at compile time, so these numbers are reproducible on any machine with no GPU and no API key.

| Probe group            | Corpus B     | Corpus C     |
|------------------------|--------------|--------------|
| negative_controls      | 1.0 trusted  | 1.0 trusted  |
| held_out_rediscovery   | 0.7 trusted  | 0.5 trusted  |
| knowledge_mutation     | 1.0 trusted  | 1.0 trusted  |
| lifecycle              | 1.0 trusted  | 1.0 trusted  |

The lifecycle group is new in v0.3: two probes per corpus — `supported→contested` (inject a contradiction) and `→invalidated` (delete the only source). Both passed at 1.0 on both corpora.

The **held-out rediscovery rate (0.5–0.7) is honest and reported as such.** It passes when the loop identifies the withheld fact and generates a question targeting it. It is below 1.0 because the coverage layer localises a hole best when the withheld fact is a *unique link-carrier* between two entities; in densely-interconnected regions a gap does not survive as a single localisable hole. That is real system behavior, not a bug to paper over — and the canary is built to *fail* when it should, which is the whole point.

**Extraction precision/recall** (carried from v0.2, against a 50-sentence hand-annotated gold set from the real Track A corpus):

```
precision = 0.667   recall = 1.000   f1 = 0.800
```

The only error class is false positives — rhetorical "What is…?" questions and metaphors slip through the `is/are/has` assertion cue. The confidence function down-weights low-reliability sources and the gap analysis ignores claims with no entity backing, so these do not poison the graph. High recall, modest precision — a deliberate tradeoff, measured and accepted.

## Reproduction (every command, real)

```bash
# clone + venv (stdlib-only at runtime; pytest is the only dev dep)
cd hermes-atlas
python3.14 -m venv .venv
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python -m pip install -q pytest

# run the full suite (73 tests)
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python -m pytest -q -p no:cacheprovider

# run the dual-corpus canary benchmark (writes bench_report.json)
env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python bench.py

# build a store from a real markdown corpus and run the lifecycle gate for real
rm -rf /tmp/atlasdemo && mkdir -p /tmp/atlasdemo/src
cat > /tmp/atlasdemo/src/demo.md <<'MD'
# Local-first AI

A `sovereign` system IS a machine that owns its own `memory`.

`contradictions` ARE first-class `nodes` so neither opposed `claim` is ever silently overwritten.

A `graph` HAS cached `summaries` that are static artifacts at compile time.
MD

python -m hermes_atlas.cli --store /tmp/atlasdemo ingest /tmp/atlasdemo/src
python -m hermes_atlas.cli --store /tmp/atlasdemo compile
python -m hermes_atlas.cli --store /tmp/atlasdemo gate --lifecycle
python -m hermes_atlas.cli --store /tmp/atlasdemo explain \
  $(python -c "from hermes_atlas.store import AtlasStore; \
    s=AtlasStore('/tmp/atlasdemo'); \
    print([c['id'] for c in s.read_all('claims') if 'contradictions' in c.get('text','')][0])") --json
```

If you run that, you will see the determinism gate print identical full-compile fingerprints, the lifecycle gate report `no-op stable / no illegal skips / invalidations justified: True`, and `explain --json` emit the full evidence chain + retained history for the contradictions claim. I ran it; the output above is what it produced.

## What v0.3 does NOT claim

- It is **not** production-grade incremental Leiden. `graph.py` is label propagation with a seeded, frozen-core append step; `stability()` reports the drift against a full recompute.
- It does **not** beat retrieval baselines on generic terms on a small corpus.
- **Coverage localisation is strongest on unique link-carriers.** Held-out rediscovery is 0.5–0.7, not 1.0, in dense regions. Reported honestly.
- **Extraction precision is 0.667.** Rhetorical questions and metaphors produce false-positive claims; tolerated via confidence/entity gating, but a real, measured limitation.
- **`invalidated` is DELETE-driven only.** A claim that merely loses corroboration (but still has a source) drops to `candidate`, not `invalidated`. Intentionally: `invalidated` means "the evidence I believed is gone," not "I am less sure." Richer resolution provenance is v0.4.

## v0.4 roadmap (not in this release)

- Richer lifecycle transitions: `superseded` provenance, resolution chains for `contested→invalidated` (who resolved it, with what evidence).
- `derived_from` derivation chains wired into confidence and the explain view.
- A canary run on a live (non-fixed) corpus to test generalization beyond the two deterministic benchmarks.

The through-line of v0.1 → v0.3: every release makes the system's beliefs *more auditable and its corrections more observable*. v0.3 is the one where you can finally ask any single claim "why do you believe this?" — and watch it answer, or watch it retract, without the truth getting lost in the changelog.
