---
author: Daniel Kliewer
canonical_url: /blog/2026-07-22-if-the-loop-is-the-product
date: 07-22-2026
description: "Yesterday I argued scientific knowledge needs a compiler, not a better research assistant. Today I built the general one — five discovery passes, local-first version control for understanding, and a live explorer. This is what it means when the loop, not the model, is the product."
layout: post
title: 'If the Loop Is the Product, Observability Becomes the Operating System'
og:description: "The Scientific Discovery Compiler turns a corpus into versioned understanding: causal structure, consensus and silence, falsifiable hypotheses, a research plan, and a local-first version history of the loop itself."
og:title: 'If the Loop Is the Product'
og.type: article
og.url: /blog/2026-07-22-if-the-loop-is-the-product
image: "/images/12092025/uncensored-ai-chatbot-architecture-diagram.png"
tags:
  - ai-agents
  - compile-time-ai
  - knowledge-compiler
  - knowledge-graph
  - local-first-ai
  - provenance
  - reproducible-ai
  - research-compiler
  - scientific-discovery
  - sovereign-ai
  - causal-inference
  - version-control
draft: true
---

# If the Loop Is the Product, Observability Becomes the Operating System

*By Daniel Kliewer · 2026-07-22*

Yesterday I published an argument: scientific knowledge does not need a better
research assistant. It needs a **compiler** — a system that transforms literature
into versioned representations of understanding rather than retrieving and
summarizing it. That essay was a vision. It described the *category* of tool I
thought should exist, and admitted that the clinical prototype we had shipped was
only the first instance of a much larger idea.

Today I built the general one.

This post documents that build honestly — what works, what broke, what I learned
— but it is not a changelog. It is the next turn of the same argument. Because the
thing I actually confirmed today is not "the passes run." It is a claim about
where intelligence lives in a research system, and what follows once you take
that claim seriously.

## The claim

**The model is not the product. The loop is.**

Every demo of "AI for science" sells the moment of generation: paste a paper, get
a summary, a hypothesis, a slide. That moment is the least interesting part of the
system. What matters — and what is almost always missing — is the accumulated,
auditable, versioned state a system builds *between* generations.

A large language model is a stateless function. You call it, it returns text, it
forgets. If your architecture treats that function as the product, you have built
a very expensive way to forget things quickly. The intelligence — to reuse the
line this whole project is built on — is not the model. It is *the accumulated
decisions that shaped the model's inputs, and the structured record of what those
decisions produced.*

So the design question is not "which model?" It is: **what does the system keep,
and can you inspect it?**

## The compiler metaphor is literal

A software compiler turns source into an intermediate representation, optimizes
that IR through a series of passes, and emits an object file. The IR is the whole
point. It is the thing you inspect, diff, and debug. You do not ask a compiler
"why did you emit that instruction?" and hope for a good vibe. You read the IR.

The Scientific Discovery Compiler does the same thing to a corpus:

| Software compiler | Scientific Discovery Compiler |
|---|---|
| source code | raw corpus (papers, notes, sites) |
| lex / parse | provenance-tracked markdown |
| semantic analysis | claim + entity extraction |
| data-flow graph | knowledge graph |
| type checking | contradiction + citation-quality checks |
| dead-code elimination | **the Unknown Detector** — what's *absent* |
| optimization passes | **causal**, **consensus**, **hypotheses**, **planner** |
| object file | `research-knowledge-artifact.json` |
| version control | **Scientific Git** |
| debugger / profiler | the **Understanding Explorer** |

Because every pass writes a typed, schema-validated IR, the loop is observable.
When a hypothesis is wrong you do not interrogate a black box. You trace it:

```bash
hyp-1.grounded_in → gap-3 → causal_edge ce-4 → claim clm-9 → source src-2
```

That chain is the payoff. **If the loop is the product, then observability becomes
the operating system** of the research process — the layer everything else runs
on top of.

## The five passes that make it discovery, not summarization

A summarizer lists "key findings." That is retrieval wearing a lab coat. The five
discovery passes I built today turn a corpus into something you can *act* on, and
each one consumes the typed output of the passes before it.

**Causal Discovery.** Extracts typed mechanism nodes and *directed causal edges* —
each with an explicit mechanism, a mediator, and boundary conditions. An edge with
no stated mechanism is rejected at the schema. This is structural, not prose: a
"missing edge" is two mechanisms with no link; an "unresolved mechanism" is an
edge whose boundary conditions are empty or contested. On the mechanistic-biology
corpus I tested it on — insulin signaling, AMPK, mTOR — it produced a graph of
mechanism nodes and causal edges, evaluated at 0.94.

**Consensus and Silence.** Classifies each finding as consensus-strong,
contested, or **silent**. The silence map is the single highest-value output of
the whole system. It lists what the corpus *implies should exist but doesn't* —
for example, that the molecular crosstalk between two well-studied pathways is
asserted everywhere but the direct phosphorylation targets are never actually
named. That gap is exactly what a human expert flags in the margin and what an LLM
summary silently smooths over.

