---
author: Daniel Kliewer
canonical_url: /blog/2026-07-20-compile-time-intelligence-research-compiler-agent
date: 07-20-2026
description: "An autonomous Research Compiler Agent that compiles web sources into a persistent, queryable, provenance-tracked Knowledge Artifact — moving semantic computation from runtime inference into reusable artifacts (Compile-Time Intelligence). Built on the Knowledge Compiler SDK; local-first and reproducible."
layout: post
title: 'Compile-Time Intelligence: Building a Research Compiler Agent That Compiles Knowledge Instead of Re-Reading It'
og:description: "An autonomous Research Compiler Agent that compiles web sources into a persistent, queryable, provenance-tracked Knowledge Artifact (Compile-Time Intelligence)."
og:title: 'Compile-Time Intelligence: A Research Compiler Agent That Compiles Knowledge'
og:type: article
og:url: /blog/2026-07-20-compile-time-intelligence-research-compiler-agent
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
  - sovereign-ai
draft: false
---

# Compile-Time Intelligence: Building a Research Compiler Agent that Compiles Knowledge Instead of Re-Reading It

*By Daniel Kliewer · 2026-07-20*

> A research agent shouldn't re-read the web on every turn. It should **compile**
> what it learns into a persistent, queryable knowledge artifact — and then reason
> over *that*. This post walks through the full design, code layout, and a live
> ru

