---
author: Daniel Kliewer
canonical_url: /blog/2026-10-25-the-dissolve-that-wasnt-applied
date: 10-25-2026
description: "A 2:57 short film from six Rust reimplementations of the Adobe suite. Four failures reported success — a transition API with two id namespaces, a caption track that never renders, a silent grade."
image: /images/last-human-in-the-loop-hero.jpg
layout: post
title: "The Dissolve That Wasn't Applied: Six Rust Tools, Four Silent Failures, and a 2:57 Film"
og:description: "Fifteen stills, a cloned voice, a synthesised score, and a headless edit in six Rust reimplementations of the Adobe suite. Four failures that each reported success — two id namespaces in one API, a caption track that never renders, a grade that no-ops, and two frozen shots."
og:image: /images/last-human-in-the-loop-hero.jpg
og:title: "The Dissolve That Wasn't Applied: Six Rust Tools, Four Silent Failures, and a 2:57 Film"
og:type: article
og:url: /blog/2026-10-25-the-dissolve-that-wasnt-applied
tags:
  - local-image-generation
  - filmcraft
  - artcraft-suite
  - rust
  - video-editing
  - mlx
  - hermes-agent
twitter:card: summary_large_image
twitter:description: "Six Rust reimplementations of the Adobe suite, one 2:57 film, and four failures that each reported success — two id namespaces, a caption track that never renders, a grade that no-ops, and two frozen shots."
twitter:image: /images/last-human-in-the-loop-hero.jpg
twitter:title: "The Dissolve That Wasn't Applied: Six Rust Tools, Four Silent Failures, and a 2:57 Film"
---

The brief was a film. Not an image, not a prompt — a finished two-to-three minute
cinema piece: storyboard, shot list, colour grade, score, subtitles, opening
credits, end credits, and a deliberate visual arc. The constraint was the
interesting part: **use the Rust reimplementations of Adobe Creative Cloud that
are already installed, prefer them over anything external, and never assume a
command that succeeded actually did its job.**

