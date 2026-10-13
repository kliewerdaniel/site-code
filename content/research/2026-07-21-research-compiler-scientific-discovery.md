---
author: Daniel Kliewer
canonical_url: /blog/2026-07-21-research-compiler-scientific-discovery
date: 07-21-2026
description: "A research vision: why scientific knowledge needs a new computational architecture. The Clinical Research Compiler SDK is an early prototype of a scientific reasoning compiler that transforms literature into versioned understanding — not a better research assistant."
layout: post
title: 'A Research Compiler for Scientific Understanding, Not a Better Research Assistant'
og:description: "Current AI retrieves and summarizes knowledge. A research compiler should transform scientific literature into versioned representations of understanding — evidence graphs, causal models, contradiction maps, unknowns, hypotheses, and research opportunities."
og:title: 'A Research Compiler for Scientific Understanding'
og.type: article
og.url: /blog/2026-07-21-research-compiler-scientific-discovery
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
  - clinical-ai
  - sovereign-ai
  - scientific-discovery
draft: false
---

# A Research Compiler for Scientific Understanding, Not a Better Research Assistant

*By Daniel Kliewer · 2026-07-21*

This is not primarily a description of a software project. It is a research vision — an
argument for why scientific knowledge requires a new computational architecture, and what
that architecture should look like.

The immediate occasion is a build we shipped: the **Clinical Research Compiler**, an
extension of the Research Compiler Agent SDK that discovers clinical sources, extracts
treatments with evidence grades, surfaces conflicts, tracks guideline evolution, and emits a
provenance-tracked artifact rendered as a live explorer. That system works. But reading the
run back, the interesting question is not "did it deploy." It is whether the thing we built
is the right *category* of tool — and the answer is that it is only the first instance of a
much larger idea.

**Current AI systems primarily retrieve and summarize existing knowledge. A research
compiler should instead transform scientific literature into versioned representations of
scientific understanding.**

That sentence is the thesis. The rest of this essay explains it.

## 1. The distinction we kept missing

For most of this project we described the tool as a *research aide*. A research aide is,
honestly, a better search engine. The thing we were actually circling is closer to a
**scientific reasoning compiler**. The distinction is not cosmetic — it changes what the
system is for:

| Research aide | Research compiler |
|---|---|
| Finds papers | Finds relationships |
| Summarizes evidence | Synthesizes evidence |
| Answers questions | Generates questions |
| Retrieves known knowledge | Produces structured understanding |
| Helps researchers work faster | Changes what researchers can discover |

A research aide reduces the cost of *reading* scientific knowledge. A research compiler
reduces the cost of *generating new scientific understanding*. Those are different products.
The first optimizes consumption. The second optimizes discovery.

## 2. The purpose is not cheaper reading

The next version of the SDK should be built around one statement:

> **The purpose of a research compiler is not to reduce the cost of reading scientific
> knowledge. It is to reduce the cost of generating new scientific understanding.**

That means the output chain cannot stop at "disease → papers → summaries." It has to become
a compilation pipeline in which each stage is a higher-level intermediate representation:

```
Literature
  → Claims
    → Evidence
      → Mechanisms
        → Consensus
          → Contradictions
            → Unknowns
              → Hypotheses
                → Research Opportunities
```

Every arrow is a compiler pass. Every stage preserves provenance back to the literature it
came from. By the time you reach "Research Opportunities," you are no longer looking at the
literature — you are looking at a structured representation of what the literature *means*,
and where it is silent.

## 3. Papers are source code

The metaphor that makes this concrete: **papers are equivalent to source code.** A compiler
does not reason over `.c` files as prose; it parses them into an intermediate representation
and reasons over that. We should treat the literature the same way.

The true primitive is not the document. It is the **claim**. A claim is a typed, machine-
reasoned unit:

```json
{
  "claim": "Drug X reduces mortality",
  "population": "adults > 65",
  "intervention": "Drug X",
  "outcome": "all-cause mortality",
  "confidence": 0.82,
  "supporting_sources": ["src-1", "src-7"],
  "contradictions": ["src-12"]
}
```

The compiler reasons over *claims*, not PDFs. Documents become inputs to a parser; claims
become the IR the rest of the pipeline operates on. This is the single most important
architectural upgrade, because everything downstream — evidence graphs, contradiction
compilation, hypothesis generation — only becomes possible once the unit of knowledge is a
claim with structure, confidence, and provenance, rather than a paragraph.

