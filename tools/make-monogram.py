#!/usr/bin/env python3
"""Regenerate the monogram module, favicon, and PNG icons from Fraunces.

The mark is the Fraunces Black "K" outline, used verbatim — so it can never
drift from the typeface the wordmark is set in. Run this after changing the
mark's weight, optical size, or inset:

    python3 tools/make-monogram.py

Requires: fonttools (pip install fonttools) and rsvg-convert (brew install librsvg).
The variable font is downloaded to a temp dir on first run.
"""
import json
import os
import subprocess
import sys
import tempfile
import urllib.request

FONT_URL = (
    "https://github.com/google/fonts/raw/main/ofl/fraunces/"
    "Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf"
)
GLYPH_CHAR = "K"
AXES = {"wght": 900, "opsz": 144, "SOFT": 0, "WONK": 0}  # Black, display, plain

GOLD = "#ffc370"
VOID = "#01040a"
BOX = 48
BARE_K_WIDTH = 42   # header/footer/paper: glyph nearly fills the box
BOXED_K_WIDTH = 36  # favicon: inset so it survives a tab bar

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

try:
    from fontTools.pens.boundsPen import BoundsPen
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont
except ImportError:
    sys.exit("fonttools missing: pip install fonttools")


def load_glyph():
    cache = os.path.join(tempfile.gettempdir(), "Fraunces.ttf")
    if not os.path.exists(cache):
        print(f"downloading {FONT_URL}")
        urllib.request.urlretrieve(FONT_URL, cache)
    font = instantiateVariableFont(TTFont(cache), AXES, inplace=False)
    gs = font.getGlyphSet()
    glyph = gs[font.getBestCmap()[ord(GLYPH_CHAR)]]

    bp = BoundsPen(gs)
    glyph.draw(bp)
    pen = SVGPathPen(gs)
    glyph.draw(pen)
    return pen.getCommands(), bp.bounds


def placement(k_width, bounds):
    x_min, _, x_max, y_max = bounds
    y_min = bounds[1]
    w, h = x_max - x_min, y_max - y_min
    s = k_width / w
    k_h = h * s
    return s, (BOX - k_width) / 2.0, (BOX - k_h) / 2.0, x_min, y_max


def svg(path, bounds, k_width, background):
    s, tx, ty, x_min, y_max = placement(k_width, bounds)
    bg = f'<rect width="{BOX}" height="{BOX}" fill="{VOID}"/>' if background else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX} {BOX}">'
        f"{bg}"
        f'<path transform="translate({tx:.3f} {ty:.3f}) scale({s:.6f} {-s:.6f}) '
        f'translate({-x_min} {-y_max})" d="{path}" fill="{GOLD}"/>'
        f"</svg>"
    )


def main():
    path, bounds = load_glyph()
    x_min, y_min, x_max, y_max = bounds
    w, h = x_max - x_min, y_max - y_min

    s_bare, tx_bare, ty_bare, _, _ = placement(BARE_K_WIDTH, bounds)
    s_box, tx_box, ty_box, _, _ = placement(BOXED_K_WIDTH, bounds)

    module = f'''// Generated from Fraunces Black (wght 900, opsz 144, SOFT 0, WONK 0).
// Regenerate with tools/make-monogram.py — do not hand-edit the path.
//
// The mark is the real letterform from the site's display face, so it can never
// drift from the type it sits beside. At 16px there is room for one shape, so
// there is exactly one: no container, no second colour, no second idea.

export const MONOGRAM_PATH = "{path}";

export const GLYPH = {{ xMin: {x_min}, yMax: {y_max}, width: {w}, height: {h} }};

// Bare mark (header, footer, paper): K fills {BARE_K_WIDTH} of the {BOX}-unit box.
export const BARE = {{
  box: {BOX},
  scale: {s_bare:.6f},
  tx: {tx_bare:.3f},
  ty: {ty_bare:.3f},
}};

// Boxed mark (favicon): same glyph, inset to {BOXED_K_WIDTH} units on a void field.
export const BOXED = {{
  box: {BOX},
  scale: {s_box:.6f},
  tx: {tx_box:.3f},
  ty: {ty_box:.3f},
}};
'''
    open(os.path.join(REPO, "src/components/monogram-path.ts"), "w").write(module)

    fav = svg(path, bounds, BOXED_K_WIDTH, background=True)
    open(os.path.join(REPO, "public/favicon.svg"), "w").write(fav + "\n")

    tmp = os.path.join(tempfile.gettempdir(), "monogram_favicon.svg")
    open(tmp, "w").write(fav)
    for name, px in (
        ("icon-16.png", 16), ("icon-32.png", 32),
        ("apple-icon.png", 180), ("icon-192.png", 192), ("icon-512.png", 512),
    ):
        out = os.path.join(REPO, "public", name)
        subprocess.run(
            ["rsvg-convert", "-w", str(px), "-h", str(px), "-o", out, tmp], check=True
        )
        print(f"  {name:18s} {os.path.getsize(out):>6d} B")

    print("monogram-path.ts, favicon.svg and 5 PNG icons regenerated")


if __name__ == "__main__":
    main()
