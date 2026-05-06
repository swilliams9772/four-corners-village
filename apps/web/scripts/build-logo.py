#!/usr/bin/env python3
"""
Strip white background from /public/brand/logo-medallion.png using a soft
alpha key + un-premultiply, then regenerate the downstream brand assets:

  • brand/logo-medallion.png       — transparent, tight crop, 1:1 aspect
  • brand/logo-medallion-1024.png  — for iOS/Android app store icons
  • brand/logo-medallion-512.png   — for Android adaptive launcher icon
  • og.png                         — 1200×630, medallion on dark brand canvas
  • apple-touch-icon.png       — 180×180, medallion on dark brand canvas
  • favicon-32.png             — 32×32, transparent

Run with: python3 apps/web/scripts/build-logo.py
"""
from __future__ import annotations
import math
from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter

WEB = Path(__file__).resolve().parents[1]  # apps/web
PUBLIC = WEB / "public"
BRAND_DIR = PUBLIC / "brand"
SOURCE = BRAND_DIR / "logo-medallion.png"

# Brand canvas backgrounds (must mirror tokens.css & layout.tsx themeColor).
DARK = (8, 8, 26, 255)   # #08081A — dark canvas / og / apple-touch-icon
LIGHT = (251, 248, 242, 255)  # #FBF8F2 — light canvas (kept for reference)


