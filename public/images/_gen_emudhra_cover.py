#!/usr/bin/env python3
"""Generate the cover image for the eMudhra/Node.js security post.

Every number in this image is real, collected on 2026-10-23 from the actual
runtimes on this machine:
  - v22.23.1 bundled trust store: 145 roots, 4 eMudhra/emSign
  - v22.23.4 bundled trust store: 116 roots, 1 eMudhra/emSign
  - the 3 dropped roots and their SHA-1 fingerprints
Palette matches the site: --color-abyss #0b1119, --color-gold #d9a648.
"""
import subprocess, os, textwrap

OUT_SVG = os.path.join(os.path.dirname(__file__), "emudhra-nodejs-security.svg")
OUT_PNG = os.path.join(os.path.dirname(__file__), "emudhra-nodejs-security.png")

W, H = 1600, 1040
ABYSS = "#0b1119"
INK = "#101825"
GOLD = "#d9a648"
TEXT = "#e8e4da"
MUTED = "#8b93a3"
RED = "#e05563"
GREEN = "#4fbf8f"

DROPPED = [
    ("emSign ECC Root CA - G3", "3043FA4F…FE6BBC1", "eMudhra Technologies Limited"),
    ("emSign Root CA - C1", "E72EF1DF…864F01", "eMudhra Inc"),
    ("emSign ECC Root CA - C3", "B6AF43C2…CE4866", "eMudhra Inc"),
]


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
p.append(f'<text x="120" y="130" font-family="Menlo, monospace" font-size="25" '
         f'letter-spacing="6" fill="{MUTED}">SECURITY LOG · 2026-10-23</text>')

p.append(f'<text x="118" y="228" font-family="Georgia, serif" font-weight="bold" '
         f'font-size="74" fill="{TEXT}">The Trust Store</text>')
p.append(f'<text x="118" y="316" font-family="Georgia, serif" font-weight="bold" '
         f'font-size="74" fill="{TEXT}">Nobody Patched</text>')
p.append(f'<rect x="120" y="348" width="360" height="4" fill="{GOLD}"/>')

sub = ("eMudhra\u2019s compromised intermediate keys, the Node.js security release, and the "
       "build-time gate that now refuses to compile on a vulnerable runtime.")
p.append(f'<text font-family="Georgia, serif" font-size="29" fill="{MUTED}">')
for i, line in enumerate(textwrap.wrap(sub, 58)):
    p.append(f'<tspan x="120" y="{398 + i * 40}">{esc(line)}</tspan>')
p.append('</text>')

# ---- left: the delta chart ------------------------------------------------
CX = 120
HEADER_Y = 540
BASE_Y = 840
MAX_H = 140
BAR_W, GAP = 200, 110

p.append(f'<text x="{CX}" y="{HEADER_Y}" font-family="Menlo, monospace" font-size="23" '
         f'letter-spacing="3" fill="{MUTED}">COMPROMISED emSign ROOTS IN THE BUNDLED STORE</text>')

bars = [("v22.23.1 (before)", 4, RED, "VULNERABLE"),
        ("v22.23.4 (after)", 1, GREEN, "PATCHED")]
for i, (label, val, color, verdict) in enumerate(bars):
    x = CX + i * (BAR_W + GAP)
    h = max(14, int(MAX_H * val / 4))
    y = BASE_Y - h
    # value numeral sits clearly above the bar top, below the section header
    p.append(f'<text x="{x + BAR_W / 2}" y="{y - 24}" text-anchor="middle" '
             f'font-family="Georgia, serif" font-weight="bold" font-size="72" fill="{color}">{val}</text>')
    p.append(f'<rect x="{x}" y="{y}" width="{BAR_W}" height="{h}" fill="{color}" opacity="0.88"/>')
    p.append(f'<text x="{x + BAR_W / 2}" y="{BASE_Y + 42}" text-anchor="middle" '
             f'font-family="Menlo, monospace" font-size="23" fill="{TEXT}">{esc(label)}</text>')
    p.append(f'<text x="{x + BAR_W / 2}" y="{BASE_Y + 80}" text-anchor="middle" '
             f'font-family="Menlo, monospace" font-size="20" letter-spacing="2" '
             f'fill="{color}">{verdict}</text>')
p.append(f'<line x1="{CX - 24}" y1="{BASE_Y}" x2="{CX + 2 * (BAR_W + GAP)}" y2="{BASE_Y}" '
         f'stroke="{MUTED}" stroke-width="2"/>')

# ---- right: the dropped roots ---------------------------------------------
RX = 1000
p.append(f'<text x="{RX}" y="{HEADER_Y}" font-family="Menlo, monospace" font-size="23" '
         f'letter-spacing="3" fill="{MUTED}">ROOTS THE PATCH DROPS</text>')

row_y = HEADER_Y + 62
p.append(f'<rect x="{RX}" y="{row_y - 36}" width="470" height="48" fill="{RED}" opacity="0.16"/>')
p.append(f'<text x="{RX + 18}" y="{row_y}" font-family="Menlo, monospace" font-size="21" '
         f'fill="{RED}">&#10005;  dropped by v22.23.4</text>')

for i, (cn, fp, org) in enumerate(DROPPED):
    y = row_y + 62 + i * 94
    p.append(f'<text x="{RX}" y="{y}" font-family="Menlo, monospace" font-size="24" '
             f'fill="{TEXT}">{esc(cn)}</text>')
    p.append(f'<text x="{RX}" y="{y + 32}" font-family="Menlo, monospace" font-size="18" '
             f'fill="{MUTED}">{esc(org)} · SHA-1 {esc(fp)}</text>')

y = row_y + 62 + 3 * 94 + 10
p.append(f'<rect x="{RX}" y="{y - 36}" width="470" height="48" fill="{GREEN}" opacity="0.14"/>')
p.append(f'<text x="{RX + 18}" y="{y}" font-family="Menlo, monospace" font-size="21" '
         f'fill="{GREEN}">&#10003;  emSign Root CA - G1 retained</text>')

# ---- footer ---------------------------------------------------------------
FOOT_Y = H - 72
p.append(f'<rect x="0" y="{FOOT_Y}" width="{W}" height="{H - FOOT_Y}" fill="{INK}"/>')
p.append(f'<text x="120" y="{FOOT_Y + 44}" font-family="Menlo, monospace" font-size="22" '
         f'fill="{MUTED}">CVE-2026-111943  ·  Node.js 22.23.4 / 24.22.1 / 26.12.1  ·  PHP2Shell: not applicable</text>')
p.append(f'<text x="{W - 120}" y="{FOOT_Y + 44}" text-anchor="end" font-family="Georgia, serif" '
         f'font-size="24" fill="{GOLD}">danielkliewer.com</text>')

p.append('</svg>')

with open(OUT_SVG, "w") as f:
    f.write("\n".join(p))

r = subprocess.run(["rsvg-convert", "-w", str(W), "-h", str(H), "-o", OUT_PNG, OUT_SVG],
                   capture_output=True, text=True)
print("rsvg exit", r.returncode, r.stderr[:400])
print("png:", OUT_PNG, os.path.getsize(OUT_PNG), "bytes")
