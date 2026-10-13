---
author: Daniel Kliewer
canonical_url: /blog/2026-07-23-the-scientific-state-compiler-roadmap
date: 07-23-2026
description: "A research roadmap: the four compiler directions — Mechanistic Reasoning, Scientific Question, Scientific State, and Discovery — are not competing projects. They are five passes in one architecture that compiles the scientific corpus into a versioned, executable model of human understanding. Here is the full plan."
layout: post
title: 'Compiling the State of Human Understanding: A Roadmap for the Scientific State Compiler'
og:description: "From today's Scientific Discovery Compiler to a versioned operating system for science. The four research directions unify into one pipeline: Evidence → Questions → Mechanisms → State → Discovery."
og:title: 'Compiling the State of Human Understanding'
og.type: article
og.url: /blog/2026-07-23-the-scientific-state-compiler-roadmap
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
  - uncertainty
  - scientific-state
  - research-roadmap
draft: false
---

# Compiling the State of Human Understanding: A Roadmap for the Scientific State Compiler

*By Daniel Kliewer · 2026-07-23*

Two days ago I argued that scientific knowledge does not need a better research
assistant — it needs a **compiler**. Yesterday I built the general Scientific
Discovery Compiler and watched it run end to end: five discovery passes turning a
mechanistic-biology corpus into causal structure, a consensus-and-silence map,
falsifiable hypotheses, a research plan, and a local-first version history of the
loop itself. It works, and you can [see it live](https://scientific-discovery-explorer.vercel.app).

This post is the map for where we go next. It is longer than usual on purpose:
it is meant to be the single document we return to when we continue the work — a
roadmap that contains everything we need to keep building without re-deriving the
architecture each time.

The short version: I explored four possible research directions, and the most
important thing I learned is that **they are not four projects.** They are five
passes in one larger architecture. What we have been calling separate compilers —
a Mechanistic Reasoning Compiler, a Scientific Question Compiler, a Scientific
State Compiler, a Discovery Compiler — are stages of a single pipeline that
transforms raw literature into *executable scientific understanding*. And a
fragment of every one of those stages already exists in the thing I built
yesterday.

Let me show the whole shape, then walk each stage, then say exactly what we build
next and why.

---

## The one architecture

Every one of the "four directions" is a transformation over the same corpus. Read
top to bottom, they compose into a single compiler:

```
                 Raw Scientific Literature
                           │
                           ▼
                 PASS 1 — Evidence Compilation
        (claims, provenance, evidence grade, citation quality)
                           │
                           ▼
                 PASS 2 — Question Compilation
          (gaps, unknowns, contradictions → an uncertainty graph)
                           │
                           ▼
                 PASS 3 — Mechanism Compilation
        (typed mechanism nodes + directed causal edges w/ boundaries)
                           │
                           ▼
                 PASS 4 — Scientific State Compilation
   (consensus, conflict, uncertainty, evolution → a versioned "state of science")
                           │
                           ▼
                 PASS 5 — Discovery Compilation
   (hypotheses → predictions → discriminating experiments → research program)
                           │
                           ▼
              Executable Scientific Understanding
```

The insight worth pausing on: **this is the same move a software toolchain makes.**
Source code becomes an intermediate representation, gets optimized through passes,
and is emitted as an executable that is then version-controlled and released.
Science has the same shape and has never had the tooling:

```bash
Software:  source → compiler → executable → version control → releases
Science:   papers → state compiler → understanding artifact → version control → scientific releases
```

The target we are compiling toward has a name I have started using without irony:
**ScienceOS** — a continuously updated, versioned model of what humanity
understands, that you query not with "find me papers about X" but with "show me
the current scientific state of X."

Here is the summary of the four directions as directions, before we collapse them
into passes:

| Direction | Primary object | Core question | Risk | Potential |
|---|---|---|---|---|
| Mechanistic Reasoning Compiler | Mechanisms | How does reality work? | Medium | Very High |
| Scientific Question Compiler | Unknowns | What should we investigate? | Medium | High |
| Scientific State Compiler | Understanding | What does humanity currently know? | High | Extreme |
| Discovery Compiler | Actions | What should we do next? | Very High | Transformational |

They are ordered by ambition, and — not coincidentally — by dependency. Discovery
needs State. State needs Mechanisms and Questions. Everything needs Evidence. So
the real strategic question is not "which one do we choose?" It is:

> **Which compiler pass is the missing bottleneck that keeps the whole system from
> being useful?**

That reframing is the most valuable thing to come out of this planning round, and
the rest of the roadmap is organized around answering it.

## Where we already are

Before describing three stages that do not exist yet, it is worth being precise
about which pieces are already running. The Scientific Discovery Compiler I built
yesterday is not a prototype of *one* direction — it already contains a working
fragment of **every** one:

- **Evidence (PASS 1)** — fully built. Provenance-tracked markdown, claim
  extraction, contradiction detection, citation-quality scoring.
- **Question (PASS 2)** — partially built. The Unknown Detector (`pass-r5-gaps`)
  emits ranked gaps and follow-up queries; the silence map in consensus is the seed
  of an uncertainty graph.
- **Mechanism (PASS 3)** — partially built. `pass-g2-causal` extracts typed
  mechanism nodes and *directed* causal edges with explicit mechanism, mediator,
  and boundary conditions. This is the Mechanistic Reasoning Compiler as a pass.
- **State (PASS 4)** — *partially* built, and this is the gap to close. The
  artifact is versioned (Scientific Git, local-first, commit/diff/recency-weight),
  and `pass-g3-consensus` produces a consensus/silence map. What is missing is the
  *state* framing: a coherent versioned "state of a field" with accepted vs
  uncertain models, conflict preservation, and historical evolution. We have the
  versioning engine; we have not yet composed it into a state object.
- **Discovery (PASS 5)** — partially built. `pass-g4-hypothesis` derives falsifiable
  hypotheses grounded in causal edges/gaps; `pass-g5-planner` sequences them into a
  plan with `inputs_needed` and a stop condition; the recursive agent loop consumes
  those queries and commits a new Scientific Git version each iteration.

So the answer to "which pass is the missing bottleneck?" is concrete: **PASS 4,
the Scientific State object and its historical-evolution dimension, is the weakest
link.** Evidence, Questions, Mechanisms, and Discovery already have real
implementations. State exists only as a versioning log underneath them. Closing
PASS 4 is what turns a set of discovery passes into a *Scientific State Compiler* —
and once State is real, Discovery becomes a closed loop rather than a one-shot plan.

That points the roadmap at a single first move. But the three not-yet-built stages
each deserve their own design, so I will describe them in turn.

## Stage 1 — Question Compilation: a map of what we do not know

The Scientific Question Compiler asks not *what do we know?* but *what remains
unknown?* The premise: progress is not limited by information accumulation (we
have too much); it is limited by **identifying the right unanswered questions.** A
field is defined not by its papers but by its unresolved contradictions, missing
mechanisms, unexplained observations, competing theories, experimental
bottlenecks, and incomplete evidence.

The compiler reverses the traditional workflow:

```bash
Papers → Evidence → Claims → Contradictions → Missing explanations → Unanswered Questions → Research Opportunities
```

New intermediate representations it introduces:

- **Question IR** — a question as a structured object: text, category, domain,
  upstream evidence strength, downstream evidence strength, priority.
- **Question taxonomy** — Mechanistic ("how does X cause Y?"), Causal ("does X
  cause Y?"), Boundary ("when does X become harmful?"), Optimization ("what is the
  ideal state?"), Translational ("how do we intervene?").
- **Question ranking** — by Importance (lives affected), Feasibility (can it be
  answered?), Knowledge Gap (how incomplete is understanding?), Scientific
  Leverage (would answering it unlock other discoveries?), Evidence Density (enough
  data to investigate?).

The explorer becomes a **map of scientific uncertainty**: instead of searching
"Alzheimer's," you see Known / Unknown / Controversial branches, a question graph
where questions are connected by dependency, a research frontier map showing where
knowledge is mature and where it is not, and a historical evolution view showing
how questions migrate (from "what causes Alzheimer's?" in 1980 to "which pathways
connect metabolism and neurodegeneration?" in 2026).

This is the natural next increment on top of what exists: the Unknown Detector
already emits gaps; we promote them to first-class Question IRs, add the taxonomy
and ranking, and render the uncertainty map. Lowest-risk, highest-leverage
extension of today's build.

## Stage 2 — Mechanism Compilation: reconstructing how reality works

The Mechanistic Reasoning Compiler asks *can mechanisms be reconstructed from
evidence?* It is the causal layer. Ours is already built as `pass-g2-causal`, but
the full vision generalizes it: every causal edge carries an explicit mechanism, a
mediator, and boundary conditions; edges with no stated mechanism are rejected at
the schema; "missing edges" and "unresolved mechanisms" become queryable objects.

This is the substrate the other stages sit on. Hypotheses close detected mechanism
gaps; the State compiler records which mechanisms are accepted vs contested;
Discovery uses mechanisms to predict outcomes. The risk is medium (causal inference
from text is noisy) but the potential is very high — mechanism reconstruction is the
difference between a literature summary and a model of the system.

## Stage 3 — Scientific State Compilation: the versioned model of understanding

This is the deepest branch and the one we are weakest on. It asks: *can the current
state of human scientific understanding itself be represented as a computational
object?* The hypothesis is that understanding has a computable state space — at any
moment humanity has established knowledge, uncertain knowledge, competing
explanations, unresolved contradictions, active research directions, and a history
of how all of that changed.

Science is a **state machine**, not a document collection:

```bash
Scientific State(t0) → new evidence → Scientific State(t1) → new evidence → State(t2)
```

Each compilation is a *release*. Alzheimer's Understanding v2026.07 supersedes the
amyloid-centered model with an amyloid + immune + metabolic interaction model. The
state has six dimensions:

1. **Knowledge** — what is believed true (with confidence).
2. **Evidence** — why we believe it (studies, experiments, replication, quality).
3. **Mechanisms** — how it works (causal structure).
4. **Uncertainty** — where confidence is low.
5. **Questions** — what remains unknown.
6. **Historical Evolution** — how understanding changed (1995 amyloid-dominant →
   2015 inflammation → 2026 metabolic).

The Scientific State artifact is the unifying layer. The State Compiler combines
the output of all other passes — Knowledge + Evidence + Mechanisms + Questions +
Uncertainty + History = Scientific State. It behaves like a version-controlled
repository: commits, branches, merges, deprecated theories, accepted models,
unresolved conflicts. *We already have the commit/diff/recency-weight engine
(Scientific Git). What is missing is composing it into a state object with
accepted-vs-uncertain models and a conflict-preserving evolution dimension.* That is
the single most important build in the roadmap.

## Stage 4 — Discovery Compilation: from understanding to action

The Discovery Compiler is the most action-oriented branch. It asks *given what we
know, what should we investigate next?* It consumes the scientific state and
produces not just hypotheses but **discriminating experiments** — tests chosen to
maximize knowledge gain, not interest.

The pipeline:

```bash
Scientific State → Uncertainty Detection → Hypothesis Generation → Hypothesis Ranking
→ Experiment Simulation → Expected Outcome Prediction → Experiment Recommendation → Research Program
```

New intermediate representations:

- **Hypothesis IR** — a structured hypothesis with `predicts`, `confidence`, and a
  falsification test.
- **Experiment IR** — a possible test: population, intervention, prediction.
- **Prediction IR** — every hypothesis must yield a testable prediction (Model A:
  "BBB dysfunction causes cognitive decline → repairing BBB restores cognition";
  Model B: "neuron insulin resistance causes BBB dysfunction → neuron changes
  first").
- **Discrimination IR** — the most important component: the experiment that
  *separates* competing hypotheses. For "BBB→neuron" vs "neuron→BBB," the best
  experiment is a longitudinal measurement of temporal order.

The key word is not "generate" — many systems generate ideas. The key is
**prioritize experiments that maximize uncertainty reduction**. Metrics: number of
hypotheses eliminated, information gain, cost, feasibility, expected impact. For
the mTOR question, the compiler would surface three competing hypotheses (excess
mTOR causes pathology / suppression harms cognition / timing determines effect),
each with a prediction, and recommend a longitudinal intervention with timing
variation as the discriminating experiment.

This stage is the highest-risk (a wrong hypothesis may sound novel; validation can
take decades) but transformational. And it closes the loop:

```bash
Reality → Experiments → Papers → Compiler → Scientific State → New Questions → Hypotheses → Experiments → Reality
```

The compiler becomes part of science itself. A future researcher could ask: "Given
everything humanity knows about Alzheimer's, what experiment would most reduce
uncertainty about treatment?" — and the system would derive the answer from
evidence, mechanisms, uncertainty, competing models, and predicted outcomes, rather
than from pattern-matching on abstracts.

## The Scientific State Explorer / ScienceOS

Today's explorer renders documents, claims, contradictions, the causal graph, the
discovery layer, and Scientific Git. The State Compiler needs a different kind of
surface — a **scientific dashboard** rather than a document browser:

- **Current State view** — "what do we believe today?" (accepted models, contested
  models, major open questions, recent changes).
- **Historical Timeline** — "how did we get here?" (the evolution dimension).
- **Uncertainty Map** — "what remains unresolved?"
- **Conflict Map** — "where do scientists disagree?" (preserving disagreement,
  never collapsing it into a false consensus).
- **Mechanism View** — "how does the system work?"

For a diabetes-and-brain-aging field, the dashboard would show: *Established* —
insulin resistance affects metabolism (confidence very high). *Probable* — insulin
resistance contributes to cognitive decline (confidence medium). *Unknown* — BBB
insulin transport failure as initiating event (confidence low). *Active research* —
can metabolic intervention restore neuronal plasticity?

This is the face of ScienceOS: a continuously updated, versioned model of
understanding you navigate instead of search.

## Strategic principles for building it

Three things have to be true or the whole architecture collapses into a chatbot
with extra steps:

1. **Local-first and sovereign.** Every pass runs on hardware we own, no cloud
   inference, no data leaving the machine. Versioning is local-first; export to a
   remote only by choice. A research infrastructure that phones home is not ours.
2. **Schema-first, repair-always, trust the artifact not the model.** This is the
   hard-won lesson from yesterday's build. The reasoning model emits a ~14k-char
   trace before answering, so it needs token headroom; its output drifts from the
   schema (a string where an array was promised); it must be validated and repaired
   before any downstream pass consumes it. The artifact — not the model call — is
   the product.
3. **Preserve disagreement.** The State Compiler must store contested and
   deprecated models, not just accepted ones. A consensus map that erases conflict
   is a lie. The value is in the unresolved.

## Concrete next build: closing the State pass

Given the bottleneck analysis, the next engineering move is narrow and high-value.
Build it as compass passes on top of the existing explorer, so each increment is
visible and verifiable on the running artifact:

1. **Question IR promotion.** Promote `pass-r5-gaps` output into a typed `question-ir`
   with the five-category taxonomy and the five ranking signals. Reuse the Unknown
   Detector; add classification + scoring. Lowest risk, immediate payoff (the
   uncertainty map lights up).
2. **State object + `pass-g6-state`.** Compose accepted/uncertain/contested models,
   conflict map, and the consensus/silence output into a `scientific-state-ir` keyed
   by field. Reuse the Scientific Git commit/diff/recency engine already built; add
   the "accepted vs uncertain vs deprecated" model ledger and conflict preservation.
3. **Evolution dimension.** Add a `pass-g7-evolution` that diffs successive state
   versions and writes a structured historical transition (model accepted / model
   deprecated / uncertainty shifted / new question appeared). This is what turns
   versioning into a *timeline*, the missing sixth dimension.
4. **ScienceOS dashboard.** A new explorer surface rendering Current State,
   Historical Timeline, Uncertainty Map, Conflict Map, Mechanism View — fed by
   `scientific-state-ir`.
5. **Close the Discovery loop.** With State real, point the recursive agent loop at
   `scientific-state-ir` (not just `loop_plan.queries`): each iteration re-compiles
   state, re-ranks questions, regenerates discriminating experiments, commits a new
   version. The loop becomes a true research operating system.

Each step is independently shippable and ends with a `next build` on the explorer
and a fresh Scientific Git version.

## How we will know it works

Evaluation criteria carried over from the planning, made concrete as tests:

- **Expert agreement.** Do domain scientists recognize the generated state and
  questions as meaningful? (Compare a compiled Alzheimer's state against expert
  reviews and NIH priority statements.)
- **Temporal accuracy.** Does the evolution pass correctly reconstruct historical
  transitions (amyloid → inflammation → metabolic)?
- **Predictive value.** Does the state surface emerging fields before they are
  obvious?
- **Compression.** Can a large corpus collapse into a useful, navigable state?
- **Update ability.** Can new evidence update the state *without* a full rebuild
  (incremental compilation)?
- **Discovery value.** Do recommended experiments actually discriminate between
  competing hypotheses? (Retrospective test: feed pre-CRISPR genetics literature,
  ask whether the compiler suggests CRISPR-like directions.)

Suggested first experiments: (1) compile the Alzheimer's + diabetes-neuroscience
corpus we already have and have neuroscientists score the questions and state;
(2) historical reconstruction — compile 1990–2000 Alzheimer's literature yearly and
compare against actual discoveries; (3) cross-domain state transfer — compile
Alzheimer's, diabetes, and cancer, find overlapping mechanisms.

## Why this is worth doing

We are not building a better search engine or a paper summarizer. We are building
the missing infrastructure layer for directing research itself — a versioned,
observability-first operating system for science that runs on our own hardware. The
telescope extended vision; the microscope extended scale; the computer extended
calculation. A Scientific State Compiler would extend *scientific reasoning* — not
by doing science instead of scientists, but by making the next most valuable
experiment obvious, well-grounded, and traceable all the way back to its sources.

The four directions are not a menu to choose from. They are the five passes of one
compiler we have already begun. The bottleneck is the State pass; the next build
closes it. After that, the loop runs itself, and "observability becomes the
operating system" stops being a thesis and becomes a tool.

*The Scientific Discovery Compiler we built yesterday is the seed. It is open
source and running at
[scientific-discovery-explorer.vercel.app](https://scientific-discovery-explorer.vercel.app),
compiled entirely on local hardware. Everything in this roadmap is an extension of
that seed.*
