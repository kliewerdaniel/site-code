---
author: Daniel Kliewer
canonical_url: /blog/omarchy-on-a-2017-macbook-pro-a-setup-retrospective
date: 09-26-2026
description: 'Replacing macOS on a 2017 MacBook Pro with Omarchy — the flash-drive install, the hybrid-graphics black screen, a boot menu that silently rolled back the filesystem, and wiring a local Llama 3.1 8B into an agent harness. What broke, what actually fixed it, and what the firmware would not give up.'
image: /images/ComfyUI_00210_.png
layout: post
og:description: 'Replacing macOS on a 2017 MacBook Pro with Omarchy — the flash-drive install, the hybrid-graphics black screen, a boot menu that silently rolled back the filesystem, and wiring a local Llama 3.1 8B into an agent harness. What broke, what actually fixed it, and what the firmware would not give up.'
og:image: /images/ComfyUI_00210_.png
og:title: 'Omarchy on a 2017 MacBook Pro: A Setup Retrospective'
og:type: article
og:url: /blog/omarchy-on-a-2017-macbook-pro-a-setup-retrospective
tags:
- linux
- omarchy
- arch
- macbook
- limine
- btrfs
- luks
- snapper
- amdgpu
- hyprland
- llama-cpp
- local-first
- self-hosting
title: 'Omarchy on a 2017 MacBook Pro: A Setup Retrospective'
twitter:card: summary_large_image
twitter:description: 'Replacing macOS on a 2017 MacBook Pro with Omarchy — the flash-drive install, the hybrid-graphics black screen, a boot menu that silently rolled back the filesystem, and wiring a local Llama 3.1 8B into an agent harness. What broke, what actually fixed it, and what the firmware would not give up.'
twitter:image: /images/ComfyUI_00210_.png
twitter:title: 'Omarchy on a 2017 MacBook Pro: A Setup Retrospective'
wiki_references: []
---

# Omarchy on a 2017 MacBook Pro: A Setup Retrospective

*Replacing macOS with Omarchy, then turning the result into a working development machine and a CPU-only image generator. The display topology is inverted from what the "hybrid graphics" label implies. The bootloader can silently roll back your filesystem. A WiFi driver can make the machine unresumable from sleep. And the GPU has no compute path at all.*

**Status:** complete, with one documented dead end (the Touch Bar) carried over from the original investigation.

---

## What this document is

This is a reproducible record of turning a 2017 13" MacBook Pro into an Omarchy-based development environment with a working local image generator. Everything here was executed on the target machine, and every performance number is measured rather than estimated.

Where a number is extrapolated rather than measured, it says so.

**The machine:**

| | |
|---|---|
| Model | MacBookPro13,3 (Kaby Lake, 2017) |
| CPU | i7-6820HQ — 4 cores / 8 threads @ 2.70 GHz |
| GPU | Radeon RX 460 (Baffin, Polaris10) + Intel HD 530 |
| VRAM | 2 GB exactly (`mem_info_vram_total` = 2147483648) |
| RAM | 15 GiB, with 31 GiB swap (15.5 G zram + 15.5 G swapfile) |
| Storage | 512 GB Apple SSD, btrfs on LUKS, Snapper snapshots |
| Kernel | 7.2.5-3-omarchy |
| Bootloader | Limine + `limine-mkinitcpio`, UKI enabled |

---

## Phase one: the install

Omarchy is Arch with opinions. You write the image to a USB stick, boot it, and it does the rest: `btrfs` subvolumes for root and `/home`, LUKS on top, and Snapper snapshots for rollback. The bootloader is **Limine**, not GRUB — modern Omarchy ships Limine plus `limine-mkinitcpio` and a `limine-snapper-sync` service that keeps the boot menu in sync with new snapshots.

Two properties of that stack matter for everything that follows, and neither is obvious until it has already bitten you.

**The kernel command line is assembled from three concatenated layers**, in descending priority:

```
1  /etc/default/limine                      (highest — the LUKS + root mapping)
2  /etc/limine-entry-tool.d/omarchy-defaults.conf
3  /etc/limine-entry-tool.d/resume.conf
```

And there is a `/etc/kernel/cmdline` file that **looks** authoritative and is read by nothing. Editing it does nothing at all. Verify via `/proc/cmdline` — the unused file's contents appear nowhere in the live command line.

**Snapshots are real boot targets, not just backups.** The generated menu gets a second entry — `//Snapshots` — with `rootflags=subvol=/@/.snapshots/1/snapshot`. If that entry ever becomes the default, the machine does not merely revert your packages. It boots a *different, older initramfs and kernel* as well, because the UKI is part of what the snapshot captured.

---

## Phase two: the black screen, and the first three wrong explanations

Symptom: after the GPU install step, a black screen following the bootloader menu. Reachable only via TTY. The natural assumption is a driver initialization failure on the hybrid graphics.

**Wrong explanation #1: it's a hybrid-graphics race, disable the dGPU.**

This is the advice almost every generic hybrid-GPU writeup gives, and on this machine it would have bricked the display. The connector states:

```
/sys/class/drm/card1-eDP-1/status   = connected     <-- panel is on the AMD GPU
/sys/class/drm/card0-DP-5/status    = disconnected
/sys/class/drm/card0-DP-6/status    = disconnected
/sys/class/drm/card0-HDMI-A-1/status = disconnected
/sys/class/drm/card0-HDMI-A-2/status = disconnected
```

`card1` is `amdgpu`. `card0` is `i915`. The internal panel is on the **AMD** card, and every Intel connector is dead. So `amdgpu.modeset=0`, or blacklisting `amdgpu`, removes the only working display. The topology is the *opposite* of what "hybrid graphics" implies: here the dGPU is the display owner, not the render-only compute card.

The accompanying i915 errors are expected and harmless:

```
i915 [drm] [ENCODER:110:DDI A/PHY A] failed to retrieve link info, disabling eDP
i915 [drm] Cannot find any crtc or sizes
```

Intel has no connected connectors, so it has no CRTCs. Nothing to fix.

**Wrong explanation #2: Omarchy's T2 fix applies.**

Omarchy ships `fix-t2.sh` and the parameters `intel_iommu=on iommu=pt pm_async=off mem_sleep_default=deep`. None of it applies: `lspci` shows no `106b:1801`/`106b:1802`, so there is no T2 chip on this machine. I nearly added those params on the strength of "it's a MacBook."

**Wrong explanation #3: `supergfxctl` will fix the GPU switching.**

It is AMD-mux-only, and a MacBookPro13,3 has no mux. It does nothing here.

### What it actually was

A silent boot window. The fix is to remove the kernel log suppression tokens from the command line, not to touch a single GPU driver. `initramfs_async=0` in the same drop-in also removed a serialization race that was costing roughly fifty seconds, bringing boot to **~29–31 s** and making it visible.

**One misleading measurement worth naming:** early kernel lines in `journalctl` are stamped with a large monotonic offset, identical *to the millisecond*. That is not the kernel taking 70 seconds to print. It is the early ring buffer being flushed to the journal all at once, so that timestamp is when journald started.

---

## Phase three: the boot menu was eating my packages

This is the failure that cost the most time, and it is the one I would most like to warn people about, because it presents as a *package manager* bug and is not one.

Packages kept vanishing. A package installed at 16:25 did not exist by evening and `pacman` reported it as "not found" — not uninstalled, just *absent*.

The cause was in `/boot/limine.conf`:

```
#timeout: 3
```

**Commented out.** With no timeout, the Limine menu waits forever and the user picks. Across fifteen boots the machine alternated between the live entry and the snapshot entry.

Booting `//Snapshots` mounted a subvolume created *before* packages were installed. The proof is in the file sizes: that entry's UKI is **81,581,056 bytes**; the live entry's is **91,877,888**. Different kernel, different initramfs, different userspace. Anything installed after the snapshot simply did not exist on that boot.