## 3b. The distinction that is everything

There is a sharper way to state the whole thesis, and it is the part worth building the
project around:

> **A research compiler should not compile papers. It should compile the *state of
> understanding* represented by papers.**

That distinction is everything. A PDF compiler produces PDFs. A code compiler produces
executable programs. A research compiler should produce **explanations, models, hypotheses,
unresolved questions, and experimental opportunities.** The artifact is not the literature.
The artifact is *scientific understanding*.

This reframes the real research question. We are no longer asking "how do we make researchers
more efficient?" We are asking: **can we create computational infrastructure that changes how
scientific discovery itself happens?** That is a much more interesting question — and it
places this work inside the broader movement toward AI systems that assist with scientific
reasoning, hypothesis generation, and automated research workflows. Recent efforts from
groups like Google Research and others are moving in this direction, but they often focus on
*agents that perform parts of the research loop*. The angle here is different and, arguably,
more foundational: **create the knowledge substrate those agents reason over.**

## 3c. The Scientific IR — a stack of intermediate representations

The deepest technical contribution follows from the "papers are source code" metaphor.
Software compilers don't jump straight from source to machine code; they pass through
intermediate representations, and every transformation is inspectable. The research compiler
needs the same:

```
Papers
  → Claims IR
    → Evidence IR
      → Mechanism IR
        → Causal IR
          → Consensus IR
            → Discovery IR
```

Each pass transforms the knowledge state into a higher-level representation, preserving
provenance at every step. The compiler becomes *explainable by construction* — you can open
any IR and see exactly how the understanding was derived. This is also what makes the
downstream artifacts trustworthy: a hypothesis in the Discovery IR carries a traceable path
back through Causal, Mechanism, Evidence, and Claims IR to the original papers.

## 3d. Discovery Artifacts — what nobody has stated yet

The current explorer answers "what did we find?" The next output should answer "what has
nobody explicitly stated yet?" Three shapes:

**Hidden connection** — Mechanism A appears in diabetes research; Mechanism B in Alzheimer's.
No paper connects them. But A → pathway X → inflammation → B. The compiler surfaces a
cross-domain hypothesis nobody wrote.

**Missing experiment** — Known: drug affects biomarker X; X predicts outcome Y. Missing: no
trial measures whether the drug changes Y *through* X. Suggested study attached.

**Field-level contradiction** — The field assumes A causes B. The evidence actually shows A
causes B *only under condition C*. Research opportunity: define the boundary conditions.

These are the artifacts that make an expert lean in — not a summary of what they already
knew, but the missing edge in the synthesis.

## 3e. Scientific Git — version-controlled understanding

Every compilation should produce a versioned snapshot, like a commit:

```
Clinical Knowledge v2026.07
  Added:       + New mechanism
  Changed:     ~ Treatment confidence increased
  Deprecated:  - Previous hypothesis weakened
  Unresolved:  ? 14 contradictions remain
```

Scientific understanding becomes **version controlled**. This is perhaps the most intuitive
explanation of why the compiler metaphor matters: the literature is recompiled periodically,
and each version is a diff against the last. You can bisect it, revert it, and ask "what did
we learn between v2026.06 and v2026.07?" — a changelog for science itself.

## 3f. The Expert Surprise Score — the benchmark that matters

The hardest question is how to measure whether the compiler discovered something valuable.
Not papers processed, not retrieval accuracy, not summary quality. The right instrument is an
**Expert Surprise Score**: would a domain expert say

- "I knew this already,"
- "I suspected this," or
- "I had never connected these before?"

The highest-value output is the third category. That single metric reframes evaluation around
*discovery* rather than *fidelity* — and it is exactly the prospective benchmark (can experts
recognize valuable hypotheses? does it predict future papers?) made operational.

## 4. The artifacts a compiler should emit

Once claims are the primitive, the compiler produces scientific work products — structures a
scientist can pick up and use immediately. The highest-value ones:

**Evidence Graphs.** A normal knowledge graph says `Drug → treats → Disease`. An evidence
graph makes the *evidence* a graph object:

```
Drug → reduces mortality
  Supported by:  RCT A, Meta-analysis B
  Contradicted by: Study C
  Confidence: Moderate
  Population: Adults > 65
```

The evidence itself becomes a first-class node, not a footnote.

