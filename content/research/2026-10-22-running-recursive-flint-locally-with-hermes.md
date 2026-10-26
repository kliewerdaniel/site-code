---
author: Daniel Kliewer
canonical_url: /blog/2026-10-22-running-recursive-flint-locally-with-hermes
date: 10-22-2026
description: "A complete, verified log of running Recursive's 39.8B-parameter Flint MoE locally on an Apple M4 Pro and wiring it into Hermes as the default model. Covers the architecture-version gate, the chat-template trap that silently destroys tool calling, quant selection with measured KLD and tool-call agreement, a self-hosted llama.cpp install, launchd persistence, and every measured number. Written so an agent can repeat it without making the same mistakes."
image: /images/ai-job-market.png
layout: post
title: "Hoisting Recursive Flint Aboard Hermes: A Pirate's Guide to Running a 40B MoE Locally"
tags:
  - local-llm
  - llama-cpp
  - hermes-agent
  - moe
  - apple-silicon
  - quantization
  - flint
---

Arrr, gather round. This be the log of how I took a 40-billion-parameter mixture-of-experts
model from Recursive — a thing built for B300 and H200 GPUs — and made it answer to Hermes
on a single MacBook Pro with 48 GB of unified memory. Every command in this log was run.
Every number came off real output. Every mistake I made is written down so ye don't have to
make it again.

I'm writing this for an **agent**, not a human. That means: assume nothing, verify everything,
and when the evidence contradicts the documentation, believe the evidence.

---

## 0. The Booty We're After

**Recursive Flint.** Recursive's mixture-of-experts language model for coding agents:

| Property | Value |
|---|---|
| Total parameters | 39.8 B |
| Active per token | ~2.5 B (40B-A2.5B) |
| Layers | 49 (2 dense + 47 MoE) |
| Attention | 35 sliding-window layers (513 tokens) + 14 full-attention |
| Experts per MoE layer | 256 routed, 6 selected, plus an always-active shared expert |
| Context | 262,144 tokens |
| Vocabulary | 150,144 |
| License | Apache-2.0 |

Published scores: 54.9% Terminal-Bench 2.1, 89.7% SWE-bench Pro v2, 74.2% SWE-bench Verified.

The machine:

```
$ system_profiler SPHardwareDataType
Model Name: MacBook Pro
Model Identifier: Mac16,7
Chip: Apple M4 Pro
Total Number of Cores: 14 (10 Performance and 4 Efficiency)
Memory: 48 GB

$ system_profiler SPDisplaysDataType
Chipset Model: Apple M4 Pro
Total Number of Cores: 20
Metal Support: Metal 4
```

Already aboard: `ollama` 0.40.8, a brew `llama.cpp` at build 10330, `hf` CLI.

---

## 1. The First Trap: The Build Is Too Old To Know The Architecture

This is the mistake that will eat your whole afternoon if you don't check it first.

New model architectures land in llama.cpp **continuously**, and the build you have
installed was built before they did. Flint support landed in PR #30928:

```bash
$ curl -s "https://api.github.com/repos/ggml-org/llama.cpp/commits?path=src/models/flint.cpp&per_page=5"
a37cc46104  2026-10-21 models : add Flint model (FlintForCausalLM) (#30928)
```

**2026-10-21.** Your installed build must postdate that. Mine didn't:

```bash
$ llama-server --version
version: 9591 (e95dae18d)          # /usr/local/bin — way too old

$ /opt/homebrew/bin/llama-server --version
version: 10330 (687e77892)        # brew — Aug 2026, also too old
```

### The nastier version: Hermes's own managed engine is pinned

Hermes ships a **Local Models** feature that downloads and manages llama.cpp for you,
sizes memory, and handles context automatically. It looks like the easy path. **It is not
available for a brand-new architecture**, because Hermes pins its engine rather than
tracking master:

```bash
$ python3 -c "
import json,os
p=os.path.expanduser('~/.hermes/hermes-agent/pm/lock.json')
d=json.load(open(p))
for k,v in d['packages'].items():
    if k.startswith('llamacpp-'):
        arts=v.get('artifacts',{})
        a=arts.get('darwin-arm64') or next(iter(arts.values()))
        print(k, '->', a['url'].rsplit('/',2)[-2])
"
llamacpp-cpu -> llama-b11671
llamacpp-cuda -> llama-b11671
llamacpp-hip -> llama-b11671
llamacpp-metal -> llama-b11671
llamacpp-vulkan -> llama-b11671
```