So the "graphics fix" that never worked and the "packages disappearing" problem were the same bug wearing two costumes.

**The fix** was a pacuhooks script at `/etc/boot/hooks/post.d/95-limine-default-entry` that sets `timeout: 3` and `default_entry: Omarchy/linux-omarchy`.

**Critical detail:** `limine-entry-tool` **hardcodes** `#timeout: 3` and `default_entry: 2` on every regeneration, and those are **not** settable from `/etc/limine-entry-tool.d/*.conf` — those files only cover `KERNEL_CMDLINE[...]` and `BOOT_ORDER`. Editing `/boot/limine.conf` directly is fixing a build artifact. The `post.d` hook is the only durable fix, and it must be re-registered with `pacuhooks`.

Use the **entry path**, not the index. `default_entry: Omarchy/linux-omarchy` survives reordering; `default_entry: 1` silently points at whatever ends up first, which may be a snapshot.

---

## Phase four: graphics, verified rather than assumed

Once the boot was fixed, it was worth confirming the display stack was actually healthy rather than just not complaining. All three APIs check out on the RX 460:

| API | Result |
|---|---|
| OpenGL | radeonsi — panel on card1-eDP-1 |
| Vulkan | RADV |
| Video decode | VA-API via radeonsi_drv_video.so |

And the proof that matters is not the driver listing but the open file descriptors: Hyprland, quickshell, Xwayland, and Chromium all hold `/dev/dri/renderD128` open simultaneously. That is not "drivers installed" — that is the compositor, the shell, the XWayland bridge, and the browser all actively rendering on the AMD card.

**Two things deliberately left alone:**

- **Intel HD 530** contributes a second render node and nothing else. Disabling it would quiet Xwayland/GLX selection noise but risks disturbing which adapter Xwayland picks. Low reward, non-zero risk.
- **NVIDIA-proprietary**, wrong vendor entirely.

---

## Phase five: the sleep problem, and why the obvious fix was wrong

This phase is the one that most changed how I approach a bug, because the fix that is recommended everywhere on this hardware is **provably wrong**, and I would have shipped it without knowing.

**Symptom:** close the lid, open it, black screen, hard reboot required. Every time.

### The empty-journal trap

The obvious first move is to add `mem_sleep_default=s2idle` to the kernel command line. This is the standard fix for pre-T2 MacBooks with broken S3, and it is what Omarchy's own T2 script sets.

It is also the wrong move, and here is why it fails.

The journal shows:

```
PM: suspend entry (s2idle)
                        <-- nothing further; next boot is a cold boot
```

That empty tail is **identical** for two completely different bugs:

- **(A) frozen/asleep** — the kernel genuinely never resumes. The fix lives in the suspend path.
- **(B) alive but black** — the kernel resumed fine, journal writes continue, and only the panel is dark. The user perceives this identically because a frozen cursor is invisible on a black panel.

A cold boot after either leaves the same empty tail, so **the journal alone can never separate them.**

### The probe that separates them

Before theorising, run a heartbeat that writes a timestamped tick every two seconds, and leave it running across the reproduction:

```bash
~/suspend-test.sh plain      # or drive the probe directly
```

The result is decisive. On this machine the log simply **stopped** — ticks ending at `14:03:25.904`, no completion line, no resume ticks. The probe process was frozen by `user.slice` during suspend and never woke.

**That is failure mode (A).** The kernel genuinely never resumes.

The consequence is uncomfortable: `mem_sleep_default=s2idle` changes nothing, because the sleep mode was never the variable. I had added it, rebooted, watched two lid cycles fail identically, and could easily have reported success — the empty journal looks the same either way.

### The actual cause

`brcmfmac` — the Broadcom BCM43602 WiFi driver, firmware 7.35.177.61 from 2015. With it loaded, suspend never resumes. Unloaded, it resumes reliably.

Verified directly: two consecutive cycles, both logged `System returned from sleep operation 'suspend'`.

Two things had to be right to unload it, and both are non-obvious:

```bash
# refcounts, from /sys/module/*/refcnt
brcmfmac      refcnt=1   held BY brcmfmac_wcc
brcmfmac_wcc  refcnt=0
brcmutil      refcnt=1   held BY brcmfmac
```

**`brcmfmac_wcc` must be removed first, as its own command.** NetworkManager is *not* the blocker — stopping it changes nothing. And listing `brcmfmac_wcc` in the same `modprobe -r` invocation makes depmod treat it as a *dependent* rather than a dependency, so the whole unload fails with `Module brcmfmac is in use`.

### The permanent fix

A systemd system-sleep hook, which runs automatically around every suspend/resume:

```bash
sudo install -m 755 ~/brcmfmac-suspend /usr/lib/systemd/system-sleep/brcmfmac-suspend
```

```bash
#!/bin/bash
case "$1" in
  pre)
    systemctl stop NetworkManager 2>/dev/null
    modprobe -r brcmfmac_wcc 2>/dev/null   # FIRST, and alone
    modprobe -r brcmfmac brcmutil 2>/dev/null
    ;;
  post)
    modprobe brcmfmac 2>/dev/null
    systemctl start NetworkManager 2>/dev/null
    ;;
esac
```

WiFi is briefly unavailable during sleep, which is invisible to the user. **Do not blacklist `brcmfmac`** — that would kill WiFi permanently. Disable it per-suspend instead.

---

## Phase six: the development environment

With the machine stable, it became a development environment. Omarchy ships `mise` as the tool manager, which is the right foundation — it makes every language version reproducible.

### Toolchain

```bash
# Node, package managers
mise use -g node@lts pnpm bun
# -> node 24.21.0 LTS, pnpm 12.6.0, bun 1.4.2

# Python
mise use -g python@3.13
mise use -g pipx:ruff pipx:black
uv tool install httpie
# -> python 3.13.15, ruff 0.16.9, black 26.5.1, uv 0.12.19

# Systems languages
mise use -g go rust
# -> go 1.27.1, rust 1.98.1

# Shell tooling
mise use -g shellcheck
```

TypeScript is not a `mise` tool — it is an npm package:

```bash
npm install -g typescript @types/node tsx
npm config set allow-scripts=esbuild --location=user
npm install -g --allow-scripts=esbuild esbuild
```

**The `allow-scripts` step is not optional on npm 11.** Install scripts are gated by default now, and `esbuild`'s postinstall is what places its native binary. Skip it and `tsx` installs "successfully" while failing at runtime with a missing binary.

### Verified, not assumed

Every toolchain was compile-and-run tested rather than version-checked:

```bash
# TypeScript: compile and execute
npx tsc index.ts --outDir out && node out/index.js    # -> "hi typescript"

# Python: run and lint
uv run main.py && uv run ruff check .                 # -> 5, "All checks passed!"
```

**Resulting environment:**

| Tool | Version | | Tool | Version |
|---|---|---|---|---|
| node | 24.21.0 LTS | | python | 3.13.15 |
| pnpm | 12.6.0 | | uv | 0.12.19 |
| bun | 1.4.2 | | ruff | 0.16.9 |
| go | 1.27.1 | | black | 26.5.1 |
| rust | 1.98.1 | | shellcheck | 0.11.0 |
| gh | 2.101.0 | | httpie | 3.2.4 |
| typescript | 7.0.2 | | esbuild | 0.28.2 |
| tsx | 4.23.15 | | deno | (pre-installed) |

### VS Code

Omarchy ships a first-class installer, but VS Code was already present. What was missing was the extension set:

```bash
code --install-extension ms-python.python --force
code --install-extension dbaeumer.vscode-eslint --force
code --install-extension charliermarsh.ruff --force
code --install-extension eamodio.gitlens --force
code --install-extension github.vscode-pull-request-github --force
code --install-extension redhat.vscode-yaml --force
code --install-extension ms-vscode-remote.remote-ssh --force
```

