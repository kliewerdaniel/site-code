---
author: Daniel Kliewer
canonical_url: /blog/2026-10-25-ganymede-the-archive-of-the-gods
date: 10-25-2026
description: "A 3:08 mythological science-fiction film built with local models and Rust creative tools: twenty environments, six effect templates, a cloned voice, and a twenty-check artifact report."
image: /images/ganymede-archive-hero.jpg
layout: post
title: "Ganymede, the Archive of the Gods: A Film Pipeline an Agent Can Replicate"
og:description: "Twenty environments, six effect templates, a 2.5D rig, a cloned voice and a twenty-check report — with the full repo layout and every data contract between stages. Plus the seven audio attempts it took to beat a broken export stage."
og:image: /images/ganymede-archive-hero.jpg
og:title: "Ganymede, the Archive of the Gods: A Film Pipeline an Agent Can Replicate"
og:type: article
og:url: /blog/2026-10-25-ganymede-the-archive-of-the-gods
tags:
  - local-image-generation
  - effectcraft
  - filmcraft
  - artcraft-suite
  - rust
  - mlx
  - video-editing
  - hermes-agent
twitter:card: summary_large_image
twitter:description: "Twenty environments, six effect templates, a 2.5D rig and a twenty-check artifact report. The full repo layout, every data contract, and the seven attempts it took to stop the export clipping the mix."
twitter:image: /images/ganymede-archive-hero.jpg
twitter:title: "Ganymede, the Archive of the Gods: A Film Pipeline an Agent Can Replicate"
---

The brief was a 3–4 minute mythological science-fiction film about an archive
that cannot tell the difference between what it knows and what it merely
contains. Twenty environments. Six named effects. A recurring protagonist. A
final line that has to land: *"An archive can contain the universe and still
misunderstand it. Knowledge begins when memory is answerable to evidence."*

What I want to write down here is not the film. It is the **machine that made
the film**, because that is the part that transfers. A reader who wants their own
version should be able to take this repository layout, this ordering, and these
data contracts, and run them with different prompts.

Everything below was executed. Every number came off a file on disk.

![The protagonist at the threshold of the archive](/images/ganymede-archive-hero.jpg)

