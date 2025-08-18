#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Optimiza las imágenes de PFP del proyecto:
- Reescala (reduce o aumenta) a un tamaño objetivo manteniendo proporción.
- Convierte a formato WebP para reducir peso (con calidad configurable).
- Actualiza assets/segmentos/segmentos.json con las nuevas rutas (assets/pfp_web/*.webp).

Uso rápido (por defecto 256px lado mayor, calidad 82):
  python tools/pfp_optimizer.py

Opciones útiles:
  python tools/pfp_optimizer.py --max 320 --quality 85
  python tools/pfp_optimizer.py --lossless
  python tools/pfp_optimizer.py --only-json   # no re-procesa imágenes, solo actualiza rutas existentes
  python tools/pfp_optimizer.py --dry-run     # no escribe cambios, solo informa
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Dict, List, Tuple

try:
    from PIL import Image, ImageOps
except Exception:
    sys.stderr.write("\n[pfp_optimizer] Falta Pillow. Instala con: pip install pillow\n\n")
    raise

# Rutas basadas en la ubicación de este archivo (tools/)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
# Canonical assets layout
SEG_DIR = os.path.join(ROOT, 'assets', 'segmentos')
JSON_PATH = os.path.join(SEG_DIR, 'segmentos.json')
PFP_DIR = os.path.join(ROOT, 'assets', 'pfp')
PFP_OUT_DIR = os.path.join(ROOT, 'assets', 'pfp_web')

# Fallbacks to legacy layout if assets/ doesn't exist yet
if not os.path.exists(JSON_PATH):
    legacy_json = os.path.join(ROOT, 'segmentos', 'segmentos.json')
    if os.path.exists(legacy_json):
        JSON_PATH = legacy_json
        SEG_DIR = os.path.join(ROOT, 'segmentos')
if not os.path.isdir(PFP_DIR):
    legacy_pfp = os.path.join(ROOT, 'pfp')
    if os.path.isdir(legacy_pfp):
        PFP_DIR = legacy_pfp
if not os.path.isdir(PFP_OUT_DIR):
    legacy_pfp_web = os.path.join(ROOT, 'pfp_web')
    if os.path.isdir(legacy_pfp_web):
        PFP_OUT_DIR = legacy_pfp_web

SUPPORTED_EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tif', '.tiff'}


def field_ok(v) -> bool:
    return bool(v and str(v).strip())


def backup_json(path: str) -> None:
    try:
        base, _ = os.path.splitext(path)
        bak = base + '.bak'
        import shutil
        shutil.copy2(path, bak)
        print(f"[backup] Copia creada: {bak}")
    except Exception as e:
        print(f"[backup] No se pudo crear copia: {e}")


def load_json(path: str) -> List[Dict]:
    if not os.path.exists(path):
        print(f"[error] No existe JSON: {path}")
        return []
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, list):
                raise ValueError('El JSON debe ser una lista de segmentos')
            return data
    except Exception as e:
        print(f"[error] No se pudo leer JSON: {e}")
        return []


def save_json(path: str, data: List[Dict], dry_run: bool = False) -> bool:
    if dry_run:
        print("[dry-run] JSON no escrito.")
        return True
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        backup_json(path)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[ok] JSON actualizado: {path}")
        return True
    except Exception as e:
        print(f"[error] No se pudo guardar JSON: {e}")
        return False


def iter_pfp_files() -> List[str]:
    if not os.path.isdir(PFP_DIR):
        return []
    out = []
    for name in os.listdir(PFP_DIR):
        p = os.path.join(PFP_DIR, name)
        if not os.path.isfile(p):
            continue
        ext = os.path.splitext(name)[1].lower()
        if ext in SUPPORTED_EXTS:
            out.append(p)
    return sorted(out)


def compute_target_size(w: int, h: int, max_side: int) -> Tuple[int, int]:
    if w <= 0 or h <= 0:
        return (w, h)
    s = max(w, h)
    if s == max_side:
        return (w, h)
    scale = max_side / s
    nw = max(1, int(round(w * scale)))
    nh = max(1, int(round(h * scale)))
    return (nw, nh)


def process_image(src_path: str, out_dir: str, max_side: int, quality: int, lossless: bool, overwrite: bool, dry_run: bool) -> Tuple[str, str, bool]:
    """
    Procesa una imagen y la guarda en WebP.
    Devuelve (abs_src, abs_dst, written)
    """
    name = os.path.splitext(os.path.basename(src_path))[0]
    dst_path = os.path.join(out_dir, f"{name}.webp")

    if (not overwrite) and os.path.exists(dst_path):
        return (src_path, dst_path, False)

    try:
        im = Image.open(src_path)
        im = ImageOps.exif_transpose(im)
        # Convertir a modo adecuado (WebP soporta RGBA)
        if im.mode not in ('RGB', 'RGBA'):
            im = im.convert('RGBA') if 'A' in im.getbands() else im.convert('RGB')
        w, h = im.size
        nw, nh = compute_target_size(w, h, max_side)
        if (nw, nh) != (w, h):
            # Lanczos da buena calidad de reescala general; si se prefiriera pixel-art, cambiar a Image.NEAREST
            im = im.resize((nw, nh), Image.LANCZOS)
        os.makedirs(out_dir, exist_ok=True)
        if dry_run:
            print(f"[dry-run] {os.path.basename(src_path)} -> {os.path.basename(dst_path)} {w}x{h} -> {nw}x{nh}")
            return (src_path, dst_path, False)
        save_params = {"optimize": True, "method": 6}
        if lossless:
            save_params.update({"lossless": True, "quality": 100})
        else:
            save_params.update({"quality": max(1, min(100, quality))})
        im.save(dst_path, format='WEBP', **save_params)
        print(f"[ok] {os.path.basename(src_path)} -> {os.path.basename(dst_path)} {w}x{h} -> {nw}x{nh}")
        return (src_path, dst_path, True)
    except Exception as e:
        print(f"[error] Falló {src_path}: {e}")
        return (src_path, dst_path, False)


def rel_from_root(abs_path: str) -> str:
    return os.path.relpath(abs_path, ROOT).replace('\\', '/')


def main():
    parser = argparse.ArgumentParser(description='Optimiza PFPs a WebP y actualiza JSON.')
    parser.add_argument('--max', dest='max_side', type=int, default=256, help='Lado mayor objetivo en píxeles (default: 256)')
    parser.add_argument('--quality', type=int, default=82, help='Calidad WebP (1-100, default: 82)')
    parser.add_argument('--lossless', action='store_true', help='Usar WebP sin pérdidas (ignora quality)')
    parser.add_argument('--overwrite', action='store_true', help='Reprocesar aunque el destino exista')
    parser.add_argument('--only-json', action='store_true', help='No re-procesa imágenes; solo actualiza rutas en JSON si el .webp ya existe')
    parser.add_argument('--dry-run', action='store_true', help='No escribe archivos; solo muestra lo que haría')
    args = parser.parse_args()

    print(f"[cfg] max_side={args.max_side} quality={args.quality} lossless={args.lossless} overwrite={args.overwrite} only_json={args.only_json} dry_run={args.dry_run}")

    # Recolectar archivos fuente en assets/pfp/ (o legacy pfp/)
    src_files = iter_pfp_files()
    if not src_files:
        print(f"[warn] No se encontraron imágenes en: {PFP_DIR}")

    # Procesar imágenes (a menos que --only-json)
    mapping: Dict[str, str] = {}  # rel_src -> rel_dst
    if not args.only_json:
        for src in src_files:
            abs_src, abs_dst, _written = process_image(
                src_path=src,
                out_dir=PFP_OUT_DIR,
                max_side=args.max_side,
                quality=args.quality,
                lossless=args.lossless,
                overwrite=args.overwrite,
                dry_run=args.dry_run,
            )
            rel_src = rel_from_root(abs_src)
            rel_dst = rel_from_root(abs_dst)
            mapping[rel_src] = rel_dst

    # Cargar JSON y actualizar rutas de 'perfil'
    data = load_json(JSON_PATH)
    if not data:
        print('[warn] JSON vacío o no disponible. Fin.')
        return 0

    changed = 0
    checked = 0

    # Construye también mapping a partir del json (por si el perfil no apunta a assets/pfp/ pero existe archivo homónimo)
    for seg in data:
        old = seg.get('perfil')
        if not field_ok(old):
            continue
        checked += 1
        rel_old = str(old).replace('\\', '/').lstrip('/')

        # Caso 1: Tenemos mapping directo de procesamiento
        rel_new = mapping.get(rel_old)

        # Caso 2: Si no, intentar inferir destino si es un PFP dentro de assets/pfp/ (o legacy pfp/)
        if not rel_new:
            base = os.path.splitext(os.path.basename(rel_old))[0]
            # Prefer assets/pfp_web
            inferred_dst = f"assets/pfp_web/{base}.webp"
            abs_inferred = os.path.join(ROOT, inferred_dst.replace('/', os.sep))
            if os.path.exists(abs_inferred):
                rel_new = inferred_dst
            else:
                # Legacy fallback
                legacy_dst = f"pfp_web/{base}.webp"
                abs_legacy = os.path.join(ROOT, legacy_dst)
                if os.path.exists(abs_legacy):
                    rel_new = legacy_dst

        if rel_new and rel_new != rel_old:
            print(f"[json] perfil: {rel_old} -> {rel_new}")
            seg['perfil'] = rel_new
            changed += 1

    if changed:
        print(f"[json] {changed} perfiles actualizados de {checked} con valor.")
        save_json(JSON_PATH, data, dry_run=args.dry_run)
    else:
        print(f"[json] No hubo cambios en perfiles (revisados {checked}).")

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