Thirteen extensions installed: Python, Pylance, Python Envs, debugpy, ESLint, Ruff, GitLens, GitHub Pull Requests, YAML, Remote-SSH, Remote Explorer, Remote-SSH Edit, and the Omarchy theme.

### Two remaining manual steps

```bash
sudo usermod -aG docker $USER    # requires re-login
gh auth login
```

---

## Phase seven: local image generation, and the ceiling

With no usable GPU for compute, image generation is CPU-bound by construction. This is where the hardware's limits become unavoidable rather than merely inconvenient.

### The ceiling, established before downloading anything

ROCm dropped everything below Vega. Polaris is pre-Vega. The RX 460 has **no GPU compute path at all** — ComfyUI confirms this independently at startup:

```
'PyTorch ROCm/HIP runtime not available'
```

And the arithmetic is not close:

```
qwen_image_2.1_bf16.safetensors             14.23 GB
qwen3vl_8b_text_encoder (smallest official)  6.31 GB   <- 3x the entire VRAM budget
qwen_image_2.1_vae                            0.68 GB
```

The smallest official text encoder is three times the whole VRAM budget *before* the diffusion model loads. So the question is never "will it be fast" but "will it run at all."

### The chosen path

CPU-only with quantisation, and a working set sized against RAM + swap rather than RAM alone:

```
3.0 GB  qwen_image_2.1_Q3_K_M.gguf        diffusion, Abiray/Qwen-Image-2.1-GGUF
5.9 GB  qwen3vl_8b_w4a8.safetensors       text encoder, Comfy-Org (official)
645 MB  qwen_image_2.1_vae_bf16...        VAE, Comfy-Org (official)
```

### Four things that had to be discovered, not assumed

**1. Core ComfyUI cannot see `.gguf` files at all.** The diagnostic signature is subtle: the VAE registered fine while `UNETLoader` and `CLIPLoader` both showed empty dropdowns — because the VAE is a `.safetensors`. Not a permissions problem, not a path problem. Core simply does not list GGUF for those loaders.

```bash
git clone --depth 1 https://github.com/city96/ComfyUI-GGUF.git custom_nodes/ComfyUI-GGUF
```

The workflow must then use `UnetLoaderGGUF` and `CLIPLoaderGGUF`, not the core loaders.

**2. Some quantised GGUFs have zero metadata and can never load.** This one cost a wasted 2.5 GB download. GGUF loaders identify architecture from `general.architecture` in the file's KV block. Two popular repos ship files with valid tensors but no metadata at all:

```
magic=0x46554747 version=3 tensors=265 kv=0
                                        ^^^^ zero KV pairs

ValueError: This model is not currently supported - (Unknown model architecture!)
```

265 valid tensors, and the file is still unloadable by every GGUF loader. A repo's files having the right *size* tells you nothing.

**Check before downloading gigabytes** — this costs one second:

```bash
~/ComfyUI/check-gguf.sh <url-or-path>
# version=3 tensors=265 kv=0
# *** kv=0 -> UNLOADABLE. Do not download this file.
```

**3. A text encoder that loads cleanly is not necessarily compatible.** The most expensive trap, because it wastes a full generation cycle. A third-party encoder loaded at 6829 MB with no error whatsoever, then failed on the first sampling step:

```
RuntimeError: Given normalized_shape=[4096], expected input with shape [*4096],
              but got input of size[1, 512, 12288]
```

Not memory, not hardware — a dimension mismatch. The source:

```python
@dataclass
class Qwen3_8BConfig:
    hidden_size: int = 4096          # what the DiT requires (context_in_dim=4096)
    intermediate_size: int = 12288   # what this file actually emitted
```

The encoder was dumping **MLP intermediate activations** instead of final hidden states. The fix is the official `qwen3vl_8b_w4a8.safetensors`.

**A cheap oracle exists for this:** ComfyUI logs which class it instantiated. Check it immediately after the first load, before committing to a long run.

```
Requested to load QwenImage21TEModel_   <- correct encoder
Requested to load Flux2TEModel_         <- generic, WRONG tensor
```

