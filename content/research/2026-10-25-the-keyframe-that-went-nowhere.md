---
author: Daniel Kliewer
canonical_url: /blog/2026-10-25-the-keyframe-that-went-nowhere
date: 10-25-2026
description: "One selfie into a 3:42 film: ten stills, a cloned voice, a headless edit. Three NLE failures all reported success — a keyframe in the wrong time space, an ignored quality flag, a nested loudness setting."
image: /images/2001-documentary-frame-10.jpg
layout: post
title: "The Keyframe That Went Nowhere: Building a 3:42 Film Out of Ten Generated Frames"
og:description: "Ten stills, a cloned voice, and a headless NLE. The dimension rule that rejects exact 16:9, a vox venv that does not exist under the name everyone uses, and three silent failures in the edit — including a keyframe written into the wrong time space."
og:image: /images/2001-documentary-frame-10.jpg
og:title: "The Keyframe That Went Nowhere: Building a 3:42 Film Out of Ten Generated Frames"
og:type: article
og:url: /blog/2026-10-25-the-keyframe-that-went-nowhere
tags:
  - local-image-generation
  - tts
  - voice-cloning
  - filmcraft
  - video-editing
  - mlx
  - hermes-agent
twitter:card: summary_large_image
twitter:description: "Ten stills, a cloned voice, a headless NLE. Three failures that all reported success — a keyframe in the wrong time space, a quality flag silently ignored, a loudness setting that nests."
twitter:image: /images/2001-documentary-frame-10.jpg
twitter:title: "The Keyframe That Went Nowhere: Building a 3:42 Film Out of Ten Generated Frames"
---

The ask started small: take one selfie, replace the background. Then: make it a
burning building. Then a bunker under the pyramids. Then a sixteen-by-nine
version. Then ten images telling a story. Then — the real one — write the
monologue, clone the voice, and cut it into a film.