`b11671` published **2026-10-16** — five days *before* Flint existed in llama.cpp. Hermes
will cheerfully offer the model, download 25 GB of it, and then fail to load it.

**Lesson:** when a model is younger than your engine pin, self-host. The docs even say so —
*"an explicit entry wins over server detection."*

### Getting a build that knows the arch

```bash
$ curl -s "https://api.github.com/repos/ggml-org/llama.cpp/releases?per_page=8" \
  | python3 -c "
import json,sys
for r in json.load(sys.stdin):
    print(r['tag_name'], r['published_at'][:10])
"
b11822 2026-10-22
b11821 2026-10-22
b11819 2026-10-22
...
```

`b11822` is the newest and postdates the merge. Grab the macOS arm64 asset:

```bash
$ curl -sL "https://github.com/ggml-org/llama.cpp/releases/download/b11822/llama-b11822-bin-macos-arm64.tar.gz" \
  -o llama_b11822.tar.gz
$ tar -xzf llama_b11822.tar.gz
```

### Installing it so it actually runs

The macOS prebuilt is a **flat tree**: binaries and `.dylib`s side by side, with
`LC_RPATH = @loader_path`. Copy only the binaries and the loader dies:

```
dyld[]: Library not loaded: @rpath/libllama-server-impl.dylib
```

Check your PATH first — `/usr/local/bin` is root-owned, `~/.local/bin` is not and comes first:

```bash
$ echo $PATH | tr ':' '\n' | head -3
/Users/danielkliewer/.local/bin
/Users/danielkliewer/.local/bin
/usr/local/bin

$ cp /usr/local/bin/.wtest /dev/null 2>&1 || echo "NOT writable (root-owned)"
```

So copy the whole tree, not the binaries:

```bash
$ cp -f llama-b11822/llama-b11822/* ~/.local/bin/
$ chmod +x ~/.local/bin/llama-* ~/.local/bin/ggml-*

$ llama-server --version
version: 0.7.0-dev (build 11822, commit d9ee007a0)
```

---

## 2. The Second Trap: A Chat Template That Silently Kills Tool Calling

This one is insidious because **everything looks fine**. `/health` returns 200. `/v1/models`
lists your model. The server logs `model loaded`. Then the agent sends a tool schema and
gets back... prose. No `tool_calls`.

### Reading the template out of the GGUF header

You can inspect a GGUF **without downloading it**. The header (KV metadata + tensor infos)
sits at the front of the file; one range request gets it:

```bash
$ curl -s -r 0-33554431 -L \
  "https://huggingface.co/RecursiveSI/flint-int4-gguf/resolve/main/flint-int4-q4_1.gguf" \
  -o off_head.bin
$ python3 gguf_hdr.py off_head.bin
GGUF version: 3 | tensors: 779
  general.architecture = flint
  general.name = Flint INT4 Preview
  flint.block_count = 49
  flint.context_length = 262144
  flint.attention.head_count = 32
  flint.attention.head_count_kv = 4
  flint.expert_count = 256
```

And the template:

```
CHAT TEMPLATE (len 2328):
{%- macro flint_text(t) -%}
{%- if t is string -%}
{{- t | replace("\x00", "") | replace("<think>", "") | ...
```

**`replace("\x00", "")`.** That's the poison.

llama.cpp's Jinja engine (minja) chokes on it. Without `--jinja` the server falls back to a
generic chat format and **the model's tool-call syntax is gone**. For a coding agent whose
entire purpose is tool calling, that is fatal — and it fails silently.

I confirmed this is not a theoretical concern. The terelabs README states it flatly:

> Only these files work with `llama-server --jinja` out of the box. The official, unsloth and
> lmstudio GGUFs embed the original template with the `\x00` filter described above.

### A note on not trusting a single line of reasoning

While investigating I found that minja's lexer *does* appear to handle `\x` escapes
(`common/jinja/lexer.cpp`, the `case 'x'` branch). I initially concluded the official file
would work. **I was wrong to trust that.** The publisher's empirical result is the evidence
that counts: they ran it, it failed, and they fixed it. Read the source to understand, but
when someone has run the actual command, believe them over your reading.

---

## 3. Choosing The Quant

### The candidates

