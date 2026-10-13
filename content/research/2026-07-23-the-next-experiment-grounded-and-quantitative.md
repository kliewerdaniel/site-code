---
author: Daniel Kliewer
canonical_url: /blog/2026-07-23-the-next-experiment-grounded-and-quantitative
date: 07-23-2026
description: "Today we proved the Scientific Question & State Compiler survives scale — 6.3M ORKG RDF triples distilled into a 300-document corpus, 881 claims, 13 ranked questions, a versioned state of the field, all compiled locally on a 35B model. But surviving scale is not the same as being correct. This post records what we built, what we learned, the four bugs that only appeared at scale (including one that shipped Alzheimer's data into the live ORKG demo), and a fully-specified next experiment: source-level traceability, a grounding audit with a groundedness rate, a negative control, a fixed versioning layer, an explicit distillation method, an external-validity check against survey papers, and a move to quantitative domains (COVID-19 observatory or materials science) where contradictions are measured, not just defined."
draft: false
tags:
  - ai-agents
  - compile-time-ai
  - knowledge-compiler
  - local-first-ai
  - scientific-state-compiler
  - orkg
title: "The Next Experiment: From 'Survives Scale' to 'Correct' — Grounding, Negative Controls, and Quantitative Domains"
---

## What today was

Today we took the Scientific Question & State Compiler — born on three
hand-written documents — and pointed it at **real, large-scale data**: the full
**ORKG** (Open Research Knowledge Graph) RDF export, **6,344,307 triples**, ~897
MB of N-Triples. The question was honest and narrow: *does the compiler
generalize, or was the toy corpus hiding its assumptions?*

The answer, after a full day of building, breaking, fixing, and deploying: **the
architecture generalizes.** The same five-stage pipeline that ran on three docs
ran on 300 documents drawn from a live scholarly knowledge graph and produced
the same *shape* of output — a map of what we don't know, a versioned state of
what we do, and a loop that closes them.

But — and this is the whole point of the next experiment — **survives scale is
not the same as correct.** Today proved the tool is *robust*. It did not yet
prove the tool is *right*. This post records both, then specifies exactly how we
close that gap.

## What we built today (the validation experiment)

**Ingestion.** `orkg_ingest.py` streams the entire 897 MB dump *once*, in bounded
memory, into a queryable index:

- 14,128 predicates, 1.04M resources, 65,689 papers, 98,774 contributions,
  8,420 research problems.

`select_domain.py` picks a research problem, walks its papers → contributions →
statements, and renders each contribution as a markdown document with
human-readable, label-resolved claims. We chose the largest problem in the
graph: **"Empirical Research in Requirements Engineering"** — 728 papers, 766
contributions — and extracted **300 documents**.

**Scale-hardening.** Three things broke only because the input was large, and
each fix is a legitimate adaptation of the existing tool:

1. **Batched claims** (`KC_CLAIMS_BATCH`): N documents per model call instead of
   N calls, with each claim attributed back to its source document. Turns 300
   sequential calls into 60.
2. **Crash-safe checkpoint / resume / retry**: the claims pass persists after
   every batch, skips completed documents on restart, and retries a failed batch
   at half size down to a single document. A 5-hour job that any single timeout
   would have destroyed now resumes cleanly.
3. **Sharded contradiction detection** (`KC_CONTR_SHARD`): scans windowed blocks
   of claims, re-bases indices into the global list, merges. This fixed a silent
   failure — on 881 claims in one shot, the model's chain-of-thought overflowed
   and the JSON failed to parse, so the pass reported **0 contradictions**, which
   is almost never true of a real field. After the fix it found genuine
   disagreements.

**Output.** Run end-to-end, locally, on the 35B model:

- **881 claims** across 300 contributions
- **2 contradictions** detected (genuine scope disagreements)
- **6 gaps**, **7 silence topics**
- **13 ranked questions**, 4 flagged controversial
- **Pass 4 state**: accepted / uncertain / contested models, a conflict ledger,
  12 open questions
- **The closing loop** ran one iteration and Scientific Git committed a new
  version with a real diff

**Delivery.** Two live artifacts, one tool:

- Original (3-doc toy): https://scientific-question-compiler.vercel.app
- **ORKG validation (300-doc, real data): https://scientific-question-compiler-orkg.vercel.app**

And a blog post: "Validating at Scale: The Compiler Meets 6.3 Million RDF
Triples."

## The bug that shipped (and the lesson in it)

