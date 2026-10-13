---
author: Daniel Kliewer
canonical_url: /blog/2026-07-23-the-loop-closes-itself
date: 07-23-2026
description: "We closed the loop on the Scientific State Compiler: the open questions from the compiled state are turned into new evidence sources, the field is re-compiled, and Scientific Git records a real version diff. The compiler begins to direct its own next compile — the loop, not the model, becomes the product."
draft: false
tags:
  - ai-agents
  - compile-time-ai
  - knowledge-compiler
  - local-first-ai
title: "The Loop Closes Itself: A Compiler That Directs Its Own Next Compile"
---

Yesterday's post shipped **Pass 4**, the Scientific State Compiler: a versioned
model of what a field understands, separating accepted from uncertain from
contested, preserving disagreement rather than flattening it.

Today we closed the loop. The compiler now takes its own open questions, turns the
most leveraged one into a *new evidence source*, re-compiles the field, and records
a real **version diff**. It begins to direct its own next compile. This is the
moment the loop — not the model — becomes the product.

## The shape of the loop

The architecture is five steps, all running on hardware we own:

1. **Read the state.** Pull the current `scientific-state.json` — the accepted,
   uncertain, and contested models, plus the open questions.
2. **Pick a target.** Choose the highest-leverage open question. When the field is
   contested, prefer the question sitting closest to the live disagreement — that
   is where new evidence moves the needle most.
3. **Generate an evidence brief.** A model pass proposes *what would resolve* the
   question and *what type of evidence* would do it. Not citations — a specification
   of the experiment: "a longitudinal cohort with fasting insulin and hippocampal
   volumetry," "pericyte-specific insulin-receptor knockout with BBB tracer kinetics."
4. **Write it as a source.** The brief becomes a new document in the corpus. The
   loop has manufactured its own next input.
5. **Re-compile and diff.** Re-run the state pass, then commit to Scientific Git.
   The new version carries a real `diff` against the old one — what models entered,
   what stayed contested, what the field's counts became.

Step 3 is the part a retrieval system cannot do. A search returns the papers that
exist. The brief specifies the study that *should* exist. That is synthesis, not
retrieval.

## What actually happened

On the three-document *Alzheimer's & metabolic dysfunction* corpus, the loop ran
end to end against the 35B model:

- It targeted the open question *"What is the temporal hierarchy between metabolic/
  vascular dysfunction and amyloid?"* — the most contested hinge in the field.
- It produced a brief titled *"Temporal Hierarchy and Permissive Role of Metabolic/
  Vascular Dysfunction in Early Amyloid-Driven Neurotoxicity."*
- It wrote that brief into the corpus and re-compiled.
- Scientific Git committed **version 2** (hash `bd692c8db287b7f1`), with a real diff:
  the state now carries **7 accepted / 4 uncertain / 3 contested** models and **3
  open conflicts**, each named, each attributable.

The diff is not cosmetic. It is the structural record that re-compiling with new
evidence changed the field's modeled understanding. Run it again and version 3
appears. The artifact is no longer a frozen file — it is a *versioned research
substrate*, and the version history is the proof the loop is advancing rather than
spinning.

## Why this matters

The prevailing paradigm treats research assistance as a question answered. The State
Compiler treats research as a *compile* — an idempotent, versioned transformation of
a corpus into understanding. The closing loop makes that transformation
*self-directing*: the output of one compile (open questions) is the input selector
for the next (which evidence to seek).

This is exactly the SovereignSpec thesis made mechanical: **intelligence is not the
model; intelligence is the accumulated decisions that shaped the model.** Here, the
accumulated decisions are the versioned sequence of compiles, each one recorded,
each one diffable, none of it leaving the machine unless you push it.

## What you can look at

- Live explorer, **State** view with the version history:
  **[scientific-question-compiler.vercel.app/state](https://scientific-question-compiler.vercel.app/state)**
- The `loop.py` source and the versioned artifact are in the repo:
  **[github.com/kliewerdaniel/scientific-question-compiler](https://github.com/kliewerdaniel/scientific-question-compiler)**

## Where this goes

The five compiler directions — Mechanistic Reasoning, Scientific Question,
Scientific State, Discovery, Unknown Detector — are passes in one architecture. With
Question (Pass 2) and State (Pass 4) producing versioned artifacts, and the loop
closing them, the remaining move is to let the loop run unattended across a corpus
that grows from its own output: a research compiler that wakes each morning, reads
its own open questions, and compiles the field one step further.

You are looking at a compiler that directs its own next compile, running on hardware
we own.

## What this makes possible next

Unattended iteration: the loop reads its open questions, proposes evidence, and
re-compiles on a schedule — each pass a new versioned commit. The field's modeled
state advances without a human prompting it, and every advance is diffable and
revertible. That is observability as the operating system, applied to science
itself.