| Quant | Size | KLD mean | top-1 | same tool call as BF16 |
|---|---:|---:|---:|---:|
| **terelabs Q4_K_M** | 25.02 GB | 0.440 | 85.8% | **80.0%** |
| terelabs IQ4_XS | 22.24 GB | 0.473 | 85.3% | 78.3% |
| terelabs Q5_K_M | 28.98 GB | 0.369 | 87.3% | 78.7% |
| unsloth UD-Q4_K_XL | 25.05 GB | 0.389 | 86.5% | 79.7% |
| official int4 Q4_1 (QAT) | 25.99 GB | 0.675 | 80.4% | 77.0% |
| lmstudio Q4_K_M | 24.17 GB | 0.668 | 82.1% | 76.0% |

All measured by terelabs against the same BF16 reference. Lower KLD is better.

### Why Q4_K_M and not the others

Three reasons, in order of importance:

1. **Tool-call agreement is what matters for an agent.** KLD measures logit distance; it
   does not measure whether the model picks the same tool. Q4_K_M wins here at 80.0% — ahead
   of unsloth's 79.7% and the official file's 77.0%.
2. **It's imatrix-calibrated, and the calibration is on your workload.** ~300k tokens of
   `NousResearch/hermes-function-calling-v1` (Apache-2.0) rendered through Flint's *own*
   chat template, plus ~500k tokens of code from six permissive repos and ~150k of prose.
   The Q8_0 overrides on attention, embeddings, output, dense FFN and the shared expert mean
   everything that runs on every token is stored nearly losslessly, and the routed experts
   carry the compression.
3. **`Q4_1` is not `Q4_K_M`.** It's a legacy format, and in the official file it stores F32
   embeddings — making it *larger* than Q4_K_M (25.99 GB vs 25.02 GB) for measurably worse
   quality. Do not grab "Q4_1" because it sounds close to "Q4_K_M".

### Verifying the tensor layout before you commit 25 GB

The GGUF header carries the full tensor list. Compare it against the loader's
`load_arch_tensors` in `src/models/flint.cpp` *before* the download finishes:

```
tensor name patterns:
    49  blk.N.attn_k.weight
    49  blk.N.attn_k_norm.weight
    49  blk.N.attn_norm.weight
    49  blk.N.attn_output.weight
    49  blk.N.attn_q.weight
    49  blk.N.attn_q_norm.weight
    49  blk.N.attn_sinks.weight
    49  blk.N.attn_v.weight
     2  blk.N.ffn_down.weight          <- dense lead layers
    47  blk.N.ffn_down_exps.weight     <- MoE layers
    47  blk.N.ffn_down_shexp.weight    <- shared expert
     2  blk.N.ffn_gate.weight
    47  blk.N.ffn_gate_exps.weight
    47  blk.N.ffn_gate_inp.weight
    47  blk.N.ffn_gate_shexp.weight
    49  blk.N.ffn_norm.weight
     2  blk.N.ffn_up.weight
    47  blk.N.ffn_up_exps.weight
    47  blk.N.ffn_up_shexp.weight
     1  output.weight
     1  output_norm.weight
     1  token_embd.weight
```

779 tensors. Two dense layers, forty-seven MoE layers, shared experts present. It matches
`flint.cpp` exactly. The file is what it claims to be.

---

## 4. The Download (Do Not Get Clever)

```bash
$ mkdir -p ~/models/flint && cd ~/models/flint
$ curl -sL -C - --retry 5 --retry-delay 10 --retry-all-errors -m 7200 \
  "https://huggingface.co/terelabs/flint-GGUF/resolve/main/flint-Q4_K_M.gguf" \
  -o flint-Q4_K_M.gguf
```

**~6.9 MB/s, ~55 minutes for 25.02 GB.**

You will be tempted to parallelize. **Don't.** I benchmarked it:

```
8 parallel conns: 100.0 MB in 61.8s = 1.62 MB/s
1 conn:           ~6.9 MB/s
```

The Hugging Face CDN throttles per client, so eight range connections are *four times
slower* in aggregate than one stream. Measure a single stream first, then plan your wait.

Verify the byte count at the end. The manifest says `25,017,398,368`:

```
$ ls -la ~/models/flint/flint-Q4_K_M.gguf
-rw-r--r--  1 danielkliewer  staff  25017398368 Oct 22 13:57 flint-Q4_K_M.gguf
```