After deploying, the live `/state` page on the ORKG explorer showed
**Alzheimer's disease** content — the toy corpus — not the requirements
engineering field we had just compiled. A human (Daniel) caught it by looking at
the demo. The root cause was a `KC_BUILD` propagation bug in `run_all.py`: it
hardcoded `BUILD = Path("build")/...` instead of honoring `KC_BUILD=build_orkg`,
then handed that wrong path to the loop. The loop read the *toy*
`scientific-state.json` as its state source, and the ORKG state pass
regenerated a state carrying the Alzheimer's `field`, which got bundled into the
explorer's static import.

We fixed the bug at the source (`run_all.py` now honors `KC_BUILD`), regenerated
a clean ORKG `scientific-state.json`, recopied it into the explorer, rebuilt, and
redeployed. The live page now shows the ORKG field with **zero** Alzheimer's
mentions.

The lesson is sharper than "we had a bug." **A silent cross-contamination bug
shipped to a public URL and was only caught by a person reading the output.**
That is the exact failure mode the next experiment is designed to defend against:
if a node can be published with no link back to its source, genre boilerplate
can hide inside real findings, and wrong data can ship undetected. Traceability
is not polish. It is the difference between a knowledge compiler and articulate
autocomplete.

## What we learned

1. **The architecture is scale-robust.** Same code, ~100× more input, same-shaped
   output. Pass 2 → Pass 4 → loop holds.

2. **Scale failures are a distinct class.** Per-doc call explosions, long-job
   fragility, and single-shot context overflow all *only* appear past a threshold.
   They are not the same as "the idea doesn't work" — they are "the tool needs
   resilience engineering." Checkpointing, batching, and sharding are not optional
   polish on 35B hardware; they are what make a multi-hour job survivable.

3. **The 35B model is slow and CoT-expensive.** Every call is minutes, not
   seconds. This is why resilience (resume, retry) matters more here than on a
   fast API — and why we must spend calls *deliberately*, not waste them on
   boilerplate.

4. **Domain shapes what the tool can find.** On a narrative/qualitative domain
   (requirements engineering), the "contradictions" were *boundary-definition*
   disputes — "does CrowdRE include Evolution and Prioritization, or not?" — not
   *measured* disagreements. That is a property of the corpus, not the compiler.
   To test whether the tool catches real disagreement, we need domains with
   **numeric, comparable contributions**.

5. **A tool that publishes flat assertions is untrustworthy by construction.**
   Without a link from every claim/gap/question back to a specific source, we
   cannot tell a corpus-derived finding from the model's prior about "what
   empirical papers usually lack." That distinction is the entire credibility of
   the project.

## The gap, stated plainly

Today demonstrated the architecture **survives scale**. It did **not** yet
demonstrate the architecture is **correct**. The next experiment is about
correctness: grounding, controls, and domains where "right" is checkable.

---

# The next experiment (full specification)

This section is the brief for the next run. It is written so a fresh session can
execute it. It is organized around the seven considerations that define it.

## Domain choice: structured-and-quantitative, not just bigger

RE papers are mostly narrative/qualitative, which is why our "contradictions"
were term-boundary disputes. Medicine and hard science give a fundamentally
harder and more meaningful test: ORKG's biomedical and clinical comparisons
contain **actual numeric contributions** — reported efficacy percentages,
dosages, sample sizes, effect sizes. Real contradictions there look like *"Study
A reports 67% efficacy, Study B reports 41% for the same intervention,"* not
*"two camps define a term differently."*

**Primary domain — ORKG's COVID-19 Observatory.** Large, well-curated, heavily
comparison-tabled (vaccine efficacy, treatment trial outcomes), with a high
density of genuinely conflicting numeric claims. This is the more legible story
for a general audience.

**Alternative / second run — materials science (battery / energy-storage
comparisons).** Dense numeric benchmark tables (capacity, efficiency, cost). A
different failure mode than medicine or RE: contradictions from unit mismatches
or measurement-condition differences rather than genuine disagreement — which
makes it the cleaner ground-truth check if we want unambiguous verification.

**Recommendation:** run the primary on COVID-19; keep materials science as the
*negative-control-unrelated* domain (see §2) and optionally as a second
quantitative validation.

## 1. Grounding / traceability (highest-priority fix)

Right now every claim, gap, and question is a flat assertion with no link back to
a specific ORKG contribution ID or triple. Fix:

- **Attach `source_ids: [orkg:R12345, orkg:R12388, ...]`** to every claim, gap,
  and question — the specific contributions that node was derived from. The
  ingestion already resolves resource URIs to labels; extend it so each
  contribution document carries its ORKG ID, and the claims pass records which
  source document (hence which ORKG contribution) produced each claim.