**Watch the film:** [Ganymede, the Archive of the Gods](https://youtu.be/NbcUXQCPQw4) — 3:08, 1536×864, h264 + AAC.

## 0. The shape of the repository

The single most important decision in the whole build was that **each stage
writes a file, and the next stage reads only that file**. No stage reaches back
into an earlier stage's memory, no stage re-derives a duration that another
stage already decided, and every stage is resumable because the artifact it
produces is the record of its own completion.

```
ganymede-archive/
├── capability/                  # proof the tools do what their names claim
│   ├── build_matrix.py          # 17 tests, each measuring rendered output
│   ├── capability.json          # machine-readable results
│   ├── CAPABILITY_MATRIX.md     # human-readable results
│   └── proof/                   # one rendered PNG per test
├── storyboard/                  # the design, as data
│   ├── environments.json        # 20 environments + image prompts
│   ├── narration.json           # 20 beats + the words
│   ├── timeline.json            # THE contract: every stage reads this
│   └── VFX_BIBLE.md             # five visual systems, in prose
├── pipeline/                    # 14 scripts, 2,195 lines
│   ├── 01_generate_stills.py
│   ├── 02_generate_narration.py
│   ├── 03_verify_narration.py
│   ├── 04_prepare_audio.py
│   ├── 05_compose_score.py
│   ├── 06_grade_stills.py
│   ├── 07_mix_audio.py
│   ├── 08_build_comps.py
│   ├── 09_render_shots.py
│   ├── 10_assemble.py
│   ├── 11_add_subtitles.py
│   ├── 12_verify.py
│   ├── 13_master_audio.py
│   └── effects.py               # 6 reusable effect templates
├── stills/                      # generated source imagery
│   ├── *.png                    # 20 originals
│   ├── graded/                  # 20 after one consistent grade
│   ├── blur/                    # 20 defocused plates for the depth rig
│   └── manifest.json            # seed, prompt, elapsed time per frame
├── audio/
│   ├── *.wav                    # 20 narration clips as generated
│   ├── trimmed/                 # 20 after silence-trim + peak normalisation
│   ├── score.wav                # the four-bed soundscape
│   └── mix.wav                  # voice + ducked bed, ONE master
├── shots/
│   ├── film.ecproj              # 23 comps
│   ├── build.jsx                # the generated comp-building script
│   └── clips/*.mp4              # 23 rendered clips
└── output/
    ├── ganymede_archive_of_the_gods.mp4
    ├── ganymede_archive_of_the_gods.srt
    ├── contact_sheet.png
    ├── quality.json             # 20 checks, machine-readable
    ├── QUALITY_REPORT.md        # 20 checks, human-readable
    ├── MANUAL_REVIEW.md         # what the checks cannot score
    ├── POSTMORTEM.md            # what broke and why
    └── RUNBOOK.md               # the exact command order
```

The dependency graph is a straight line with one fan-out and one fan-in:

```
environments.json ──> stills/ ──> graded/ ──┐
                                            ├──> film.ecproj ──> clips/ ──┐
narration.json ──> audio/ ──> timeline.json ┤                            ├──> mp4
                                  │         └──> score.wav ──> mix.wav ──┘
                                  └──────────────────────────────────────┘
```

`timeline.json` is the hinge. Picture and sound both derive their timing from it,
which makes A/V drift structurally impossible rather than something you check for
afterwards.

## 1. Stage 0: prove the tools before you design around them

I did not start with images. I started with seventeen small tests, each of which
renders a frame and then **measures the pixels**.

The distinction matters more than it sounds. A test that asserts "the Glow effect
was added" passes when the Glow is invisible. A test that asserts "the centre
pixel is 255 and the ring at r=60 is 238" fails when the Glow is invisible.

Three of my own tests were initially wrong, and each wrong test looked like a
broken tool:

- **A shape path with no Fill draws nothing.** Glow, Light Rays and CC Threads
  all appeared broken until I added a fill to the carrier shape. The effects were
  fine; there was no source pixel for them to work on.
- **Gradient Ramp defaults to a vertical ramp.** I measured column means and got
  a flat result. Measuring rows showed the full 0–255 span.
- **The Repeater worked, but I had pushed two copies off-screen.** The element
  count was right; the visible count was not.

And one genuine API asymmetry, worth knowing before you write a line of JSX:
`blendingMode`'s **getter returns a label string while its setter demands the
numeric enum**. Read it back and compare to `"SCREEN"`; set it with
`BlendingMode.SCREEN`.

The payoff is that later, when the rig rendered pure black, I already knew the
effects were not the problem and could look at the layer stack instead.

## 2. Twenty environments, one face, one mode per server lifetime

Thirteen of the twenty shots contain the protagonist. Those are `edit`-mode
generations against a single reference portrait, always from the **original**,
never from a previous output — chaining edits drifts a face into a stranger.

The other seven have no person in them and are plain `t2i`.

**The rule that saved the batch:** run one mode per server lifetime.

The Qwen server keeps one variant resident. The first attempt interleaved modes,
and at the t2i→edit boundary the server loaded a second 17.8 GB copy alongside
the first. Swap went to 20 GB and macOS killed it at sixty-three minutes. The
batch died with it. The fix is a `--mode` flag and a server restart between
groups:

```bash
./start.sh                                              # t2i variant
python3 pipeline/01_generate_stills.py --mode t2i       # 7 frames
pkill -f uvicorn && ./start.sh                          # edit variant
python3 pipeline/01_generate_stills.py --mode edit      # 13 frames
```

Timings on an M-series machine with 48 GB: 125–218 s per `t2i` frame, 271–299 s
per `edit` frame. The whole set took about an hour of wall clock.

### The prompt structure that actually held identity

Two prompt failures are worth recording because they are general.

**Failure one: edit mode inherits the reference image's background.** My first
`G15_LAW` came back as the portrait restaged in a generic hall, with the
pointillist artwork from the reference photo still hanging behind him and none of
the archive architecture present. The cause was that every prompt opened with
"The SAME man as the reference photograph…", which primed the background.

The fix is to lead with the **environment**, describe it fully, and only then
place the person in it.

**Failure two: the fix for failure one caused a new defect.** I added "there is
NO painting, NO tapestry, NO artwork anywhere; every wall is bare stone." The
memory-hall shot then rendered as a grid of **framed paintings** — the exclusion
manufactured the thing it forbade, because the prompt also asked for "walls made
of moving images" and the model resolved the conflict with frames.

The lesson is that a negative constraint can create the object. Name the *form*
instead:

> "frameless, glowing translucent panels floating slightly proud of the stone…
> there are NO picture frames, NO borders, NO canvases"

That shot also came back with **Saturn** in the oculus — rings and all — when
every other frame shows Jupiter. No threshold catches "that is the wrong planet".
It was caught by looking, which is why `MANUAL_REVIEW.md` exists as a separate
document from the quality report.

### The manifest

`stills/manifest.json` records, per environment: the numeric id, the comp name,
act, effect, mode, output path, job id, seed (`1000 + n`), elapsed seconds, and
the full prompt. Re-running the script skips anything already present, so a
killed batch resumes rather than restarts.

## 3. The storyboard is data, not prose

Three files carry the design, and they are deliberately separate.

**`environments.json`** — the 20 environments. Each entry is:

```json
{
  "n": 5, "id": "G05_HALL", "act": "II", "effect": "B", "mode": "edit",
  "camera": "push_in", "dur_hint": 8.0,
  "prompt": "..."
}
```

A shared `design_language` string at the top of the file names the recurring
architectural anchors that every interior prompt must repeat: *a bronze inlay
running along every floor edge, a band of seven vertical light-slots in every
wall pier, and an oculus that always shows Jupiter.* That repetition is what
makes twenty separate generations read as one building.

**`narration.json`** — 20 beats, each with the comp it belongs to, a speech-length
hint, and the words. The final line is stored separately so the closing card and
the last narration can never disagree.

**`timeline.json`** — generated by `04_prepare_audio.py`, and the only thing
`08`, `09`, `10`, `11`, `12` and `13` read. Its element shape:

```json
{
  "kind": "shot", "n": 5, "comp": "G05_HALL", "act": "II", "effect": "B",
  "camera": "push_in", "start": 44.62, "dur": 7.92, "into": "dissolve",
  "narration": "...", "speech": 5.60, "audio": "audio/trimmed/05_G05_HALL.wav",
  "speech_at": 45.62
}
```

`kind` is one of `title`, `shot`, `line`, `credits`. `into` is the transition
type, and the hard cuts are declared in a `hard_cuts` array at the top level so
the assembler knows which cuts must **not** get a dissolve — a transition that is
silently applied everywhere is as wrong as one that is silently skipped.

Holds are derived from the **measured** speech duration plus lead and tail
padding, with a floor of 7.2 s. The script asserts the total lands inside
180–240 s and prints a warning if it does not. My first run came out at 180.29 s
— inside the brief by a quarter of a second, which is inside the brief only until
an encoder rounds. Raising the floor and tail put it at 188.15 s.

## 4. Six effect templates, each with a declared contract

`pipeline/effects.py` is 341 lines and contains no rendering. It contains six
functions that return lists of JSX lines, plus a `TEMPLATE_SPEC` dictionary that
declares, for each effect: its inputs, its parameters, the expected comp state,
the expected *visible* result, how to inspect it, and its known limits.

That last pair is the part people skip. Declaring the inspection method **before
the effect exists** is what makes the verification meaningful later, because the
check is written against the design rather than against whatever the render
happened to produce.

The six:

| effect | what it must visibly do | how it is checked |
|---|---|---|
| **A** opening | point → concentric rings → gateway scaling past camera | ring frame luma std > 20 |
| **B** constellation | hundreds of fragments at depth, threads between some | horizontal edge energy > 0.8 |
| **C** provenance | one continuous trail from claim to a named source | bright-pixel count must increase monotonically |
| **D** fracture | architecture shears into planes that no longer meet | mean abs diff > 2.0, blown-out fraction < 55 % |
| **E** reconstruction | planes slide back into alignment, magenta closes | diff present but settling, not frozen |
| **F** final | stable wide, lit-and-connected vs grey-and-separate | parallax ratio > 1.0, grey fraction 0.25–0.75 |

Effect C carries the film's whole argument, so it has a hard requirement written
into the spec: **the trail must terminate on a specific object visible in the
same frame.** A generic glow that merely suggests a relationship is exactly the
lie the film is against. The beam is a Write-on with a Brush Position keyframed
from the claim coordinate to the source coordinate, and the verification compares
the terminal pixel against the declared point.

Two API facts cost time here and belong in any replication:

- **`Turbulent Displace.Amount` is a scalar, not a 2D vector.** Passing `[70,70]`
  fails with `value must be a number, not an array`.
- **An effect carrier solid sitting on top of a rig must be additive.** My first
  constellation comps laid an opaque black solid at 100 % opacity above the
  plate. The comps rendered pure black — luma mean 0.2 — with no error at all.
  Setting `BlendingMode.ADD` on the carrier fixed it, because black adds nothing
  and the plate shows through.

## 5. The 2.5D rig

There is no 3D camera. The illusion is built from differential scale on
depth-ordered, masked regions of the **same** still:

| layer | scale at t=end | mask |
|---|---|---|
| `FAR` | `from + 0.55·span` | none (pre-blurred plate) |
| `MID` | `from + 0.85·span` | ellipse, normal |
| `NEAR` | `from + 1.15·span` | ellipse, **inverted** |
| `VIG` | `from + 1.30·span` | radial vignette |
| `WASH` | — | flat act colour at 11 %, soft light |

At `t=0` every layer sits at `from`, so the composite equals the source still.
That identity is the rig's correctness test, and it is the reason the rig can be
debugged at all.

Ellipse masks are built through the property API, not through
`app.executeCommand("layer.addMask", {rect: …})` — that call **silently drops the
rect** and creates a default centred mask, which looks like a masking bug rather
than a parameter-drop bug.

The same masked-plate technique carries the act palette. Each act has a wash
colour — indigo, cyan, gold, magenta, silver — and the magenta of contradiction
is gone entirely by the reconstruction.

## 6. Audio: seven attempts, and the black box that caused six of them

This is the part I would most want another agent to read, because I got it wrong
repeatedly and each wrong answer was plausible.

| attempt | change | speech/bed | peak |
|---|---|---|---|
| 0 | nothing | 1.73× | — |
| 1 | duck the bed −7.5 dB | **0.83×** | — |
| 2 | voice loudnorm −16, bed −27 | 1.07× | 1.193 |
| 3 | disable export loudness stage | 1.26× | 1.114 |
| 4 | voice −20 LUFS, duck 0.18 | 1.03× | 1.203 |
| 5 | deterministic peak −3 dBFS | 1.02× | 1.202 |
| 6 | **one mixed master** | **2.51×** | 1.197 |
| 7 | master to −1.7 dBFS | **2.51×** | **0.823** |

**Attempt 1 was backwards.** A speech window contains narration *plus* bed, so
removing the bed lowered the speech window and the ratio fell. Ducking only helps
if the voice is already loud enough to dominate on its own.

**`loudnorm` is unreliable on 3–6 second clips.** It applied unstable gain and
actually *raised* the peak. Replaced with a measured constant gain to a fixed
−3 dBFS peak: every clip now peaks at 0.708.

**The peak was byte-identical across different source levels.** That is the
signature of a fixed gain stage. Gaps peaked at 1.188 while `score.wav` peaked at
0.334 — a 3.55× boost, which is exactly what normalising to −16 LUFS does. The
edit tool's export was normalising despite `effects.loudness.enabled = false`,
and its `true_peak_dbtp: -1.5` ceiling did not hold. I set the flag, restarted,
re-measured: still 1.19. The setting was inert.

**The actual root cause** was that the editor normalises **each imported audio
item independently** on export. Narration on A1 and the bed on A2 could never
hold a measured balance — whatever the files contained, they arrived equal.

The fix is architectural, not a level tweak: `07_mix_audio.py` bakes **one**
master file — bed ducked under every narration event with 0.35 s ramps, voice on
top, peak at −3 dBFS — and the assembler places that single item on A1. One item
leaves nothing to renormalise against.

Then `13_master_audio.py` fixes the remaining overshoot deterministically:
measure the peak, compute the exact gain to 0.70, apply it, and **refuse to
report success if the result still clips**.

The delivered file peaks at 0.823 with the voice 8.0 dB above the bed.

The score itself is four beds, one per epistemic state, crossfaded by act, and
it is verifiable rather than merely present. Act IV carries **66.5 %** of its
energy below 120 Hz — two fundamentals a semitone apart, beating against each
other — while Act V is **0.3 %**. Contradiction is the only state that beats
against itself; verification resolves to a single pitch. That is the film's
argument expressed in the spectrum.

## 7. Twenty checks on the delivered artifact

`12_verify.py` measures the files, not the intent. Its checks, all passing:

```
stills present              20/20 environments on disk
no empty shots              every shot carries structure in >=1 of 5 samples
clips rendered              20/20 clips present
clip durations match        every clip within 0.20 s of its declared hold
motion present              no clip is a frozen frame
effect A: rings expand      luma std 56.4            (needs > 20)
effect B: threads present   edge energy 1.40         (needs > 0.8)
effect C: beam draws        ink 10266 -> 12703 -> 14979 (must increase)
effect D: fracture          mean abs diff 12.09      (needs > 2.0)
effect D: not a blowout     blown-out fraction 0.0%
effect E: reconstruction    mean abs diff 26.11
hard cuts land on frames    1 cut verified
film duration 3–4 min       188.2 s (3:08.18)
film has audio              [video, audio]
film has subtitles          burned in + .srt sidecar
video encodes h264          h264 1536x864
audio does not clip         peak 0.823 (-1.69 dBFS)
voice sits above the bed    2.51x (8.0 dB)
score covers the film       188.2 s vs 188.2 s
score is not silent         peak -17.4 dBFS
```

Two of these caught real defects that would otherwise have shipped:

**"no empty shots" failed on `G01_VOID`** — luma std 2.39, mean 0.1, eight
seconds of black. The opening effect used each shot's *own* plate as its gateway,
and `G01`'s plate is a black field, so scaling it produced more black. The effect
was attached and did nothing visible. Fixed by building shots 1–2 toward the
gateway still instead, which is also better grammar: void → rings → gate →
interior.

**"audio does not clip" failed at 1.202** and drove the entire section above.

The report also declares what it cannot score, in the artifact itself:

> protagonist identity across 13 frames — verified by inspecting each still;
> whether the archive "reads as magnificent then accountable" — a judgement, not
> a measurement.

## 8. What I would tell an agent

1. **Prove the tools first, by measuring pixels.** An effect that is attached is
   not an effect that is visible. Write the inspection before the effect.
2. **One mode per model-server lifetime.** A variant switch is a process
   restart, not a cache miss.
3. **Lead image prompts with the environment, not the person.** In edit mode the
   reference background comes along otherwise.
4. **Name the form, not just the prohibition.** "No artwork" produced framed
   paintings. "Frameless panels with no borders" produced panels.
5. **Carrier solids on top of a rig must be additive.** An opaque black solid
   renders a perfect, silent black frame.
6. **Every stage writes a file; the next stage reads only that file.** It is what
   makes the pipeline resumable and the timing consistent.
7. **Derive holds from measured speech**, and assert the total runtime rather
   than hoping.
8. **When a black box overrides your levels, remove it from the signal path.**
   Six attempts were spent tuning inputs to a stage that renormalised them
   anyway. One mixed master ended it.
9. **Never trust a contact sheet for identity.** At 384 px per tile, backlit hair
   reads as a bald scalp. I nearly triggered thirteen unnecessary regenerations
   on that reading; full-resolution inspection disproved it.
10. **Say what the checks cannot see.** The Saturn oculus passed every threshold
    in this post.

## 9. Where it lives

- Repository: `~/Projects/ganymede-archive`
- Film: `output/ganymede_archive_of_the_gods.mp4` — 3:08, 1536×864, h264 + AAC
- Published: <https://youtu.be/NbcUXQCPQw4>
- Reproduce: `output/RUNBOOK.md` (exact order, plus the eight traps)
- Failures: `output/POSTMORTEM.md` (each with the measurement that exposed it)
- Judgements: `output/MANUAL_REVIEW.md`
- Checks: `output/QUALITY_REPORT.md` and `output/quality.json`
- Capability proof: `capability/CAPABILITY_MATRIX.md`

![Twenty environments in order](/images/ganymede-archive-contact-sheet.jpg)

The archive in the film is confident, beautiful, and wrong, and its beauty is the
bug. The pipeline that built it has the opposite property: it is unglamorous,
slow to run, and refuses to call anything done that it has not measured. That
asymmetry is the whole method.