---

## 5. Launching The Server

`~/models/flint/serve-flint.sh`:

```bash
#!/bin/bash
set -euo pipefail

MODEL="${FLINT_MODEL:-$HOME/models/flint/flint-Q4_K_M.gguf}"
PORT="${FLINT_PORT:-8080}"
CTX="${FLINT_CTX:-131072}"

LLAMA_SERVER="$HOME/.local/bin/llama-server"

ARGS=(
  -m "$MODEL"
  --alias flint
  --port "$PORT"
  --host 127.0.0.1
  -ngl all
  -np 1
  -c "$CTX"
  -fa on
  -b 1024
  -ub 512
  -t 10
  --cache-ram 0
  -ctk q8_0
  -ctv q8_0
  --jinja
  --temp 1
  --top-p 0.95
  --top-k 20
  --min-p 0
)

exec "$LLAMA_SERVER" "${ARGS[@]}"
```

Why these flags:

- **`-ngl all`** — full Metal offload. 25 GB of weights, 48 GB of unified memory: it fits.
- **`-c 131072`** — 128K context. Hermes requires **at least 64K** for agent use; the sliding
  window (513 tokens on 35 of 49 layers) keeps the KV cache far smaller than a naive
  14 × 2 × 512 × 131072 calculation suggests.
- **`-ctk q8_0 -ctv q8_0`** — quantized KV cache. Roughly halves KV memory against f16 and
  costs almost nothing in quality. Keep **K at the higher tier** if you ever go asymmetric —
  K degrades faster than V.
- **`--cache-ram 0`** — from the official Flint instructions; limits extra host-memory use.
- **`--jinja`** — mandatory. Without it the template doesn't load and tool calling dies.
- **`-b 1024 -ub 512`** — see the tuning section below.

Load time: **~20 seconds**. The log:

```
init: chat template supports preserving reasoning, it is enabled by default
      (may use more tokens, disable via --no-reasoning-preserve)
llama_server: model loaded
llama_server: listening on http://127.0.0.1:8080
```

That `chat template supports preserving reasoning` line is your Gate 1 evidence. If you don't
see it, your template didn't parse.

---

## 6. Verifying, In The Right Order

Don't trust a 200 response. Run all four checks.

```bash
# 1. alias advertised
$ curl -s http://127.0.0.1:8080/v1/models | head -c 150
{"models":[{"name":"flint","model":"flint",...
```

```python
# 2. plain completion
# 3. TOOL CALLING  <- the one that matters
# 4. throughput
```

Full harness at `~/models/flint/verify_flint.py`. Real output:

```
[1] /v1/models -> ['flint']
[2] completion (0.4s): 'FLINT_OK'
[3] tool call (1.4s): 1 call(s)
    name='get_weather' args='{"city":"Paris"}'
[4] throughput: 101 tokens in 1.8s = 55.8 tok/s
    prompt_tokens=10

RESULT: PASS
```

The tool call is the load-bearing check. A model that completes prose but never emits
`tool_calls` is useless to an agent, and nothing in `/health` or `/v1/models` will tell you.

### Reasoning is correctly separated

Flint emits `...`. With `--reasoning-format auto` (the default) it lands in
`reasoning_content`, not `content`:

```
=== A) default reasoning_format (auto -> none) ===
  keys: ['role', 'content', 'reasoning_content']
  content[:300]: 'The ball costs **$0.05** (5 cents).\n\nLet the ball cost **x**....'
  reasoning_content[:200]: 'We need answer user. Need think through. Classic bat and ball...'
```

Good — the bat-and-ball problem answered correctly *and* the trace was split out. Hermes
replays history, so this separation matters.

---

## 7. Tuning: Prefill And Decode Are Different Problems

I benchmarked the same 21,606-token prompt at three batch settings:

| `-b` / `-ub` | prefill | note |
|---|---|---|
| 256 / 128 | 453 tok/s | official default |
| 1024 / 512 | **620 tok/s** | chosen |
| 2048 / 1024 | 648 tok/s | diminishing returns, more memory |

```
b=256/ub=128:   prompt_ms: 47653.864  prompt_per_second: 453.39
b=1024/ub=512:  prompt_ms: 34869.982  prompt_per_second: 619.62
b=2048/ub=1024: prompt_ms: 33349.071  prompt_per_second: 647.87
```

