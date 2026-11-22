---
author: Daniel Kliewer
canonical_url: /blog/2026-11-22-unified-local-creative-production-system
date: 11-22-2026
description: "How Hermes, Hermes Local Video Studio, Ganymede, the ArtCraft suite and Raea were wired into one local-first production system, with the exact contracts, commands and traps an agent needs to reproduce it."
image: /images/2026-11-22-raea-control-plane.jpg
layout: post
title: "One Local Production System: Hermes, ArtCraft, Ganymede and Raea"
og:description: "A replication guide for a local-first creative production stack: canonical timeline, per-engine adapters, measured evidence, and a verified documentary built end to end."
og:image: /images/2026-11-22-raea-control-plane.jpg
og:title: "One Local Production System: Hermes, ArtCraft, Ganymede and Raea"
og:type: article
og:url: /blog/2026-11-22-unified-local-creative-production-system
tags:
  - local-ai
  - hermes
  - video-production
  - artcraft
  - raea
  - ganymede
  - agent-architecture
twitter:card: summary_large_image
twitter:description: "A replication guide for a local-first creative production stack with measured verification."
twitter:image: /images/2026-11-22-raea-control-plane.jpg
twitter:title: "One Local Production System: Hermes, ArtCraft, Ganymede and Raea"
---

# One Local Production System: Hermes, ArtCraft, Ganymede and Raea

The problem was not that I had too few tools. It was that I had too many capable ones sitting side by side, each with its own project format, time base, id space and idea of what "success" means. FilmCraft finishes an export even when the dissolve failed. Raea refuses a render with a P1 finding. Ganymede has a storyboard contract. Hermes Local Video Studio has a schema and an evidence ledger. None of them is a universal adapter, and pretending otherwise is how you get a film that renders but does not contain the edit you asked for.

So I built one coherent system instead of three installed apps. Hermes is the director and the verifier. Hermes Local Video Studio (HLVS) is the orchestrator. Ganymede is the canonical methodology. ArtCraft owns the craft it already does well. Raea is an independent GPU renderer for the shots that genuinely need spatial computation. Every engine is reached through a small adapter that translates intent and then gets out of the way.

The result is a working, local-first documentary, *The Architecture of Sovereign Intelligence*, produced from a single canonical timeline and verified with real measurements. This post is the replication guide. If you hand it to a fresh agent with the repositories available, that agent should be able to rebuild the architecture without guessing which tool owns what.

![The Raea-rendered agent control plane from the finished film](/images/2026-11-22-raea-control-plane.jpg)

## 0. What exists, before you change anything

Re-verify this on the machine you are using. The paths below are the ones that were actually present.

| Thing | Path | What it really is |
|---|---|---|
| HLVS repo | `~/Projects/hermes-local-video-studio` | stdlib-only Python orchestrator, schema v1.1, provenance ledger, adapters for Qwen/FilmCraft/media/timeline/Raea/audio |
| Ganymede reference | `~/Projects/ganymede-archive` | the film methodology: `storyboard/timeline.json`, `pipeline/effects.py` `TEMPLATE_SPEC`, runbook, quality report, postmortem |
| ArtCraft CLIs | `~/Projects/<app>/target/{release,debug}/<app>-cli` | EffectCraft 669 commands, FilmCraft 693, LightCraft 307, PhotoCraft 871 (debug only), VectorCraft 736, DesignCraft 446, PDFCraft 143 tools |
| Raea | `~/.local/bin/raea` → `~/.raea/bin/raea` | v0.1.8, FSL-1.1-ALv2, independent React/TypeScript GPU renderer |
| Qwen Image | `~/Projects/qwen-image-studio` | FastAPI on `:8787`, `qwen-image-2.1-turbo-q8`, ~17.8 GB weights |
| Vox / Qwen3-TTS | `~/Documents/Projects/vox` | Flask + waitress on `:7860`; "Vox TTS" and "Qwen3-TTS" are the same service |
| ffmpeg | `/opt/homebrew/bin/ffmpeg` | present, but **no** `subtitles`, `ass` or `drawtext` filters — captions must be native graphics |