- **Add a post-hoc audit pass** (a second, cheaper model call, or even a script):
  for each gap/claim, check whether the cited source actually contains evidence
  for it, or whether the model filled in a plausible-sounding gap from its prior
  about "what empirical papers usually lack." Flag ungrounded nodes instead of
  publishing them silently.
- **Report a groundedness rate**: % of gaps/claims with verifiable `source_ids`
  vs. % that are prior-knowledge fill-ins. That single number tells us whether we
  built a knowledge compiler or a very articulate autocomplete of "what research
  papers are usually missing." This is the headline metric of the next run.

## 2. Negative control

Compile a corpus from a **totally unrelated domain** using the *identical*
prompt and pipeline, and diff the two Silence Maps. If "lacks replication
protocols," "lacks demographic reporting," and "lacks cost-benefit analysis"
show up near-verbatim in both, we've confirmed those are **template outputs**,
not corpus-derived findings — and we know exactly which gap categories to
suppress or re-engineer. This is cheap and fast (the RE corpus we already have
plus one new unrelated one, e.g. materials science or image classification) and
should happen *before* investing in a bigger medicine run.

Concretely: run the pipeline on (a) COVID-19 observatory and (b) an unrelated
ORKG domain; emit both Silence Maps; compute set overlap; report which silence
topics are domain-specific vs. template-inventory. Suppress or re-prompt the
template ones.

## 3. Fix / instrument the versioning layer

The Scientific Git log on `/state` showed `accepted ? · uncertain ? · contested ?
· conflicts ?` for intermediate commits — the diff mechanism that is supposed to
be the trust story ("versioned, real diffs") wasn't populating for intermediate
commits. Before the next run, **either fix the diff population or at minimum log
the raw counts to a file** so we can report real before/after deltas when new
sources are added mid-experiment. The `git_history.diff()` engine already handles
state fields (fixed earlier this week); the gap is that intermediate-loop commits
weren't recording a populated `changed.counts`. Verify the loop commit writes a
non-empty `changed` block; if not, fix `loop.py`/`git_history.py` before the run.

## 4. Document the distillation step explicitly

"6.3M triples → 300 documents" is a real number but an opaque pipeline. For the
writeup to hold up, publish: **how were the 300 documents selected from 728
papers** — random sample, highest-triple-density papers, or stratified by
sub-topic? That determines whether "generalizes to real data" is a fair claim or
whether we cherry-picked a clean subset. Instrument `select_domain.py` this time
to record and report the **selection method** and the **compression ratio**
(triples consumed → documents emitted → claims extracted). This doesn't block the
run, but it must be reported alongside the results.

## 5. Domain choice (covered above) — go quantitative