The film is two minutes fifty-seven. Fifteen stills, one cloned voice, a
synthesised score, and a headless edit. You can watch it here:
**[The Last Human in the Loop](https://youtu.be/rSA-P8fnR-E)**.

What this post is about is the second sentence of that brief, because **four
separate things reported success and were wrong.** A transition API that
accepts two different id namespaces and only tells you half of the time. A
caption track that exports a perfectly correct SRT and never draws a single
letter. A grade that no-ops when you forget to select clips. And two shots that
were frozen frames wearing a keyframe, invisible until I measured them.

Every command below was run on 2026-10-25 on an M4 Pro with 48 GB unified
memory. Every number came off real output. Everything is local — no prompt,
sample or frame left the machine.

---

## 0. The pipeline

Six tools, each doing the job it is actually for:

| Stage | Tool | What it does |
| --- | --- | --- |
| Stills | `qwen-image-studio` — Qwen-Image-2.1-Turbo, MLX Q8 | fifteen 1536×864 frames from one portrait |
| Grade | `lightcraft-cli` (Lightroom) | one transform applied to all fifteen stills |
| Line art | `vectorcraft-cli` (Illustrator) | HUD frame, schematic grid, scanlines → crisp PNGs |
| Compositing | `effectcraft-cli` (After Effects) | eighteen comps: camera moves, parallax, overlays, type |
| Voice | `vox` — Qwen3-TTS 1.7B 4-bit, MLX | zero-shot clone of `chris.wav` |
| Score | numpy + scipy | four-section bed, ducked against the narration |
| Assembly | `filmcraft-cli` (Premiere) | timeline, dissolves, subtitles, look, export |

Total wall time: 63.5 minutes of image generation, 100 seconds of rendering,
about 20 minutes of encode — and considerably longer than all of that finding
out why the picture was not moving.

---

## 1. Fifteen frames, one face

Same rule as the previous film, and it mattered again: **source every frame from
the original reference, never from the previous output.** Chaining edits
compounds artifacts and inherits the last scene's lighting onto the subject.

Fifteen stills, 1536×864, 8 steps, serialised because Metal is one GPU:

```
n=15  mean 253.9 s  min 227.9 s  max 273.0 s  total 63.5 min
```

Sixty-three minutes of GPU is not something you want to lose to a timeout, so
the generator appends each finished beat to a manifest and skips beats already
marked done. A killed turn mid-batch costs you nothing.

The one thing that cost me a full cycle: **I ran Whisper transcription
concurrently with the image model.** Both load multi-GB weights. Swap reached
7.3 GB of 8 GB and the OS sent the image server a SIGKILL:

```
Connection refused: http://127.0.0.1:8787/api/status
$ ps aux | grep qwen-image
... -9
```

The fix is boring and absolute: **serialise anything that loads model
weights.** A CPU compositor can overlap with a diffusion model; two large
models cannot.

---

## 2. The voice, and the check that actually means something

`vox` is a Qwen3-TTS web UI with zero-shot cloning on `:7860`, using the same
`chris.wav` profile as the previous film. 399 words across sixteen beats.

A WAV with the right duration proves nothing about what it says. So every clip
goes through Whisper (`mlx-community/whisper-large-v3-turbo-asr-fp16`) and is
scored word-by-word against the script:

| Metric | Value |
| --- | --- |
| Beats | 16 / 16 |
| Total speech | 156.51 s |
| Mean word coverage | **0.997** |
| Worst beat | 0.958 |

That worst beat was worth having: the script said *"you"* where the model
delivered *"he"*, and the coverage score caught it before the edit did. It got
regenerated.

One operational note that cost a run: `vox`'s venv is `venv/`, **not**
`.venv/`, and it has `mlx-audio` but not `requests`. The server runs there; the
HTTP client that drives it has to run somewhere else — I used the image studio's
venv. Launch the server as a tracked background process. An interrupted turn
takes a foreground process with it, and a dead TTS server mid-batch looks
exactly like a network problem.

---

## 3. The score, verified structurally

No synth, no samples — a four-section electronic bed synthesised in numpy with
a 2 dB duck under the narration, written from the actual narration timings.

You cannot verify music by "trusting the process", and an agent cannot verify
it by ear. What you *can* do is measure it, and I did: dominant energy at
26–85 Hz in Act I (72% below 80 Hz), 98% sub-bass in Act II, 75% mid-band with a
measurable 0.5 s pulse in Act III (envelope autocorrelation 0.555 against 0.325
in Act I), and a 99% mid-band pad for Act IV.

That is a structural proof that the four sections differ and that the duck is
real. It is not a proof that it is good.

---

## 4. The bug that reported success

This is the one worth the post, and it is not the one I expected.

I placed eighteen clips on the timeline, added the caption track, applied the
grade, applied the dissolves, exported. Every command returned success. The
export wrote a file:

```
exported the_last_human_in_the_loop.mp4 (100.0 MB)
```

And **all seventeen dissolves had been skipped**, because the loop that applies
them printed this seventeen times:

```
dissolve skipped for SH01: no edit point at the playhead
dissolve skipped for SH02: no edit point at the playhead
...
applied 0 dissolves
```

Hard cuts, exactly what I asked it not to ship. The script treated a failed
transition as a warning and exported anyway.

The cause is an id namespace trap, and it is genuinely nasty:

> **`timeline.place` takes ITEM ids. `applyVideoTransition`, `timeline.select`
> and Lumetri take SEQUENCE CLIP ids. They are different namespaces, and passing
> an item id where a clip id belongs fails with the misleading "no edit point
> at the playhead" rather than "no such clip".**

The fix is to read the placed clips back and map them by timeline order:

```python
seq = json.loads(fc("inspect", "sequence"))
placed = sorted(seq["video"][0]["items"], key=lambda i: i["start"])
clip_ids = {e["comp"]: it["clip"] for e, it in zip(tl["elements"], placed)}
```

Then the playhead has to be moved to each cut before the transition is applied
— `applyVideoTransition` works on the edit point at the playhead, not on a
named clip:

```python
fc("exec", "playhead.set", js({"seconds": e["start"]}))
fc("exec", "sequence.applyVideoTransition",
   js({"clip": clip_ids[e["comp"]], "effect": "cross_dissolve",
       "frames": 14, "edge": "in"}))
```

After the fix: **17 dissolves applied.**

But the important change was not the fix — it was refusing to ship the broken
state:

```python
if n == 0:
    raise SystemExit("no dissolves applied — refusing to export a hard-cut film")
```

A silent skip and a successful export is the worst outcome in the world, and it
is the default behaviour. Every effect that can silently no-op needs a guard
that makes its absence fatal.

---

## 5. Three more silent failures

**The caption track that never renders.** Fifty-one cards went onto a real
subtitle track. `captions.list` showed them all with correct in/out points.
`captions.export` wrote a perfectly correct SRT — first card at `00:00:06,000`,
text matching. And not one letter appeared in the exported picture.
`captions.showAll` changed nothing.

**Cause:** FilmCraft's caption track is *data*, not a burn-in layer. The
exporter does not composite it.

The obvious fallback was to burn the SRT with ffmpeg. That also failed, and for
a reason worth writing down: **this machine's ffmpeg has no `libass`, no
`subtitles` filter, no `ass` filter, and no `drawtext`.** Not misconfigured —
absent:

```
$ ffmpeg -filters | grep -E "\b(ass|subtitles|drawtext)\b"
(nothing)
```

So there is no way to burn text with ffmpeg on this box under any invocation.

The fix was to stop trying to burn a caption track and to use a tool that
composites: each subtitle card became a **native FilmCraft title graphic** on a
video track, which is what the NLE is for:

```python
out = fc("exec", "graphics.newText", js({
    "text": text, "box": [1400, 96], "position": [68, 690],
    "size": 34, "font": "Helvetica Neue",
    "seconds": dur, "track": 1, "time": int(start * TICKS), "newClip": True}))
```

Forty-nine graphics, verified by reading frames back off the exported file.

**The grade that no-ops.** `lumetri.applyPreset {"name": ...}` failed with
*"select clips first"*. Selecting requires clip ids (the same trap as above),
not item ids:

```python
fc("exec", "timeline.select", js({"clips": picture_ids}))
fc("exec", "lumetri.applyPreset", js({"name": LOOK, "clips": picture_ids}))
```

Made fatal on failure, for the same reason as the dissolves.

**Two shots frozen for ten seconds.** The motion audit — mean absolute luma
difference per segment — reported two segments at **0.63** and **0.08**. Both
had `camera: "static"`, and with no camera movement the dust and overlay layers
have nothing to move against. A static keyframe is not a static shot: nothing
moves at all.

Changed both to a slow push (107→113%) and re-rendered only those two comps.
Post-fix: **42.0 and 43.5.**

---

## 6. Two smaller traps

**Caption overlap from rounding.** `captions.add` failed with *"a caption
already covers this time"*. Proportional sentence timing plus a 0.5 s minimum
duration let *"Deterministic."* — a 0.44 s span — overrun the next card by
43 ms. The fix is to compute raw spans first, then clamp each card's end against
the next card's start with a 60 ms gap, and **dry-run the overlap check before
touching the NLE**:

```python
end = min(end, raw[i + 1][0] - 0.02)
```

**The score ended 2.5 s before the picture.** The credits comp was built at
9.0 s while the timeline allotted 6.5 s. The film ran 179.79 s against a
177.26 s score, so the last two and a half seconds of credits played over
silence. Set the credits comp to 6.5 s, re-rendered it, re-assembled. Runtime is
now 177.29 s, matching the score to within a frame.

---

## 7. What I measured on the delivered file

Not the export's own summary — the file.

| Check | Result |
| --- | --- |
| Streams | h264 1536×864 24/1 + aac 48 kHz stereo |
| Duration | 177.29 s (4255 frames) |
| Full decode | clean, no errors |
| Loudness | **−16.21 LUFS** integrated, **−1.48 dBTP** |
| Motion per shot | all 18 segments above 6.4 — no frozen clip |
| Narration content | transcribed back, mean coverage 0.997, worst 0.958 |
| Subtitles | read back off sampled frames at 8 points; text matches, none clipped |
| Titles / credits | read back off sampled frames; spelling correct |
| Dissolves | 17 applied, confirmed in the project |
| Grade | applied to all 18 picture clips, confirmed not skipped |
| Size | 100,208,701 bytes |

The subtitle check is the one most likely to be skipped, and it is the one that
matters most. Subtitle text is invisible to ffprobe, to the export summary, and
to every byte-count comparison in the world. The only way to know a subtitle is
on screen is to extract a frame and **look at it**:

```bash
ffmpeg -ss 9 -i output/the_last_human_in_the_loop.mp4 -frames:v 1 -y /tmp/f.png
```

I read frames back at eight points across the runtime and confirmed the text
matches the script at each one.

One judgement call worth flagging: the closing card displays its line as hero
typography, so its subtitle card is **deliberately suppressed**. Showing the
same sentence twice — once as the film's title, once as a caption — reads as a
bug, not as thoroughness.

---

## 8. What I would tell an agent

1. **Two id namespaces in one API is the trap that bites hardest.** Read the
   placed clips back from `inspect sequence`; never assume the ids you placed
   with are the ids the effect commands want.
2. **Make silent skips fatal.** A guard that raises when a dissolve count is
   zero is the difference between shipping hard cuts and knowing you did.
3. **A caption track is not a burned subtitle.** Check whether your exporter
   composites captions at all before building a pipeline on them.
4. **Check your ffmpeg for `libass` before you rely on it.** `ffmpeg -filters |
   grep subtitles` — absent means no text, under any flag.
5. **Measure motion, do not trust the return code.** Mean luma difference
   between two frames inside a clip is the only proof a keyframe is doing work.
6. **A static camera is not a static shot.** With nothing to move against, a
   frozen layer stays frozen.
7. **Verify speech by transcribing it back.** Duration is not content. Coverage
   against the script is.
8. **Verify music structurally, and say so.** Spectra and envelope
   autocorrelation prove structure; they do not prove taste.
9. **Read frames back off the exported file.** Titles, subtitles and grade are
   invisible to every automated check.
10. **Serialise anything that loads model weights.** One OOM kill costs more
    than all the waiting.

---

## 9. Where it lives

The film: **[The Last Human in the Loop](https://youtu.be/rSA-P8fnR-E)**

Sixteen frames in order, sampled from the delivered file:

![Sixteen story frames with camera moves and grade](/images/last-human-story-contact-sheet.jpg)

The closing card:

![The closing line, set as the final card](/images/last-human-closing-card.jpg)

The whole production is twelve scripts, checked in alongside the assets:

```
pipeline/
  01_generate_stills.py    # 15 stills, manifest-resumable, aborts after 2 failures
  02_generate_narration.py # vox + chris.wav, 503-aware retry
  03_verify_narration.py   # Whisper transcription + coverage score
  04_prepare_audio.py      # silence-trim + body timeline
  04b_finalize_timeline.py # + title/credits, absolute times
  05_compose_score.py      # four sections, ducking, act-by-act spectra
  06_grade_stills.py       # lightcraft, one transform for all
  07_build_overlays.py     # vectorcraft SVGs + procedural raster
  08_build_shots.py        # 18 comps
  09_render_shots.py       # → shots/clips/*.mp4
  10_assemble.py           # FilmCraft timeline, dissolves, look, SRT
  11_add_subtitles.py      # burned-in subtitles + final export
output/
  the_last_human_in_the_loop.mp4   # 177.29 s, −16.21 LUFS
  the_last_human_in_the_loop.srt   # subtitle sidecar
  SCRIPT.md  TIMELINE.md  PRODUCTION_REPORT.md  RUNBOOK.md
```

The image half is **[qwen-image-studio](https://github.com/kliewerdaniel/qwen-image-studio)**,
written up in the previous post. The NLE is
**[FilmCraft](https://getartcraft.com/apps/filmcraft)**, MIT/Apache-2.0, and the
headless CLI is what makes an edit scriptable at all. `vox` is the Qwen3-TTS web
UI over MLX.

One licensing note that applies to the stills and not the code: the Qwen-Image
weights are under the **Qwen Research License Agreement, non-commercial use
only**. The FilmCraft code is MIT/Apache-2.0 and `vox` is MIT. If any of this
becomes commercial, the image model is the piece to renegotiate.

---

*Everything here ran locally: the stills, the voice, the score, the composites
and the encode. No prompt, sample or frame left the machine. The only network
traffic was uploading the finished film.*