**4. `--lowvram` and `--cpu` are mutually exclusive** in ComfyUI 0.37.0. Passing both fails at argument parsing. Use `--cpu` alone.

### The result

```
diffusion      QwenImage21                3230 MB
text encoder   QwenImage21TEModel_        6019 MB
sampling       4 steps in 10:56   (209s, 174s, 162s, 151s)
VAE decode     ~2 min
TOTAL          14:53, no OOM
peak memory    5.3-6.3 GB available of 15 GiB; zram swap peaked ~13 GB
output         512x512 RGBA, 420,120 bytes
```

An image was generated and visually confirmed: a coherent red fruit on a wood-grain surface with correct specular highlighting. At 4 steps on Q3 quantisation, "plausible rather than photorealistic" is the expected and correct outcome.

### The honest assessment

**Resolution is the brutal cost knob**, and the scaling is not linear:

| Resolution | Steps | Time | |
|---|---|---|---|
| 512×512 | 4 | **~15 min** | measured |
| 512×512 | 8 | ~28 min | extrapolated |
| 768×768 | 4 | ~35 min | extrapolated |
| 1024×1024 | 8 | ~2.5 hr | extrapolated |

Only the first row is measured. At 15 minutes per 512×512 image, this is a proof of concept, not a tool.

**The workflow is the durable artifact.** It is portable to real hardware unchanged — identical graph, identical node names, seconds per image on a rented GPU. That is where the value of this phase actually is. If you need volume, a rented GPU (RunPod, Vast.ai, cents an hour) or an SDXL-Turbo model that fits the 2 GB of VRAM are both better uses of this machine than 15-minute images.

---

## The keyboard row that does not exist

The Touch Bar's top row is unobtainable (see below), so the useful thing to do with a keyboard shortcut is make `SUPER+A` mean "select all" everywhere.

```lua
-- ~/.config/hypr/bindings.lua
o.bind("SUPER + A", nil, "wtype -k ctrl+a")
o.bind("SUPER + SHIFT + A", nil, "wtype -k ctrl+shift+a")
```

`wtype` → `ctrl+a` covers every GUI toolkit.

**One failure worth recording.** I grepped `hyprctl binds` for `SUPER` and found nothing, concluding the bind was dead. It was live. The Omarchy Hyprland config is Lua, so every binding surfaces as `dispatcher: __lua` with modifiers encoded as a numeric `modmask` — a key-name search returns nothing whether or not the bind exists. Verified properly through `hyprctl -j binds`, where the bind appeared with `modmask` 64, matching `SUPER` exactly.

---

## The Touch Bar: a definitive no

Carried over from the original investigation, and still the hardest "no" on this machine.

The old DKMS package would not build against kernel 7.2.5 — five separate API breaks. All five were small fixes, all four modules then compiled clean, they built, signed, loaded, and bound:

```
apple_ibridge   32768  2 apple_ib_als,apple_ib_tb
apple_ib_tb     32768  0
apple_ib_als    20480  0
```

The ACPI device bound. Platform children appeared. And the kernel log's entire contribution was:

```
apple_ibridge: loading out-of-tree module taints kernel.
apple_ibridge: module verification failed: signature and/or required key missing
```

Then nothing. `modprobe` succeeded, the child bound, and the HID probe **silently failed**.

The drivers all wait on a USB HID endpoint that the Mac's own firmware does not enumerate when booting non-Apple firmware. Neither exists here.

I checked every bus before concluding anything. SPI carries exactly one device, the topcase keyboard/touchpad; the other controller is enumerated and functional but has zero devices. All 18 I2C adapters are display, SMBus, or thermal. USB has one Apple device, class `DFU` — recovery, not HID.

Then I dumped and decompiled all 22 ACPI tables and read the iBridge device directly. It is `AppleHIDKeyboardEventDriverV2`, and its **strong** method set is ten methods:

```
SWDS  SWDM  SWDC  SWDD  FDFU  DFU1  DFU2  FRST  SOCW  MBXC
```

