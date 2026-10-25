---
author: Daniel Kliewer
canonical_url: /blog/2026-10-25-hermes-local-video-studio
date: 10-25-2026
description: "How six separate investigations became one reproducible local video-production capability: Qwen-Image-2.1-Turbo for stills, the ArtCraft Rust suite for compositing and editing, and a validation layer that records every step as verified or merely requested. Includes the working code, the four silent failures it caught, and the exact commands to reproduce it."
image: /images/hlvs-lighthouse-hero.jpg
layout: post
title: "Hermes Local Video Studio: A Reproducible Video Production Capability for Agents"
og:description: "Six investigations, one capability. Qwen-Image plus the ArtCraft Rust suite, wrapped in a validation layer that distinguishes what was requested from what was verified — with the four silent failures that distinction caught."
og:image: /images/hlvs-lighthouse-hero.jpg
og:title: "Hermes Local Video Studio: A Reproducible Video Production Capability for Agents"
og:type: article
og:url: /blog/2026-10-25-hermes-local-video-studio
tags:
  - hermes-agent
  - local-image-generation
  - artcraft-suite
  - rust
  - mlx
  - video-editing
  - reproducibility
twitter:card: summary_large_image
twitter:description: "A reproducible local video-production capability: Qwen-Image plus the ArtCraft Rust suite, with a validation layer that separates requested from verified."
twitter:image: /images/hlvs-lighthouse-hero.jpg
twitter:title: "Hermes Local Video Studio: A Reproducible Video Production Capability for Agents"
---

For the last two weeks I have been building films with local models and local
Rust tools, and writing down what broke. Six articles came out of that: an
installation guide, a model guide, and three post-mortems about a dissolve, a
keyframe and a mask that each reported success and each did nothing.

Writing post-mortems is not the same as building a system. A post-mortem tells
you where the cliff is. It does not stop the next agent walking off it. So this
is the other half: the six investigations compressed into one repository that a
fresh Hermes agent can clone, probe, and run.