def remove_background(
    im: Image.Image,
    *,
    flood_tolerance: int = 40,
    edge_tolerance: int = 65,
    feather_px: int = 1,
) -> Image.Image:
    """Knock out the background using a flood fill from the four corners.

    The source PNG has a textured parchment background (not pure white), so a
    simple color-distance keying leaves a ghost rectangle. Instead we:

      1. Sample the average color of small patches at all four corners and
         use that as the canonical background color.
      2. Flood-fill from every corner, following pixels whose color stays
         within `flood_tolerance` of the running fill color. This naturally
         stops at the medallion's gold boundary while crossing texture noise.
      3. Walk the flood-fill frontier outward by one ring of pixels and
         compute a soft alpha based on color distance — that gives a clean
         anti-aliased edge instead of a hard cookie-cutter.
      4. Un-premultiply the surviving color so semi-transparent boundary
         pixels don't look milky against a dark background.

    Pure-Python BFS is plenty fast for a 1024×571 source.
    """
    src = im.convert("RGBA")
    w, h = src.size
    pixels = list(src.getdata())

    def idx(x: int, y: int) -> int:
        return y * w + x

    # Sample BG color from a 16×16 patch at each corner.
    sample_size = 16
    samples: list[tuple[int, int, int]] = []
    for cx, cy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        x0 = max(0, cx - sample_size + 1) if cx else 0
        y0 = max(0, cy - sample_size + 1) if cy else 0
        x1 = min(w, x0 + sample_size)
        y1 = min(h, y0 + sample_size)
        rs = gs = bs = n = 0
        for yy in range(y0, y1):
            for xx in range(x0, x1):
                r, g, b, _a = pixels[idx(xx, yy)]
                rs += r
                gs += g
                bs += b
                n += 1
        samples.append((rs // n, gs // n, bs // n))
    bg = (
        sum(s[0] for s in samples) // 4,
        sum(s[1] for s in samples) // 4,
        sum(s[2] for s in samples) // 4,
    )

    # Flood fill (4-way) from all 4 corners.
    is_bg = [False] * (w * h)
    queue: deque[tuple[int, int]] = deque()
    flood_sq = flood_tolerance * flood_tolerance
    for sx, sy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        i = idx(sx, sy)
        r, g, b, _a = pixels[i]
        if (r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2 <= flood_sq:
            is_bg[i] = True
            queue.append((sx, sy))
    while queue:
        x, y = queue.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                ni = idx(nx, ny)
                if is_bg[ni]:
                    continue
                r, g, b, _a = pixels[ni]
                d_sq = (r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2
                if d_sq <= flood_sq:
                    is_bg[ni] = True
                    queue.append((nx, ny))

    # Walk the BG frontier inward by one ring; pixels that are NOT bg but
    # are adjacent to a bg pixel get a soft alpha based on how close their
    # color is to the background. Beyond `edge_tolerance` they're full-alpha.
    edge_sq = edge_tolerance * edge_tolerance
    out: list[tuple[int, int, int, int]] = [(0, 0, 0, 0)] * (w * h)
    for y in range(h):
        for x in range(w):
            i = idx(x, y)
            if is_bg[i]:
                out[i] = (0, 0, 0, 0)
                continue
            r, g, b, _a = pixels[i]
            # Only soften if at least one neighbor is bg
            soft = False
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and is_bg[idx(nx, ny)]:
                    soft = True
                    break
            if not soft:
                out[i] = (r, g, b, 255)
                continue
            d_sq = (r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2
            if d_sq >= edge_sq:
                out[i] = (r, g, b, 255)
                continue
            t = math.sqrt(d_sq) / edge_tolerance
            a = max(0, min(255, int(round(t * 255))))
            ar = a / 255.0
            inv = 1.0 - ar
            if ar <= 0:
                out[i] = (0, 0, 0, 0)
                continue
            fr = max(0, min(255, int(round((r - inv * bg[0]) / ar))))
            fg_ = max(0, min(255, int(round((g - inv * bg[1]) / ar))))
            fb = max(0, min(255, int(round((b - inv * bg[2]) / ar))))
            out[i] = (fr, fg_, fb, a)

    dst = Image.new("RGBA", (w, h))
    dst.putdata(out)

    if feather_px > 0:
        # Slight Gaussian blur of the alpha channel to remove jaggies left
        # over from the 4-way flood mask.
        r, g, b, a = dst.split()
        a = a.filter(ImageFilter.GaussianBlur(feather_px))
        dst = Image.merge("RGBA", (r, g, b, a))

    return dst


def autocrop(im: Image.Image, padding_pct: float = 0.04) -> Image.Image:
    """Crop to the alpha bounding box, then add a small symmetric padding."""
    bbox = im.getbbox()
    if not bbox:
        return im
    cropped = im.crop(bbox)
    w, h = cropped.size
    pad = int(round(max(w, h) * padding_pct))
    side = max(w, h) + pad * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(cropped, ((side - w) // 2, (side - h) // 2), cropped)
    return canvas


def composite(im: Image.Image, size: tuple[int, int], bg: tuple[int, int, int, int]) -> Image.Image:
    """Place the medallion centered on a solid background canvas of given size."""
    canvas = Image.new("RGBA", size, bg)
    target_h = int(size[1] * 0.78)
    target_w = int(im.width * (target_h / im.height))
    if target_w > size[0] * 0.8:
        target_w = int(size[0] * 0.8)
        target_h = int(im.height * (target_w / im.width))
    resized = im.resize((target_w, target_h), Image.LANCZOS)
    canvas.alpha_composite(
        resized,
        ((size[0] - target_w) // 2, (size[1] - target_h) // 2),
    )
    return canvas


def main() -> None:
    print(f"Source: {SOURCE}")
    raw = Image.open(SOURCE)
    print(f"  in: {raw.size} {raw.mode}")
    keyed = remove_background(raw, flood_tolerance=42, edge_tolerance=70, feather_px=1)
    cropped = autocrop(keyed, padding_pct=0.03)
    print(f"  cropped: {cropped.size}")

    # Primary medallion — transparent, tight crop, full quality
    cropped.save(BRAND_DIR / "logo-medallion.png", "PNG", optimize=True)
    print(f"  wrote {BRAND_DIR / 'logo-medallion.png'}")

    # Smaller convenience copies for raster fallbacks / app store
    cropped.resize((1024, 1024), Image.LANCZOS).save(
        BRAND_DIR / "logo-medallion-1024.png", "PNG", optimize=True
    )
    cropped.resize((512, 512), Image.LANCZOS).save(
        BRAND_DIR / "logo-medallion-512.png", "PNG", optimize=True
    )

    # OG card — 1200×630 on dark brand canvas
    og = composite(cropped, (1200, 630), DARK)
    og.convert("RGB").save(PUBLIC / "og.png", "PNG", optimize=True)
    print(f"  wrote {PUBLIC / 'og.png'}")

    # Apple touch icon — 180×180 on dark, no transparency (iOS dislikes it)
    ati = composite(cropped, (180, 180), DARK)
    ati.convert("RGB").save(PUBLIC / "apple-touch-icon.png", "PNG", optimize=True)
    print(f"  wrote {PUBLIC / 'apple-touch-icon.png'}")

    # Favicon-32 — transparent PNG, browsers handle it well
    fav = cropped.resize((32, 32), Image.LANCZOS)
    fav.save(PUBLIC / "favicon-32.png", "PNG", optimize=True)
    print(f"  wrote {PUBLIC / 'favicon-32.png'}")

    print("Done.")


if __name__ == "__main__":
    main()