Raising `-b`/`-ub` lifted prefill **37%** at a 6% size penalty going to 2048. Not worth it —
the activation buffers cost memory. Decode speed barely moved, because it's memory-bandwidth
bound:

```
gen: 44.6 tok/s   42.7 tok/s   39.3 tok/s   (300 tokens each, 3 runs)
gen: 56.0 tok/s   (best case)
```

**Roughly 40–56 tok/s generation, 620 tok/s prefill.**

### The performance reality you must set expectations about

**First turn is expensive.** Hermes ships a large system prompt plus every tool schema. With
18 toolsets that is **27,123 tokens**:

```
prompt eval time = 78646.00 ms / 27123 tokens (2.90 ms per token, 344.87 tokens per second)
```

At 620 tok/s that's ~44 s before the first token. The KV cache then makes later turns cheap:

```
prompt eval time = 599.36 ms / 231 tokens   <- later turn, cache hit
prompt eval time = 246.60 ms / 22 tokens    <- later turn, cache hit
```

**But agent turns are token-hungry.** In a real Hermes session, each turn generated
**1,200–1,400 tokens**:

```
eval time = 37502.49 ms / 1400 tokens (26.81 ms per token, 37.30 tokens per second)
eval time = 35306.26 ms / 1261 tokens (28.02 ms per token, 35.69 tokens per second)
```

An 8-tool-call task therefore took **5m 29s** — not because the setup is broken, but because
the model reasons at length. Multiply by turns when estimating wall time. `--reasoning-budget N`
caps the thinking.

---

## 8. Wiring Hermes To It

### The provider entry

```bash
$ hermes config set providers.llamacpp.name "llama.cpp (Flint)"
$ hermes config set providers.llamacpp.base_url "http://127.0.0.1:8080/v1"
$ hermes config set providers.llamacpp.model "flint"

$ hermes config set model.provider llamacpp
$ hermes config set model.default flint
```

`providers.<name>` only becomes a custom-endpoint definition when it carries an endpoint
(`base_url`/`api`/`url`). A block with no endpoint is read as tuning for a **built-in**
provider of the same name — so include the URL.

### TRAP: the old route survives the switch

After switching, the config still read:

```
$ hermes config get model
provider: llamacpp
base_url: https://inference-api.nousresearch.com/v1     <- STALE
default: flint
api_mode: chat_completions                            <- STALE
```

`hermes config set model.provider` did **not** clear the previous provider's `base_url`.
Requests could have been routed to the Nous endpoint while the provider name said otherwise.
Clear it:

```bash
$ hermes config unset model.base_url
$ hermes config unset model.api_mode

$ hermes config get model
provider: llamacpp
default: flint
```

A clean block is just those two keys.

### Verify with no explicit flags

The proof that the default route is local is running *without* `--provider`:

```
$ hermes chat -q "Reply with exactly: FINAL_OK" --oneshot
 FINAL_OK
 Duration:       55s
 Messages:       2 (1 user, 0 tool calls)
```

And a tool-using task, no flags, default model:

```
$ hermes chat -q "Use the terminal tool to count how many .gguf files exist under ~/models/flint. Report just the number." --oneshot
 ┊ 💻 $         find ~/models -type f -name "*.gguf" 2>/dev/null  0.7s
 ┊ 💻 $         find ~/models/fluff -type f -name "*.gguf" 2>/dev/null  0.2s
 ┊ 💻 $         ls -la ~/models/  0.2s
 ┊ 💻 $         find ~/models/flint -type f -name "*.gguf" 2>/dev/null  0.2s
 1
 Duration:       5m 29s
 Messages:       10 (1 user, 8 tool calls)
```

Eight tool calls, correct answer. The agent loop works end to end.

---

## 9. Measuring GPU Memory (ps Lies)

Here's a trap that will make you think your model is half-loaded:

```
$ ps -o rss= -p <pid>
11.0 GB                       <- for a 25 GB model?!

$ footprint -p <pid> | grep -E "mapped file|TOTAL"
    0 B    9290 MB          0 B         19    mapped file
2180 MB    9304 MB          0 B       4682    TOTAL
```

**macOS does not count Metal buffer allocations in process RSS.** The real residency is in
the GPU driver:

```bash
$ ioreg -r -c IOAccelerator | grep -oE '"(Alloc|In use) system memory"=[0-9]+'
"Alloc system memory"=30865080320     <- 28.7 GB allocated
"In use system memory"=28195946496     <- 26.3 GB in use
```

