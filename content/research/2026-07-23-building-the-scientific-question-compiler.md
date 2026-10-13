---
author: Daniel Kliewer
canonical_url: /blog/2026-07-23-building-the-scientific-question-compiler
date: 07-23-2026
description: "We built the second compiler in the Scientific State program: the Scientific Question Compiler, which turns a corpus into a map of what humanity does not yet know. Local-first, running on a 35B model on our own hardware. Here is what we built, what broke, and what it means."
layout: post
title: 'Building the Scientific Question Compiler: A Map of What We Do Not Know'
og:description: "The second compiler in the Scientific State program compiles papers into ranked, classified, dependency-linked research questions. Built local-first on a 35B model. Live demo included."
og.title: 'The Scientific Question Compiler'
og.type: article
og.url: /blog/2026-07-23-building-the-scientific-question-compiler
image: "/images/12092025/uncensored-ai-chatbot-architecture-diagram.png"
tags:
  - ai-agents
  - compile-time-ai
  - knowledge-compiler
  - local-first-ai
  - provenance
  - reproducible-ai
  - research-compiler
  - scientific-discovery
  - sovereign-ai
  - scientific-question-compiler
  - uncertainty
draft: true
---

# Building the Scientific Question Compiler: A Map of What We Do Not Know

*By Daniel Kliewer · 2026-07-23*

Yesterday I wrote the [roadmap](/blog/2026-07-23-the-scientific-state-compiler-roadmap):
the four "research directions" for the Scientific State Compiler are not four
projects, they are five passes in one architecture — Evidence → Questions →
Mechanisms → State → Discovery. The roadmap's central question was *which pass is
the missing bottleneck?* My answer was concrete: **Pass 2, Questions** — the
lowest-risk, highest-leverage increment, the one that turns a corpus into a map of
what we do not know.