COVID-19 observatory primary; materials science as the unrelated negative-control
domain and optional second quantitative run. The point: contradictions should be
*measured* (67% vs 41% efficacy) not *defined* (what is CrowdRE's scope).

## 6. External validity check

Pull 1–2 recent **survey/review papers** in the chosen field (survey papers
explicitly enumerate "open problems in X") and compute **overlap** between their
stated open questions and the compiler's ranked list. This gives a real
precision/recall-style number instead of "these questions look plausible to me"
— which is currently the only evidence we have that q1–q13 are good. Report
overlap as the external-validity metric.

## 7. Scale and stability

Push **past 300 documents** this time (the user wants more of the dataset used),
and run the *same* corpus **twice** with different batching/order to see if the
top-ranked questions and contested list are stable. If q1's score of 0.787
becomes 0.55 on a re-run with the same input just reordered, that's a signal the
ranking is sensitive to something other than the underlying evidence — which
matters a lot if we're calling this a "versioned state of the field." Report the
stability delta alongside the results.

---

# Operational brief (everything the next run needs)

This is the environment and command context, recorded so the next experiment can
be executed without re-deriving it.

**Repository:** `~/Projects/scientific-question-compiler` (branch `main`, pushed
to `kliewerdaniel/scientific-question-compiler`).

**Model:** local Ornith 35B (`deepreinforce-ai_Ornith-1.0-35B-Q4_K_M.gguf`) at
`http://localhost:8080`, OpenAI-compatible. Endpoint
`/v1/chat/completions`; response `choices[0].message.content` = answer,
`reasoning_content` = CoT. **Healthy and verified.**

**Runtime constraint — broken hermes venv.** Do **not** use the `openai` package.
Call the endpoint via stdlib `urllib.request` exactly as `inference.py` does.
Always prefix Python runs with:
```bash
env -u PYTHONPATH -u VIRTUAL_ENV KC_MAX_TOKENS=12000 KC_TIMEOUT=600 /usr/bin/python3 <script>.py
```

**Consent-gate constraint — never `rm -rf build` or `rm -rf .next`.** The
compiler and explorer **overwrite** artifacts; prefer overwrite over deletion.
If a clean slate is truly needed, remove specific files (e.g. `rm -f
build_orkg/question-compiler/scientific-state.json`), not whole trees.

**Per-pass `max_tokens` budgets** (35B CoT is ~4–6k tokens; these protect the
global ceiling): claims 6000×(batch), contradictions 5000, gaps 6000, question
9000, state 9000, evidence 5000. Global ceiling `KC_MAX_TOKENS=12000`,
`KC_TIMEOUT=600`.

**Pipeline scripts (all in repo root):**
- `orkg_ingest.py <dump> <out-index.json>` — stream-parse the RDF dump into a
  queryable index.
- `select_domain.py [domain-substring] [cap]` — extract a problem's papers →
  contributions → documents into `corpus_orkg/`. **Instrument this run to record
  selection method + compression ratio (§4).**
- `compiler.py` — Pass 2 chain: ingest → claims → contradictions → gaps →
  QUESTION → assemble. Honors `KC_BUILD`, `KC_CLAIMS_BATCH`, `KC_CONTR_SHARD`.
- `state.py` — Pass 4: consumes question-state → versioned scientific-state.
  Honors `KC_BUILD`.
- `loop.py` — Pass 4.5: open question → evidence brief → new source → recompile →
  version. Honors `KC_BUILD`, `KC_CORPUS`.
- `run_all.py <corpus-dir> <field>` — full pipeline. **Now honors `KC_BUILD`**
  (the bug that cross-contaminated the ORKG run with Alzheimer's data is fixed).
- `git_history.py` — Scientific Git versioning; `diff()` handles state fields.

**Key environment variables:**
- `KC_BUILD` — build dir name (use `build_covid` / `build_materials` for the next
  runs; keeps artifacts separate from the RE validation).
- `KC_CLAIMS_BATCH` — docs per claims call (5 worked; may raise for >300 docs).
- `KC_CONTR_SHARD` — claims per contradiction window (60 worked).
- `KC_CORPUS` — where the loop writes its evidence brief (set to match the run's
  corpus dir so it doesn't pollute the toy `corpus/`).
- `KC_MAX_TOKENS`, `KC_TIMEOUT`.

**Explorer:** `explorer-orkg/` is an independent Next.js app (deployed as
`scientific-question-compiler-orkg.vercel.app`) with real data in
`explorer-orkg/data/`. The original toy explorer is `explorer/` →
`scientific-question-compiler.vercel.app`. To deploy a new domain run, copy the
generated `build_<domain>/question-compiler/{question-state,scientific-state,git_history}.json`
into a fresh explorer copy's `data/` and `vercel deploy . --prod --yes
--archive=tgz` as a new project (do not overwrite the RE explorer).

**Blog:** `~/a10/sovereign-ai-site/content/blog/` (date-prefixed filename,
`/blog/<full-filename>` URL). Pushes auto-deploy; `llms.txt`/`llms-full.txt`
auto-generate from the blog index, so every post is LLM-discoverable. The
three-deliverable convention for each experiment: **GitHub repo + Vercel explorer
+ pushed blog post.**

**Deliverables for the next experiment:** a new GitHub repo (or new branch),
a new Vercel explorer project for the quantitative domain, and a blog post —
plus, this time, the **groundedness rate**, the **negative-control silence-map
diff**, the **fixed version diffs**, the **documented distillation method +
compression ratio**, the **survey-paper overlap**, and the **stability delta**.

---

# Success criteria for the next experiment

The next run succeeds not when it produces more output, but when it can answer:

- **Groundedness:** what % of gaps/claims carry verifiable `source_ids`, and what
  % are prior-knowledge fill-ins? (Target: publish the number; drive fill-ins
  down.)
- **Control:** which silence topics are template-inventory vs. domain-specific,
  after the negative-control diff?
- **Versioning:** do intermediate commits show real, populated before/after
  deltas?
- **Distillation:** what was the selection method and compression ratio from
  6.3M triples to documents to claims?
- **External validity:** what overlap does the ranked question list have with
  survey-paper open problems?
- **Stability:** how much does the top-question ranking move under reordering of
  the same input?
- **Quantitative catch:** on COVID-19 / materials, does the compiler surface
  *measured* contradictions (67% vs 41% efficacy), not just defined ones?

If we can report those seven numbers, we will have moved from "the architecture
survives scale" to "the architecture is correct — and we can prove it." That is
the experiment. The tool is no longer a demo. The next run is whether it is
trustworthy.

*Everything above — the pipeline, the bugs we fixed, the constraints, and this
seven-point design — is the brief for that run.*