**The Unknown Detector.** Generalizes the silence idea across domains and emits
ranked follow-up queries — the fuel for the recursive loop.

**Hypotheses.** Derives *falsifiable* hypotheses, each traceably grounded in a
causal edge, a gap, or a silence entry, each with a concrete test design and a
predicted outcome. Not "future work" platitudes — tests you could design on
Tuesday. Every hypothesis it generated was both novel and falsifiable, grounded
in specific detected unknowns.

**Planner.** Sequences the hypotheses and gaps into an ordered,
dependency-aware research plan, with explicit `inputs_needed` — the queries that
drive the next loop iteration — and a stop condition.

Causality is assessed over mechanisms, not surface claims. Consensus is assessed
over the causal structure. Hypotheses close detected unknowns. The plan sequences
the hypotheses. The loop closes on itself.

## Scientific Git: version control for understanding

A research system you cannot diff is a research system you cannot trust.

So the artifact is versioned on every build. Each version is a content hash, a
timestamp, and a structured diff — what was added, removed, or changed status —
against the previous one. It is local-first: each build diffuses into a commit on
your own machine, in a plain JSON history, exportable to a real git remote only if
you choose. No cloud, no account, no telemetry.

Two consequences fall out of this, and they are the reason it matters:

1. **"What changed since last build" becomes real, not a placeholder.** Re-run the
   loop on new sources and you get a genuine diff: a new claim here, a hypothesis
   that flipped from consensus to contested there, one more entry in the silence
   map. I verified this end to end — a first commit, an idempotent no-op re-run
   (nothing changed, no spurious version), then a real diff when the corpus
   changed.
2. **Recency becomes first-class.** Each version carries a recency weight, so
   downstream passes can let newer evidence outrank stale claims — the principle
   that new evidence beats old evidence, encoded as data instead of a vibe.

This is why I keep insisting the artifact — not the UI, not any single model call
— is the product. The interface is a *renderer* of the artifact. The artifact is
the thing that persists, versions, and compounds.

## You can look at it

None of this means anything if you cannot see it, so the compiler emits a
self-contained explorer for whatever it just compiled. It is live here:

**[scientific-discovery-explorer.vercel.app](https://scientific-discovery-explorer.vercel.app)**

Alongside the usual views — documents, claims, contradictions, timeline, graph —
there are two new ones that render the discovery layer directly:

- **Discovery** — the causal structure, the consensus and silence map, the
  hypotheses, and the plan, read as a single narrative of what the compiler
  *found* rather than what it summarized.
- **Scientific Git** — the version history, the diffs between builds, and the
  recency weighting. The loop, made visible.

## What broke, and why that's the point

I want to be honest about the failure modes, because they are more instructive
than the successes.

The reasoning model I ran locally — a 35B parameter model, served on my own
hardware, no external API — spends roughly fourteen thousand characters *thinking*
before it answers. The first time I ran the consensus pass, it returned nothing.
Empty. Three times. The reasoning trace had eaten the entire token budget before a
single character of the actual answer could be emitted. The fix was mundane —
give it headroom — but the lesson was not: a compiler cannot treat its model as an
oracle. It has to budget for the model's behavior, validate the model's output
against a schema, and repair the model's drift (a string where an array was
promised, a null where a note belonged) before any downstream pass is allowed to
consume it.

That discipline — schema-first, repair-always, trust-the-artifact-not-the-model —
is the difference between a compiler and a chatbot with extra steps. And when I
finally ran the whole thing as one orchestrated build, all five discovery passes
executing in sequence against the local model, it completed cleanly and committed
its third version on the way out. The loop ran itself.

## Why this is worth doing

Everything here runs on hardware I own. Discovery, inference, versioning, the
explorer — no cloud APIs, no data leaving the machine. That is not a limitation I
am apologizing for. It is the point. Research infrastructure that phones home is
research infrastructure you do not own; if the product lives on someone else's
GPU, you do not have a product, you have a subscription. Sovereignty is a
precondition for trust, and trust is a precondition for anything worth calling
knowledge work.

But the deeper reason is the one in the title. For a generation we have built AI
that produces answers and discards its reasoning. The Scientific Discovery
Compiler produces *understanding* and keeps it — typed, grounded, versioned,
inspectable, and improvable. It does not finish science. A human still runs the
experiments. What it does is make the next experiment obvious and well-grounded,
and it shows its work all the way down to the source.

If the loop is the product, then the machine we should be building is not a better
oracle. It is a better memory — one that accumulates, diffs, and compounds what we
come to understand. That is the machine I am building. Today it took a real step.

*The Scientific Discovery Compiler is open source. The live explorer above renders
a real compile of a mechanistic-biology corpus, produced entirely on local
hardware.*