![A frame from the pipeline's own output](/images/hlvs-lighthouse-hero.jpg)

That image is not a screenshot. It is a frame decoded from the 12-second film
this repository produced, by the code in this repository, on the machine that
wrote it.

## The objective

Combining three things that are each useful and none of which is sufficient:

1. **Hermes** as the orchestrator — it reads a brief, writes a plan, calls tools,
   inspects results.
2. **Qwen-Image-2.1-Turbo** running locally on Apple Silicon for stills.
3. **The ArtCraft Rust suite** — clean-room reimplementations of the Adobe apps,
   each with a headless CLI where every UI action is a command.

Individually these are three interesting tools. Together they are a production
pipeline with no cloud dependency, no subscription, and no GUI. The thing that
was missing was not capability. It was **trustworthiness**: knowing which of your
steps actually happened.

## The rule

> An operation is not done because a command returned `0`. It is done when
> something measured the result.

This is the whole repository. Every step is recorded as either **verified** — a
measurement is attached — or **requested_only** — the tool accepted the command
and nothing checked it. In code:

```python
@dataclass
class StepResult:
    step: str
    status: str = REQUESTED_ONLY
    requested: Dict[str, Any] = field(default_factory=dict)
    verified: Dict[str, Any] = field(default_factory=dict)

    def verify(self, **measured):
        if not measured:
            raise ValueError("verify() requires measured evidence; "
                             "a step with no measurement stays requested_only")
        self.verified.update(measured)
        self.status = VERIFIED
        return self
```

`verify()` raises if you call it without a measurement. A step cannot be promoted
to "done" by optimism, and a report cannot quietly round "requested" up to
"verified" — the two live in different fields.

That sounds like bookkeeping. It is not. In building this, **four separate
failures returned success**, and every one of them was caught by a measurement
rather than by an exit code.

## Architecture

```
brief
  |
  v
project.json ---- validate (schema + allowlist) ----> reject before any GPU time
  |
  v
capabilities (doctor) ----> is the machine able?  no -> stop, report
  |
  +--> QwenAdapter ......... stills (t2i / edit)
  |
  +--> FilmCraft adapter ... place, motion, transitions, export
  |      (EffectCraft, LightCraft, PhotoCraft, VectorCraft plug in here)
  |
  v
media measurement ....... ffprobe / ffmpeg / frame diffs / loudness
  |
  v
manifest.json ........... per-step requested + verified + hashes
```

Six layers, each with one job and one refusal:

| layer | owns | refuses to |
|---|---|---|
| `schema.py` | what a project may say | accept unknown ops, bad dimensions, dangling refs |
| `capabilities.py` | what the machine has | claim a tool works because a path exists |
| `adapters/qwen.py` | image generation | return before `result.path` exists |
| `adapters/filmcraft.py` | timeline, transitions, export | let item ids pass as clip ids |
| `adapters/media.py` | measurement | trust any renderer's own report |
| `runner.py` | ordering, resume, gating | continue past a failure to look productive |

### Why adapters and not one interface

The tools are not interchangeable, and a unified interface would have to lie
about it. FilmCraft needs `--save-as` to create a project and `--project … --save`
on every later call; EffectCraft saves from inside its script; LightCraft and
VectorCraft are stateless one-shots. Their id spaces differ *within* a single app:
FilmCraft's `timeline.place` takes **item** ids while `applyVideoTransition` takes
**sequence clip** ids, and passing one for the other fails with
`no edit point at the playhead` — which blames the playhead, not the argument.

So each adapter encodes one tool's real shape and exposes a small honest
vocabulary on top. `FilmCraft.dissolve()` moves the playhead itself, because
forgetting that is the single most expensive mistake in the suite.

### Why the project format is app-independent

The spec says "a 4-second scene with a push-in and a 16-frame dissolve". It does
not say "call `effects.setParam`". Creative intent and tool invocation are
different things, and only the first belongs in a portable file.

## The project format

```jsonc
{
  "schema_version": "1.0",
  "project": {"name": "lighthouse", "canvas": {"width": 1024, "height": 576}, "fps": 24},
  "assets": [
    {"id": "a_approach", "source": {"kind": "generate", "mode": "t2i", "seed": 4101,
                                    "prompt": "A weathered stone lighthouse..."}}
  ],
  "scenes": [
    {"id": "s1", "asset": "a_approach", "duration": 4.0,
     "motion": {"type": "push_in", "from": 100, "to": 112}}
  ],
  "transitions": [{"between": ["s1", "s2"], "type": "cross_dissolve", "frames": 16}],
  "render": {"format": "h264", "bitrateKbps": 6000}
}
```

Validation is front-loaded and strict, because a spec error found after six
generations has cost an hour and the same error found by `validate` costs a
second. It rejects:

- canvas dimensions that are not multiples of 32 — the model refuses them, and
  `1280x720` is exact 16:9 and does not work
- unsupported motion types, modes, transitions, formats, against an explicit
  allowlist, so a typo cannot become a silent no-op
- scene→asset references that do not resolve
- transitions between scenes that are not adjacent
- duplicate ids, non-positive durations, missing prompts, missing files

## Installation

Two paths, and the difference matters: this was built against an **existing**
installation, so the clean path is documented but marked untested where it is.

**Integrating with what you have:**

```bash
git clone <repo> ~/Projects/hermes-local-video-studio
cd ~/Projects/hermes-local-video-studio
scripts/setup
scripts/doctor
```

`doctor` discovers; it does not install. Expected output is one line per app with
a path, and `qwen: reachable` once the studio is up.

**Prerequisites:** macOS on Apple Silicon, Python ≥ 3.9, ffmpeg, ~20 GB free disk
for the Q8 weights, and 48 GB of RAM if you want headroom — the model holds one
17.8 GB variant resident.

**From clean** you additionally need Homebrew's `ffmpeg` and `python@3.12`, the
Rust toolchain, each ArtCraft app built release, and the Qwen studio with its
weights fetched on demand. The repository URLs for the ArtCraft apps are not
published here; if you do not have them, `doctor` reports `missing` and the
stages that need them are **skipped rather than faked**.

**Smoke test, no model required:**

```bash
scripts/smoke
```

That runs 26 tests, validates the example project, and prints the capability
summary.

## The implementation

The package is standard-library only. `numpy` and `pillow` are optional and used
only by the *measurement* helpers — so schema validation and the NLE adapter work
on a bare Python, and the motion and content checks report as skipped rather than
passing.

### Discovery: found is not the same as working

```python
def probe_binary(path):
    """A binary that cannot list its commands is not usable."""
    out = _run([path, "commands"], timeout=25)
    ok = bool(out) and "ERROR" not in out[:10]
    return {"runs": ok, "command_catalogue_chars": len(out)}
```

The doctor records `found` and `runs` separately. A file on disk that cannot
answer `commands` is not a capability, and reporting it as one is how a pipeline
gets three stages deep before dying.

It also reports something I would not have guessed:

```
text filt : no — burn captions via title graphics, not drawtext
```

This machine's ffmpeg has **no `subtitles`, `ass` or `drawtext` filter**. Not
"might not" — I listed the filter catalogue and searched it, and they are absent.
The consequence is concrete: no ffmpeg invocation will ever burn a subtitle here.
Captions must be composited as title graphics. A plan that assumes otherwise
fails at the last step of a long build, which is the worst possible time.

### Generation: the adapter will not return a path that does not exist

```python
if state == "done":
    path = (st.get("result") or {}).get("path")
    if not path or not os.path.isfile(path):
        raise QwenError("job %s reported done but %r is not a file" % (job_id, path))
    return {"job_id": job_id, "path": path, ...}
```

A job reporting `done` means the server finished. It does not mean a usable file
exists. The adapter treats the two as different events.

### Assembly: the ids that are not the ids you think

```python
def placed_clips(self, track_index=0):
    """Sequence CLIP ids in timeline order — not the item ids you placed."""
    seq = self.sequence()
    video = seq.get("video") or []
    if track_index >= len(video):
        return []
    return sorted(video[track_index].get("items", []), key=lambda i: i.get("start", 0))
```

The runner places items, then reads the sequence back and maps clip ids by
timeline order. It never carries an item id into a command that wants a clip id.

### The gate that matters

```python
wanted = [t for t in project["transitions"] if t["type"] == "cross_dissolve"]
got = nle.transitions_count()
if got != len(wanted):
    raise SystemExit("expected %d dissolves, sequence has %d — refusing to export"
                     % (len(wanted), got))
```

Asserting the **expected count** rather than "greater than zero" is deliberate. A
film that silently loses four of its thirteen dissolves exports happily; only a
count check catches it.

## The skill system

Nine skills, each installable into Hermes, each pointing at the code rather than
duplicating it:

| skill | responsibility |
|---|---|
| `environment-discovery` | what exists, and what answers |
| `qwen-image` | generate/edit, with the constraints that bite |
| `creative-apps` | per-app adapters, silent-drop discipline |
| `video-planning` | brief → validated spec |
| `asset-provenance` | prompts, hashes, transformations |
| `timeline-validation` | config validation vs rendered validation |
| `render-qa` | measure the file, not the renderer |
| `end-to-end-production` | coordinate the chain |
| `troubleshooting` | symptom → cause → fix |

The most important of these is `timeline-validation`, because it encodes the
distinction the whole system exists to make:

| question | method | what it proves |
|---|---|---|
| did the command land? | read the project back | the config contains it |
| did it reach the picture? | measure frames | the viewer sees it |

A dissolve can be present in the project and absent from the export. Only the
second question answers "is it in the film".

## The production workflow

```bash
scripts/validate-project examples/minimal-project/project.json
scripts/run-project examples/minimal-project/project.json
```

Six stages: validate, probe, generate, assemble, render, verify. A run stops at
the first failed stage. It does not attempt later stages to look productive.

Real output from the recorded run:

```
OK   capabilities               {'rust_apps_found': 7, 'qwen_reachable': True, 'text_filters': False}
OK   asset:a_approach           {'path': '...', 'sha256': '...', 'job_id': '...'}
OK   asset:a_lantern            {'path': '...', 'sha256': '...', 'job_id': '...'}
OK   asset:a_dark               {'path': '...', 'sha256': '...', 'job_id': '...'}
OK   nle:create                 {'project_exists': True}
OK   place:s1                   {'item_id': 8}
OK   place:s2                   {'item_id': 10}
OK   place:s3                   {'item_id': 12}
OK   nle:map_clips              {'clip_ids': [9, 11, 13]}
REQ  motion:s1                  no measurement
REQ  transition:s1->s2          no measurement
OK   verify:transitions         {'count': 2}
OK   render                     {'bytes': 9264092, 'duration': 12.01, 'sha256': '9ae966c8...'}
OK   verify:container           {'codec': 'h264', 'width': 1024, 'height': 576}
OK   verify:decode              {'clean': True}
OK   verify:duration            {'actual': 12.01, 'model': 'sum', 'expected': 12.0}
OK   verify:motion              {'frame_diff': {'s1': 6.707, 's2': 28.343, 's3': 0.935}}
OK   verify:content             {'luma_std': {'s1': [74.8, 74.5, 74.3], ...}}
```

**17 verified, 5 requested_only, 0 failed.**

The five `REQ` lines are not a defect. `motion:s1` records that a command was
accepted; `verify:motion` records that frames 0.8 s apart inside the clip differ
by 6.7, 28.3 and 0.9. Merging those two into one green tick would hide exactly
the thing this repository is for.

## The reliability lessons

The three post-mortems were about a dissolve, a keyframe and a mask. Here is what
each one became in code, and what the build added on top.

**The dissolve that wasn't applied** was a missing `playhead.set`: transitions
act on the edit point under the playhead, so every dissolve failed, and the export
completed anyway. Now `FilmCraft.dissolve()` moves the playhead itself, and the
runner asserts the count against the spec before allowing an export.

**The keyframe that went nowhere** was a time-space error: a keyframe before the
clip's start clamps onto the first keyframe, collapsing the animation to a static
frame with no error. Now motion uses sequence-absolute times — and I found a
second, independent version of the same class of bug while building this, below.

**The mask that rendered anyway** was a layer that existed, attached, read back
correctly, and drew nothing — usually because a shape path had no Fill, or because
an opaque carrier solid sat above the plate. The rule that came out of it: a
capability claim needs a measured property of the rendered frame, not a read-back.

### Two more, found while building the repository

**The parser that returned a fragment.** `filmcraft-cli import` prints its result
pretty-printed across several lines. My first parser scanned lines for one
starting with `{`, found `}` instead, and returned `{}` — so the run reported
"placed 3 clips but sequence reports 0". My second attempt scanned last-brace to
last-brace and returned a *nested* object, which made `inspect sequence` look
like an empty timeline. The fix decodes from each `{` and keeps the object that
ends at the final brace:

```python
decoder = json.JSONDecoder()
final = text.rfind("}")
idx = text.find("{")
while idx != -1:
    try:
        obj, consumed = decoder.raw_decode(text, idx)
    except json.JSONDecodeError:
        idx = text.find("{", idx + 1)
        continue
    if idx + consumed - 1 == final:
        return obj if isinstance(obj, dict) else {}
    idx = text.find("{", idx + 1)
```

Both failures looked like *the tool* was broken. Neither was. There are now
regression tests for it.

**The keyframe that animated nothing, again.** `effects.setParam` with a `time`
and a value writes a **static** value. The catalogue says so plainly — *"a
parameter that is not animated gets a new static value whatever the time"* — and
requires `keyframe: true` to animate. Without it, two calls write two static
values, the second wins, and the clip never moves. My first run measured frame
diffs of 0.128–0.152: nonzero, plausible, and far below the 0.3 threshold. With
the flag, the same three clips measure **6.7, 28.3 and 0.9**.

That is the case for the whole design in one number. A "did the command succeed"
check would have passed. The measurement did not.

### And one about expectations

The duration check failed on a correct render: 12.01 s measured against 10.67 s
expected. My formula subtracted the dissolve overlap — assuming, as Premiere
does, that a transition shortens the timeline. This NLE does not. A 3×4 s film
with two 16-frame dissolves renders 12.01 s.

The honest fix was not to loosen the threshold but to fix the **model**: accept
either the summed or the overlapped expectation, and record which one matched.
The measurement was right; my belief about the tool was wrong.

## Verification results

Everything below is from the recorded run. Nothing here is estimated.

| check | result |
|---|---|
| unit + integration tests | **26 passed**, 0 failed |
| capability probe | 7/7 Rust apps answer, qwen reachable |
| assets | 3 generated, hashed, cached, reusable on resume |
| transitions | 2 applied, count asserted against spec |
| motion | frame diff 6.71 / 28.34 / 0.94, all > 0.3 |
| duration | 12.01 s vs 12.00 expected (`sum` model) |
| container | h264 1024×576, 288 frames, 24/1 fps |
| decode | clean, empty stderr |
| file | 9,264,092 bytes, 6.17 Mbps |
| steps | 17 verified, 5 requested_only, 0 failed |

Independent confirmation with plain ffprobe on the same file gave the same
numbers, and a frame decoded at 2.0 s is a correctly rendered lighthouse — not a
placeholder, not a black frame.

## Known limitations

Stated plainly, because a list of what works is not a capability report:

- **Apple Silicon only.** MLX has no other backend.
- **~17.8 GB of weights** must be present; they are not in the repository.
- **No audio stage yet.** The audio lessons — per-item normalisation destroying a
  measured balance, and mastering an export that clips — are documented in the
  `render-qa` skill but not implemented here.
- **EffectCraft is not wired into the runner.** Per-shot compositing is proven in
  the `artcraft-suite-headless` skill, not by this end-to-end test.
- **The clean install is untested.** This was built against an existing
  installation; `installation.md` marks where it is inferred.
- **Only 1024×576 was measured.** Other resolutions are documented, not verified.
- **The end-to-end test is not in CI.** It needs 17.8 GB of weights and MLX
  inference. Claiming it in CI would be claiming a test that cannot run.
- **No license yet.** No `LICENSE` file ships until the choice is made
  deliberately rather than assumed.

## The repository

**[github.com/kliewerdaniel/hermes-local-video-studio](https://github.com/kliewerdaniel/hermes-local-video-studio)** — MIT licensed, public.

```
hermes-local-video-studio/
  hlvs/            schema, capabilities, provenance, runner, adapters/
  schemas/         JSON Schema copy for editors
  skills/          9 installable Hermes skills
  scripts/         doctor, setup, smoke, validate-project, run-project, verify-output
  examples/        minimal-project — 3 scenes, 2 dissolves, 2 motions
  tests/           unit (schema, provenance, parser) + integration (real ffmpeg)
  docs/            architecture, installation, configuration, workflow,
                   troubleshooting, verification, security, environment report
  docs/evidence/   manifest + capability report + a real frame
  .github/         CI: unit + integration on macos-14
```

The evidence directory is the part I would look at first: a real
`manifest.json`, a real `capabilities.json`, and a frame decoded from the render.
Every number in this article comes from those files.

## Reproducing it

```bash
# 1. clone
git clone https://github.com/kliewerdaniel/hermes-local-video-studio ~/Projects/hermes-local-video-studio
cd ~/Projects/hermes-local-video-studio

# 2. does the code work? (no model)
scripts/smoke

# 3. is the machine able?
scripts/doctor

# 4. start the image studio
cd ~/Projects/qwen-image-studio && ./start.sh     # terminal 1

# 5. produce a film
cd ~/Projects/hermes-local-video-studio
scripts/run-project examples/minimal-project/project.json
```

Expect 17 verified steps, 0 failed, and a 12-second h264 file at 1024×576.

To use your own brief: copy `examples/minimal-project/project.json`, change the
prompts and scene list, run `scripts/validate-project`, then `scripts/run-project`.
Validation will tell you what is wrong before anything expensive happens.

## Next steps

Separated from what exists, because the difference matters:

**Planned, not built**

- An audio stage: narration generation, a synthesised score, and the one-mixed-
  master rule that the Ganymede build proved necessary.
- EffectCraft in the runner, for per-shot compositing and 2.5D camera moves.
- Captions as title graphics, since this ffmpeg cannot burn them.
- A `--backend` switch so the same project can run against a different NLE.

**Not planned**

- Cloud inference. The point is local.
- A GUI. The point is that every action is a command.
- Automatic retry of parameter errors. They fail identically and cost GPU time.

## The six articles

This repository is the synthesis of:

- [Rust-Native Creative Suite Installation](/blog/2026-10-11-rust-native-creative-suite-installation)
- [Qwen Image 2.1 Turbo on Apple Silicon](/blog/2026-10-24-qwen-image-2-1-turbo-on-apple-silicon)
- [Ganymede, The Archive of the Gods](/blog/2026-10-25-ganymede-the-archive-of-the-gods)
- [The Dissolve That Wasn't Applied](/blog/2026-10-25-the-dissolve-that-wasnt-applied)
- [The Keyframe That Went Nowhere](/blog/2026-10-25-the-keyframe-that-went-nowhere)
- [The Mask That Rendered Anyway](/blog/2026-10-25-the-mask-that-rendered-anyway)

Each one found a failure. This one is the attempt to make the failures
structurally hard to repeat — not by being careful, which does not survive a long
build, but by making the pipeline refuse to report success it cannot measure.
