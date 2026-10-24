"""Turn live <text> in brand SVGs into real glyph outlines, using the site's own fonts.

    python3 tools/outline_svg.py brand/            # every *.svg under brand/
    python3 tools/outline_svg.py in.svg out.svg     # one file

Writes `<name>-outlined.svg` beside each `<name>.svg` (never touching the
source, which keeps live text so a rename stays one edit). Needs fontTools:
`pip install fonttools`. That is a tool dependency, not a site dependency.

Why it exists: an SVG with live text renders in whatever font the machine
has. A print shop without Big Shoulders installed, or a browser loading the
SVG through an <img> tag (which cannot load web fonts at all), silently
substitutes a generic sans, and the wordmark comes out wider and clipped.
The library ChatGPT delivered shipped its "-outlined" twins as copies with
the text still live, and every PNG it rendered had exactly that clipping.

It handles the shapes the library uses: single-line <text> with x, y, fill,
font-family, font-size, font-weight, text-anchor, letter-spacing, opacity.
Anything else (tspan, textPath, an unknown family, a glyph the font lacks)
raises, rather than quietly dropping a word from a printed banner.
"""
import html, os, re, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib import instancer

FONTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "fonts")
_cache = {}

def font_for(family, weight, size):
    family = family.strip().strip("'\"")
    weight = int(weight or 400)
    if family == "Barlow":
        name = "Barlow-400.woff" if weight < 550 else "Barlow-600.woff" if weight < 650 else "Barlow-700.woff"
        key = (name,)
        var = None
    elif family in ("Big Shoulders", "Big Shoulders Stencil"):
        name = "BigShoulders.woff" if family == "Big Shoulders" else "BigShouldersStencil.woff"
        # Browsers set the optical size from the font size; clamp to the axis.
        opsz = max(10, min(72, round(float(size))))
        key = (name, weight, opsz)
        var = {"wght": max(100, min(900, weight)), "opsz": opsz}
    else:
        raise ValueError(f"unknown font-family {family!r}")
    if key not in _cache:
        f = TTFont(os.path.join(FONTS, name))
        if var and "fvar" in f:
            f = instancer.instantiateVariableFont(f, var)
        _cache[key] = (f, f.getGlyphSet(), f.getBestCmap(), f["hmtx"], f["head"].unitsPerEm)
    return _cache[key]

TEXT = re.compile(r"<text\b([^>]*)>(.*?)</text>", re.S)
ATTR = re.compile(r'([\w:-]+)="([^"]*)"')

def outline_text(m):
    attrs = dict(ATTR.findall(m.group(1)))
    body = m.group(2)
    if "<" in body:
        raise ValueError("nested markup inside <text> is not supported: " + body[:60])
    # SVG's default whitespace handling: collapse runs to one space and trim,
    # exactly as a browser draws it. Keeping "  •  " literal set the bullets
    # visibly wider than the live-text original.
    text = re.sub(r"\s+", " ", html.unescape(body)).strip()
    size = float(attrs.get("font-size", 16))
    font, glyphs, cmap, hmtx, upem = font_for(attrs.get("font-family", "Barlow"), attrs.get("font-weight", 400), size)
    scale = size / upem
    spacing = float(attrs.get("letter-spacing", 0) or 0)
    seq = []
    for ch in text:
        g = cmap.get(ord(ch))
        if g is None:
            if ch == " ": g = cmap.get(32)
            else: raise ValueError(f"glyph for {ch!r} missing in {attrs.get('font-family')}")
        seq.append(g)
    width = sum(hmtx[g][0] * scale for g in seq) + spacing * max(0, len(seq) - 1)
    x, y = float(attrs.get("x", 0)), float(attrs.get("y", 0))
    anchor = attrs.get("text-anchor", "start")
    if anchor == "middle": x -= width / 2
    elif anchor == "end": x -= width
    pen = SVGPathPen(glyphs)
    cx = x
    for g in seq:
        glyphs[g].draw(TransformPen(pen, (scale, 0, 0, -scale, cx, y)))
        cx += hmtx[g][0] * scale + spacing
    keep = {k: v for k, v in attrs.items() if k in ("fill", "opacity", "fill-opacity", "transform", "id", "class", "stroke", "stroke-width")}
    keep.setdefault("fill", "#000")
    a = " ".join(f'{k}="{html.escape(v, quote=True)}"' for k, v in keep.items())
    return f'<path {a} d="{pen.getCommands()}"><title>{html.escape(text)}</title></path>'

def outline_file(src, dst):
    s = open(src, encoding="utf-8").read()
    if "<tspan" in s or "<textPath" in s:
        raise ValueError(f"{src}: tspan/textPath not supported")
    out = TEXT.sub(outline_text, s)
    open(dst, "w", encoding="utf-8").write(out)
    return len(TEXT.findall(s))

def main(args):
    if len(args) == 2 and args[0].endswith(".svg"):
        print(outline_file(args[0], args[1]), "text elements outlined"); return
    root = args[0] if args else "brand"
    n = files = 0
    failed = []
    for d, _, fs in os.walk(root):
        for f in sorted(fs):
            if f.endswith(".svg") and not f.endswith("-outlined.svg"):
                src = os.path.join(d, f)
                dst = src[:-4] + "-outlined.svg"
                try:
                    n += outline_file(src, dst); files += 1
                except ValueError as e:
                    # A stale twin that still has live text is worse than none:
                    # it looks finished and prints in the wrong font.
                    if os.path.exists(dst): os.remove(dst)
                    failed.append(f"{src}: {e}")
    print(f"outlined {n} text elements across {files} files")
    for f in failed: print("NOT OUTLINED", f)
    if failed: sys.exit(1)

if __name__ == "__main__":
    main(sys.argv[1:])