**Contradiction Compilation.** This is one of the highest-value features, because science
progresses by *resolving* disagreements. The compiler should output:

```
Conflict #142
  Claim: "Treatment X improves survival"
  Conflict source:
    Study A: positive result
    Study B: negative result
  Possible explanation:
    ✓ Population difference
    ✓ Dosage difference
    ✓ Follow-up duration
    ✓ Statistical power
```

That is far more valuable than "here are 10 papers." It turns a pile of citations into a
*scientific debate map*.

**Knowledge Delta.** Every compilation should produce a **Git diff for science**:

```
Clinical Knowledge Compiler v1.4
  New:        + Mechanism discovered
              + Trial evidence added
  Changed:    ~ Treatment recommendation confidence increased
  Removed:    - Weak hypothesis rejected
```

This is where the "compiler" metaphor becomes real. The literature is recompiled
periodically; each version is a diff against the last. The artifact is not a snapshot — it is
a changelog of understanding.

**Unknown Detection — the killer feature.** The question is not "what do we know?" It is
"what *should* exist but does not?" Example:

```
Known:    A causes B
          B causes C
Missing:  No study has tested whether A causes C
```

The compiler generates **research gaps** by finding the missing edge in a causal chain.

**Hypothesis Generation with Provenance.** Not "AI thinks X." Instead:

```
Generated hypothesis: Pathway A may influence Disease B.
  Reason:
    Paper 1: A activates mechanism M
    Paper 2: M influences symptom S
    Paper 3: S predicts Disease B
  Novelty:    High
  Confidence: Moderate
```

The evidence chain is attached, so an expert can evaluate the hypothesis rather than trust
it.

**Research Opportunity Ranking.** The compiler ranks opportunities by novelty, impact,
evidence support, feasibility, and **expected information gain**, and outputs "here are the
20 experiments humanity should consider."

**Why This Matters.** Every artifact answers "why should a human care?" — e.g., "Three
independent pathways converge on target X; current therapies ignore this pathway; potential
impact: a new therapeutic direction."

## 5. From Evidence Explorer to Understanding Explorer

The current explorer answers "what evidence exists?" The next version should answer "what
does this evidence *collectively imply*?" The interface should stop feeling like a database
and start feeling like exploring a field's mental model. Sections like:

- **Current Understanding**
- **Known Mechanisms**
- **Strong Evidence** / **Weak Evidence**
- **Active Debates**
- **Unknowns**
- **Potential Discoveries**

The UI still needs two modes — but the second is where the product becomes unique:

- **General researcher:** "What is known about Alzheimer's?"
- **Expert scientist:** "What assumptions in Alzheimer's research are weakest?"

The first mode is a research aide. The second is a reasoning compiler — it interrogates the
*structure* of the field, not its summary. Competing Theory Generation belongs here: the
compiler produces Model A (inflammation-first) vs Model B (protein-folding), each with an
evidence bar, and surfaces what is unresolved ("which mechanism is upstream?"). The output
is a debate map, not a verdict.

And the explorer should optimize for **knowledge gaps** — the places where human knowledge is
*inefficiently structured*. Consider a field with 10,000 papers, 500 mechanisms, 50 diseases,
and 3 disconnected research communities. The compiler notices that Mechanism X is central yet
studied separately in three domains. That is exactly where breakthroughs occur: connecting
previously separated knowledge. This idea has precedent in computational theories of
discovery and knowledge-network research — and it is a direct output of the Discovery IR in
§3c.

## 6. Benchmarks around discovery, not summarization

The hardest and most important shift is how we judge the thing. Do **not** benchmark "did it
summarize correctly?" Benchmark "did it identify something useful?"

- Can experts recognize the generated hypotheses as valuable?
- Does it rediscover known research gaps (face validity)?
- Does it *predict* future papers (prospective validity)?
- Does it identify contradictions earlier than reviewers do?

The success criterion is not whether a researcher saves time reading papers. It is whether
domain experts discover useful insights that were not explicitly written in any single paper
but *emerge from the structured synthesis of thousands of sources*.

## 7. The evolved SDK architecture

Concretely, the SDK should evolve into a pipeline of typed passes, each emitting an
intermediate representation that the next pass consumes — exactly like a source-code
compiler:

