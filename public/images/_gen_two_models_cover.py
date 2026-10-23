#!/usr/bin/env python3
"""Cover for the 'two models, one harness' post.

Every number here is real, collected on 2026-10-23 on this machine (M4 Pro, 48 GB):
  - GPU residency, each model alone, via ioreg IOAccelerator "In use system memory"
      flint  (39.8B MoE, 256x2.1B, -c 131072) -> 28.1 GB
      gemma4 (26B-A4B MoE, 128 experts, -c 65536) -> 20.0 GB
  - loading both -> Metal "Insufficient Memory", every request HTTP 500
  - decode, 4 identical prompts, each model resident alone:
      flint 56.4 tok/s | gemma4+MTP 57.9 tok/s | gemma4 no-MTP 54.3 tok/s
Palette matches the site: --color-abyss #0b1119, --color-gold #d9a648.
"""
import subprocess, os, textwrap

OUT_SVG = os.path.join(os.path.dirname(__file__), "two-models-one-harness.svg")
OUT_PNG = os.path.join(os.path.dirname(__file__), "two-models-one-harness.png")

W, H = 1600, 1040
ABYSS = "#0b1119"
INK = "#101825"
GOLD = "#d9a648"
TEXT = "#e8e4da"
MUTED = "#8b93a3"
RED = "#e05563"
GREEN = "#4fbf8f"
BLUE = "#5aa3d6"


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


p = []
p.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
p.append(f'<rect width="{W}" height="{H}" fill="{ABYSS}"/>')

p.append(f'<g stroke="{INK}" stroke-width="1">')
for x in range(0, W, 80):
    p.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}"/>')
for y in range(0, H, 80):
    p.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}"/>')
p.append('</g>')

p.append(f'<rect x="0" y="0" width="{W}" height="6" fill="{GOLD}"/>')

# ---- header --------------------------------------------------------------
p.append(f'<text x="120" y="128" font-family="Menlo, monospace" font-size="25" '
         f'letter-spacing="6" fill="{MUTED}">LOCAL INFERENCE LOG · 2026-10-23</text>')

p.append(f'<text x="118" y="226" font-family="Georgia, serif" font-weight="bold" '
         f'font-size="76" fill="{TEXT}">Two Models,</text>')
p.append(f'<text x="118" y="312" font-family="Georgia, serif" font-weight="bold" '
         f'font-size="76" fill="{TEXT}">One Harness</text>')
p.append(f'<rect x="120" y="344" width="360" height="4" fill="{GOLD}"/>')

sub = ("Adding a 26B MoE beside a 40B one on 48 GB of unified memory — and the "
       "measurement that refused to admit it was faster.")
p.append(f'<text font-family="Georgia, serif" font-size="28" fill="{MUTED}">')
for i, line in enumerate(textwrap.wrap(sub, 58)):
    p.append(f'<tspan x="120" y="{394 + i * 38}">{esc(line)}</tspan>')
p.append('</text>')

# ---- left: GPU residency -------------------------------------------------
LX = 120
HEADER_Y = 548
BASE_Y = 840
MAX_H = 150
BAR_W, GAP = 220, 120

p.append(f'<text x="{LX}" y="{HEADER_Y}" font-family="Menlo, monospace" font-size="23" '
         f'letter-spacing="3" fill="{MUTED}">GPU RESIDENT, EACH ALONE</text>')

bars = [("flint  (40B MoE, ctx 131072)", 28.1, BLUE, "28.1 GB"),
        ("gemma4  (26B MoE, ctx 65536)", 20.0, GREEN, "20.0 GB")]