28 GB of GPU memory resident. On a 48 GB machine that leaves ~20 GB for macOS, the Hermes
Electron app, and everything else. Know this number *before* you commit to a quant — and
measure it this way.

---

## 10. Persistence: launchd, Not A Backgrounded Shell

A shell-backgrounded server dies with the session. Ship a LaunchAgent:
`~/models/flint/com.danielkliewer.flint-llamacpp.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.danielkliewer.flint-llamacpp</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/danielkliewer/.local/bin/llama-server</string>
        <string>-m</string>
        <string>/Users/danielkliewer/models/flint/flint-Q4_K_M.gguf</string>
        <string>--alias</string>
        <string>flint</string>
        <string>--port</string>
        <string>8080</string>
        <string>--host</string>
        <string>127.0.0.1</string>
        <string>-ngl</string>
        <string>all</string>
        <string>-np</string>
        <string>1</string>
        <string>-c</string>
        <string>131072</string>
        <string>-fa</string>
        <string>on</string>
        <string>-b</string>
        <string>1024</string>
        <string>-ub</string>
        <string>512</string>
        <string>-t</string>
        <string>10</string>
        <string>--cache-ram</string>
        <string>0</string>
        <string>-ctk</string>
        <string>q8_0</string>
        <string>-ctv</string>
        <string>q8_0</string>
        <string>--jinja</string>
        <string>--temp</string>
        <string>1</string>
        <string>--top-p</string>
        <string>0.95</string>
        <string>--top-k</string>
        <string>20</string>
        <string>--min-p</string>
        <string>0</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>ProcessType</key>
    <string>Interactive</string>
    <key>StandardOutPath</key>
    <string>/Users/danielkliewer/models/flint/llama-server.out.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/danielkliewer/models/flint/llama-server.err.log</string>
    <key>WorkingDirectory</key>
    <string>/Users/danielkliewer/models/flint</string>
</dict>
</plist>
```

Install and verify:

```bash
$ plutil -lint ~/models/flint/com.danielkliewer.flint-llamacpp.plist
.../com.danielkliewer.flint-llamacpp.plist: OK

# FREE THE PORT FIRST, or the agent's instance cannot bind
$ pkill -f "llama-server.*flint-Q4_K_M"; sleep 3
$ pkill -9 -f "llama-server.*flint-Q4_K_M"; sleep 2

$ cp ~/models/flint/com.danielkliewer.flint-llamacpp.plist ~/Library/LaunchAgents/
$ launchctl unload ~/Library/LaunchAgents/com.danielkliewer.flint-llamacpp.plist 2>/dev/null
$ launchctl load -w ~/Library/LaunchAgents/com.danielkliewer.flint-llamacpp.plist

$ launchctl list | grep -i flint
93833	0	com.danielkliewer.flint-llamacpp
```

The PID and exit status 0 say it's loaded and running. The log files are not decoration —
without them you cannot tell "never started" from "started and failed".

---

## 11. Operating Commands

```bash
# stop / start
launchctl unload ~/Library/LaunchAgents/com.danielkliewer.flint-llamacpp.plist
launchctl load   ~/Library/LaunchAgents/com.danielkliewer.flint-llamacpp.plist

# watch it load
tail -f ~/models/flint/llama-server.out.log

# is the model actually resident?
ioreg -r -c IOAccelerator | grep -oE '"(Alloc|In use) system memory"=[0-9]+'

# switch back to a cloud model
hermes config set model.provider nous
hermes config set model.default upstage/solar-pro4:free

# manual foreground run (debugging)
~/models/flint/serve-flint.sh
```

Files, all in `~/models/flint/`:

| File | Purpose |
|---|---|
| `serve-flint.sh` | launch the server |
| `verify_flint.py` | model list, completion, tool call, throughput |
| `bench_prefill.py` | prefill/decode benchmark |
| `com.danielkliewer.flint-llamacpp.plist` | launchd agent |
| `gguf_hdr.py` / `gguf_tensors.py` | inspect a GGUF header without downloading it |

---

## 12. The Skill, So Ye Don't Repeat This

The whole procedure is captured in the `local-inference-integration` skill, which now
carries three references:

- **`references/hermes-local-model-wiring.md`** — the pinned managed engine, provider
  config, the stale `model.base_url` trap, Metal memory measurement, prefill-vs-decode
  expectations, launchd persistence, and the verification order.
- **`references/gguf-quant-selection.md`** — the two gates (template parses under `--jinja`;
  tensor names match the arch loader) and how to choose among quants that pass both.
- **`references/gguf-arch-load-fix.md`** — diagnosing and fixing GGUF load failures for
  unknown architectures, including the pinned-Hermes-engine variant.
- **`references/llama-server-tuning.md`** — KV-cache quantization ("turboquant"), Flash
  Attention, context length, offload, threading.

Load it before you start. It exists because I made every mistake in this log at least once.

---

## 13. The Whole Voyage In One Block

```bash
# 0. Know thy enemy: which llama.cpp build knows this arch?
curl -s "https://api.github.com/repos/ggml-org/llama.cpp/commits?path=src/models/<arch>.cpp&per_page=5"

# 1. Install a build that postdates it
curl -sL "https://github.com/ggml-org/llama.cpp/releases/download/b11822/llama-b11822-bin-macos-arm64.tar.gz" -o l.tar.gz
tar -xzf l.tar.gz
cp -f llama-b11822/llama-b11822/* ~/.local/bin/ && chmod +x ~/.local/bin/llama-*
llama-server --version

# 2. Inspect the candidate BEFORE downloading 25 GB
curl -s -r 0-33554431 -L "<resolve URL>" -o head.bin
python3 gguf_hdr.py head.bin        # check tokenizer.chat_template for \x00
python3 gguf_tensors.py head.bin    # check tensor names match src/models/<arch>.cpp

# 3. Download — single stream, be patient
mkdir -p ~/models/flint && cd ~/models/flint
curl -sL -C - --retry 5 --retry-delay 10 --retry-all-errors -m 7200 \
  "https://huggingface.co/terelabs/flint-GGUF/resolve/main/flint-Q4_K_M.gguf" \
  -o flint-Q4_K_M.gguf

# 4. Launch
~/models/flint/serve-flint.sh        # --jinja is mandatory

# 5. Verify in order: models -> completion -> TOOL CALL -> throughput
python3 ~/models/flint/verify_flint.py

# 6. Wire Hermes, then clear the stale route
hermes config set providers.llamacpp.name "llama.cpp (Flint)"
hermes config set providers.llamacpp.base_url "http://127.0.0.1:8080/v1"
hermes config set providers.llamacpp.model flint
hermes config set model.provider llamacpp
hermes config set model.default flint
hermes config unset model.base_url
hermes config unset model.api_mode

# 7. Persist
plutil -lint ~/models/flint/com.danielkliewer.flint-llamacpp.plist
pkill -f "llama-server.*flint-Q4_K_M"; sleep 3
cp ~/models/flint/com.danielkliewer.flint-llamacpp.plist ~/Library/LaunchAgents/
launchctl unload ~/Library/LaunchAgents/com.danielkliewer.flint-llamacpp.plist 2>/dev/null
launchctl load -w ~/Library/LaunchAgents/com.danielkliewer.flint-llamacpp.plist

# 8. Prove the default route is local
hermes chat -q "Reply with exactly: FINAL_OK" --oneshot
```

---

## 14. What I'd Tell Ye, If Ye Asked

**Check the build before you check the model.** The GGUF was never the problem. The binary
was. One API call against the arch's commit history would have told me in ten seconds that
my engine was five days too old — and that Hermes's managed engine was too old by design.

**The quiet failure is the dangerous one.** A template that won't parse doesn't crash
anything. `/health` is green, `/v1/models` answers, the agent just never gets `tool_calls`.
Verify the tool round trip explicitly, every time.

**Prefer a publisher who has run the command.** I reasoned from the lexer source that the
`\x00` filter would parse. The publisher who actually tried it said otherwise, and they were
right. Read source to understand; trust executors to know.

**Don't fight the CDN.** Eight connections gave 1.62 MB/s. One gave 6.9. Parallelism is not
always speed.

**Set expectations honestly.** This is not a fast setup. First turn costs ~45 s, and agent
turns cost 30+ s each. It is *good* — 620 tok/s prefill, 40–56 tok/s decode, tool calling
that works — but it is not instant, and anyone you hand this to deserves to know that
before they sit down at the helm.

Fair winds. May yer weights stay resident and yer templates parse.
