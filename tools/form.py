#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Herramienta de formulario para editar personajes del proyecto Visualizador.

Funciones principales:
- Carga segmentos/segmentos.json.
- Muestra un menú principal (lista) con el estado de cada personaje y qué campos faltan (iconos ✓ / •).
- Permite editar un personaje a la vez: nombre y redes (X, Discord, VGen, Ko‑fi, YouTube).
- Muestra el sprite segmentado.
- Permite seleccionar y recortar una imagen de PFP y guardarla en pfp/.

Requisitos:
- Tkinter (incluido con Python estándar).
- Pillow (PIL) para manejar imágenes. Si no está instalado: pip install pillow

Rutas relativas a este archivo:
- JSON:   ../segmentos/segmentos.json
- Sprites: ../segmentos/
- PFP out: ../pfp/
"""

from __future__ import annotations

import json
import os
import sys
import shutil
from dataclasses import dataclass, field
from typing import Dict, List, Optional

try:
    from PIL import Image, ImageTk
except Exception as e:  # pragma: no cover
    # Mensaje amable si falta Pillow
    sys.stderr.write("\n[form.py] Falta dependencia Pillow. Instala con:\n  pip install pillow\n\n")
    raise

import tkinter as tk
from tkinter import ttk, filedialog, messagebox


def project_root() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))


ROOT = project_root()
SEG_DIR = os.path.join(ROOT, 'segmentos')
JSON_PATH = os.path.join(SEG_DIR, 'segmentos.json')
PFP_DIR = os.path.join(ROOT, 'pfp')

os.makedirs(PFP_DIR, exist_ok=True)


def load_segments() -> List[Dict]:
    if not os.path.exists(JSON_PATH):
        messagebox.showerror("Error", f"No se encontró el archivo:\n{JSON_PATH}")
        return []
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            if not isinstance(data, list):
                raise ValueError('El JSON debe ser una lista de segmentos')
            return data
        except Exception as e:  # pragma: no cover
            messagebox.showerror("Error", f"No se pudo leer JSON: {e}")
            return []


def backup_json(path: str) -> None:
    try:
        base, ext = os.path.splitext(path)
        shutil.copy2(path, base + '.bak')
    except Exception:
        pass


def save_segments(data: List[Dict]) -> bool:
    try:
        if os.path.exists(JSON_PATH):
            backup_json(JSON_PATH)
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:  # pragma: no cover
        messagebox.showerror("Error", f"No se pudo guardar JSON: {e}")
        return False


def sanitize_filename(name: str) -> str:
    safe = ''.join(c if c.isalnum() or c in ('-', '_') else '-' for c in name.strip())
    return safe.strip('-_') or 'pfp'


def field_ok(v: Optional[str]) -> bool:
    return bool(v and str(v).strip())


FIELDS = [
    ('nombre', 'Nombre'),
    ('x', 'X'),
    ('discord', 'Discord'),
    ('vgen', 'VGen'),
    ('kofi', 'Ko‑fi'),
    ('youtube', 'YouTube'),
    ('twitch', 'Twitch'),
    ('portfolio', 'Portfolio'),
    ('perfil', 'PFP'),
]


class SegmentManager:
    def __init__(self):
        self.data = load_segments()
        # Normalizar PFP al cargar: si es None, vacío o solo espacios, dejar en ""
        for seg in self.data:
            val = seg.get('perfil')
            if not field_ok(val):
                seg['perfil'] = ''

    def save(self) -> bool:
        return save_segments(self.data)

    def pending_map(self, seg: Dict) -> Dict[str, bool]:
        return {k: field_ok(seg.get(k)) for k, _ in FIELDS}

    def is_pending(self, seg: Dict) -> bool:
        pm = self.pending_map(seg)
        # Consideramos pendiente si falta al menos uno
        return not all(pm.values())


class CropWindow(tk.Toplevel):
    def __init__(self, parent, image_path: str, on_crop_done):
        super().__init__(parent)
        self.title("Recortar PFP")
        self.resizable(True, True)
        self.on_crop_done = on_crop_done

        # Cargar imagen original
        self.orig_img = Image.open(image_path).convert('RGBA')
        self.display_img = self.orig_img.copy()
        self.scale = 1.0

        self.canvas = tk.Canvas(self, bg='#222', highlightthickness=0, cursor='cross')
        self.canvas.pack(fill=tk.BOTH, expand=True)

        btns = ttk.Frame(self)
        btns.pack(fill=tk.X, side=tk.BOTTOM)
        ttk.Button(btns, text='Restablecer', command=self.reset_view).pack(side=tk.LEFT, padx=4, pady=4)
        ttk.Button(btns, text='Recortar y guardar', command=self.apply_crop).pack(side=tk.RIGHT, padx=4, pady=4)

        self._imgtk = None
        self.rect_id = None
        self.start = None
        self.end = None

        self.bind('<Configure>', self._on_resize)
        self.canvas.bind('<ButtonPress-1>', self._on_press)
        self.canvas.bind('<B1-Motion>', self._on_drag)
        self.canvas.bind('<ButtonRelease-1>', self._on_release)

        self._redraw()

    def reset_view(self):
        self.start = self.end = None
        self._redraw()

    def _on_resize(self, _evt=None):
        self._redraw()

    def _compute_scale(self, w, h):
        if w <= 1 or h <= 1:
            return 1.0
        max_w = max(100, self.canvas.winfo_width())
        max_h = max(100, self.canvas.winfo_height())
        sw = max_w / w
        sh = max_h / h
        return min(sw, sh, 1.0)  # no agrandar por encima del original

    def _redraw(self):
        self.canvas.delete('all')
        w, h = self.orig_img.size
        self.scale = self._compute_scale(w, h)
        disp = self.orig_img
        if self.scale < 1.0:
            disp = self.orig_img.resize((int(w * self.scale), int(h * self.scale)), Image.NEAREST)
        self.display_img = disp
        self._imgtk = ImageTk.PhotoImage(disp)
        self.canvas.create_image(0, 0, anchor='nw', image=self._imgtk)
        # rect existente
        if self.start and self.end:
            x0, y0 = self.start
            x1, y1 = self.end
            self.rect_id = self.canvas.create_rectangle(x0, y0, x1, y1, outline='#0ff', width=2)

    def _on_press(self, evt):
        self.start = (evt.x, evt.y)
        self.end = (evt.x, evt.y)
        self._redraw()

    def _on_drag(self, evt):
        if not self.start:
            return
        self.end = (evt.x, evt.y)
        self._redraw()

    def _on_release(self, evt):
        if not self.start:
            return
        self.end = (evt.x, evt.y)
        self._redraw()

    def apply_crop(self):
        if not (self.start and self.end):
            messagebox.showwarning('Recorte', 'Dibuja un rectángulo para recortar.')
            return
        # Coordenadas en imagen original
        x0, y0 = self.start
        x1, y1 = self.end
        x0, x1 = sorted((x0, x1))
        y0, y1 = sorted((y0, y1))
        if x1 - x0 < 2 or y1 - y0 < 2:
            messagebox.showwarning('Recorte', 'El área de recorte es muy pequeña.')
            return
        inv = 1.0 / (self.scale or 1.0)
        box = (int(x0 * inv), int(y0 * inv), int(x1 * inv), int(y1 * inv))
        box = (
            max(0, min(box[0], self.orig_img.width - 1)),
            max(0, min(box[1], self.orig_img.height - 1)),
            max(1, min(box[2], self.orig_img.width)),
            max(1, min(box[3], self.orig_img.height)),
        )
        if box[2] <= box[0] or box[3] <= box[1]:
            messagebox.showwarning('Recorte', 'El área de recorte no es válida.')
            return
        cropped = self.orig_img.crop(box)
        self.on_crop_done(cropped)
        self.destroy()


class EditWindow(tk.Toplevel):
    def __init__(self, parent, manager: SegmentManager, index: int):
        super().__init__(parent)
        self.title(f"Editar personaje #{index}")
        self.manager = manager
        self.index = index
        self.seg = manager.data[index]

        self.columnconfigure(1, weight=1)
        form = ttk.Frame(self)
        form.grid(row=0, column=0, columnspan=2, sticky='nsew', padx=10, pady=10)
        form.columnconfigure(1, weight=1)

        # Campos de texto
        self.entries: Dict[str, tk.Entry] = {}
        row = 0
        for key, label in FIELDS[:-1]:  # excepto PFP
            ttk.Label(form, text=label+':').grid(row=row, column=0, sticky='w', pady=2)
            ent = ttk.Entry(form)
            ent.grid(row=row, column=1, sticky='ew', pady=2)
            ent.insert(0, str(self.seg.get(key, '') or ''))
            self.entries[key] = ent
            row += 1

        # Sprite preview
        spr_frame = ttk.LabelFrame(self, text='Sprite')
        spr_frame.grid(row=1, column=0, sticky='nw', padx=10, pady=(0,10))
        self.spr_canvas = tk.Canvas(spr_frame, width=160, height=160, bg='#111', highlightthickness=1, highlightbackground='#444')
        self.spr_canvas.pack(padx=6, pady=6)
        self._spr_imgtk = None
        self._load_sprite()

        # PFP preview y acciones
        pfp_frame = ttk.LabelFrame(self, text='PFP')
        pfp_frame.grid(row=1, column=1, sticky='new', padx=10, pady=(0,10))
        self.pfp_canvas = tk.Canvas(pfp_frame, width=96, height=96, bg='#222', highlightthickness=1, highlightbackground='#444')
        self.pfp_canvas.grid(row=0, column=0, columnspan=3, padx=6, pady=6, sticky='w')
        self._pfp_imgtk = None
        self._pfp_img = None
        self._load_pfp_preview()

        self.btn_pfp_select = ttk.Button(pfp_frame, text='Seleccionar imagen…', command=self._select_pfp)
        self.btn_pfp_select.grid(row=1, column=0, padx=4, pady=4, sticky='w')
        self.btn_pfp_crop = ttk.Button(pfp_frame, text='Recortar actual…', command=self._crop_current_pfp)
        self.btn_pfp_crop.grid(row=1, column=1, padx=4, pady=4, sticky='w')
        self.btn_pfp_clear = ttk.Button(pfp_frame, text='Quitar', command=self._clear_pfp)
        self.btn_pfp_clear.grid(row=1, column=2, padx=4, pady=4, sticky='e')
        self._update_pfp_buttons()

        # Botones guardar/cerrar
        actions = ttk.Frame(self)
        actions.grid(row=2, column=0, columnspan=2, sticky='ew', padx=10, pady=10)
        actions.columnconfigure(0, weight=1)
        ttk.Button(actions, text='Guardar', command=self._save).grid(row=0, column=1, sticky='e', padx=4)
        ttk.Button(actions, text='Cerrar', command=self.destroy).grid(row=0, column=2, sticky='e', padx=4)

    # --- Sprite ---
    def _load_sprite(self):
        img_rel = str(self.seg.get('imagen') or '').replace('\\', '/')
        if not img_rel:
            return
        img_path = img_rel
        if not os.path.isabs(img_path):
            img_path = os.path.join(SEG_DIR, os.path.basename(img_rel))
        if not os.path.exists(img_path):
            return
        try:
            im = Image.open(img_path).convert('RGBA')
            # Escalar a canvas manteniendo pixel art (NEAREST)
            cw, ch = (160, 160)
            scale = min(cw / max(1, im.width), ch / max(1, im.height), 1.0)
            nw, nh = max(1, int(im.width * scale)), max(1, int(im.height * scale))
            im = im.resize((nw, nh), Image.NEAREST)
            self._spr_imgtk = ImageTk.PhotoImage(im)
            self.spr_canvas.create_image((cw - nw)//2, (ch - nh)//2, anchor='nw', image=self._spr_imgtk)
        except Exception:
            pass

    # --- PFP ---
    def _load_pfp_preview(self):
        self.pfp_canvas.delete('all')
        pfp_rel = str(self.seg.get('perfil') or '')
        if not pfp_rel.strip():
            # Sin PFP
            self.pfp_canvas.create_text(48, 48, text='(vacío)', fill='#aaa')
            self._update_pfp_buttons(has_pfp=False)
            return
        p = pfp_rel
        if not os.path.isabs(p):
            p = os.path.join(ROOT, p.replace('\\', '/').lstrip('/'))
        if not os.path.exists(p):
            self.pfp_canvas.create_text(48, 48, text='(no existe)', fill='#faa')
            self._update_pfp_buttons(has_pfp=False)
            return
        try:
            im = Image.open(p).convert('RGBA')
            self._pfp_img = im
            cw, ch = (96, 96)
            scale = min(cw / max(1, im.width), ch / max(1, im.height))
            im2 = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.NEAREST)
            self._pfp_imgtk = ImageTk.PhotoImage(im2)
            self.pfp_canvas.create_image((cw - im2.width)//2, (ch - im2.height)//2, anchor='nw', image=self._pfp_imgtk)
            self._update_pfp_buttons(has_pfp=True)
        except Exception:
            self.pfp_canvas.create_text(48, 48, text='(error)', fill='#faa')
            self._update_pfp_buttons(has_pfp=False)

    def _update_pfp_buttons(self, has_pfp: Optional[bool] = None):
        if has_pfp is None:
            has_pfp = field_ok(self.seg.get('perfil'))
        state_crop = tk.NORMAL if has_pfp else tk.DISABLED
        state_clear = tk.NORMAL if has_pfp else tk.DISABLED
        if hasattr(self, 'btn_pfp_crop'):
            self.btn_pfp_crop.config(state=state_crop)
        if hasattr(self, 'btn_pfp_clear'):
            self.btn_pfp_clear.config(state=state_clear)

    def _select_pfp(self):
        path = filedialog.askopenfilename(title='Seleccionar imagen',
                                          filetypes=[('Imágenes', '*.png;*.jpg;*.jpeg;*.webp;*.bmp'), ('Todos', '*.*')])
        if not path:
            return
        def on_done(cropped_img: Image.Image):
            # Guardar en pfp/
            base = sanitize_filename(self.seg.get('nombre') or os.path.basename(self.seg.get('imagen', 'pfp')))
            out_name = f"{base}.png"
            out_path = os.path.join(PFP_DIR, out_name)
            try:
                cropped_img.save(out_path, 'PNG')
                rel = os.path.relpath(out_path, ROOT).replace('\\', '/')
                self.seg['perfil'] = rel
                self._load_pfp_preview()
            except Exception as e:
                messagebox.showerror('Guardar PFP', f'No se pudo guardar: {e}')
        CropWindow(self, path, on_done)

    def _crop_current_pfp(self):
        # Si ya hay PFP, permitir re-cortar desde ese archivo; si no, pedir seleccionar
        pfp_rel = str(self.seg.get('perfil') or '')
        if not pfp_rel.strip():
            return self._select_pfp()
        p = pfp_rel
        if not os.path.isabs(p):
            p = os.path.join(ROOT, p.replace('\\', '/').lstrip('/'))
        if not os.path.exists(p):
            return self._select_pfp()
        def on_done(cropped_img: Image.Image):
            try:
                cropped_img.save(p, 'PNG')
                self._load_pfp_preview()
            except Exception as e:
                messagebox.showerror('Guardar PFP', f'No se pudo guardar: {e}')
        CropWindow(self, p, on_done)

    def _clear_pfp(self):
        if messagebox.askyesno('Quitar PFP', '¿Eliminar referencia al PFP de este personaje?'):
            self.seg['perfil'] = ''
            self._load_pfp_preview()
            self._update_pfp_buttons(has_pfp=False)

    def _save(self):
        for k, _label in FIELDS[:-1]:
            self.seg[k] = self.entries[k].get().strip()
        if self.manager.save():
            messagebox.showinfo('Guardado', 'Cambios guardados.')
            self.destroy()


class MainWindow(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('Formulario de personajes')
        self.geometry('880x520')
        self.minsize(760, 440)
        self.manager = SegmentManager()

        top = ttk.Frame(self)
        top.pack(fill=tk.BOTH, expand=True)

        # Barra de botones
        bar = ttk.Frame(top)
        bar.pack(fill=tk.X, side=tk.TOP)
        ttk.Button(bar, text='Abrir seleccionado', command=self.open_selected).pack(side=tk.LEFT, padx=4, pady=4)
        ttk.Button(bar, text='Abrir siguiente pendiente', command=self.open_next_pending).pack(side=tk.LEFT, padx=4, pady=4)
        ttk.Button(bar, text='Guardar JSON', command=self.manager.save).pack(side=tk.LEFT, padx=4, pady=4)

        # Lista
        cols = ('nombre', 'PFP', 'X', 'Discord', 'VGen', 'Ko‑fi', 'YouTube', 'Twitch', 'Portfolio')
        self.tree = ttk.Treeview(top, columns=cols, show='headings', selectmode='browse')
        for c in cols:
            self.tree.heading(c, text=c)
        self.tree.column('nombre', width=260, anchor='w')
        for c in cols[1:]:
            self.tree.column(c, width=70, anchor='center')
        self.tree.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)
        self.tree.bind('<Double-1>', lambda _e: self.open_selected())

        self._reload()

        # Estado inferior
        self.status = tk.StringVar(value=f"JSON: {JSON_PATH}")
        ttk.Label(self, textvariable=self.status, anchor='w').pack(fill=tk.X, side=tk.BOTTOM)

    def _icon(self, ok: bool) -> str:
        return '✓' if ok else '•'  # ✓ para completo, • para pendiente

    def _reload(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        for idx, seg in enumerate(self.manager.data):
            pm = self.manager.pending_map(seg)
            row = (
                seg.get('nombre') or os.path.basename(str(seg.get('imagen') or '')),
                self._icon(pm.get('perfil', False)),
                self._icon(pm.get('x', False)),
                self._icon(pm.get('discord', False)),
                self._icon(pm.get('vgen', False)),
                self._icon(pm.get('kofi', False)),
                self._icon(pm.get('youtube', False)),
                self._icon(pm.get('twitch', False)),
                self._icon(pm.get('portfolio', False)),
            )
            self.tree.insert('', 'end', iid=str(idx), values=row)

    def open_selected(self):
        sel = self.tree.selection()
        if not sel:
            messagebox.showinfo('Abrir', 'Selecciona un personaje de la lista.')
            return
        idx = int(sel[0])
        win = EditWindow(self, self.manager, idx)
        self.wait_window(win)
        self._reload()

    def open_next_pending(self):
        for idx, seg in enumerate(self.manager.data):
            if self.manager.is_pending(seg):
                win = EditWindow(self, self.manager, idx)
                self.wait_window(win)
                self._reload()
                return
        messagebox.showinfo('Pendientes', 'No hay formularios pendientes. ¡Todo completo!')


def main():
    app = MainWindow()
    app.mainloop()


if __name__ == '__main__':
    main()
