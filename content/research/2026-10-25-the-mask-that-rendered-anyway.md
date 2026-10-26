---
author: Daniel Kliewer
canonical_url: /blog/2026-10-25-the-mask-that-rendered-anyway
date: 10-25-2026
description: "A 2:22 film about impossible space, built from fifteen stills and a 2.5D parallax rig. A mask API accepted a rect, ignored it, and reported success — every mask was a default centred shape."
image: /images/impossible-shot-hero.jpg
layout: post
title: "The Mask That Rendered Anyway: One 2:22 Film Through an Impossible Space"
tags:
  - local-image-generation
  - artcraft-suite
  - rust
  - video-editing
  - after-effects
  - mlx
  - hermes-agent
---

The brief was a film about impossible space. A protagonist walks into an ordinary
room, notices a doorway that was not there yesterday, and follows it into a
library whose shelves run up past the ceiling, then through corridors that
connect to themselves, then through a mirror into a room he has not entered —
until he finds the seam where the model stops rendering.

The interesting constraint was the same as the last one: **use the Rust
reimplementations of Adobe Creative Cloud that are already installed, and never
assume a command that returned success actually did its job.**

The film is two minutes twenty-two. You can watch it here:
**[The Impossible Shot](https://youtu.be/QZkvLkYZIN8)**.

What this post is about is the failure that sentence exists for. **A mask API
that accepts a `rect`, silently discards it, and reports success.** Every mask in
the film was a default centred shape. It rendered. It feathered. Nothing errored.
The only way to catch it was to read the vertices back out of the engine and
compare them with what I had asked for.

Every command below ran on 2026-10-25 on an M4 Pro with 48 GB unified memory.
Every number came off real output. Everything is local.

---

## 0. The pipeline

Seven tools, each doing the job it is actually for:

| Stage | Tool | What it does |
| --- | --- | --- |
| Stills | `qwen-image-studio` — Qwen-Image-2.1-Turbo, MLX Q8 | fifteen 1536×864 frames from one portrait |
| Grade | `lightcraft-cli` (Lightroom) | one transform applied to all fifteen stills |
| Defocus + overlays | `photocraft-cli` (Photoshop) | gaussian plates for the far plane, plus vector line art |
| Compositing | `effectcraft-cli` (After Effects) | seventeen comps: the 2.5D rig, masks, typography |
| Voice | `vox` — Qwen3-TTS 1.7B 4-bit, MLX | zero-shot clone of `chris.wav` |
| Sound | numpy + scipy | spatial sound design, per-space impulse responses |
| Assembly | `filmcraft-cli` (Premiere) | timeline, dissolves, subtitles, look, export |

Total: 58.8 minutes of image generation, 118.8 seconds of rendering, about eight
minutes of encode — and considerably longer than all of that finding out why the
depth was wrong in every shot.

---

## 1. There is no 3D camera in this toolchain, so build the depth

No tool here produces a real camera move through a scene. So the depth is
**2.5D**: one still, instantiated four times, masked into depth-ordered regions
of itself, each layer scaling at a different rate.

| Layer | Source | Scale | Mask |
| --- | --- | --- | --- |
| FAR | defocused plate | `from + 0.55·span` | none |
| MID | sharp still | `from + 0.85·span` | ellipse at the vanishing point |
| VP | defocused plate | `from + 0.45·span` | small ellipse at the vanishing point |
| NEAR | sharp still | `from + 1.15·span` | the same ellipse, **inverted** |

The near plane outruns the far plane. That differential *is* parallax, and it is
a stronger cue than scale alone — which is why the defocused plates exist. In a
real push-in the far plane goes soft while the near plane stays sharp.

The rig is parameterised, so it is a template, not fourteen one-offs. Applied to
fourteen different images, measured on the delivered file:

```
parallax ratio (border motion / centre motion):  mean 1.635, 11 of 14 above 1.0
```

The three below 1.0 are explained, not defects: `E10_COR_LOOP` (0.69) carries the
reflection transition where the mirror interior deliberately outgrows the
corridor; `E13_SEAM` (0.715) is an extreme close-up with no depth to separate;
`E08_COR_A` (0.753) has a high-contrast light at the vanishing point, so the
measurement follows the contrast rather than the geometry.

---

## 2. The mask API that reported success

This is the one worth the post. And I walked into it *after* documenting it.

Every mask in the first build was created with:

```js
app.executeCommand("layer.addMask", {shape: "ellipse", rect: [0, 0, 890, 864]});
```

It returns success. The mask exists. The feather applies. And the **`rect` is
ignored** — you get a default centred mask, roughly 60 % of the frame. The same
parameter-drop trap as `layer.newText`, in a different command.

I only found it because I read the geometry back:

```
VOID mask vertices = [[307.2, 172.8], [1228.8, 172.8], [1228.8, 691.2], [307.2, 691.2]]
```

307.2 is exactly 20 % of 1536. I had asked for `[0, 0, 890, 864]`. So **every mask
in the film was a default box centred in frame**, not the ellipse at each
environment's vanishing point. Fourteen shots, all wrong, all rendering
perfectly.

The fix is to build the path through the property API, where values actually
apply:

```js
function ellipseMask(L, cx, cy, rx, ry, feather) {
  var m = L.property("Masks").addProperty("Mask");
  var P = m.property("Mask Path");
  var k = 0.5523;                       // bezier circle constant
  P.setValue({
    vertices:    [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]],
    inTangents:  [[-rx * k, 0], [0, -ry * k], [rx * k, 0], [0, ry * k]],
    outTangents: [[rx * k, 0], [0, ry * k], [-rx * k, 0], [0, -ry * k]],
    closed: true
  });
  m.property("Mask Feather").setValue([feather, feather]);
  return m;
}
```

After the fix, the read-back is exact:

```
VOID mask vertices = [[0, 0], [890, 0], [890, 864], [0, 864]]
```

**The tell is that the dropped parameter produces a plausible mask.** It renders,
it feathers, nothing throws. A wrong mask and a right mask are indistinguishable
from the output alone. The only test that separates them is the geometry.

---

## 3. Three difficult transitions, each measured

### The match cut that was not matching

A closed door becomes an open doorway onto a library. First attempt:
**SSIM 0.397** across the cut — barely different from the reflection cut, which
means it was not functioning as a match cut at all.

Rather than regenerate images, I swept scale pairs over the two graded stills —
8 × 8 combinations, cropping and resampling in numpy, measuring structural
similarity at each:

```
E02@1.00 vs E04@1.00   ssim 0.482
E02@1.20 vs E04@1.10   ssim 0.552
E02@1.30 vs E04@1.10   ssim 0.605   <- chosen
E02@1.50 vs E04@1.20   ssim 0.637
E02@1.00 vs E04@1.70   ssim -0.053
```

Delivered: **SSIM 0.5841** at 21.954 s, against **0.3619** for the reflection cut.
The match cut now sits where it should — measurably above the cut that is
supposed to break space.

Honest limit: 0.5841 is a good match cut, not a perfect one. `E04` rendered as a
double doorway rather than the single door the prompt asked for, so the frame
edges match at the door jamb and not at a single frame. The composition still
cuts on the doorway.

**Measure before you regenerate.** A two-minute numpy sweep found the pair that a
forty-minute image regeneration might not have.

### Through the reflection

The reflected room is masked into the mirror rectangle with an 8 px feather, then
scaled **128 % against the corridor's 106 %** — the reflected room grows faster
than the space containing it. That is the impossibility the shot needs. A hard
cut lands once it fills frame.

Verified by reading the frames either side of the cut: the outgoing frame is the
empty reflected room, the incoming frame is the same room with the man already
standing in it.

### The boundary, which a diffusion model cannot draw

`E14_BOUNDARY` needs a hard vertical edge where a rendered room stops and an
untextured void begins. The first generation produced a plain studio backdrop.
The second produced a boundary — but the "void" side was a grey *surface*: lit,
shaded, subtly graded, because an image model textures everything it draws.

So the void is not generated. It is composited: a flat solid, masked to a hard
edge, **zero feather**. The proof is a measurement, not an opinion:

```
void region: mean luma 97.00, standard deviation 0.000, over 117,894 pixels
```

Every pixel identical. That is what "unrendered" looks like.

---

## 4. Four more real failures

**The clone cannot say "shelves".** Whisper scored beat 5 at 0.826 coverage. I
assumed transcription error and isolated the word — synthesised
`"Shelves. Shelves. The shelves were loaded."` and transcribed that alone:

```
HEARD: shells, shells, the shells were loaded.
```

Not a transcription artefact. The clone genuinely collapses the labiodental in
that cluster. Reworded to *"Stacks at four metres…"*, which it says correctly.

Two more iterations on the same beat: *"allows"* came out as *"of ours"*, then
*"They were more detailed"* came out as *"there are more detail"*. Each was a
real delivery error, caught by the coverage score, not by listening.

A second error elsewhere: *"Every tier was loaded"* was delivered as **"Every
chair"**. Reworded to *"Every level"*.

**Five frames broke the camera grammar.** The stated grammar was that the
protagonist is seen from behind, facing camera exactly once at the boundary. The
first pass put him facing camera in four shots, and `E04` rendered **two** doors
flanking him — which would have made the match cut impossible. Regenerated those
five with a much harder framing instruction: *"photograph taken from directly
BEHIND"*, *"his face is completely hidden from us"*, *"there is exactly one door
in this image"*. Cost: 20 minutes of GPU, found by looking at the frames instead
of assuming from the prompt.

**`justification = "center"` throws.**

```
Bad justification value center
```

The text API takes the enum constant, not a string:
`ParagraphJustification.CENTER_JUSTIFY` (== 7414). Found by reading the engine's
own prelude rather than guessing.

**A contact sheet became a sixteenth still.** The grade step globs `stills/*.png`,
and I had written a contact sheet into that directory, so it graded 16 stills and
failed its own assertion. Moved the sheet to `output/`. The assertion is what
caught it.

---

## 5. Two verification bugs in my own harness

Worth writing down, because both produced a confident wrong number.

**The void measurement included the subtitles.** The first read gave
**std 18.9** for the void. The sampling window was `y 10 %–90 %`; the burned-in
subtitle bar sits at **80–91 %**. Measuring above it gave **std 0.000**.

The lesson is general: before believing a region measurement, extract the frame
and print per-region means. One flat region and one that is not tells you which
pixels you actually measured.

**`text=True` on binary frame reads.** The verifier crashed with

```
UnicodeDecodeError: 'utf-8' codec can't decode byte 0x80 in position 113958
```

because `grab()` pipes `rawvideo` to stdout and the helper decoded it as text.
Binary to stdout needs `text=False`.

---

## 6. A/V sync, and the check that reads backwards

Sync is measured at each cut: extract a 1.6 s window starting at the shot start
and find where the audio rises above −45 dB.

The first version reported `none` for every cut, which looks like total failure.
It was the opposite — **if speech starts on the cut there is no leading silence**,
so there is nothing to detect. The correct reading is a 0.000 offset, and only a
`silence_start` that never ends is a real desync.

Delivered: **median onset 0.000 s, max 0.000 s.**

---

## 7. What I measured on the delivered file

Not the export's own summary — the file.

| Check | Result |
| --- | --- |
| Streams | h264 1536×864 24/1 + aac 48 kHz stereo |
| Duration | 142.1 s |
| Full decode | clean, no errors |
| Loudness | **−16.07 LUFS** integrated, **−1.47 dBTP** |
| Motion per shot | all 14 above 2.0 — no static clip |
| Parallax ratio | mean **1.635**, 11/14 above 1.0 |
| Void uniformity | mean 97.0, **std 0.000**, 117,894 px |
| Match cut SSIM | **0.5841** at 21.954 s |
| Reflection cut SSIM | **0.3619** at 87.921 s |
| A/V sync | **0.000 s** at every cut |
| Narration coverage | mean **0.9911**, worst 0.947 |
| Dissolves | 14 applied, asserted before export |
| Intentional hard cuts | 2, both verified by frame inspection |
| Blank frames | 1, at 141.6 s — the second after the credits end |
| Size | 77,442,496 bytes |

The narration number is the one most likely to be taken on faith, so here is how
it was produced: every clip goes through Whisper
(`mlx-community/whisper-large-v3-turbo-asr-fp16`) and is scored word-by-word
against the script. **Duration is not content.** A WAV with the right length
proves nothing about what it says, and an agent cannot listen.

---

## 8. What I would tell an agent

1. **`app.executeCommand` drops its parameters.** `layer.addMask`,
   `layer.newText` — both accept, ignore and report success. Use the property
   API, then **read the value back and compare it with what you asked for.**
2. **A plausible mask is not a correct mask.** It renders, it feathers, it looks
   fine. The vertices are the only evidence.
3. **A diffusion model cannot render "nothing".** Any void must be composited as
   a flat fill with zero feather, or it will be a lit grey surface.
4. **Measure before you regenerate.** The scale sweep that fixed the match cut
   took two minutes and was decisive; the regeneration would have taken forty and
   might not have helped.
5. **Isolate a suspicious transcription before acting on it.** Synthesise the
   single word. If Whisper hears "shells" for an isolated "shelves", the clone is
   at fault; if it hears "shelves", the transcription was.
6. **Make silent skips fatal.** The assembly asserts the dissolve count against
   the transition spec — not against zero. A film that silently loses four of
   fourteen dissolves is as wrong as one that loses all of them.
7. **"No silence detected" is a pass.** When checking sync at a cut, no leading
   silence means speech starts on the cut. Report 0.000, not a failure.
8. **Know what else lives in your measurement window.** Subtitles, overlays and
   vignettes occupy known bands. Measuring std across a subtitle bar gives you the
   subtitles.
9. **`text=True` on binary stdout crashes.** Raw video to a pipe is bytes.
10. **Assert against the spec, not against zero.** Count what you expected.

---

## 9. What I could not verify

Stated plainly, because the rest of this post is evidence:

- **I cannot hear the audio.** I can prove the words are right (0.9911 coverage),
  that the levels are right (−16.07 LUFS, −1.47 dBTP) and that the reverb decays
  per space as designed. Whether the sound design *feels* like moving through
  those rooms is a human judgement.
- **The 2.5D rig is not a camera.** It creates convincing parallax on a still; it
  does not create new geometry.
- **The match cut is a good match, not a perfect one.**
- **Three shots measure parallax below 1.0**, each for a stated reason. They are
  reported in the quality report, not hidden.

---

## 10. Where it lives

The film: **[The Impossible Shot](https://youtu.be/QZkvLkYZIN8)**

The boundary — where the room stops and the model ends:

![The protagonist at the edge of the rendered world](/images/impossible-shot-hero.jpg)

All fourteen shots, sampled from the delivered file:

![Fourteen story frames in order](/images/impossible-shot-contact-sheet.jpg)

The whole production is twelve scripts, checked in alongside the assets:

```
pipeline/
  01_generate_stills.py    # 15 stills, manifest-resumable
  02_generate_narration.py # vox + chris.wav
  03_verify_narration.py   # Whisper transcription + coverage score
  04_prepare_audio.py      # silence-trim + cut timeline
  05_compose_score.py      # spatial sound design, per-space IRs
  06_grade_stills.py       # lightcraft, one transform for all
  07_photo_prep.py         # photocraft blur plates + vectorcraft overlays
  08_build_comps.py        # 17 comps, the 2.5D rig, masks, type
  09_render_shots.py       # → shots/clips/*.mp4
  10_assemble.py           # FilmCraft timeline, dissolves, look
  11_add_subtitles.py      # burned-in subtitles + export
  12_verify.py             # artifact-based quality report
output/
  the_impossible_shot.mp4        # 142.1 s, −16.07 LUFS
  the_impossible_shot.srt        # subtitle sidecar
  STORYBOARD.md  TRANSITION_SPEC.md  TRANSITION_TEMPLATES.json
  SCRIPT.md  TIMELINE.md  QUALITY_REPORT.md  PRODUCTION_REPORT.md  RUNBOOK.md
  parallax_rig.jsx               # the reusable rig, copy-paste ready
```

The image half is **[qwen-image-studio](https://github.com/kliewerdaniel/qwen-image-studio)**.
The NLE is **[FilmCraft](https://getartcraft.com/apps/filmcraft)**, MIT/Apache-2.0,
and the compositor is
**[EffectCraft](https://getartcraft.com/apps/effectcraft)** — the JSX scripting
engine is what makes a mask pipeline possible at all. `vox` is the Qwen3-TTS web
UI over MLX.

One licensing note, same as last time: the Qwen-Image weights are under the
**Qwen Research License Agreement, non-commercial use only**. The ArtCraft code is
MIT/Apache-2.0 and `vox` is MIT. If any of this becomes commercial, the image
model is the piece to renegotiate.

---

*Everything here ran locally: the stills, the voice, the sound, the composites and
the encode. No prompt, sample or frame left the machine. The only network traffic
was uploading the finished film.*