The base state was recorded before edits: branch `main` at `c534b57435c1b31687a3e560d23315e42f5f2785`, clean tree, tracked-file hashes. Nothing was pushed.

The live repository for the orchestrator is [kliewerdaniel/hermes-local-video-studio](https://github.com/kliewerdaniel/hermes-local-video-studio).

## 1. The annotated repository tree

```text
hermes-local-video-studio/
├── hlvs/
│   ├── schema.py              # v1.0 and v1.1 contracts; the only expected_duration_seconds()
│   ├── provenance.py          # StepResult: requested vs verified; evidence derived from verified
│   ├── runner.py              # ordered, resumable stages; refuses to export on transition mismatch
│   ├── capabilities.py        # probes the seven ArtCraft CLIs and Qwen, without assuming docs
│   ├── cli.py                 # doctor | validate | run | verify
│   └── adapters/
│       ├── qwen.py            # POST /api/generate, poll /api/jobs/{id}, sha256 each plate
│       ├── filmcraft.py       # --save-as session, item/clip id mapping, export
│       ├── media.py           # ffprobe, full decode, frame diff, luma structure, loudness
│       ├── timeline.py        # Ganymede timeline -> segments + generated Raea timing constants
│       ├── raea.py            # independent Raea render + independent measurement gates
│       └── audio.py           # loads existing brief03 scripts by path; no duplicated audio logic
├── schemas/project.schema.json # editor copy; schema.py is the authority
├── skills/                     # nine source skills; only two were installed into Hermes
├── tests/                      # unit + integration; 52 tests at the end
├── docs/unified-architecture.md
├── docs/capability-matrix.md
└── examples/sovereign-intelligence/
    ├── project.json            # v1.1 production spec
    ├── storyboard/timeline.json # the hinge file: picture and sound derive from it
    ├── assets/                 # Qwen plates, EffectCraft clips, gap, provenance manifest
    ├── shots/                  # EffectCraft JSX and .ecproj
    ├── stills/                 # scaled and blurred plates
    ├── audio/                  # Vox manifest, score, mix, reports
    ├── build/                  # manifest.json, film.fcproj, raea_timing.ts, output.mp4
    ├── pipeline/               # the five real generation scripts, copied for reproduction
    └── output/                 # final film, QUALITY_REPORT, MANUAL_REVIEW, RUNBOOK, POSTMORTEM
```

Do not add a third project model. Raea keeps `brief.ts` and `compositions/`; HLVS keeps `project.json`. `hlvs/adapters/raea.py` is the bridge.

## 2. The one contract that makes it cohere

The hinge is `storyboard/timeline.json`. In Ganymede's recorded film it has 23 elements, 20 narration events, `fps: 24`, `total: 188.153`, 21 dissolves and one deliberate hard cut. Picture and sound both read it. No stage re-derives a hold from a guessed word count.

A subtle fact matters: the sum of the element durations is 186.652s, not 188.153s. There is a real 1.5s gap after the title plus a 0.001s rounding slip. `hlvs/adapters/timeline.py` turns gaps into explicit segments and folds sub-frame slip into the last segment, so the segments tile `[0, total]` exactly. A v1.1 scene for the gap declares `blank_hold: true`, and verification proves it is flat instead of calling it an empty shot.

`project.json` v1.1 adds intent without adding application commands:

```jsonc
{
  "schema_version": "1.1",
  "project": { "name": "…", "canvas": { "width": 1536, "height": 864 }, "fps": 24 },
  "timeline_ref": "storyboard/timeline.json",
  "brief": { "intent": "…", "audience": "…", "visual_direction": "…", "claim": "…" },
  "assets": [ { "id": "s02_graph", "source": { "kind": "file", "path": "assets/s02_graph.png" } } ],
  "scenes": [
    {
      "id": "S04_RAEA", "shot": "S04_RAEA", "asset": "s04_raea",
      "duration": 9.0, "engine": "raea", "effect_ref": "R_SPATIAL",
      "camera": "push_in", "animation": "AGENT CONTROL PLANE",
      "narration": "Render, inspect, correct. The machine sees its own output before you do."
    }
  ],
  "audio": { "narration": true, "score": true, "mix": true, "master": true,
             "target_lufs": -16.0, "true_peak_dbtp": -1.0 },
  "verification": { "require_frame_inspection": true,
                    "require_audio_measurement": true, "require_manual_review": true },
  "render": { "format": "h264", "bitrateKbps": 6000 }
}
```

The rules that are easy to get wrong:

- `shot` keys a scene to a timeline segment. It is not decoration.
- `engine` selects the renderer. It does not change who owns timing.
- `blank_hold` is a boolean contract; a flat shot without it is a defect.
- A Raea scene **requires** `timeline_ref`. The validator refuses it otherwise.
- v1.0 projects remain valid. A v1.0 file carrying a v1.1 field is rejected, so the contracts cannot drift silently.

Summed scene durations are the only duration contract. A FilmCraft cross dissolve sits inside the existing edit: three 4s scenes with two 16-frame dissolves exported **12.01s**, not 10.67s. `schema.expected_duration_seconds()` is the single implementation; docs that claimed overlap subtraction were corrected.

## 3. Dependency graph and exact ordering

```text
narration.json + Vox ──> audio/manifest.json ──┐
                                                ├─> 04_prepare_audio.py ─> storyboard/timeline.json
environments.json ──────────────────────────────┘              │
                                                               │ (the hinge)
Qwen Image ─> assets/*.png ─> EffectCraft comps ─> fx_*.mp4     │
                                                               ├─> project.json v1.1
timeline.json ─> raea_timing.ts ─> Raea clip ───────────────────┤
                                                               ├─> FilmCraft assembly
score.wav + narration ─> one baked mix.wav ────────────────────┤
                                                               └─> export ─> master ─> verify
```

Order is where these pipelines break. Do not build the project spec before the timeline exists. Do not mix audio before narration durations are measured. Do not assemble before Raea clips exist. Do not master before export.

The full source of the spec builder that binds all nine segments to assets and engines is worth reproducing exactly:

```python
#!/usr/bin/env python3
"""Phase 5: assemble the v1.1 project spec from the canonical timeline segments."""
import json, os, shutil, subprocess, sys

REPO = os.path.expanduser("~/Projects/hermes-local-video-studio")
sys.path.insert(0, REPO)
from hlvs import schema
from hlvs.adapters import timeline as tl

ROOT = os.path.join(REPO, "examples", "sovereign-intelligence")
ASSETS = os.path.join(ROOT, "assets")
CLIPS = os.path.join(ROOT, "shots", "clips")
TL_PATH = os.path.join(ROOT, "storyboard", "timeline.json")

# explicit black hold for the canonical gap
gap = os.path.join(ASSETS, "gap.png")
subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                "-f", "lavfi", "-i", "color=c=black:s=1536x864:r=24:d=1",
                "-frames:v", "1", gap], check=True)
# a declared plate for the procedural Raea scene (it is not drawn from the plate)
shutil.copyfile(os.path.join(ASSETS, "s02_graph.png"),
                os.path.join(ASSETS, "s04_raea.png"))

for f in os.listdir(ASSETS):
    if f.endswith(".mp4") and not f.startswith("fx_"):
        os.remove(os.path.join(ASSETS, f))
for name in ("TITLE", "S01_LOCAL", "S03_BOUNDARY", "LINE", "CRED"):
    shutil.copyfile(os.path.join(CLIPS, name + ".mp4"),
                    os.path.join(ASSETS, "fx_" + name.lower() + ".mp4"))

canonical = tl.load(TL_PATH)
segs = tl.segments(canonical)
asset_for = {
    "TITLE": "fx_title.mp4", "GAP_00": "gap.png", "S01_LOCAL": "fx_s01_local.mp4",
    "S02_GRAPH": "s02_graph.png", "S03_BOUNDARY": "fx_s03_boundary.mp4",
    "S04_RAEA": "s04_raea.png", "S05_SOVEREIGN": "s05_sovereign.png",
    "LINE": "fx_line.mp4", "CRED": "fx_cred.mp4",
}
engine_for = {"S04_RAEA": "raea", "S01_LOCAL": "effectcraft",
              "S03_BOUNDARY": "effectcraft", "TITLE": "effectcraft",
              "LINE": "effectcraft", "CRED": "effectcraft"}
motion_for = {"S02_GRAPH": {"type": "push_in", "from": 100, "to": 108},
              "S05_SOVEREIGN": {"type": "pull_out", "from": 108, "to": 100}}

project = {
    "schema_version": "1.1",
    "project": {"name": "sovereign-intelligence",
                "canvas": {"width": 1536, "height": 864}, "fps": 24},
    "timeline_ref": "storyboard/timeline.json",
    "brief": {
        "intent": "Explain how local inference, knowledge graphs, deterministic boundaries, evidence verification and autonomous agents compose into user-controlled intelligence.",
        "audience": "technical readers evaluating local-first AI architecture",
        "visual_direction": "cold blue-green shadows, bronze-ochre accents, precise geometry, no text in generated plates",
        "claim": "Authority is earned twice: epistemically, then operationally.",
        "runtime_seconds": canonical["total"],
    },
    "assets": [
        {"id": os.path.splitext(f)[0], "source": {"kind": "file", "path": "assets/" + f}}
        for f in sorted(os.listdir(ASSETS))
        if f.endswith((".png", ".mp4")) and f != "manifest.json"
    ],
    "scenes": [], "transitions": [],
    "audio": {"narration": True, "score": True, "mix": True, "master": True,
              "target_lufs": -16.0, "true_peak_dbtp": -1.0},
    "verification": {"require_frame_inspection": True,
                     "require_audio_measurement": True, "require_manual_review": True},
    "render": {"format": "h264", "bitrateKbps": 6000},
}

for seg in segs:
    sid = seg["id"]
    scene = {
        "id": sid, "shot": sid, "asset": os.path.splitext(asset_for[sid])[0],
        "duration": seg["dur"], "engine": engine_for.get(sid, "filmcraft"),
        "effect_ref": seg.get("effect") or "-",
        "camera": seg.get("camera") or "static",
        "animation": "AGENT CONTROL PLANE" if sid == "S04_RAEA" else "",
        "narration": seg.get("narration") or "",
    }
    if sid in motion_for:
        scene["motion"] = motion_for[sid]
    if sid == "GAP_00":
        scene["blank_hold"] = True
    project["scenes"].append(scene)

project["transitions"] = tl.map_scenes(project, canonical, TL_PATH)["transitions"]
errors = schema.validate(project, ROOT)
if errors:
    print("INVALID", errors)
    raise SystemExit(1)

with open(os.path.join(ROOT, "project.json"), "w", encoding="utf-8") as fh:
    json.dump(project, fh, indent=2)
print("PROJECT_VALID scenes", len(project["scenes"]),
      "assets", len(project["assets"]),
      "sum", schema.expected_duration_seconds(project))

from hlvs.runner import Runner
runner = Runner(project, os.path.join(ROOT, "project.json"),
                os.path.join(ROOT, "build"), log=lambda *_: None)
res = runner.check_timeline()
print("TIMELINE_STAGE", res.status, res.verified)
```

## 4. What each phase actually changed

### Phase 1 — schema v1.1 and evidence

`hlvs/schema.py` now accepts `1.0` and `1.1`, rejects v1.1 fields on a v1.0 project, validates the new scene fields, and owns the single duration function. `hlvs/provenance.py` derives `evidence` from `verified` on serialisation, so downstream QA can never find an empty proof list. Both docs and runner were reconciled to summed durations.

Gate: 36 tests OK, v1.0 example still valid.

### Phase 2 — canonical timeline and generated constants

`hlvs/adapters/timeline.py` loads a Ganymede timeline, creates explicit gap segments, folds the 0.001s slip, maps every project scene to one segment in order, and writes deterministic `raea_timing.ts`. `raea check --quick` is not involved here; the proof is structural: 23 elements + 1 gap = 24 segments tiling 188.153s, 21 dissolves and 1 hard cut, matching Ganymede's own `build.json`.

Gate: 43 tests OK.

### Phase 3 — Raea as an independent engine

`hlvs/adapters/raea.py` writes a frame-pure TSX scene, embeds the generated constants verbatim, renders with `RAEA_OFFLINE=1`, runs `raea check`, and then measures the output with HLVS's own ffprobe/decode/frame-diff/structure code. It assembles the rendered clip, not the source plate.

Two integration facts were discovered by running it, not by reading docs:

1. Raea bundles a composition into a temp directory, so a relative import of `raea_timing.ts` cannot resolve. The constants are embedded instead.
2. A Raea composition id allows only letters, digits and hyphens. `S04_RAEA` had to become `S04-RAEA` on the Raea side while the canonical key stayed `S04_RAEA`.

Gate: 46 tests OK. The rendered probe measured frame diff 16.192, luma std 50.198, zero findings.

### Phase 4 — audio without a second implementation

`hlvs/adapters/audio.py` imports `05_compose_score.py`, `07_mix_audio.py` and `13_master_audio.py` from `film-production-brief03/pipeline` by path, overrides only their path globals, and calls their real `main()`. No audio logic was copied. One baked mix goes to FilmCraft A1; the measured-gain master runs after export and refuses to ship if peak exceeds 1.0.

Gate: 50 tests OK.

### Phase 5 — the validation film

Qwen generated four plates with prompt, seed, job id and sha256 recorded. Vox generated five narration clips. The existing `04_prepare_audio.py` built a 62.129s canonical timeline from measured speech durations. EffectCraft rendered five comps from Ganymede's `TEMPLATE_SPEC` functions. Raea rendered the agent control plane. FilmCraft assembled nine scenes plus one baked audio item. HLVS verified the export.

Gate: 52 tests OK; production manifest 39 verified, 8 intentional `requested_only`, 0 failed.

### Phase 6 — documentation and skills

`docs/unified-architecture.md` and `docs/capability-matrix.md` record the roles and measured capabilities. Two HLVS skills were installed into the active Hermes profile:

- `creative/hlvs-end-to-end-production`
- `creative/hlvs-render-qa`

Both were updated with the summed-duration contract and the blank-hold rule. The existing `creative/raea-production` skill gained a unified-production section and `references/unified-production.md`. The other seven repo skills were deliberately not installed.

## 5. Engine selection is a decision, not a default

| Need | Engine | Why |
|---|---|---|
| Legible titles, masks, keyframes, procedural 2.5D effects | EffectCraft | The image model must never render words; the comp is inspectable and measured |
| Timeline, dissolves, one audio item, final export | FilmCraft | It is the NLE; its silent failures are known and asserted against |
| One consistent grade across stills | LightCraft | The skill documents it; the validation film did not need it |
| Real 3D perspective, instanced nodes, spatial environments | Raea | ArtCraft has no equivalent at comparable cost |
| Plates | Qwen Image 2.1 Turbo | Local weights, recorded provenance |
| Narration | Vox / Qwen3-TTS | Local service, 24+ voices, one POST per beat |
| Mix and master | Existing brief03 scripts | Measured lessons already encoded; do not duplicate |

The early point-of-light frame is an EffectCraft `A_OPENING` output, not a generated image with words in it:

![Opening point of light from the finished film](/images/2026-11-22-opening-point.jpg)

The execution-boundary shot uses `D_FRACTURE` from Ganymede's template contract. Its effect is not obvious in one still, so it was verified by measuring pixel difference against the source plate: 7.19 and 7.52 at two sample times, above the template's >2.0 threshold.

![Execution boundary shot from the finished film](/images/2026-11-22-execution-boundary.jpg)

The observatory shot is a Qwen plate placed directly on the FilmCraft timeline with a pull-out motion. Strong blue/bronze identity, no generated text.

![Sovereign observatory still from the finished film](/images/2026-11-22-sovereign-observatory.jpg)

The closing card is native EffectCraft typography. It reads correctly and sits fully inside the frame.

![Closing card from the finished film](/images/2026-11-22-closing-card.jpg)

## 6. Running the whole thing

These are the commands used, in order. Model-loading services were run sequentially; Qwen was stopped before Vox started.

```bash
# 1. Qwen plates
cd ~/Projects/qwen-image-studio && ./start.sh &
curl -s http://127.0.0.1:8787/api/status
python3 ~/Projects/hermes-local-video-studio/examples/sovereign-intelligence/pipeline/generate_plates.py
kill <qwen-pid>

# 2. Vox narration
cd ~/Documents/Projects/vox && ./venv/bin/python app.py &
curl -s http://127.0.0.1:7860/api/voices
python3 ~/Projects/hermes-local-video-studio/examples/sovereign-intelligence/pipeline/generate_narration.py
kill <vox-pid>

# 3. Canonical timeline, using the existing 04 script
cd ~/Projects/hermes-local-video-studio
python3 examples/sovereign-intelligence/pipeline/build_timeline.py

# 4. EffectCraft comps from Ganymede templates
python3 examples/sovereign-intelligence/pipeline/build_effectcraft.py

# 5. v1.1 project spec and timeline stage
python3 examples/sovereign-intelligence/pipeline/build_project.py

# 6. Full orchestration
cd examples/sovereign-intelligence
PYTHONPATH=~/Projects/hermes-local-video-studio python3 -m hlvs.cli run project.json

# 7. Independent export checks
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=codec_name,width,height -of json build/output.mp4
ffmpeg -v error -i build/output.mp4 -f null -
ffmpeg -hide_banner -i build/output.mp4 -af loudnorm=print_format=json -f null -
```

The final run reported:

```text
OK   capabilities               rust_apps_found=7, qwen_reachable=False, text_filters=False
OK   timeline                   scene_count=9, gaps=1, total=62.129, transitions=7
OK   raea:S04_RAEA              frame_diff=…, sha256=84aa65e1e6ba938…
OK   audio:mix                  total=62.129, peak=0.708, speech_over_bed=3.09
OK   verify:transitions         count=6
OK   render                     duration=62.17, sha256=c3b8874d43acb242…
OK   audio:master               peak_before=0.998, peak_after=0.822
OK   verify:decode              clean=True
OK   verify:duration            actual=62.17, expected=62.13, model=summed_scenes
OK   verify:motion              S02=3.15, S05=9.074
OK   verify:content             all non-blank scenes carry structure
OK   verify:blank_hold:GAP_00   luma_std=[0,0,0], deliberate=True

summary: verified=39, requested_only=8, failed=0, skipped=0
```

The eight `requested_only` steps are intentional. Motion and transition commands were accepted; their effects are measured in separate `verify:*` steps. A zero exit code is never proof.

## 7. Traps, root causes, measurements

| Symptom | Root cause | Fix | Measurement |
|---|---|---|---|
| Raea refused `S04_RAEA` | Composition ids allow letters, digits, hyphens only | Sanitize Raea-facing id, keep canonical key | Unit test + successful 216-frame render |
| `raea check` safe-area errors | Title/subtitle inside 96px exclusion zones | Move title to y=140, subtitle to bottom=150 | 0 findings; frame inspected |
| Duplicate asset ids | EffectCraft clip and Qwen plate shared basename | `fx_` prefix, clean stale files | schema validation |
| `verify:content` failed on the gap | Deliberate black hold treated as empty | `blank_hold` field + dedicated flatness proof | luma std `[0,0,0]` |
| Qwen output at 1024×576 but project canvas 1536×864 | Canonical timeline was authored at 1536×864 | Scale plates with ffmpeg, no invented grade | all EffectCraft clip durations exact |
| FilmCraft can export without transitions | Headless transition may fail silently | Assert count against spec, refuse export | 6 dissolves, 1 intentional hard cut |
| Final loudness was -17.20 LUFS | Existing master controls peak, not integrated LUFS | Reported honestly, script reused unchanged | peak 0.822, speech/bed 3.09× |

The general rule: when a check fails for a legitimate reason, change what it measures, not the number. A loosened threshold stops catching the real case.

## 8. Verification ladder

| Layer | What it proves | Evidence |
|---|---|---|
| Unit and integration tests | Contracts, adapters, timing, Raea render, audio reuse | 52 tests OK |
| Run manifest | Every stage has a status and measured fields | 39 verified / 8 REQ / 0 failed |
| Container | Correct codec, size, streams | h264 1536×864, aac, 62.167s |
| Decode | File actually plays | `ffmpeg -f null -` clean |
| Duration | One timing authority | 62.17 vs 62.129 summed |
| Motion | Clips are not still frames | 3.15 and 9.074 frame diff |
| Raea QA | Engine's own floor plus independent measurement | 0 findings, 16.192 frame diff |
| Effect QA | Procedural change is in the picture | 7.19/7.52 and 15.26 pixel diff |
| Audio | Voice above bed, no clipping | 3.09× speech/bed, peak 0.822 |
| Manual | Typography, composition, visual identity | Five decoded frames inspected |

## 9. The whole voyage in one block

For an agent with the repos present:

```bash
# Baseline first
cd ~/Projects/hermes-local-video-studio
git status --porcelain
git rev-parse HEAD

# Verify the stack is real
python3 -m unittest discover -s tests -t .
python3 -m hlvs.cli doctor --no-probe

# Install the two integrated skills if absent (from the repo's skills/ directory)
# They are now at ~/.hermes/skills/creative/hlvs-end-to-end-production
# and ~/.hermes/skills/creative/hlvs-render-qa

# Reproduce the validation project in the order in section 6, then:
cd examples/sovereign-intelligence
python3 -m hlvs.cli validate project.json
python3 -m hlvs.cli run project.json --dry-run
python3 -m hlvs.cli run project.json
python3 -c 'import json; print(json.load(open("build/manifest.json"))["summary"])'
```

Success is `failed: 0` plus an inspected frame. Nothing here needs a hosted API, a subscription or the Raea desktop app.

## 10. What I'd tell an agent

1. Record the baseline before editing anything.
2. Read the installed binaries' command catalogues. Documentation lies; `raea help` and `<app>-cli commands --json` do not.
3. Make one file the timing authority. Every stage derives from it; no stage recomputes.
4. Represent gaps explicitly. A hidden subtraction is a future desync.
5. When two engines can do a shot, choose by measured advantage, not preference.
6. Keep engine project models separate. Bridge them with adapters, never with a merged schema.
7. A command exit code is a request, not evidence. Measure the artifact.
8. Assert counts against the spec, not against zero. Four missing dissolves matter.
9. When a legitimate case fails a check, change what is measured, not the threshold.
10. Inspect actual decoded frames. A pixel measurement and a human-looking glance answer different questions.
11. Serialise weight-loading services. Qwen and Vox were never up at the same time.
12. Report limitations plainly. The -17.2 LUFS result is in the quality report, not hidden.

## 11. Where the code lives

| Artifact | Location |
|---|---|
| Orchestrator | [kliewerdaniel/hermes-local-video-studio](https://github.com/kliewerdaniel/hermes-local-video-studio) |
| Validation project | `examples/sovereign-intelligence/` in that repo |
| Final film | `examples/sovereign-intelligence/output/the-architecture-of-sovereign-intelligence.mp4` |
| Architecture and matrix | `docs/unified-architecture.md`, `docs/capability-matrix.md` |
| Quality evidence | `examples/sovereign-intelligence/output/QUALITY_REPORT.md` |
| Manual review | `examples/sovereign-intelligence/output/MANUAL_REVIEW.md` |
| Runbook and postmortem | `examples/sovereign-intelligence/output/RUNBOOK.md`, `POSTMORTEM.md` |
| Hermes skills | `~/.hermes/skills/creative/hlvs-end-to-end-production`, `hlvs-render-qa`, `raea-production` |

Raea is FSL-1.1-ALv2: use, modification and redistribution are allowed except for a competing product, and each version becomes Apache-2.0 two years after release. It is a rendering stage here, not something to package or resell.

*This post was written from real tool output during the build: 52 tests, a 39-step verified manifest, decoded frames and measured audio/video properties. The images are stills decoded from the delivered film.*
