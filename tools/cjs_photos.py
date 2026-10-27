#!/usr/bin/env python3
"""Build the CJ's Cakes gallery from docs/cjs-cakes-photos.json.

    python3 tools/cjs_photos.py

Reads every photo whose status is "gallery", makes AVIF, WebP and JPEG copies
at 480, 960 and 1440 px wide (never wider than the original) in
assets/img/cjs-cakes/, and writes data/gallery.json for goods.html. The
originals in assets/img/cjs-cakes/originals/ are never changed, and they are
blocked from the public site in netlify.toml: only these copies are served.

Copies carry no EXIF (no camera or location data reaches the site). Files this
script made earlier but no longer needs are deleted, so the folder never holds
a photo that is off the site. Needs Pillow with AVIF support.
"""
import json
from pathlib import Path

from PIL import Image, ImageOps, features

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "docs" / "cjs-cakes-photos.json"
OUT = ROOT / "assets" / "img" / "cjs-cakes"
DATA = ROOT / "data" / "gallery.json"
WIDTHS = (480, 960, 1440)
FORMATS = (("avif", {"quality": 55}), ("webp", {"quality": 78, "method": 6}), ("jpg", {"quality": 80, "optimize": True, "progressive": True}))
GROUPS = [
    {"id": "kitchen", "title": "From our kitchen and table", "note": "Cakes, cupcakes, mini cakes and cookies made by CJ's Cakes, at home and at our show table."},
    {"id": "decorating", "title": "CJ's cake decorating", "note": "Cakes CJ decorated while working in a supermarket bakery. They show her decorating, not items on our menu. Ask us about your own design."},
    {"id": "graphics", "title": "From our Facebook page", "note": "Our logo, posts and menus. The earlier mini cake menu shows old prices; the product pages have today's."},
]


def main():
    if not features.check("avif"):
        raise SystemExit("This Pillow has no AVIF support. Upgrade Pillow (11.3 or newer).")
    photos = [p for p in json.loads(MANIFEST.read_text())["photos"] if p["status"] == "gallery"]
    made, entries = set(), []
    for p in sorted(photos, key=lambda p: ([g["id"] for g in GROUPS].index(p["group"]), p["order"])):
        src = ImageOps.exif_transpose(Image.open(ROOT / p["original"])).convert("RGB")
        widths = [w for w in WIDTHS if w < src.width] + [min(src.width, WIDTHS[-1])]
        widths = sorted(set(widths))
        for w in widths:
            h = round(src.height * w / src.width)
            img = src.resize((w, h), Image.LANCZOS)
            for ext, opts in FORMATS:
                name = f"{p['slug']}-{w}.{ext}"
                img.save(OUT / name, **opts)
                made.add(name)
        big = widths[-1]
        entries.append({
            "slug": p["slug"], "group": p["group"], "alt": p["alt"], "caption": p["caption"],
            "widths": widths, "width": big, "height": round(src.height * big / src.width), "source": p["source"],
        })
    for f in OUT.iterdir():
        if f.is_file() and f.name not in made:
            f.unlink()
    DATA.write_text(json.dumps({"groups": GROUPS, "photos": entries}, indent=2, ensure_ascii=False) + "\n")
    print(f"{len(entries)} photos, {len(made)} files in {OUT.relative_to(ROOT)}, wrote {DATA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