```
Clinical Research Compiler SDK
  Pass 1:  Document Parser        → markdown / source IR
  Pass 2:  Claim Extractor        → Claims IR       (papers become claims)
  Pass 3:  Evidence Mapper        → Evidence IR     (claims weighted by sources)
  Pass 4:  Causal Reasoner        → Mechanism / Causal IR
  Pass 5:  Contradiction Detector → Contradiction map
  Pass 6:  Consensus Builder      → Consensus IR
  Pass 7:  Unknown Detector       → research gaps
  Pass 8:  Hypothesis Generator   → hypotheses w/ provenance
  Pass 9:  Research Planner       → Discovery IR: ranked opportunities + experiment designs
  Output:  Scientific Understanding Artifact
```

This is the Scientific IR stack from §3c made operational as named passes — each one a typed
transformation of the knowledge state, each inspectable. The Research Planner is the capstone:
its output is not "interesting hypothesis" but "what would we do next?" — e.g., *Hypothesis:
pathway X affects disease Y (confidence 0.71); cheapest validation: Experiment A; highest-
value validation: Experiment B; clinical relevance: high.* The compiler connects knowledge to
action.

The Clinical Research Compiler we shipped is an early prototype of this idea — it already has
a Document Parser, a Claim Extractor (in embryo), an Evidence Mapper, a Contradiction
Detector, and a Consensus/Unknown view via the guideline timeline. What it lacks is the causal
reasoner, the unknown detector, the hypothesis generator, and the research planner. Those are
the passes that turn an aide into a compiler.

## 8. What the build proved, and what it didn't

Being honest about the prototype matters, because it anchors the vision in something real.
The build proved the *substrate* works: a versioned, provenance-tracked artifact; an honest
confidence metric (we raised 0.58 → 0.76 by fixing the measurement, not the bar); a generator
that owns the UI so future work products render without a styling detour. It also surfaced
the traps that block the ambitious version — discovery counted dead links and login walls as
"16 sources"; the confidence score was a process metric mislabeled as clinical trust; we
shipped on a happy-path local check twice; we never audited extraction against ground truth.

What it did **not** prove is the thing this essay argues for: that the system reduces the
cost of *generating understanding*. It doesn't yet. It retrieves, structures, and renders.
The roadmap above is precisely the set of passes that would let it cross that line.

## 9. The reframe, and why the timing is right

Search engines organize information. Research assistants summarize information. **Research
compilers compile scientific understanding.**

The sentence to build the whole project around is sharper still:

> **The goal of a research compiler is not to automate scientists. It is to make the
> accumulated knowledge of humanity computationally manipulable.**

Because once knowledge becomes computationally manipulable, entirely new operations become
possible. You can **diff** it, **optimize** it, **test its consistency**, **find its gaps**,
**generate hypotheses**, **simulate consequences**, and **design experiments**. Those are
impossible when knowledge exists only as disconnected papers.

That reframes the SDK from an application into a proposed computational architecture for
science — and it does not compete with scientific experts. It creates a new layer of
infrastructure *between literature and human reasoning*. The analogy is the one that explains
the whole vision:

- **Before compilers,** programmers thought in machine instructions.
- **After compilers,** they could think in abstractions.
- **A research compiler could do the same for science:** before, scientists think directly in
  papers; after, they think in *compiled representations of knowledge*.

The timing is aligned with broader clinical AI trends. Current medical-AI work is
increasingly moving toward structured, auditable systems rather than purely conversational
interfaces — traceable trial-eligibility reasoning, structured clinical research artifacts,
continuous evaluation. The differentiator here is that we push the structured-artifact idea
one level higher: from *clinical data* artifacts to *scientific knowledge* artifacts. The
compiler periodically recompiles the literature into intermediate representations that
preserve provenance, uncertainty, disagreement, and evolution over time. The output is not a
summary. It is understanding, versioned — and the next important scientific question, made
visible.

The future versions name themselves:

- **v1 — Research Retrieval Compiler:** "turn papers into structured evidence."
- **v2 — Research Understanding Compiler:** "turn evidence into models."
- **v3 — Scientific Discovery Compiler:** "turn models into discoveries."

We shipped an early v1. The rest of this essay is the direction of travel.

---

*This essay extends the Clinical Research Compiler, built on the [Research Compiler Agent
SDK](https://github.com/kliewerdaniel/research-compiler-agent-sdk). The live explorer is at
`clinical-evidence-explorer.vercel.app`. The companion build post — "Compiling Medical
Evidence" — documents the pipeline itself.*