Today I built it. The **Scientific Question Compiler** takes a folder of papers and
compiles them into a structured map of scientific uncertainty: typed, ranked,
dependency-linked unanswered questions, surrounded by the known / contested /
silence landscape they emerge from. It runs entirely on our own hardware against a
35-billion-parameter model. It is [live here](https://scientific-question-compiler.vercel.app),
the code is [on GitHub](https://github.com/kliewerdaniel/scientific-question-compiler),
and this post is the honest account — including the bug that taught me something.

## What it does

A corpus of markdown papers flows through a pass chain. Each pass writes a typed
intermediate representation:

```
ingest → claims → contradictions → gaps (Unknown Detector) → QUESTION → assemble
```

- **claims** — pulls typed scientific claims (population / intervention / outcome /
  confidence) from each paper.
- **contradictions** — finds where claims genuinely disagree.
- **gaps** — the *Unknown Detector*: what the corpus implies but does not state, plus
  a silence map of topics conspicuously absent.
- **QUESTION** — the core pass. It promotes gaps + contradictions + silences into
  structured Question IRs, classifies each (mechanistic / causal / boundary /
  optimization / translational), scores it on five axes (importance, feasibility,
  knowledge gap, scientific leverage, evidence density), ranks by a weighted
  composite, and links questions by dependency. The output is an **uncertainty
  graph**, not a summary.

I compiled a small corpus on Alzheimer's disease and metabolic dysfunction — the
example domain from the roadmap. The compiler found, among others, this highest-
ranked question:

> **q1 (high):** Is BBB insulin-transport failure a cause or a consequence of
> neuronal insulin resistance in early Alzheimer's disease?

It traced the dependency chain beneath it: answer q1 before you can ask whether
restoring BBB transport reverses decline (q3), or what the molecular cascade actually
is (q2). That chain — *what must be known before this becomes answerable* — is the
part a search engine never shows you.

## What broke — and what it taught

The first run produced nothing. Not an error — just empty passes, silently. I had
to actually watch it to find out why, and the cause is worth recording because it
will bite anyone building on a reasoning model.

Our 35B model does not answer immediately. It emits a Chain-of-Thought — roughly
fourteen thousand characters of reasoning — *before* the actual answer. That is a
feature; it is why the model reasons well. But it has a consequence I had not fully
internalized: **if you cap `max_tokens` too low, the CoT eats the entire budget and
the real JSON answer gets truncated to nothing.** I had set the claims pass to 2000
tokens. The model spent those on thinking and returned an empty object. My JSON
extractor correctly found no `{...}` and the pass returned empty. No crash, no
warning — just a quiet void where the claims should be.

The fix is mundane and general: give reasoning models headroom. I set a global
`KC_MAX_TOKENS=*** and sized each pass's budget *above* its CoT length (claims 6000,
contradictions 5000, gaps 6000, question 9000). The compile then produced a full,
valid artifact. Two principles fall out of this:

1. **Schema-first, repair-always, trust the artifact not the model.** The model's
   output drifts from the schema (a string where an array was promised, a null
   where a note belonged). Every pass clamps and validates before the next consumes
   it. The *artifact* — the versioned JSON you can inspect and diff — is the
   product. The model call is a fallible subroutine.
2. **Budget for the model's behavior, not your prompt's length.** A reasoning model's
   "answer" can be ten percent of what it emits. Plan for the other ninety percent.

This is the same discipline the Discovery Compiler needed, and it is the reason both
compilers are survivable: a compiler does not treat its model as an oracle. It
validates, repairs, and versions. When the loop is the product, observability becomes
the operating system — and you cannot observe what you do not checkpoint.

## Why local-first is not optional here

Every pass ran against a model on our own machine. No cloud, no API key, no data
leaving the box. This is not a constraint I am apologizing for — it is the point. A
research infrastructure that phones home is not yours. If the map of scientific
uncertainty lives on someone else's GPU, you do not have a map, you have a
subscription. Sovereignty is a precondition for trust, and trust is a precondition for
anything worth calling knowledge work. The same 35B model that powers this could run
on a researcher's laptop; the explorer is a static site that costs nothing to host.

## The live result

The compiled artifact renders as a navigable map:

- **[Uncertainty Map](https://scientific-question-compiler.vercel.app/)** — what the
  corpus establishes (Known), where it disagrees (Controversial), what it implies but
  never states (Silence), and the typed gaps underneath.
- **[Questions](https://scientific-question-compiler.vercel.app/questions)** — the
  ranked, classified, dependency-linked research questions, each with its score and
  the five axes that produced it.
- **[Known & Contested](https://scientific-question-compiler.vercel.app/sources)** —
  the established base and the disputed frontier the questions target.

You are looking at Pass 2 of the Scientific State Compiler, running on hardware we
own.

## What this makes possible next

With the Question pass working, the roadmap's next move is clearer. The bottleneck
analysis from yesterday named **Pass 4 (State)** as the weakest link, but Pass 2
just gave us the raw material State needs: a ranked uncertainty graph. The immediate
next build is to compose those questions, contradictions, and silence maps into a
versioned *state of a field* — accepted vs uncertain vs deprecated models, a
conflict-preserving ledger, and a historical-evolution dimension that turns versioning
into a timeline. Once State exists, the Discovery pass (hypotheses → discriminating
experiments) closes into a true loop.

Concretely, the next increments, each independently shippable:

1. **State object** — fold Question IR + consensus/silence into a `scientific-state-ir`
   keyed by field, reusing the Scientific Git versioning engine from the Discovery
   Compiler.
2. **Evolution pass** — diff successive state versions into structured historical
   transitions (model accepted / deprecated / uncertainty shifted).
3. **ScienceOS dashboard** — a surface rendering Current State, Historical Timeline,
   Uncertainty Map, Conflict Map, Mechanism View.
4. **Close the loop** — point the recursive agent at the state artifact so each
   iteration re-ranks questions and commits a new version.

Today's compiler is the seed for all of it. It is small, local-first, and inspectable —
the kind of thing you can actually run and trust.

## The point

We are not building a better search engine. We are building the missing infrastructure
for *directing* research: a versioned, observability-first map of where understanding
is weakest, compiled on our own hardware, that you navigate instead of searching. The
telescope extended vision; the microscope extended scale; the computer extended
calculation. A scientific compiler extends *scientific reasoning* — by making the next
most valuable question obvious, well-grounded, and traceable back to its sources.

Pass 2 is done. The live map is up. The loop is beginning to turn.

*The Scientific Question Compiler is open source at
[github.com/kliewerdaniel/scientific-question-compiler](https://github.com/kliewerdaniel/scientific-question-compiler)
and running at
[scientific-question-compiler.vercel.app](https://scientific-question-compiler.vercel.app),
compiled entirely on local hardware.*
