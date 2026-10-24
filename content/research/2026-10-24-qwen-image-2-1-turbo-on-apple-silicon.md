---
author: Daniel Kliewer
canonical_url: /blog/2026-10-24-qwen-image-2-1-turbo-on-apple-silicon
date: 10-24-2026
description: "A complete, verified log of getting Qwen-Image-2.1-Turbo to run on an Apple M4 Pro. Covers the CUDA quickstart that cannot work on arm64 macOS and how to find the MLX conversion instead, choosing weights by free disk rather than by the model card, a Pillow pin that fails like a broken install, a 17.8 GB download that stalls and then fails with a misleading error, building a browser studio over the pipeline, a thread-affinity bug that passed every test I wrote, the swap wall that makes a job look hung, and the exact recipe so an agent can replicate it. Every command was run. Every number came off real output."
image: /images/qwen-image-yacht-edit.png
layout: post
title: "The Checkpoint That Couldn't Run: Getting Qwen-Image-2.1-Turbo Onto an M4 Pro"
og:description: "Every command, every measured number, every pitfall from the CUDA quickstart that cannot work on Apple Silicon, the MLX conversion that does, the Pillow pin that fails like a broken install, the thread-affinity bug that passed every test, and the swap wall that makes a job look hung."
og:image: /images/qwen-image-yacht-edit.png
og:title: "The Checkpoint That Couldn't Run: Getting Qwen-Image-2.1-Turbo Onto an M4 Pro"
og:type: article
og:url: /blog/2026-10-24-qwen-image-2-1-turbo-on-apple-silicon
tags:
  - local-image-generation
  - mlx
  - mflux
  - qwen-image
  - apple-silicon
  - hermes-agent
twitter:card: summary_large_image
twitter:description: "Every command, every measured number, every pitfall from the CUDA quickstart that cannot work on Apple Silicon, the MLX conversion that does, the Pillow pin that fails like a broken install, the thread-affinity bug that passed every test, and the swap wall."
twitter:image: /images/qwen-image-yacht-edit.png
twitter:title: "The Checkpoint That Couldn't Run: Getting Qwen-Image-2.1-Turbo Onto an M4 Pro"
---

The ask was simple: run Qwen-Image-2.1-Turbo on my Mac, drive it from a browser,
and save the workflows that work. What I got was a CUDA quickstart that cannot
work on this machine, a Pillow pin that fails like a broken install, a 17.8 GB
download that lies about why it failed, a concurrency bug that passed every test
I wrote, and a swap wall that makes a healthy job look hung.

The short version: **the model card is written for NVIDIA, and my machine is not
NVIDIA. The path that works is a different runtime entirely — and the hardest bug
was in my own code, not the model's.**

Every command below was run on 2026-10-24 on an M4 Pro with 48 GB unified memory.
Every number came off real output. The mistakes are written down so you don't
have to make them.

---

## 0. Rule Zero: read the quickstart's *target* before planning anything

The model card opens with:

```python
import torch
from diffusers import QwenImage21Pipeline

pipe = QwenImage21Pipeline.from_pretrained(
    "Qwen/Qwen-Image-2.1-Turbo",
    dtype=torch.bfloat16,
).to("cuda")
```

Two words decide this whole project: **`.to("cuda")`**.

My machine:

```
$ uname -m
arm64
$ sw_vers
ProductVersion: 26.6.2
```

There is no CUDA on arm64 macOS. Not "it's slow" — it does not exist. And the
weights that card expects are 32.5 GB of bf16:

```
text_encoder/model.safetensors                          17.534 GB
transformer/diffusion_pytorch_model-00001-of-00002...    9.968 GB
transformer/diffusion_pytorch_model-00002-of-00002...    4.262 GB
vae/diffusion_pytorch_model.safetensors                  0.676 GB
                                                     ------------
                                                     32.49 GB total
```

So the card's path is closed twice over: no CUDA, and a 32.5 GB footprint. I
still have 51 GB free on disk, but I did not want to spend it on a path I could
not execute.

**The lesson, and it is the whole post in one line: a model card documents the
author's environment. Check it against yours before you plan disk, memory, or
timing around anything in it.**

---

## 1. Find the conversion before you plan anything