Every one is power, GPIO, or firmware-update control. There is no read-a-byte, no write-a-byte, no SPI transfer primitive, no DMA descriptor. Nothing that could move a single byte of Touch Bar framebuffer data. I enumerated all 27 `AppleHID*` device IDs across every table and not one is a Touch Bar; grepping the decompiled ASL for `TouchBar` returns zero hits. The firmware never mentions the display.

A from-scratch driver needs a device to bind to, a transport, and a protocol. This machine supplies none of the three.

**The "just the Esc/F-keys" fallback is not a smaller job** — it is the same job with the impossible part removed. Those are HID reports on the same absent endpoint.

---

## What I got wrong, collected

This document is largely a record of correcting myself, which is the honest shape of the work. The pattern is the actual lesson.

**"Add `mem_sleep_default=s2idle`."** The standard fix, and provably wrong on this machine. I added it, rebooted, watched two lid cycles fail identically, and the empty journal gave me no reason to doubt it. The heartbeat probe — which should have come first — was the only thing that would have separated a frozen kernel from a black screen. **A journal that stops writing is ambiguous, and I treated it as evidence rather than as a question.**

**"Some quantised GGUFs are fine."** Two popular repos ship files with `kv=0` and no metadata. I downloaded 2.5 GB before checking a field that costs one second to read. **Size is not validity.**

**"The text encoder loaded, so it's compatible."** It loaded at 6829 MB without a single warning and then failed deep in a `RuntimeError` about tensor shapes. A clean load proved nothing. **The log's class name would have told me immediately — I read the log too late.**

**"A stopped system is a stable system."** I treated three stale background-process notifications as noise to summarise away, when each was a queued event from work I had already abandoned. Not a technical error, but the same instinct as trusting an empty journal: **assuming a signal is uninformative because it is uninformative.**

**On the Touch Bar** I reasoned forward from an unenumerated assumption for hours, and the decompiled ACPI tables — a twenty-minute job — would have answered it immediately. When a conclusion depends on a fact you have not actually observed, go get the fact before building on it.

**Every wrong turn in the graphics phase** came from reasoning about the display from first principles. Three seconds of `ls /sys/class/drm/*/status` would have shown the panel on the AMD card and made the entire "disable the dGPU" line of advice obviously wrong.

---

## Where it landed

```
Kernel        7.2.5-3-omarchy          Limine 12.8.0, UKI enabled
Root          btrfs /dev/mapper/root[/@]  (LUKS + snapper)
Boot          ~29-31s, visible, timeout: 3, default_entry: Omarchy/linux-omarchy
Graphics      radeonsi GL / RADV Vulkan / VA-API, all verified live
Panel         on amdgpu (card1-eDP-1)
Suspend       brcmfmac unloaded per-suspend via system-sleep hook
Dev env       node 24 LTS / py 3.13 / go 1.27 / rust 1.98 / 13 VS Code extensions
ComfyUI       0.37.0, Qwen-Image-2.1 Q3_K_M + official w4a8 encoder
Image gen     512x512 @ 4 steps in 14:53, verified by eye
```

### One thing remains genuinely open

The `limine-snapper-watcher` reports `Root filesystem is not Btrfs` as root on the host. One snapshot exists where five are configured, and it will neither create nor prune more. That is *why* `default_entry` was able to point at a stale snapshot in the first place — a stale pointer to an unmaintained rollback target. The `post.d` hook makes the symptom impossible, but the underlying watcher failure is not fixed.

### Files worth knowing about

```
~/comfyui.sh                              launcher, forces --cpu
~/brcmfmac-suspend                        the suspend hook (sudo install to activate)
~/suspend-test.sh                         lid/suspend probe
~/ComfyUI/user/default/workflows/         the saved, portable workflow
~/ComfyUI/check-gguf.sh                   kv=0 detector
~/ComfyUI/QWEN-IMAGE-README.md            full image-gen details
~/ComfyUI/download-qwen-models.sh         verifies state, refuses dead GGUFs
```
