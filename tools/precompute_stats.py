import json
import os
from PIL import Image

# This script reads assets/segmentos/segmentos.json, computes per-sprite stats once,
# writes them into the JSON under a `stats` key, and saves the file.
# Stats: w, h, r, g, b (sum of channel values over all pixels), opaque (alpha>0 count)

ROOT = os.path.dirname(os.path.dirname(__file__))
# New canonical locations
SEG_JSON = os.path.join(ROOT, 'assets', 'segmentos', 'segmentos.json')
SEG_DIR = os.path.join(ROOT, 'assets', 'segmentos')

# Fallback to legacy layout if needed
if not os.path.exists(SEG_JSON):
    legacy = os.path.join(ROOT, 'segmentos', 'segmentos.json')
    if os.path.exists(legacy):
        SEG_JSON = legacy
        SEG_DIR = os.path.join(ROOT, 'segmentos')


def compute_stats(img_path):
    try:
        with Image.open(img_path) as im:
            im = im.convert('RGBA')
            w, h = im.size
            pixels = im.getdata()
            r = g = b = opaque = 0
            for (rr, gg, bb, aa) in pixels:
                if aa > 0:
                    opaque += 1
                r += rr
                g += gg
                b += bb
            return { 'w': w, 'h': h, 'r': int(r), 'g': int(g), 'b': int(b), 'opaque': int(opaque) }
    except Exception as e:
        print(f"Warn: failed stats for {img_path}: {e}")
        return None


def main():
    if not os.path.exists(SEG_JSON):
        print(f"Not found: {SEG_JSON}")
        return
    with open(SEG_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    changed = False
    for seg in data:
        # Skip if already computed
        s = seg.get('stats')
        if s and all(k in s for k in ('w','h','r','g','b','opaque')):
            continue
        img_rel = seg.get('imagen') or ''
        # Prefer the filename inside assets/segmentos
        img_rel_norm = img_rel.replace('\\', '/')
        img_path = os.path.join(SEG_DIR, os.path.basename(img_rel_norm))
        if not os.path.exists(img_path):
            # try prefixed path inside current SEG_DIR
            img_path2 = os.path.join(SEG_DIR, img_rel_norm)
            if os.path.exists(img_path2):
                img_path = img_path2
            else:
                # legacy folder layout as last resort
                legacy_dir = os.path.join(ROOT, 'segmentos')
                img_path3 = os.path.join(legacy_dir, os.path.basename(img_rel_norm))
                if os.path.exists(img_path3):
                    img_path = img_path3
                else:
                    print(f"Skip: image not found for seg {seg.get('nombre','?')}: {img_rel}")
                    continue
        stats = compute_stats(img_path)
        if stats:
            seg['stats'] = stats
            changed = True

    if changed:
        with open(SEG_JSON, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Stats computed and saved to segmentos.json")
    else:
        print("No changes. Stats already present for all segments.")


if __name__ == '__main__':
    main()