[Github Link for Research Compiler Agent SDK](https://github.com/kliewerdaniel/research-compiler-agent-sdk)

---

## 1. The problem with research agents today

Every current "research agent" follows the same shape:

```
search → fetch → read → stuff into context → reason → answer → forget
```

Then the next question comes, and the whole thing starts over. A few paragraphs
in, a human researcher would have *internalized* the material — built a mental
model they can query without re-opening the browser. Today's agents don't.

This has four concrete costs:

1. **Repeated computation.** The same documents are fetched, parsed, and
   re-embedded on every turn. Tokens are burned re-deriving what was already
   known.
2. **Shallow memory.** Context windows are ephemeral. An insight from turn 3 is
   gone by turn 9 unless you pay to stuff it back in.
3. **Hallucination risk.** Without a stable, cited substrate, the model is one
   prompt away from confidently inventing a source.
4. **Poor reproducibility.** Two runs over the same topic can diverge, and you
   can't audit *why* — there's no artifact, only a transcript.

The root cause is architectural: **semantic computation is happening at runtime,
repeatedly, on transient context.** We'd never build a software compiler that
re-parses and re-type-checks the source on every program execution. Why do we
build research systems that re-parse and re-reason over sources on every query?

---

## 2. The core idea: Knowledge as Intermediate Representation

In a traditional compiler:

- **Source code** → (lexer, parser, optimizer, codegen) → **binary**.
- The expensive analysis is done **once, at compile time**, and stored.

In the Research Compiler Agent:

- **Source documents** (web pages, PDFs, repos) → (discovery, parse, extract,
  claim/contradiction/timeline passes) → **Research Knowledge Artifact**.
- The expensive *semantic* analysis is done **once, at compile time**, and stored
  as a **Knowledge Intermediate Representation (Knowledge IR)**.

The raw documents are the **source code**. The compiled artifact is the **IR**.
Queries at "runtime" are cheap lookups and joins over the IR — not re-reads of the
web.

We call this **Compile-Time Intelligence**:

> *Move semantic computation from runtime inference into reusable, queryable
> knowledge artifacts.*

This is the same philosophical move as moving type-checking and optimization out
of the interpreter and into the compiler. It's not a model trick; it's a
**systems** design.

---

## 3. It extends the Knowledge Compiler SDK (it doesn't reinvent it)

The Research Compiler Agent is built on the
[Knowledge Compiler SDK](https://github.com/kliewerdaniel/knowledge-compiler-sdk)
(`kc-sdk`), which already had the right bones:

- a **`PassRegistry`** that *discovers* passes from `pass-*/pass.yaml`
  declarations,
- an **`Orchestrator`** that resolves dependencies between passes, plans a path
  from source to any target IR, and executes only the passes whose inputs are
  satisfied,
- an immutable **`ArtifactStore`** that writes each artifact as a content-hashed,
  version-controlled directory (`artifact.json` + `metadata.json` +
  `diagnostics.json`),
- an **`InferenceClient`** that speaks the OpenAI `/v1/chat/completions` protocol
  against *your own* local server (Ollama, llama.cpp, vLLM) — no cloud API, no
  secret.

I did **not** fork or modify that engine. I added a `research/` layer and a set
of `pass-r*` passes that slot in as first-class citizens. That's the whole point
of the SDK's design: the pipeline is declared, not hardcoded.

---

## 4. Layer by layer

### Layer 1 — Source Discovery (`research/discovery.py`)

`SourceDiscoverer` turns an *objective* (plus optional seed URLs / local files)
into a Markdown corpus under `<build>/source/` and a
`<build>/discovery/provenance.json` table. Every source records:

- `source_id`, URL, title, author, domain
- `fetched_at` timestamp
- `content_hash` (SHA-256 of the fetched text)
- `content_type` (html / pdf / text)
- an `authority` estimate
- a `citation_ref` (`[src-1](url)`)

Web search is **key-less** (DuckDuckGo HTML), and HTML→Markdown / PDF→text are
pure code (`beautifulsoup4` + `markdownify` + `pypdf`). **Provenance is captured
at fetch time, before any LLM touches the text** — so it can never be invented
later.

### Layer 2 — The Compiler Engine (vendored)

The proven `compiler.core` engine plans and runs the pass graph. Adding a pass =
dropping a directory. Nothing in the core changed.

### Layer 3 — Research Compiler Passes

| Pass | Produces | Type | Purpose |
|------|----------|------|---------|
| `pass-r0-provenance` | `provenance-ir` | **deterministic** | join discovery provenance ↔ `markdown-ir` docs; backfill orphaned docs |
| `pass-r1-claims` | `claim-ir` | model | atomic claims + type + confidence + `source_id` |
| `pass-r2-contradictions` | `contradiction-ir` | model | conflicting claim pairs, provenance on both sides |
| `pass-r3-timeline` | `timeline-ir` | model | dated events + source |
| `pass-r4-citation-quality` | `citation-quality-ir` | **deterministic** | authority × corroboration × recency × (1 − contradiction-rate) → corpus confidence |
| `pass-r5-gaps` | `gap-ir` | model | open questions, research gaps, **ranked follow-up queries** |
| `pass-r9-assemble` | `research-knowledge-artifact` | **deterministic** | join every IR into the Knowledge IR |
| `pass-r10-explore` | `research-explorer` | **deterministic** | generate the Next.js explorer |

The vendored `pass-01-parse … pass-09-specifications` run alongside them, so the
artifact also carries entity / ontology / graph / relations / semantic /
reasoning IRs.

Notice that **three of the most important research passes are deterministic**:
provenance, citation-quality, and assembly. They need **no LLM**. The deterministic
core of Compile-Time Intelligence is reproducible and cheap; the model passes add
the semantic layer on top.

### Layer 4 — The Research Knowledge Artifact (`research/artifact.py`)

`assemble()` joins all IRs into one `research-knowledge-artifact.json`:

- **documents_index** + provenance
- **entity_graph / concept_graph / citation_graph**
- **claim database** (the compiled substrate)
- **contradictions**, **timeline**, **definitions**, **summaries**, **key concepts**
- **topic_clusters**, **open_questions**, **research_gaps**, **hypotheses**
- **citation_quality** + **embeddings_index** + **followup_queries**
- **stats**

This is the persistent thing the agent reasons over.

### Layer 5 — The Query Engine (`ResearchArtifactQuery`)

Dependency-free reasoning over the artifact:

- `find_approaches()` — competing approaches from the entity graph
- `find_contradictions()` — conflicting claims with provenance
- `evidence_for(claim)` — which sources support a claim
- `generate_hypotheses()` — hypotheses from observations + gaps
- `missing_information()` — open questions + ranked follow-up queries
- `topic_clusters()`, `timeline()`, `citation_quality()`

### Layer 6 — The Recursive Agent (`research/agent.py`)

`ResearchAgent.run(objective)` drives the full loop:

```
1. SourceDiscoverer.discover(objective)         # web/URL → corpus + provenance
2. Compiler.run(local, incremental=True)         # compile to artifact
3. loop (max_iterations):
     q  = ResearchArtifactQuery(assemble(build))
     gaps = q.missing_information().followup_queries
     if not gaps or corpus_confidence >= 0.75: stop      # autonomous stop
     for top-3 followups:
         web_search / fetch_url → new corpus docs
     Compiler.run(incremental=True)               # only stale artifacts rerun
4. return q.summary()
```

Stopping is **autonomous**: driven by gap exhaustion, corpus confidence, or the
iteration budget — not a fixed step count. The `pass-r5-gaps` pass is what makes
the loop *recursive*: it emits **ranked follow-up queries** the agent then runs
as new discovery.

### Layer 7 — The Explorer (`pass-r10-explore`)

A self-contained Next.js App Router app that **renders** the artifact: overview,
documents/sources, claims, contradictions, timeline, gaps, and an interactive
graph. The app embeds `research-knowledge-artifact.json` — no server, no API.
**The explorer is not the product; the artifact is.** The app is a window.

---

## 5. Provenance is the hard guarantee

Every downstream fact carries a `source_id` that joins back to the provenance
table, which carries the URL, author, fetch timestamp, and content hash. The
citation-quality pass turns that into a *measurable* evidence strength:

```
quality(source) = 0.40·authority
                + 0.35·corroboration      (distinct sources asserting the same claim)
                + 0.15·recency
                + 0.10·(1 − contradiction_rate)

corpus_confidence = Σ quality(s)·claims(s) / Σ claims(s)
```

So "how much should I trust this artifact?" is a **number**, not a vibe — and it
improves as more corroborating sources arrive.

---

## 6. Deterministic vs. model passes

The orchestrator distinguishes them via `pass.yaml`:

- `deterministic: true, model_required: false` → run as a subprocess, no LLM.
- `deterministic: false, model_required: true` → only run when `--local` and an
  inference server is reachable; executed via `core.llm_pass.run_model_pass`,
  which batches over documents, retries malformed JSON, validates against the
  schema, and enforces reference consistency.

This means a `researchc compile` with **no** model still yields provenance,
citation quality, the assembled artifact, and the explorer. You can ship the
deterministic core anywhere, then layer models on when you have them.

---

## 7. A real run

Objective: *"Kubernetes secrets management best practices"*.
`--max 8 --iterations 2`, local `llama3.1:8b` on Ollama `:11434`.

```
=== Research Compiler Agent ===
objective: Kubernetes secrets management best practices

[1/6] Source discovery (initial)
      discovered 8 sources
      Ollama detected at localhost:11434

[loop 1] corpus: sources=8 claims=17 contradictions=4 confidence=0.536
      5 follow-up queries; researching top ones
      +2 new sources (total 10)

[loop 2] corpus: sources=10 claims=17 contradictions=4 confidence=0.536
      artifact stable.
```

What this shows:

- **Discovery worked against live sources** (kubernetes.io, Snyk, GitGuardian,
  DEV, Plural, Kubegrade, …).
- **The model passes produced real structure** — 17 claims, 4 contradictions, 85
  timeline events — not placeholders.
- **The loop was recursive** — it detected gaps, ran follow-up searches, and grew
  the corpus from 8 → 10 sources, then recompiled incrementally.
- **`corpus_confidence` is a real 0.536**, computed deterministically from
  authority + corroboration + recency + contradiction rate.

Two bugs surfaced and were fixed *during* this run (the cost of building honestly):

1. `corpus_confidence` came out `0.0` because claims carried `doc_id`, not
   `source_id`, so the join to provenance found nothing. Fixed by resolving
   `doc_id → source_id` via the document→source map.
2. Two follow-up markdown files were orphaned from the provenance table (8 vs 10
   sources). Fixed by making `pass-r0-provenance` reconcile against the actual
   `source/*.md` corpus and backfill.

After the fix the deterministic recompile reports `source_count: 10` and
`corpus_confidence: 0.536` — correct.

The compiled example — the self-contained explorer and report — is shipped in
[`examples/`](examples/). Run it with `cd examples/research-explorer && npm
install && npm run dev`.

---

## 8. Extending it (the plugin architecture)

Add a new compiler pass **without touching the core**. Drop a directory:

```
compiler/passes/pass-r6-finance/pass.yaml
compiler/passes/pass-r6-finance/run.py
compiler/passes/pass-r6-finance/prompt.md
```

`pass.yaml`:

```yaml
id: pass-r6-finance
name: Financial Analysis
produces: financial-ir
consumes: [markdown-ir, provenance-ir]
entrypoint: run.py
deterministic: false
model_required: true
description: Extract financial metrics, valuations, and risk signals.
```

`run.py` calls `core.llm_pass.run_model_pass(...)` exactly like the other research
passes. The registry discovers it; the orchestrator plans around it;
`pass-r9-assemble` can fold `financial-ir` into the artifact by adding it to
`consumes`. New analysis dimension, zero core edits.

---

## 9. Reproducibility

Every artifact is content-hash cached (`Compiler.run(incremental=True)`). A
re-run with the same source URLs + same model yields the same deterministic
artifacts and reuses the model artifacts whose inputs are unchanged. The
provenance table records exactly which URLs (and content hashes) produced the
corpus, so any result is auditable. That's the property that makes this a
*compiler* and not a *chatbot*.

---

## 10. The pattern, stated plainly

> **Compile-Time Intelligence** — move semantic computation from runtime
> inference into reusable, queryable knowledge artifacts.

> **Related:** [I Compiled My Blog Into a Decision Graph](/blog/2026-07-15-compiling-my-blog-into-a-decision-graph) — the same compile-time intelligence idea applied to this blog's own 153 posts on a local LLM.


In software, we stopped re-parsing source on every execution. In AI research, we
should stop re-reading the web on every query. Compile it once. Reason over the
artifact. Recompile only when the frontier moves.

The Research Compiler Agent is a working instance of that pattern: an autonomous
loop that collects knowledge, compiles it, analyzes it, improves it, and
generates applications and reports from it — all local-first, provenance-tracked,
and reproducible.

---

## 11. Try it

```bash
git clone https://github.com/kliewerdaniel/research-compiler-agent
cd research-compiler-agent
/opt/homebrew/bin/python3.12 -m venv .venv
env -u PYTHONPATH .venv/bin/python -m pip install -r requirements.txt
env -u PYTHONPATH .venv/bin/python researchc.py research build-research \
  --objective "your research topic" --max 8 --iterations 2 \
  --port 11434 --model llama3.1:8b
env -u PYTHONPATH .venv/bin/python researchc.py explore build-research
```

Full docs: [`README.md`](https://github.com/kliewerdaniel/research-compiler-agent-sdk/blob/main/README.md) · [`ARCHITECTURE.md`](https://github.com/kliewerdaniel/research-compiler-agent-sdk/blob/main/ARCHITECTURE.md) ·
example: [`examples/`](https://github.com/kliewerdaniel/research-compiler-agent-sdk/tree/main/examples).

---

*This project extends the Knowledge Compiler SDK and builds on the "intelligence
is the accumulated decisions" philosophy from Sovereign AI.*