The finished thing is three minutes forty-two, ten stills, one continuous
narration read by a cloned voice. You can watch it here:
**[2001 a documentary](https://www.youtube.com/watch?v=8BcjFsYxm9Q)**.

What I want to write down is not the story. It is the plumbing, because **the
generation was the easy part and the edit was where everything lied to me.**
Three separate failures in the NLE each reported success, wrote a file, and were
wrong. One of them was invisible until I measured pixels.

Every command below was run on 2026-10-24 and 2026-10-25 on an M4 Pro with 48 GB
unified memory. Every number came off real output. All of it is reproducible from
the four scripts linked at the end.

---

## 0. The pipeline

Three local tools, no cloud calls, nothing leaves the machine:

| Stage | Tool | What it does |
| --- | --- | --- |
| Stills | `qwen-image-studio` — Qwen-Image-2.1-Turbo, MLX Q8 | ten 1536×864 frames from one reference photo |
| Voice | `vox` — Qwen3-TTS 1.7B 4-bit, MLX | zero-shot clone of a 25 s sample, 615 words |
| Film | `filmcraft-cli` — Rust reimplementation of Premiere Pro | cut, grade, dissolve, export |

Total wall time: about 45 minutes of image generation, 75 seconds of speech
synthesis, 6 minutes of encoding, and rather longer than any of that spent
finding out why the picture was not moving.

---

## 1. Ten frames, one face

The rule for a sequence is: **source every frame from the original reference,
never from the previous output.** Chaining edits compounds artifacts and bakes
the last scene's lighting onto the subject. I had already learned this the hard
way on the second image of this project, where a fire's warm key light had to be
litigated away in the next prompt.

So all ten frames ran `mode=edit` against the same original photo, with identity
anchors named explicitly and the pose stated as *not* a selfie:

```bash
curl -s -X POST http://127.0.0.1:8787/api/generate \
  -F mode=edit \
  -F "prompt=Keep the man exactly as he is — identical face, same short dark hair,
      same grey polo shirt. Now: a colossal ornate bunker deep beneath the Great
      Pyramid, tiers of basalt server racks with glowing cyan crystal cores..." \
  -F seed=1007 -F steps=8 -F guidance=1.0 \
  -F width=1536 -F height=864 -F output_resolution=1536 \
  -F "images=@selfie.jpg"
```

Two things about that command are not guessable.

**The upload field is `images`, not `images[]`.** The server declares
`images: list[UploadFile]`. Send `images[]=@file` and the request is accepted,
the job is created, and then it fails with:

```
ValueError: edit needs at least one reference image
```

which reads like a validation bug rather than a field-name mistake. It cost me a
full generate cycle to see it.

**The dimensions must be multiples of 32.** This is the one that matters:

```
$ # width=1280 height=720 — exact 16:9
ValueError: Qwen-Image-2.1 dimensions must be positive multiples of 32.
```

720 ÷ 32 = 22.5. Exact 16:9 with both axes divisible by 32 is a short list:

| Size | Ratio | 32-divisible |
| --- | --- | --- |
| 1280×720 | 1.7778 | **no** — 720 % 32 = 16 |
| 1280×736 | 1.7391 | yes |
| **1536×864** | **1.7778** | **yes** |
| 1024×576 | 1.7778 | yes |

That table explains something I had called a bug earlier in the project. The
studio's built-in `16:9` preset is `1280×736`, and I had written it off as
"slightly off true 16:9". It is not sloppy — it is the nearest 32-divisible pair
at that width. Once I understood the constraint I stopped using the preset and
went to **1536×864**, which is exactly 16:9 *and* higher resolution, which the
detail-heavy frames wanted anyway.

Measured, per frame at 1536×864, 8 steps:

```
271.6  277.8  265.8  262.3  267.8  268.6  259.2  260.4  258.8  270.4   seconds
mean 266.3 s   min 258.8   max 277.8
```

Generation is serialized — Metal is one GPU — so ten frames is a 44-minute run.
I ran it as a background job that appended each finished beat to a manifest and
skipped beats already marked done, so a timeout would not restart the whole
thing. It also aborts after two consecutive failures rather than grinding
through ten items with a bad parameter.

The pose instructions worked, which surprised me. The model held the face, hair
and shirt across all ten frames while putting him on a staircase, on his knees,
at a viewport, and floating in a light tunnel. The one thing it would not do was
hold a tan — he comes back tanned from the desert frame and stays that way, which
is fine for the story and worth knowing for anything where it is not.

---

## 2. The voice, and a venv that does not exist

`vox` is a local Qwen3-TTS web UI with zero-shot cloning: drop a 5–30 second
sample into `custom_voices/`, POST the text, get a WAV. It runs on `:7860`.

Three traps, in the order I hit them.

**The venv is `venv/`, not `.venv/`.** Every note I had — including one I wrote
myself — said `.venv/bin/python`. That path does not exist:

```
$ .venv/bin/python app.py
zsh:1: no such file or directory: .venv/bin/python
```

Exit 127, no server, and the health check returns `000` which looks like a
networking problem. It is not. `ls -d .venv venv` answers it in one line.

**That venv has `mlx-audio` but not `requests`.** So the server runs there, and
any Python driver that talks to it over HTTP has to run somewhere else:

```
ModuleNotFoundError: No module named 'requests'
```

I ended up running the server on the vox venv and the HTTP client on the
image-studio venv. Slightly absurd, entirely fine, and much better than
installing into a working environment.

**The server fast-fails 503 while busy.** That is deliberate — a `_busy` event
so a second request does not queue behind a long generation and wedge the
queue. It means every request needs a retry loop, and 503 is normal backpressure,
not a failure.

Two design choices on the narration:

- **One `POST /api/generate` per beat, not `generate_long`.** The long endpoint
  splits at roughly fifty words and concatenates, which puts a seam in the
  prosody. Beats were 53–73 words, so single-shot keeps each one continuous.
- **Synthesize, then transcribe it back.** A WAV with the right duration proves
  nothing about what it says. I ran every clip through Whisper
  (`mlx-community/whisper-large-v3-turbo-asr-fp16`) and scored word coverage
  against the script:

| Metric | Value |
| --- | --- |
| Clips | 10 / 10 |
| Total speech | 208.48 s |
| Mean word coverage | **0.967** |
| Worst beat | 0.909 |

The misses were numeral normalisation — the script says "four hundred metres",
Whisper writes "400 meters" — not content errors. That is the check I trust. It
is also, honestly, the *only* check I can run: **I cannot hear the audio.** I can
prove the words are right and the levels are right. Whether the clone's prosody
lands is a judgement a human has to make, and that is exactly the kind of claim
an agent should not make on its own.

One more operational note that cost a run: **launch the server as a tracked
background process.** I started vox, then a turn was interrupted, and the
process cleanup took the server with it mid-batch. The retry loop survived, the
manifest survived, and nothing was corrupted — but the run died and I had to
notice.

---

## 3. The cut

`filmcraft-cli` is a Rust reimplementation of Premiere Pro with every UI action
exposed as a command. It runs headless, which means the whole edit is a script.

```
$ filmcraft-cli commands --json | python3 -c "..."
total 693 commands
```

Two structural things to know before writing a line:

**`--project` requires an existing file.** To start fresh you need `--save-as`,
then `--project <path> --save` on every subsequent call. There is no "create if
missing".

**Item ids are global counters, not per-import indices.** `import` returns
`{"items":[id]}`, and the ids are not 1..N:

```
image 01 -> item 4      image 06 -> item 9
image 02 -> item 5      image 07 -> item 10
...                     audio 01 -> item 14
black  -> item 24
```

Assuming the ids would have failed with `no such item`, which at least is an
error that names itself.

Time is in ticks — **254,016,000,000 per second** — which divides evenly by every
common frame rate and sample rate, so 24 fps and 23.976 fps are both exact.

The layout, computed from the audio:

| Element | Value |
| --- | --- |
| Sequence | 1536×864, 24 fps, 48 kHz stereo |
| Lead | 1.5 s black |
| Hold per beat | narration length + 1.0 s tail |
| Dissolves | 18-frame cross dissolve at every cut (11 total) |
| Motion | alternating Ken Burns, 100→106 % and 106→100 % |
| Grade | Lumetri preset *Teal Shadows, Warm Skin* on all ten picture clips |
| End | 2.0 s black |
| Total | 221.98 s |

The 1 s tail is not decoration. A centred dissolve eats frames from both sides
of the cut, and the tail is what keeps the dissolve off the end of the speech.

---

## 4. The bug that reported success

This is the one worth the post.

I applied a Ken Burns to all ten clips, exported, and the export said:

```json
{"job": 1, "result": {"frames": 5328, "seconds": 129.3}}
```

5328 frames at 24 fps is 222 seconds. Correct. The file existed. Every command
had returned success. And the picture was **frozen on nine of the ten frames.**

I found it by measuring, not by looking: sample a frame near the start of each
clip and a frame near its end, and compare them.

```python
a = grab(t0)                     # luma array
z = grab(t1)
print(np.abs(a - z).mean())      # 0.00 == the clip is not moving
```

```
beat  1   10.66  MOVING
beat  2    0.18  STATIC
beat  3    0.17  STATIC
...
beat 10    0.17  STATIC
```

One clip animated. Nine did not. And the project confirmed it, if I had known to
look:

```
clip 26  scale_kf 2     <- beat 1
clip 28  scale_kf 1     <- beat 2, and every clip after it
```

**The cause: `effects.setParam` keyframe `time` is SEQUENCE-absolute, not
clip-relative.** I had written the keyframes as `0` and `duration` — which is
what every keyframe API I have used before expects. For a clip that starts at
26.5 s, both of those times fall *before the clip exists*. The engine clamps them
onto the clip's first keyframe, so the second write silently overwrites the
first, the animation collapses to a single static keyframe, and nothing errors.

Beat 1 was the only clip that worked because it starts at 1.5 s — close enough
to zero that a keyframe at `0` landed inside it.

The fix is to pass the clip's absolute position on the timeline:

```python
t_start = sec(l["start"])                       # 26.5 s in ticks
t_end   = sec(l["start"] + l["hold"]) - frame   # last frame of the clip
for tm, val in ((t_start, 106.0), (t_end, 100.0)):
    ex("effects.setParam", {"clip": cid, "effect": "motion", "param": "scale",
                            "value": val, "time": tm, "keyframe": True})
```

After the fix, the same measurement:

```
beat  1 10.14   beat  6 11.89
beat  2  9.82   beat  7  6.24
beat  3 10.28   beat  8 17.57
beat  4 13.91   beat  9  8.13
beat  5 15.30   beat 10  8.08
```

All ten animate. **A keyframe API that takes a time in the wrong space fails
silently, and the only defence is to measure the output.** A success return code
proves a command was accepted. It proves nothing about whether the picture moved.

I also want to flag how I nearly missed this twice. My first probe of keyframe
semantics compared two frames on a clip that had a dissolve on its incoming edge
— the frames differed because of the dissolve, not the animation, and I
concluded the keyframes were working. If your test window overlaps a transition,
you are measuring the transition.

---

## 5. Two more failures that look like successes

**`--quality` is ignored for h264.** I exported at quality 88, then 70, 55, 40:

```
quality=88 bytes=50957612 kbps=20383
quality=70 bytes=50957612 kbps=20383
quality=55 bytes=50957612 kbps=20383
quality=40 bytes=50957612 kbps=20383
```

Byte-identical at every setting. The flag is accepted, the export succeeds, and
the encoder falls back to roughly 20 Mbps regardless. A 222-second film of
slow-panning stills came out at **560 MB**.

What works is an explicit bitrate in the settings blob:

```json
{"bitrateKbps": 3000, "bitrateMode": "vbr1Pass"}
```

That produced 91.8 MB, and SSIM against the 20 Mbps version was **0.987** — the
bitrate was never the thing making it look good.

**Loudness normalisation nests, and a flat key is accepted and ignored.** My
first attempt:

```bash
--settings '{"loudnessLufs":-16}'
```

Export succeeded. Measured loudness:

```
input_i: -28.93 LUFS
```

Twenty-nine. Nowhere near the −16 I asked for. The setting is a struct, and the
serialiser simply ignored a key it did not recognise:

```json
{"effects": {"loudness": {"enabled": true, "target_lufs": -16.0,
                          "true_peak_dbtp": -1.5}}}
```

With that, the same measurement reads **−16.15 LUFS, −1.37 dBTP.** The tell, both
times, is that the JSON `result` block is *identical* to the run before it. When
two exports at different settings produce the same byte count, the setting did
not apply. That is a cheaper signal than listening.

---

## 6. What I measured on the delivered file

Not the export's own summary — the file.

| Check | Result |
| --- | --- |
| Streams | h264 1536×864 24/1 + aac 48 kHz stereo |
| Duration | 222.0 s (5328 frames) |
| Full decode | clean, no errors |
| Loudness | −16.15 LUFS integrated, −1.37 dBTP |
| Audio per beat | −29 to −34 dB mean in all ten windows |
| Head / tail | −91 dB — digital silence, 1.2 s and 1.5 s |
| A/V sync | speech onset within 1–3 frames of each cut |
| Ken Burns | frame-diff per beat, all 10 moving (6.2–17.6) |
| Encode fidelity | SSIM 0.987 vs a 20 Mbps reference |
| Size | 91,773,070 bytes |

The audio check is worth spelling out because it caught a real ordering risk. I
measured `volumedetect` in a five-second window at each beat's start, and
`silencedetect` across each cut, to confirm the narration actually begins where
the image does — not a second early, not a second late. Getting the cut right and
then drifting the audio by half a second is a very easy way to ship something
that feels wrong without looking wrong.

---

## 7. What I would tell an agent

1. **Read the dimension constraint before planning a resolution.** Multiples of
   32 is not a suggestion. Exact 16:9 and 32-divisibility intersect at
   1024×576, 1536×864, 2048×1152 — and nowhere near 1280×720.
2. **Match the multipart field name to the handler.** `images`, not `images[]`.
   The error message will blame your input, not your field name.
3. **Generate a sequence from the original reference every time.** Chaining
   outputs compounds artifacts and inherits lighting.
4. **Find the venv by listing it.** `ls -d .venv venv` beats every note that says
   which one it is, including your own.
5. **Verify speech by transcribing it back.** Duration is not content. Coverage
   against the script is content.
6. **Say what you did not verify.** I can measure loudness and words; I cannot
   judge whether a cloned voice sounds right. That is a human check.
7. **Measure motion, do not trust the return code.** A keyframe written into the
   wrong time space is accepted, applied, and invisible. Compare frames.
8. **Do not test an animation through a transition.** The transition will move
   the pixels and take the credit.
9. **Treat identical output as a failed setting.** Same byte count across
   different quality or loudness values means the parameter was dropped, not
   honoured.
10. **Set bitrate explicitly on stills-based video.** 20 Mbps of slow pan is
    wasted bytes; 3 Mbps was SSIM 0.987 against it.

---

## 8. Where it lives

The film: **[2001 a documentary](https://www.youtube.com/watch?v=8BcjFsYxm9Q)**

Every frame in order, sampled from the delivered file:

![The ten beats, in sequence](/images/2001-documentary-contact-sheet.jpg)

The four pipeline scripts are checked in alongside the assets:

```
outputs/story/
  pipeline/01_generate_images.py   # ten frames, manifest-resumable
  pipeline/02_generate_audio.py    # vox + chris.wav, 503-aware
  pipeline/03_verify_audio.py      # Whisper transcription + coverage score
  pipeline/04_build_movie.py       # FilmCraft cut, grade, export
  narration.json                   # 615 words, ten beats
  audio/manifest.json              # per-clip durations and transcripts
  movie/build.json                 # the actual timeline that was exported
```

The image half is **[qwen-image-studio](https://github.com/kliewerdaniel/qwen-image-studio)**
— the same studio written up in the previous post. The NLE is
**[FilmCraft](https://getartcraft.com/apps/filmcraft)**, MIT/Apache-2.0, and the
headless CLI is what makes an edit scriptable at all. `vox` is the Qwen3-TTS web
UI over MLX.

One licensing note that applies to the stills and not the code: the
Qwen-Image-2.1 weights are under the **Qwen Research License Agreement,
non-commercial use only**. The FilmCraft code is MIT/Apache-2.0 and `vox` is MIT.
If any of this becomes commercial, the image model is the piece to renegotiate.

---

*Everything here ran locally: the stills, the voice, the cut and the encode.
No prompt, sample or frame left the machine. The only network traffic was
uploading the finished film.*
