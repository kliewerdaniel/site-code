---
author: Daniel Kliewer
canonical_url: /blog/2026-08-05-build-a-video-editing-hermes-agent
date: 08-05-2026
description: "A methodology guide and continuity record: how a bare Hermes Agent became a video-editing assistant — and the repeatable, domain-independent method behind it. GreenPatch and a private vertical-video pipeline appear as worked examples of the pattern, not prescriptions."
image: /images/ComfyUI_00200_.png
layout: post
title: 'How I Taught an Agent to Edit Video — and the Repeatable Method Behind It'
og:description: "A methodology guide and continuity record: how a bare Hermes Agent became a video-editing assistant, and the general method for teaching an agent any craft."
og:image: /images/ComfyUI_00200_.png
og:title: 'How I Taught an Agent to Edit Video — and the Repeatable Method Behind It'
og:type: article
og:url: /blog/2026-08-05-build-a-video-editing-hermes-agent
tags:
  - ai-agents
  - local-first-ai
  - sovereign-ai
  - skills
  - video-generation
  - agent-infrastructure
---

> This post is two things at once. To you, it's a guide: how to take a general
> agent and teach it a craft — video editing here, but the method generalizes
> to anything. To the agent reading it, it's a continuity record: the state of
> the world as of this writing, so a future session can pick up exactly where
> this one left off. If you're the agent, skip to the
> [Current environment reference](#current-environment-reference).

The model is not the product. That sentence is easy to agree with and hard to
operationalize. For months I treated my agent as a smarter chatbot: I typed
requests, it typed answers, and the useful work lived only in the transcript —
gone the moment the window closed. The shift that made the agent genuinely
useful was realizing that intelligence, in this context, is not the model.
It's the accumulated decisions that shaped it — the choices about *how* to do
work, captured as software the agent can run and as instructions the agent can
load on its own.

This post walks through how that shift happened, concretely: from a bare
[Hermes Agent](https://hermes-agent.nousresearch.com/) install to an agent
that can take damaged greenscreen footage and repair it, and — by the same
method applied a second time — turn a topic into a finished, captioned
vertical video, all locally, with no cloud APIs required for the core
pipeline. GreenPatch is the worked example I can point to directly, because
it's a real, public repo with a real CLI and a real test suite. The
vertical-video generator I call kleincannon in this post is further along the
"private, still-changing project" end of the spectrum — I'll describe its
shape honestly, including what isn't public yet, because the shape is the
point, not the specific repo.

If you take one sentence away: *an agent becomes competent at a craft when you
give it (1) software that does the work and (2) a skill file that teaches it
how and when to use that software.* Everything else in this post is detail in
service of that sentence.

---

## The shape of the system

Three layers, kept deliberately separate. The separation is what makes the
whole thing *sovereign* rather than *rented* — you can swap any one layer
without touching the others.

| Layer | What it is | Where it lives |
|---|---|---|
| **Agent** | The reasoning and orchestration core — picks tools, calls them, decides what's next | `~/.hermes/` |
| **Skills** | Reusable `SKILL.md` procedures that teach the agent *how* and *when* | `~/.hermes/skills/` (bundled), or a `SKILL.md` shipped inside the tool's own repo |
| **SDKs** | The code that actually does the work — ordinary packages with CLIs | independent project repos |

The discipline layer (how to work in general) and the capability layer (what
to work on) are different things, and conflating them is the most common
failure mode. A skill like "verify before claiming completion" is
domain-free — it should apply whether the agent is repairing video or writing
a Kubernetes controller. An SDK like a greenscreen repair tool is
domain-specific and knows nothing about verification discipline on its own.
You want both, and you want them in different places so each can evolve
independently.

The compounding effect comes from the fact that each new SDK, once it has a
skill beside it, becomes something the agent can use *without you in the
loop*. The next task is then cheaper by exactly the cost of that capability.
Over a year this is the difference between an agent that answers questions
and an agent that runs meaningful parts of your workflow unattended.

---

## What was actually set up, in order

This is the chronological record. If you're reconstructing the environment,
walk it top to bottom; each step is independently verifiable.

**1. Bare Hermes.** Hermes Agent (built by [Nous Research](https://nousresearch.com/))
is a self-improving, provider-agnostic coding and automation agent — the model
behind it can be swapped freely, since Hermes itself is just the harness.
Install, run setup, then a health check:

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes setup
hermes doctor
```

Hermes ships with its own bundled skills out of the box (document handling,
web research, common dev workflows), keeps a skills directory at
`~/.hermes/skills/`, and — notably — has a built-in learning loop: after a
complex multi-step task, Hermes will often offer to save the approach it just
used as a new skill for next time. Its skill format is compatible with the
open [agentskills.io](https://agentskills.io) standard, so skills are
portable across compatible agents, not locked to Hermes specifically.

**2. The discipline layer — superpowers.** Rather than invent engineering
habits from scratch, I adapted the [`obra/superpowers`](https://github.com/obra/superpowers)
methodology — an open-source, MIT-licensed "agentic skills framework and
software development methodology" built by Jesse Vincent — into Hermes's
skill format and loaded it as engineering skills under
`~/.hermes/skills/software-development/`. Superpowers' own design enforces a
clarify → design → plan → implement (TDD) → verify → review cycle; the pieces
I lean on most:

- `using-git-worktrees` — isolate every feature so `main` stays clean
- `writing-plans` — break work into bite-sized, reviewable steps
- `executing-plans` — run the plan with checkpoints, stop on blockers
- `verification-before-completion` — no completion claim without fresh evidence, run in the same message that claims success
- `finishing-a-development-branch` — verify, then present integration options
- `writing-skills` — prove an agent *fails without* the skill before you write it, the same red/green discipline superpowers applies to code

These are what keep the capability work honest. Without them, "the agent
built a video tool" can mean nothing more than "the agent produced code that
looked plausible in the transcript." With them, it means "the agent ran the
test suite and the repair produced a valid clip, and it can show you the run
that proves it."

**3. The capability layer — SDKs.** This is where domain work lives. Two
examples, built the same way, at different levels of maturity:

- **[GreenPatch](https://github.com/kliewerdaniel/GreenPatch)** — a
  greenscreen repair CLI. You mark a damaged region and a clean source patch
  on frame 0; it tracks both through the clip, clones the source onto the
  target, and blends it back in. Public, installable, tested.
- **kleincannon** — a vertical-video generator: topic (or pasted script) in,
  a scripted monologue voiced, word-aligned, illustrated with one cinematic
  image per beat, captioned, and cut to 1080×1920 out. Still a private,
  actively-changing project — described here for the pattern, not as
  something to `pip install` today.

Both are ordinary Python projects you'd run from a terminal. Neither is
magic. What makes them *agent-native* is step 4.

**4. The teaching layer — `SKILL.md` files.** Each SDK ships a `SKILL.md`
that explains the package to the agent in its own language: triggers, exact
commands, gotchas, a verification checklist. This is the bridge. Without it,
the agent sees a repo it doesn't know how to drive. With it, the agent can be
told "fix the keyed-away ring in this clip" and know precisely what to run,
what flags matter, and how to prove it worked.

**5. The orchestration layer — directing instead of doing.** Once steps 1–4
exist, you stop invoking tools yourself and start issuing intent. "Take this
raw footage, repair it, then produce a 30-second vertical cut with captions"
becomes a single instruction the agent decomposes and executes, verifying
each stage as it goes.

The single most important operational lesson surfaced at step 3 and is worth
stating before anything else, because it will waste an afternoon if you don't
know it going in:

```bash
env -u PYTHONPATH -u PYTHONHOME python3.12 -m venv .venv
```

Agent shells — especially on macOS — can leak `PYTHONPATH` and `PYTHONHOME`
into child processes. When the agent spawns a fresh Python 3.12 venv for an
SDK, a stray 3.11 NumPy pulled in from the agent's own environment can crash
OpenCV mid-run in a way that looks like a bug in the SDK but isn't. Stripping
those two variables when creating *any* child venv is non-negotiable. It's
now documented directly in GreenPatch's own install instructions for exactly
this reason.

---

## Two example capabilities, at two levels of maturity

### GreenPatch — the lesson is *ship a real CLI and a real skill, together*

GreenPatch is the cleanest illustration of the minimal viable teaching loop,
because it's small enough to describe completely. The problem it solves is
narrow: small subject regions — chrome, jewelry, glasses, reflective foil,
metallic costume pieces — get keyed away by a green background because they
happened to match the background color. You select the damaged region and a
clean patch nearby on frame 0; GreenPatch tracks both regions through the
clip, clones the source onto the target, and blends it back in.

```bash
cd /path/to/GreenPatch
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e .
```

The interactive workflow is a first-frame selector: left-drag draws the
damaged (target) region, right-drag draws the clean source patch, space
accepts the selection and repairs the whole clip.

```bash
greenpatch repair input.mp4 output.mp4 --tracker optical --blend seamless
```

What matters for the method, not just for GreenPatch specifically:

- It exposes a real CLI with real, documented options — `--tracker`
  (`planar` default, or `optical`), `--blend` (`seamless` default, `feather`,
  or `copy`), `--padding`, `--feather`, `--config`, `--no-audio`.
- It has **both** an interactive first-frame selector (a human draws the
  boxes) and a **headless** verification path
  (`examples/headless_repair_test.py`, a synthetic clip and a fake selection
  driving the real `repair_video()` function) — so the agent can verify the
  tool actually works without a display attached, which matters a lot when
  the agent is running in a sandboxed or remote terminal.
- It preserves the original audio track by default: the frame writer emits a
  silent clip, then FFmpeg re-muxes the source audio back in with a stream
  copy (no re-encode). `--no-audio` skips this if you want the silent output.
- Its own README states the `PYTHONPATH`/`PYTHONHOME` gotcha explicitly,
  which is exactly what a good `SKILL.md` should also carry forward — the
  fix should live in more than one place, because the agent may read either.

The verification checklist the agent actually runs before claiming a repair
is done:

```bash
python3.12 -m compileall greenpatch tests examples
python3.12 -m pytest tests -q
python examples/headless_repair_test.py
```

Two things GreenPatch is honest about *not* doing yet, which the skill file
also states plainly so the agent doesn't overpromise: the `orb` tracker is
implemented but not wired into the CLI, and there's no fully-automatic
(`auto`) mode — a human still marks the regions. A skill that hides a tool's
real limitations is worse than no skill at all, because the agent will
confidently attempt something the tool can't do.

A focused, single-purpose tool with an honest skill beside it is the smallest
unit of "the agent can now do X." That's the whole lesson.

### kleincannon — the lesson is *one manifest, many stages*

kleincannon demonstrates composition, and it's the reason I don't stop at
GreenPatch-sized tools. Video generation is not one operation; it's a
pipeline, and the design choice that made it tractable was a single manifest
(`episode.json`) that every stage reads from and writes back into. No stage
asks a question interactively; it reads what it needs from the manifest or
fails loudly with a clear error. The stages:

```bash
script → tts → align → prompts → images → captions → build
```

Each stage is a standalone script you can re-run in isolation. When a stage
produces garbage output, you rerun *that stage*, not the whole video — the
same reasoning as the git-worktree discipline above, applied to a data file
instead of a branch. This isolation is the entire game for any pipeline long
enough that "just run it again from the start" stops being a reasonable
answer.

Two honest, environment-specific constraints shaped the design, and they're
the kind of constraint you should expect in any local-first media pipeline,
not quirks unique to this one:

- **FFmpeg without `libass`/`drawtext`.** The bottled FFmpeg build on the
  machine this runs on ships without text-filter support, so `subtitles` and
  `drawtext` are permanently unavailable. Captions are instead rasterized
  with Pillow into transparent PNGs and composited with FFmpeg's `overlay`
  filter. No system FFmpeg rebuild required; the pipeline stays
  self-contained and doesn't assume a capability that may not be there.
- **The LLM step is optional, not load-bearing.** A manual-script mode (you
  paste the monologue yourself) and a local fallback for image prompts both
  work fully offline. A full end-to-end AI run needs a local model server for
  the script/prompt stages; the rest of the pipeline — TTS, alignment, image
  generation, captioning, the final cut — does not depend on it.

The orchestration payoff is concrete here in a way it isn't for a
single-command tool like GreenPatch: an image-generation backend such as
ComfyUI is a long-lived local service the agent learns to *reuse* across a
run, while text-to-speech is a one-shot subprocess the agent spins up and
tears down per stage. The agent learns that distinction from the skill file,
not from being told it fresh every session.

Neither GreenPatch nor kleincannon is the goal in itself. The goal is the
shape: software with a skill beside it, driven by the agent. Once you've
built one capability this way, the second is faster, and the tenth is
routine — which is exactly the point being made about compounding above.

---

## The teaching step itself

This is the part that turns "code I wrote" into "capability the agent has." A
skill is a `SKILL.md` file with YAML frontmatter. Its `description` field is
a *trigger*: it tells the agent when to load the skill, so write it as
"Use when …" with concrete, recognizable symptoms rather than a vague
summary.

```yaml
---
name: greenpatch
description: "Use when repairing green-screen keyed regions in video with GreenPatch."
version: 1.0.0
author: GreenPatch Authors
license: MIT
metadata:
  hermes:
    tags: [greenpatch, video, repair, tracking, opencv]
    related_skills: []
---

# GreenPatch Usage Skill
## Overview
...
```

To teach the agent a repo you just cloned, you can simply point it at the
file rather than pre-installing anything:

```bash
hermes chat -q "Read ~/Documents/Projects/GreenPatch/SKILL.md and the README,
then run 'greenpatch repair demo.mp4 fixed.mp4' and report what it did."
```

For skills that should always be available regardless of which repo you
happen to be in, drop them into `~/.hermes/skills/<category>/<name>/SKILL.md`
and they become live immediately — every installed skill is automatically
available as a slash command, and the agent can also be asked in plain
language to use one. Hermes will resolve any configured settings a skill
declares (API keys go into `~/.hermes/.env` and are never shown to the model;
non-sensitive paths and preferences go into `config.yaml`) and inject them
into context when the skill loads, so the agent doesn't need to go hunting
for configuration itself.

Skills can also be composed into **bundles** — a bundle is just a named YAML
alias over a list of already-installed skills, useful for codifying "how we
always use these together." And the agent isn't limited to using skills you
wrote: it can create, update, and delete its own skills through its
`skill_manage` tool, which is the mechanism behind the "offer to save this as
a skill" behavior mentioned earlier. That's the self-improvement loop closing
on itself — skills as the agent's procedural memory, distinct from the small
durable facts it keeps in plain memory.

The rule that matters most, borrowed straight from the superpowers
`writing-skills` discipline: **prove the agent fails without the skill before
you write it.** If the agent already succeeds at the task unaided, the skill
is decorative — it isn't changing behavior, just adding words to the context
window. A skill earns its place only if you can show the failure it fixes.

---

## Hard-won lessons

These are mistakes already paid for, recorded so they aren't paid twice.

- **Strip the environment on every child process.**
  `env -u PYTHONPATH -u PYTHONHOME` before creating or launching any child
  Python interpreter. The leak is silent until it isn't, and it wastes
  exactly the kind of afternoon a skill file is supposed to prevent.
- **Don't let the agent manage services it doesn't own.** If an image-
  generation backend or any other long-lived local service degrades after
  heavy use, the fix is a fresh server for the next unit of work — but the
  agent should never kill a process the user is running themselves. Reusing
  a user's already-running service is the point of treating it as
  orchestration; restarting it out from under them defeats it.
- **Verify limitations that don't exist yet may still exist.** Before
  assuming a capability — a text filter, a codec, a tracker mode — is
  present, check for it (`ffmpeg -hide_banner -filters | grep -iE
  "subtitles|drawtext"` is the concrete example above). A skill that assumes
  an environment it hasn't confirmed will fail in exactly the cases where
  verification would have caught it first.
- **Local-first is a constraint, not a slogan.** No cloud APIs means the
  pipeline owns its own models end to end, and that has real licensing
  consequences — a non-commercial TTS model, for instance, has to be swapped
  before any commercial use of the pipeline. Constraints like this belong in
  the skill file, not just in your head.
- **Verify before completion, in the same message that claims it.** A
  previous green run proves nothing about the tree you're integrating right
  now. This is the single rule, out of everything in the discipline layer,
  that most separates "looks done" from "is done."
- **Never publish without explicit review.** Drafts stay in a local staging
  area; nothing is committed or deployed to the live site until a human has
  read it. This is a standing constraint on the whole system, not a one-time
  note about this post.

---

## How to teach the agent anything

The general procedure, stripped of the video-specific details:

1. **Write the software.** Ordinary code in an ordinary repo. Give it a real
   CLI. Keep stages isolated so any one of them can be re-run without
   re-running the rest.
2. **Write a `SKILL.md` beside it.** Triggers, exact commands, the gotchas
   you actually hit, a verification checklist — and the tool's real
   limitations, stated plainly. Prove an agent fails without it first.
3. **Let the agent use it.** Point Hermes at the skill and give it one real
   task. Watch whether it complies; close the gaps you find.
4. **Compound.** The next capability is cheaper by the cost of this one. The
   agent's skill library grows; your per-task effort shrinks.

The method generalizes well past video. The same four-step pattern has
produced research-compilation tools elsewhere in this project — SDKs that
turn a corpus into a structured, versioned knowledge artifact — with the same
discipline layer underneath and the same "one manifest, many passes" shape as
kleincannon's pipeline above. The craft changes; the teaching method does
not.

---

## Current environment reference

*For the agent: use this section to reconstruct state from bare setup to
now, in order.*

**Agent**
- Hermes Agent — `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`, then `hermes setup`, then `hermes doctor`.
- Docs: https://hermes-agent.nousresearch.com/docs/ · Source: https://github.com/NousResearch/hermes-agent
- Skills root: `~/.hermes/skills/` — discipline skills under `software-development/` (adapted from `obra/superpowers`); video-specific skills under `video/`, plus per-repo `SKILL.md` files inside GreenPatch and the private video pipeline.

**Local services (run by the user, long-lived — the agent reuses them and never kills them)**
- A local image-generation backend on `:8188` for illustration frames.
- A local LLM server on `:8080` for optional script/prompt generation.
- A local TTS/voice-cloning engine for narration, with speed adjustment applied post-generation and word timings scaled to match.

**Capability SDKs**
- GreenPatch — greenscreen repair, public and installable. Repo: https://github.com/kliewerdaniel/GreenPatch
- kleincannon — vertical video generator (script → tts → align → prompts → images → captions → build). Private, still evolving; not yet a public repo.
- Research-compilation SDKs — same pattern applied to turning a text corpus into a queryable knowledge artifact instead of a video.

**Blog & site (do not push without approval)**
- Drafts live in a local staging area.
- Standing rule: nothing is committed or deployed until a human has reviewed it.

**Environment rule that prevents the most common breakage**
```bash
env -u PYTHONPATH -u PYTHONHOME python3.12 -m venv .venv
```

---

## Closing

An agent that edits video is not a product you bought. It's infrastructure
you own — software you wrote, instructions you captured, and a loop that gets
cheaper every time you use it. The model will be replaced eventually; the
accumulated decisions are what compound. That's the whole argument for
local-first, and it's why this setup is less "a video tool" and more "a way
to turn any craft into something the agent can do."

The loop is the product. Teach it the next thing.