for i, (label, val, color, num) in enumerate(bars):
    x = LX + i * (BAR_W + GAP)
    h = max(14, int(MAX_H * val / 28.1))
    y = BASE_Y - h
    p.append(f'<text x="{x + BAR_W / 2}" y="{y - 26}" text-anchor="middle" '
             f'font-family="Georgia, serif" font-weight="bold" font-size="70" fill="{color}">{num}</text>')
    p.append(f'<rect x="{x}" y="{y}" width="{BAR_W}" height="{h}" fill="{color}" opacity="0.88"/>')
    p.append(f'<text x="{x + BAR_W / 2}" y="{BASE_Y + 42}" text-anchor="middle" '
             f'font-family="Menlo, monospace" font-size="19" fill="{TEXT}">{esc(label.split("  ")[0])}</text>')
    p.append(f'<text x="{x + BAR_W / 2}" y="{BASE_Y + 72}" text-anchor="middle" '
             f'font-family="Menlo, monospace" font-size="16" fill="{MUTED}">'
             f'{esc(label.split("  ",1)[1])}</text>')

p.append(f'<line x1="{LX - 24}" y1="{BASE_Y}" x2="{LX + 2 * (BAR_W + GAP)}" y2="{BASE_Y}" '
         f'stroke="{MUTED}" stroke-width="2"/>')

# the red finding — below the left chart, inside the left column
fx = LX
fy = BASE_Y + 150
p.append(f'<rect x="{fx}" y="{fy - 34}" width="660" height="52" fill="{RED}" opacity="0.16"/>')
p.append(f'<text x="{fx + 20}" y="{fy}" font-family="Menlo, monospace" font-size="21" '
         f'fill="{RED}">&#10005;  both loaded → Insufficient Memory</text>')
p.append(f'<text x="{fx + 20}" y="{fy + 30}" font-family="Menlo, monospace" font-size="17" '
         f'fill="{MUTED}">every request returns HTTP 500</text>')

# ---- right: decode speed -------------------------------------------------
RX = 1030
p.append(f'<text x="{RX}" y="{HEADER_Y}" font-family="Menlo, monospace" font-size="23" '
         f'letter-spacing="3" fill="{MUTED}">DECODE, SAME 4 PROMPTS</text>')

rows = [("flint", 56.4, BLUE), ("gemma4 + MTP", 57.9, GOLD), ("gemma4 no MTP", 54.3, GREEN)]
for i, (label, val, color) in enumerate(rows):
    y = HEADER_Y + 78 + i * 104
    p.append(f'<text x="{RX}" y="{y}" font-family="Georgia, serif" font-weight="bold" '
             f'font-size="58" fill="{color}">{val:.1f}</text>')
    p.append(f'<text x="{RX + 172}" y="{y}" font-family="Menlo, monospace" font-size="21" '
             f'fill="{TEXT}">tok/s</text>')
    p.append(f'<text x="{RX}" y="{y + 32}" font-family="Menlo, monospace" font-size="19" '
             f'fill="{MUTED}">{esc(label)}</text>')

# the honest verdict
vy = HEADER_Y + 78 + 3 * 104 + 6
p.append(f'<rect x="{RX - 12}" y="{vy - 34}" width="470" height="52" fill="{GOLD}" opacity="0.14"/>')
p.append(f'<text x="{RX}" y="{vy}" font-family="Menlo, monospace" font-size="19" '
         f'fill="{GOLD}">&#10003;  no meaningful difference</text>')

# ---- footer ---------------------------------------------------------------
FOOT_Y = H - 72
p.append(f'<rect x="0" y="{FOOT_Y}" width="{W}" height="{H - FOOT_Y}" fill="{INK}"/>')
p.append(f'<text x="120" y="{FOOT_Y + 44}" font-family="Menlo, monospace" font-size="22" '
         f'fill="{MUTED}">M4 Pro · 48 GB unified · 273 GB/s · the KV cache is the cost, not the weights</text>')
p.append(f'<text x="{W - 120}" y="{FOOT_Y + 44}" text-anchor="end" font-family="Georgia, serif" '
         f'font-size="24" fill="{GOLD}">danielkliewer.com</text>')

p.append('</svg>')

with open(OUT_SVG, "w") as f:
    f.write("\n".join(p))

r = subprocess.run(["rsvg-convert", "-w", str(W), "-h", str(H), "-o", OUT_PNG, OUT_SVG],
                   capture_output=True, text=True)
print("rsvg exit", r.returncode, r.stderr[:400])
print("png:", OUT_PNG, os.path.getsize(OUT_PNG), "bytes")