Hugging Face hosts two different MLX ecosystems, and they are not
interchangeable. Searching the orgs:

```bash
curl -s "https://huggingface.co/api/models?author=mflux-community&limit=100"
curl -s "https://huggingface.co/api/models?author=mlx-community&limit=100"
```

What exists:

| Shape | Example | Notes |
| --- | --- | --- |
| `mflux-community/<model>-mflux-q<N>` | `qwen-image-2-1-turbo-mflux-q8` | Pre-quantized for the **mflux** runtime. Load with `quantize=None`. |
| `mlx-community/<model>-MLX-4bit` | `Qwen-Image-2.1-MLX-4bit` | Diffusers-format MLX weights. Often a repack of the **base**, non-distilled checkpoint. |

Two things I got wrong on the first pass, both worth recording:

1. **`mlx-community/Qwen-Image-2.1-MLX-4bit` is the wrong checkpoint.** It is
   10.5 GB and it is the *base* model — 40 steps, no distillation. The card
   advertises Turbo's 8 steps. A third-party recipe explicitly warns against it:
   *"Not recommended: it quantizes the text encoder to 4-bit, which mflux itself
   refuses to do."*
2. **There is no `mlx-community` Turbo at all.** I checked three plausible names;
   all 401. The Turbo conversion lives in `mflux-community`, not `mlx-community`.

The one I want:

```
mflux-community/qwen-image-2-1-turbo-mflux-q8
  transformer/0..3.safetensors     7.66 GB
  text_encoder/0..4.safetensors   9.35 GB
  vae/0.safetensors               0.68 GB
                               ----------
                               17.79 GB total
```

Same architecture, same saved 8-step schedule, half the disk, and it runs on
Metal. Its README says the quantization level is stored *in the weights*, so
`--quantize` is not needed — which also skips a re-quantization pass over 32 GB.

---

## 2. Choose the quantization by free disk, not by the card

The card quotes bf16. The runnable size is the quantized one, and the levels
differ by gigabytes:

| Quant | Size | Repo |
| --- | --- | --- |
| bf16 | ~33 GB | `...-mflux-bf16` |
| **q8** | **17.8 GB** | `...-mflux-q8` |
| q6 | ~14.5 GB | `...-mflux-q6` |
| q5 | ~12 GB | `...-mflux-q5` |
| q4 | ~10 GB | `...-mflux-q4` |

Fetch the real byte counts rather than trusting a table:

```bash
curl -s "https://huggingface.co/api/models/<repo>?blobs=true" \
  | python3 -c "import sys,json
d=json.load(sys.stdin)
print(sum((f.get('size') or 0) for f in d['siblings'])/1e9, 'GB')"
```

I took **q8**. On a 48 GB machine, an 18 GB model leaves room for activations;
q8 is also the level the model's own documentation recommends when memory is
tighter than a 64 GB box. q4 would have been 7 GB lighter but the quality cost
is real, and I had the disk.

---

## 3. The install, and a Pillow pin that fails like a broken install

```bash
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python mflux fastapi uvicorn python-multipart "pillow==12.3.0"
```

Python 3.13, not 3.12 — mflux's dependency graph resolves differently there.

Then this, which cost me two attempts:

```
$ .venv/bin/mflux-generate-qwen-2.1-edit --help
  File ".../PIL/_typing.py", line 8, in <module>
    from numbers import _IntegralLike as IntegralLike
ImportError: cannot import name '_IntegralLike' from 'numbers'
```

Pillow **13.0.0** imports `numbers._IntegralLike`, a private name that does not
exist in Python 3.12 or 3.13. The traceback points at `PIL/_typing.py`, which
reads like a corrupt Pillow rather than a pin you forgot — and it kills *every*
mflux CLI entry point, not just the one you called.

Pinned to 12.3.0, the CLI works. This is now the first line of the README.

---

## 4. Downloading 17.8 GB: it stalls, and the error lies

First attempt, plain `hf download`:

```
Still waiting to acquire lock on .../.gitignore.lock
EXIT=0
 23M  models/qwen-image-2.1-turbo-q8
```

Zero progress. It was not slow — it was *stalled*, and it sat there for minutes
while I assumed the network was bad. Measuring bytes over a window is the only
way to tell:

```bash
A=$(find models/... -name "*.incomplete" -exec stat -f "%z" {} \; | paste -sd+ - | bc)
sleep 30
B=$(...)
echo "rate: $((B-A)) bytes in 30s"
```

**A stalled run makes zero progress and must be restarted, not waited on.**

With the Xet transfer backend it runs properly:

```bash
HF_XET_HIGH_PERFORMANCE=1 HF_HUB_DOWNLOAD_TIMEOUT=600 \
  .venv/bin/hf download mflux-community/qwen-image-2-1-turbo-mflux-q8 \
  --local-dir models/qwen-image-2.1-turbo-q8
```

(Note: `HF_HUB_ENABLE_HF_TRANSFER` is deprecated as of huggingface_hub 1.33 —
the replacement is `HF_XET_HIGH_PERFORMANCE`. The old variable still works but
warns.)

Then verify. This is the step that saved the next hour:

```
$ .venv/bin/python scripts/verify_weights.py
  files checked: 25, problems: 0
  total on disk: 17.79 GB
  OK — weights match the hub exactly.
```

Why it matters: a truncated shard does not fail during download. It fails later
at model-load time with:

```
FileNotFoundError: No safetensors files found in .../vae
```

which reads like a bad path rather than a bad download. Comparing local sizes
against the hub tree API catches it in ten seconds. Both scripts are in the repo.

---

## 5. Building the studio

The model is a library, not a service. A browser needs three things: a job
registry, a worker, and something to poll.

```
backend/
  app.py      # FastAPI routes
  engine.py   # model cache, job registry, worker thread, progress sink
  ui.html     # one file, no build step
```

`POST /api/generate` takes multipart fields plus `images[]` and an optional
`mask`, creates the job synchronously, and returns an id. The UI polls
`GET /api/jobs/{id}`. Generation is serialized — Metal is one GPU.

Two variants share one checkpoint directory; the `ModelConfig` selects the
Turbo schedule:

| Mode | Variant | Extra kwargs |
| --- | --- | --- |
| text → image | `QwenImage21` | `width`, `height` |
| image → image | `QwenImage21` | `image_path`, `image_strength` |
| reference edit | `QwenImage21Edit` | `image_paths`, `output_resolution`, `strength` |
| inpaint | `QwenImage21Edit` | `image_paths`, `mask_image` |

Three details that were not obvious:

- **Reference order is significant.** The first image is the edit source; the
  rest are additional references (subject + scene).
- **Inpaint needs a source image.** Without a server-side check it silently
  falls through to a text-to-image run and you get a picture instead of an edit.
- **Turbo rejects CFG.** `Qwen21TurboScheduler.check_generate` raises unless
  `guidance == 1.0`. The UI disables the guidance field rather than letting you
  hit the error.

---

## 6. The bug that passed every test I wrote

I ran a text-to-image job. It worked. I ran a reference edit. It worked. I ran a
second text-to-image. It **failed**:

```
RuntimeError: There is no Stream(cpu, 9) in current thread.
RuntimeError: [METAL] Command buffer execution failed:
               Caused GPU Timeout Error (00000002:kIOGPUCommandBufferCallbackErrorTimeout).
```

My code spawned a thread per request:

```python
job_id = engine.new_job(params)
threading.Thread(target=engine.run, args=(job_id,), daemon=True).start()
```

**MLX Metal streams are thread-local.** The first job creates *and* evaluates
the model on the same thread — fine. Every later job reuses the **cached** model
from a different, now-dead thread, and `mx.eval` refuses. The GPU timeout in the
same run is that corruption, which is why it looked like a hardware fault and
sent me chasing memory.

The reason this shipped: **each of my tests was the first successful job in its
own process.** A test suite that runs one job per process passes. The bug only
appears on the *second* job in a long-lived server — which is exactly the
situation a user hits and a test does not.

The fix is one worker thread behind a queue:

```python
def submit(self, params):
    job_id = self.new_job(params)
    if self._worker is None or not self._worker.is_alive():
        self._worker = threading.Thread(target=self._worker_loop, daemon=True)
        self._worker.start()
    self._queue.put(job_id)
    return job_id
```

Verified by running three jobs back-to-back through the running server — the
second one being the exact case that failed:

| # | Job | Wall time |
| --- | --- | --- |
| 1 | text → image (includes model load) | 97.3 s |
| 2 | text → image, **cached model** | 173.3 s |
| 3 | reference edit | 139.3 s |

---

## 7. The swap wall: a healthy job that looks hung

Job 2 took 173 s where job 1 took 97 s for identical work. The cause was not
the code:

```
$ sysctl vm.swapusage
total = 28672.00M  used = 27661.38M  free = 1010.62M
$ ps aux | awk '{s+=$6} END {print s/1048576 " GB total RSS"}'
12.2 GB total RSS
```

Live processes accounted for 12 GB. Swap held 27 GB — macOS had evicted the
idle model weights. The tell is unmistakable once you know it: **flat RSS at
~0–3% CPU for over a minute means thrashing, not computing.**

Kill the job and memory returns immediately; a retry succeeds. Closing Chrome
and Slack before a batch is the bigger lever — an 18 GB model plus a desktop
environment on 48 GB is a real constraint, not a hypothetical.

---

## 8. What it actually produces

Structural checks prove a file exists. Only looking at it proves the file is
right. Three real outputs from this session:

- **Text → image** — "a red panda reading a book under a cherry tree,
  watercolor illustration" → a red panda holding an open book under cherry
  blossoms, watercolor. Correct.
- **Text → image** — "a lighthouse on a cliff at sunset, oil painting" → a
  lighthouse on a grassy cliff over the ocean at golden hour, painted. Correct.
- **Reference edit** — the model card's yacht sketch → a photorealistic yacht
  with a black hull, white superstructure and yellow funnel on deep-blue water.
  Correct.

That third one is the hero image at the top of this post. It is a real output
from the setup described here, not a stock photo.

Measured on the M4 Pro, Q8, 1024×1024:

| | |
| --- | --- |
| Per denoise step | ~11 s |
| First generation (with load) | ~111 s |
| Cached | ~97 s |
| Reference edit | ~139 s |

---

## 9. What I'd tell an agent to do differently

If you are going to replicate this, start here:

1. **Check the runtime before the model.** `.to("cuda")` on arm64 macOS is a
   dead end. Find the MLX conversion first, then plan.
2. **Search both orgs.** `mflux-community` (pre-quantized, mflux runtime) and
   `mlx-community` (diffusers-format) are different things, and the checkpoint
   you want may only exist in one.
3. **Measure, never assume, a download.** Zero bytes over a 30 s window is a
   stall. Restart it.
4. **Verify weights against the tree API before the first load.** The failure it
   prevents looks like a bad path.
5. **Pin `pillow==12.3.0`.** The error points at `PIL/_typing.py` and misleads.
6. **One worker thread.** Not a lock around a shared thread — one long-lived
   thread behind a queue. Thread-local Metal streams make anything else break
   on the second job.
7. **Test the second job in the same process.** Every bug in section 6 was
   invisible to a one-job-per-process test.
8. **Read swap before reading the code.** Flat RSS and ~0% CPU is thrash.

---

## 10. The repo

Everything is at
**[github.com/kliewerdaniel/qwen-image-studio](https://github.com/kliewerdaniel/qwen-image-studio)**.

The weights are **not** committed — 17.8 GB is not a git problem, and they carry
their own license. `scripts/fetch_weights.sh` downloads them and
`scripts/verify_weights.py` checks them. The repo is 13.86 MB across 17 files,
with zero `safetensors`.

```bash
git clone https://github.com/kliewerdaniel/qwen-image-studio.git
cd qwen-image-studio
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python mflux fastapi uvicorn python-multipart "pillow==12.3.0"
./scripts/fetch_weights.sh
./start.sh          # → http://127.0.0.1:8787
```

The three seeded workflows — sketch to photorealistic, style transfer, object
swap — are in `workflows/` as JSON and load straight into the UI.

**One license note, and it is not a footnote.** The weights are under the
**Qwen Research License Agreement: non-commercial use only.** Section 1.i defines
"Non-Commercial" as "for research or evaluation purposes only", and Section 2.a
grants the license "FOR NON-COMMERCIAL PURPOSES ONLY". The code is MIT. If you
want to use the model commercially, that is a separate license from the licensor.

---

*The studio is local-first: prompts, images and outputs never leave the machine.
The only network call is fetching the weights.*
