"""Rebuild every raster brand asset from the site's own colours and fonts.

    python3 tools/branding.py

Writes assets/og.png (1200x630 share card), assets/apple-touch-icon.png (180),
assets/icon-192.png and assets/icon-512.png. Never hand-edit those files: a
hand-made PNG is a fork of the brand nobody can see is a fork. Change the name
in data/site.json, run this, commit what changed. test/run.mjs checks the
files exist and are the right size.

The share card is opaque on purpose: half the apps that unfurl a link put the
card on white, and a transparent corner turns into a white corner.
"""
import json, os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, *p)
site = json.load(open(A("data", "site.json")))

OLIVE, OLIVE2, BLAZE, INK, PAPER, MANILA = "#4B5235", "#363C25", "#E8501A", "#1F241E", "#FBFBF8", "#DCC48E"

def font(name, size, weight=None):
    f = ImageFont.truetype(A("assets", "fonts", name), size)
    if weight is not None:
        try: f.set_variation_by_axes([weight])
        except Exception: pass
    return f

def fit(draw, text, name, weight, max_w, start):
    size = start
    while size > 20:
        f = font(name, size, weight)
        if draw.textlength(text, font=f) <= max_w: return f
        size -= 4
    return font(name, size, weight)

def ticket_mark(img, x, y, s):
    """The same ticket as assets/icon.svg, drawn at scale s (64 units)."""
    d = ImageDraw.Draw(img)
    k = s / 64
    d.rounded_rectangle([x, y, x + 64 * k, y + 64 * k], radius=12 * k, fill=OLIVE)
    d.rectangle([x + 10 * k, y + 20 * k, x + 54 * k, y + 44 * k], fill=BLAZE)
    for cx in (x + 10 * k, x + 54 * k):
        d.ellipse([cx - 4 * k, y + 28 * k, cx + 4 * k, y + 36 * k], fill=OLIVE)
    yy = y + 22 * k
    while yy < y + 42 * k:
        d.line([x + 24 * k, yy, x + 24 * k, min(yy + 3 * k, y + 42 * k)], fill=INK, width=max(1, round(2.5 * k)))
        yy += 6 * k

def icon(size, path):
    img = Image.new("RGB", (size, size), OLIVE)
    ticket_mark(img, 0, 0, size)
    img.save(path, optimize=True)

def og(path):
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), OLIVE)
    d = ImageDraw.Draw(img)
    d.rectangle([0, H - 120, W, H], fill=OLIVE2)
    ticket_mark(img, 70, 40, 120)
    name = site.get("name", "").upper()
    f = fit(d, name, "BigShouldersStencil.woff", 900, W - 160, 190)
    d.text((80, 170), name, font=f, fill="#FFFFFF")
    tag = site.get("tagline", "")
    tf = font("Barlow-600.woff", 38)
    words, lines, cur = tag.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=tf) > W - 160: lines.append(cur); cur = w
        else: cur = t
    if cur: lines.append(cur)
    for i, line in enumerate(lines[:2]):
        d.text((80, 170 + f.size + 30 + i * 50), line, font=tf, fill="#DCE0CC")
    foot = font("BigShoulders.woff", 46, 800)
    d.text((80, H - 92), "WHERE WE'LL BE NEXT", font=foot, fill=BLAZE)
    note = font("Barlow-600.woff", 30)
    msg = "Goods, not guns"
    d.text((W - 80 - d.textlength(msg, font=note), H - 80), msg, font=note, fill=MANILA)
    img.save(path, optimize=True)

og(A("assets", "og.png"))
icon(180, A("assets", "apple-touch-icon.png"))
icon(192, A("assets", "icon-192.png"))
icon(512, A("assets", "icon-512.png"))
print("wrote og.png, apple-touch-icon.png, icon-192.png, icon-512.png")
