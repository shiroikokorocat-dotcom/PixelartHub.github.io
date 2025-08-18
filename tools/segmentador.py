
# Script para segmentar Ilustración72.png en 32 partes tras seleccionar un área de trabajo, con escalado 4x y previsualización

import cv2
import os
import json
import numpy as np

IMG_PATH = r"Ilustracion72.png"  # Asegúrate que el nombre sea correcto y sin acentos
OUTPUT_DIR = r"assets/segmentos"
SCALE_FACTOR = 4

# Variables globales para el área de trabajo
refPt = []
cropping = False

def show_help(win: str, lines):
	"""Muestra instrucciones como overlay en una ventana, y las imprime en consola como respaldo."""
	if isinstance(lines, (list, tuple)):
		text = "\n".join(lines)
	else:
		text = str(lines)
	try:
		# Disponible en OpenCV 4.x
		cv2.displayOverlay(win, text, 0)
	except Exception:
		pass
	print("\n" + ("="*60))
	print(f"[{win}] Instrucciones:\n" + text)
	print(("="*60) + "\n")

def click_and_crop(event, x, y, flags, param):
	global refPt, cropping
	if event == cv2.EVENT_LBUTTONDOWN:
		refPt = [(x, y)]
		cropping = True
	elif event == cv2.EVENT_LBUTTONUP:
		refPt.append((x, y))
		cropping = False
		cv2.rectangle(image, refPt[0], refPt[1], (0, 255, 0), 2)
		cv2.imshow("image", image)


# Cargar imagen y escalar 4x sin antialiasing, conservando transparencia
orig_image = cv2.imread(IMG_PATH, cv2.IMREAD_UNCHANGED)
if orig_image is None:
	print(f"No se pudo cargar la imagen '{IMG_PATH}'. Verifica el nombre y la ruta.")
	exit()
height, width = orig_image.shape[:2]
image = cv2.resize(orig_image, (width*SCALE_FACTOR, height*SCALE_FACTOR), interpolation=cv2.INTER_NEAREST)
clone = image.copy()
cv2.namedWindow("image")
cv2.setMouseCallback("image", click_and_crop)
show_help("image", [
	"Paso 1: Selecciona el área de trabajo (arrastra con clic izquierdo).",
	"Controles:",
	"- c: continuar",
	"- r: reiniciar selección",
	"- Esc: cerrar"
])

while True:
	cv2.imshow("image", image)
	key = cv2.waitKey(1) & 0xFF
	if key == ord("r"):
		image = clone.copy()
		refPt = []
	elif key == ord("c"):
		break

cv2.destroyAllWindows()

def rgba_to_bgr_preview(rgba: np.ndarray, bg=(20, 20, 20)) -> np.ndarray:
	"""Convierte una imagen RGBA a BGR para previsualización sobre un fondo dado."""
	if rgba is None:
		return None
	if rgba.shape[2] == 3:
		return rgba
	b, g, r, a = cv2.split(rgba)
	a_f = a.astype(np.float32) / 255.0
	bg_bgr = np.zeros_like(rgba[:, :, :3])
	bg_bgr[:, :, 0] = bg[0]
	bg_bgr[:, :, 1] = bg[1]
	bg_bgr[:, :, 2] = bg[2]
	out = (rgba[:, :, :3].astype(np.float32) * a_f[:, :, None] + bg_bgr.astype(np.float32) * (1.0 - a_f[:, :, None]))
	return out.astype(np.uint8)

def find_content_props(seg_rgba: np.ndarray, alpha_thr: int = 32):
	"""Devuelve máscara, bbox (x,y,w,h) y centroide (cx, cy) de los píxeles opacos."""
	if seg_rgba.shape[2] == 4:
		alpha = seg_rgba[:, :, 3]
	else:
		# Si no hay alfa, considerar todo opaco
		alpha = np.full(seg_rgba.shape[:2], 255, dtype=np.uint8)
	mask = (alpha > alpha_thr).astype(np.uint8) * 255
	if cv2.countNonZero(mask) == 0:
		return mask, None, None
	# bbox
	x, y, w, h = cv2.boundingRect(mask)
	# centroide con momentos
	m = cv2.moments(mask, binaryImage=True)
	cx = m['m10'] / (m['m00'] + 1e-6)
	cy = m['m01'] / (m['m00'] + 1e-6)
	return mask, (x, y, w, h), (cx, cy)

def center_segment(seg_rgba: np.ndarray, alpha_thr: int = 32):
	"""Centra lo más posible el contenido opaco dentro del lienzo del segmento sin recortar.
	Devuelve (seg_centrada, shift_aplicado (dx, dy), props).
	"""
	h, w = seg_rgba.shape[:2]
	mask, bbox, centroid = find_content_props(seg_rgba, alpha_thr)
	if bbox is None:
		return seg_rgba, (0, 0), (mask, bbox, centroid)
	x, y, bw, bh = bbox
	cx, cy = centroid
	target_cx, target_cy = w / 2.0, h / 2.0
	dx = int(round(target_cx - cx))
	dy = int(round(target_cy - cy))
	# Limitar desplazamiento para no salir del lienzo
	min_dx = -x
	max_dx = w - (x + bw)
	min_dy = -y
	max_dy = h - (y + bh)
	dx = max(min_dx, min(dx, max_dx))
	dy = max(min_dy, min(dy, max_dy))
	if dx == 0 and dy == 0:
		return seg_rgba, (0, 0), (mask, bbox, centroid)
	M = np.float32([[1, 0, dx], [0, 1, dy]])
	shifted = cv2.warpAffine(seg_rgba, M, (w, h), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
	# Recalcular props post-centro (opcional)
	return shifted, (dx, dy), (mask, bbox, centroid)

def build_mosaic(roi: np.ndarray, rows: int, cols: int, centered: bool, alpha_thr: int = 32, overlay: bool = True) -> np.ndarray:
	"""Crea un mosaico BGR de todos los segmentos, opcionalmente centrados y con overlay de guías."""
	seg_h = roi.shape[0] // rows
	seg_w = roi.shape[1] // cols
	mosaic = np.zeros((seg_h * rows, seg_w * cols, 3), dtype=np.uint8)
	mosaic[:] = (15, 15, 15)
	for i in range(rows):
		for j in range(cols):
			x0 = j * seg_w
			y0 = i * seg_h
			seg = roi[y0:y0+seg_h, x0:x0+seg_w]
			# Asegurar RGBA
			if seg.shape[2] == 4:
				seg_rgba = seg.copy()
			else:
				bgr = seg
				mask = cv2.inRange(bgr, (255, 255, 255), (255, 255, 255))
				alpha = 255 - mask
				seg_rgba = cv2.merge([bgr[:, :, 0], bgr[:, :, 1], bgr[:, :, 2], alpha])
			if centered:
				seg_disp, (dx, dy), props = center_segment(seg_rgba, alpha_thr)
			else:
				seg_disp, (dx, dy), props = seg_rgba, (0, 0), find_content_props(seg_rgba, alpha_thr)
			seg_bgr = rgba_to_bgr_preview(seg_disp)
			mosaic[y0:y0+seg_h, x0:x0+seg_w] = seg_bgr
			if overlay:
				# Guías: centro ideal, centroide, bbox
				cx_i = x0 + seg_w // 2
				cy_i = y0 + seg_h // 2
				cv2.drawMarker(mosaic, (cx_i, cy_i), (0, 255, 255), markerType=cv2.MARKER_CROSS, markerSize=8, thickness=1)
				mask, bbox, centroid = props if isinstance(props, tuple) and len(props) == 3 else (None, None, None)
				if bbox is not None and centroid is not None:
					bx, by, bw, bh = bbox
					cv2.rectangle(mosaic, (x0 + bx, y0 + by), (x0 + bx + bw, y0 + by + bh), (0, 255, 0), 1)
					ccx, ccy = centroid
					cv2.circle(mosaic, (x0 + int(round(ccx)), y0 + int(round(ccy))), 2, (0, 0, 255), -1)
					# Flecha hacia el centro ideal (en preview del estado elegido)
					cv2.arrowedLine(mosaic, (x0 + int(round(ccx)), y0 + int(round(ccy))), (cx_i, cy_i), (255, 0, 0), 1, tipLength=0.25)
	return mosaic

def interactive_preview(roi: np.ndarray, rows: int, cols: int) -> int:
	"""Muestra previsualización en tiempo real: izquierda original, derecha centrada.
	Trackbar para umbral alfa. Devuelve el umbral elegido."""
	win = 'Vista previa segmentos (izq: original, der: centrado)'
	cv2.namedWindow(win)
	show_help(win, [
		"Paso 3 (modo grilla): Vista previa en tiempo real.",
		"Izquierda: original | Derecha: centrado",
		"Controles:",
		"- Slider alpha_thr: ajusta qué se considera opaco",
		"- Enter/Espacio/S: confirmar y guardar",
		"- Esc/Q: cancelar y volver"
	])
	alpha_thr = 32
	cv2.createTrackbar('alpha_thr', win, alpha_thr, 255, lambda v: None)
	while True:
		alpha_thr = cv2.getTrackbarPos('alpha_thr', win)
		left = build_mosaic(roi, rows, cols, centered=False, alpha_thr=alpha_thr, overlay=True)
		right = build_mosaic(roi, rows, cols, centered=True, alpha_thr=alpha_thr, overlay=True)
		sep = np.full((left.shape[0], 2, 3), 60, dtype=np.uint8)
		combo = np.hstack([left, sep, right])
		cv2.imshow(win, combo)
		key = cv2.waitKey(30) & 0xFF
		if key in (27, ord('q')):  # Esc o q cancela
			break
		if key in (13, 32, ord('s')):  # Enter, espacio o 's' para confirmar
			cv2.destroyWindow(win)
			return alpha_thr
	cv2.destroyWindow(win)
	return alpha_thr

def select_person_boxes(roi: np.ndarray):
	def row_major_indices(boxes_list, tol=None):
		if not boxes_list:
			return []
		# Compute centers and median height to derive tolerance
		hs = [h for (_, _, _, h) in boxes_list]
		med_h = int(np.median(hs)) if hs else 1
		if tol is None:
			tol = max(6, int(0.4* med_h))  # tolerancia vertical dinámica
		# Prepare entries: (idx, x, y, w, h, cy)
		entries = []
		for i, (x, y, w, h) in enumerate(boxes_list):
			cy = y + h / 2.0
			entries.append((i, x, y, w, h, cy))
		# Sort by cy (top to bottom)
		entries.sort(key=lambda e: e[5])
		# Group into rows with tolerance
		rows = []  # list of lists of entries
		for e in entries:
			if not rows:
				rows.append([e])
			else:
				# compare with last row baseline (use first element's cy as baseline)
				baseline = rows[-1][0][5]
				if abs(e[5] - baseline) <= tol:
					rows[-1].append(e)
				else:
					rows.append([e])
		# Within each row, sort left-to-right by x
		order = []
		for row in rows:
			row.sort(key=lambda e: e[1])  # by x
			order.extend([e[0] for e in row])
		return order
	def auto_detect_boxes(roi_local: np.ndarray, alpha_thr: int = 32, min_area: int = 36):
		# Construir máscara binaria de contenido
		if roi_local.shape[2] == 4:
			alpha = roi_local[:, :, 3]
			mask = (alpha > alpha_thr).astype(np.uint8) * 255
		else:
			bgr = roi_local[:, :, :3]
			white = cv2.inRange(bgr, (255, 255, 255), (255, 255, 255))
			mask = 255 - white
		# Limpieza y unión ligera
		k = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
		mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, k, iterations=1)
		mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k, iterations=1)
		num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)
		boxes_auto = []
		for i in range(1, num_labels):  # saltar fondo
			x, y, w, h, area = stats[i]
			if area >= min_area and w > 1 and h > 1:
				# pequeño padding
				pad = 1
				x0 = max(0, x - pad)
				y0 = max(0, y - pad)
				x1 = min(roi_local.shape[1], x + w + pad)
				y1 = min(roi_local.shape[0], y + h + pad)
				boxes_auto.append((x0, y0, x1 - x0, y1 - y0))
		# ordenar en modo "row-major" con tolerancia vertical
		order = row_major_indices(boxes_auto)
		boxes_sorted = [boxes_auto[i] for i in order]
		return boxes_sorted

	boxes = auto_detect_boxes(roi)
	if not boxes:
		# Si no detecta nada, devolver lista vacía
		return boxes

	sel = 0  # índice seleccionado
	win = 'Paso 2: Ajuste de recuadros detectados'
	cv2.namedWindow(win)
	show_help(win, [
		"Paso 2: Revisa los recuadros detectados automáticamente.",
		"Controles:",
		"- Tab: cambiar recuadro activo",
		"- Flechas: expandir 1 px (←↑→↓)",
		"- w/a/s/d: contraer 1 px (arriba/izquierda/abajo/derecha)",
		"- Supr/Backspace: eliminar recuadro",
		"- Enter/Espacio: confirmar",
		"- Esc: cancelar y volver"
	])

	def clamp_box(b):
		x, y, w, h = b
		x = max(0, min(x, roi.shape[1] - 1))
		y = max(0, min(y, roi.shape[0] - 1))
		w = max(1, min(w, roi.shape[1] - x))
		h = max(1, min(h, roi.shape[0] - y))
		return (x, y, w, h)

	def draw_view():
		disp = rgba_to_bgr_preview(roi)
		if disp is None:
			disp = roi[:, :, :3].copy()
		overlay = disp.copy()
		# Dibujar rectángulos (mantener resaltado del seleccionado por índice)
		for i, (bx, by, bw, bh) in enumerate(boxes):
			color = (0, 255, 255) if i == sel else (100, 200, 255)
			cv2.rectangle(overlay, (bx, by), (bx + bw, by + bh), color, 1)
		# Numeración en orden row-major con tolerancia
		order = row_major_indices(boxes)
		for pos, idx in enumerate(order):
			bx, by, bw, bh = boxes[idx]
			cv2.putText(overlay, f"{pos+1}", (bx + 4, by + 14), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 255, 200), 1, cv2.LINE_AA)
		return overlay

	while True:
		cv2.imshow(win, draw_view())
		# Usar waitKeyEx para capturar teclas extendidas (flechas) en Windows
		key = cv2.waitKeyEx(0)
		if key in (27, ord('q')):  # Esc
			boxes = []
			break
		elif key in (13, 32):  # Enter o espacio
			# Reordenar boxes en orden row-major con tolerancia antes de salir
			order = row_major_indices(boxes)
			boxes = [boxes[i] for i in order]
			break
		elif key == 9:  # Tab
			if boxes:
				sel = (sel + 1) % len(boxes)
		elif key in (2555904, 65363):  # Right arrow
			# expandir derecha (+1)
			x, y, w, h = boxes[sel]
			boxes[sel] = clamp_box((x, y, w + 1, h))
		elif key in (2424832, 65361):  # Left arrow
			# expandir izquierda (-x, +w)
			x, y, w, h = boxes[sel]
			if x > 0:
				boxes[sel] = clamp_box((x - 1, y, w + 1, h))
		elif key in (2490368, 65362):  # Up arrow
			# expandir arriba
			x, y, w, h = boxes[sel]
			if y > 0:
				boxes[sel] = clamp_box((x, y - 1, w, h + 1))
		elif key in (2621440, 65364):  # Down arrow
			# expandir abajo
			x, y, w, h = boxes[sel]
			boxes[sel] = clamp_box((x, y, w, h + 1))
		elif key == ord('d'):  # contraer derecha
			x, y, w, h = boxes[sel]
			if w > 1:
				boxes[sel] = clamp_box((x, y, w - 1, h))
		elif key == ord('a'):  # contraer izquierda
			x, y, w, h = boxes[sel]
			if w > 1:
				boxes[sel] = clamp_box((x + 1, y, w - 1, h))
		elif key == ord('w'):  # contraer arriba
			x, y, w, h = boxes[sel]
			if h > 1:
				boxes[sel] = clamp_box((x, y + 1, w, h - 1))
		elif key == ord('s'):  # contraer abajo
			x, y, w, h = boxes[sel]
			if h > 1:
				boxes[sel] = clamp_box((x, y, w, h - 1))
		elif key in (8, 127):  # Backspace/Delete
			if boxes:
				boxes.pop(sel)
				sel = max(0, sel - 1)
		# Redibujar en el siguiente loop
	cv2.destroyWindow(win)
	return boxes

def build_mosaic_from_boxes(roi: np.ndarray, boxes, centered: bool, alpha_thr: int = 32, cols: int = 6):
	if not boxes:
		return rgba_to_bgr_preview(roi)
	segs = []
	max_w = 1
	max_h = 1
	for (bx, by, bw, bh) in boxes:
		seg = roi[by:by+bh, bx:bx+bw]
		if seg.shape[2] == 4:
			seg_rgba = seg.copy()
		else:
			bgr = seg
			mask = cv2.inRange(bgr, (255, 255, 255), (255, 255, 255))
			alpha = 255 - mask
			seg_rgba = cv2.merge([bgr[:, :, 0], bgr[:, :, 1], bgr[:, :, 2], alpha])
		if centered:
			seg_rgba, _, props = center_segment(seg_rgba, alpha_thr)
		else:
			props = find_content_props(seg_rgba, alpha_thr)
		segs.append((seg_rgba, props))
		h, w = seg_rgba.shape[:2]
		max_w = max(max_w, w)
		max_h = max(max_h, h)
	rows = int(np.ceil(len(segs) / cols))
	pad = 2
	tile_w = max_w
	tile_h = max_h
	mosaic = np.zeros((rows * (tile_h + pad) + pad, cols * (tile_w + pad) + pad, 3), dtype=np.uint8)
	mosaic[:] = (15, 15, 15)
	for idx, (seg_rgba, props) in enumerate(segs):
		r = idx // cols
		c = idx % cols
		x0 = pad + c * (tile_w + pad)
		y0 = pad + r * (tile_h + pad)
		seg_bgr = rgba_to_bgr_preview(seg_rgba)
		sh, sw = seg_bgr.shape[:2]
		# pegar centrado en el tile
		ox = x0 + (tile_w - sw) // 2
		oy = y0 + (tile_h - sh) // 2
		mosaic[oy:oy+sh, ox:ox+sw] = seg_bgr
		# Guías
		cx_i = x0 + tile_w // 2
		cy_i = y0 + tile_h // 2
		cv2.drawMarker(mosaic, (cx_i, cy_i), (0, 255, 255), markerType=cv2.MARKER_CROSS, markerSize=8, thickness=1)
		mask, bbox, centroid = props if isinstance(props, tuple) and len(props) == 3 else (None, None, None)
		if bbox is not None and centroid is not None:
			bx, by, bw, bh = bbox
			cv2.rectangle(mosaic, (ox + bx, oy + by), (ox + bx + bw, oy + by + bh), (0, 255, 0), 1)
			ccx, ccy = centroid
			cv2.circle(mosaic, (ox + int(round(ccx)), oy + int(round(ccy))), 2, (0, 0, 255), -1)
			cv2.arrowedLine(mosaic, (ox + int(round(ccx)), oy + int(round(ccy))), (cx_i, cy_i), (255, 0, 0), 1, tipLength=0.25)
	return mosaic

def interactive_preview_boxes(roi: np.ndarray, boxes):
	win = 'Paso 3: Vista previa (izq: original, der: centrado)'
	cv2.namedWindow(win)
	show_help(win, [
		"Paso 3 (recuadros): Vista previa en tiempo real.",
		"Izquierda: original | Derecha: centrado",
		"Controles:",
		"- Slider alpha_thr: ajusta qué se considera opaco",
		"- Enter/Espacio/S: confirmar y guardar",
		"- Esc/Q: cancelar y volver"
	])
	alpha_thr = 32
	cv2.createTrackbar('alpha_thr', win, alpha_thr, 255, lambda v: None)
	while True:
		alpha_thr = cv2.getTrackbarPos('alpha_thr', win)
		left = build_mosaic_from_boxes(roi, boxes, centered=False, alpha_thr=alpha_thr)
		right = build_mosaic_from_boxes(roi, boxes, centered=True, alpha_thr=alpha_thr)
		sep = np.full((max(left.shape[0], right.shape[0]), 2, 3), 60, dtype=np.uint8)
		# ajustar alturas si difieren
		def pad_to_h(img, h):
			if img.shape[0] == h:
				return img
			top = (h - img.shape[0]) // 2
			bottom = h - img.shape[0] - top
			return cv2.copyMakeBorder(img, top, bottom, 0, 0, cv2.BORDER_CONSTANT, value=(15,15,15))
		h = max(left.shape[0], right.shape[0])
		left = pad_to_h(left, h)
		right = pad_to_h(right, h)
		combo = np.hstack([left, sep, right])
		cv2.imshow(win, combo)
		key = cv2.waitKey(30) & 0xFF
		if key in (27, ord('q')):
			break
		if key in (13, 32, ord('s')):
			cv2.destroyWindow(win)
			return alpha_thr
	cv2.destroyWindow(win)
	return alpha_thr

while True:
	if len(refPt) == 2:
		x1, y1 = refPt[0]
		x2, y2 = refPt[1]
		x_min, x_max = min(x1, x2), max(x1, x2)
		y_min, y_max = min(y1, y2), max(y1, y2)
		roi = clone[y_min:y_max, x_min:x_max]
	else:
		print("No se seleccionó área.")
		exit()

	# Selección de recuadros independientes por personaje
	print("Dibuja recuadros para cada personaje dentro del área seleccionada.")
	boxes = select_person_boxes(roi)
	if boxes:
		alpha_thr_sel = interactive_preview_boxes(roi, boxes)
		resp = input("¿Guardar los recortes aplicando centrado? (s/n, otra tecla para ajustar área): ").strip().lower()
		if resp == 's':
			mode = 'boxes'
			break
	else:
		# Fallback a modo grilla si no se marcaron cajas
		print("No se definieron recuadros. Usando modo grilla (4x8).")
		rows, cols = 4, 8
		alpha_thr_sel = interactive_preview(roi, rows, cols)
		resp = input("¿Guardar los segmentos aplicando centrado? (s/n, otra tecla para ajustar área): ").strip().lower()
		if resp == 's':
			mode = 'grid'
			break

	# Repetir selección del área
	print("Vuelve a seleccionar el área en la ventana principal.")
	image = clone.copy()
	refPt = []
	cv2.namedWindow("image")
	cv2.setMouseCallback("image", click_and_crop)
	while True:
		cv2.imshow("image", image)
		key = cv2.waitKey(1) & 0xFF
		if key == ord("r"):
			image = clone.copy()
			refPt = []
		elif key == ord("c"):
			break
	cv2.destroyAllWindows()

os.makedirs(OUTPUT_DIR, exist_ok=True)

count = 0


# Si el JSON existe, cargarlo para conservar los campos personalizados
json_path = os.path.join(OUTPUT_DIR, "segmentos.json")
old_data = None
if os.path.exists(json_path):
	with open(json_path, "r", encoding="utf-8") as f:
		try:
			old_data = json.load(f)
		except Exception:
			old_data = None

segmentos_info = []

if 'mode' in locals() and mode == 'grid':
	rows, cols = 4, 8
	seg_height = roi.shape[0] // rows
	seg_width = roi.shape[1] // cols
	for i in range(rows):
		for j in range(cols):
			x = j * seg_width
			y = i * seg_height
			seg = roi[y:y+seg_height, x:x+seg_width]
			seg_path = os.path.join(OUTPUT_DIR, f"segmento_{count+1}.png")
			# Asegurar canal alfa
			if seg.shape[2] == 4:
				seg_rgba = seg
			else:
				bgr = seg
				mask = cv2.inRange(bgr, (255, 255, 255), (255, 255, 255))
				alpha = 255 - mask  # blanco -> 0, resto -> 255
				seg_rgba = cv2.merge([bgr[:, :, 0], bgr[:, :, 1], bgr[:, :, 2], alpha])
			seg_centered, (dx, dy), _ = center_segment(seg_rgba, alpha_thr=alpha_thr_sel)
			cv2.imwrite(seg_path, seg_centered)
			# Buscar datos previos si existen
			datos_previos = {}
			if old_data:
				for item in old_data:
					if item.get("nombre") == f"segmento_{count+1}":
						datos_previos = item
						break
			segmento = {
				"nombre": f"segmento_{count+1}",
				"x": int(x),
				"y": int(y),
				"width": int(seg_width),
				"height": int(seg_height),
				"imagen": seg_path.replace("\\", "/")
			}
			for campo in ["perfil", "xCuenta", "discord", "vgen", "kofi", "youtube"]:
				segmento[campo] = datos_previos.get(campo, "")
			segmentos_info.append(segmento)
			count += 1
else:
	# Modo recuadros independientes
	for (bx, by, bw, bh) in boxes:
		seg = roi[by:by+bh, bx:bx+bw]
		seg_path = os.path.join(OUTPUT_DIR, f"segmento_{count+1}.png")
		if seg.shape[2] == 4:
			seg_rgba = seg
		else:
			bgr = seg
			mask = cv2.inRange(bgr, (255, 255, 255), (255, 255, 255))
			alpha = 255 - mask
			seg_rgba = cv2.merge([bgr[:, :, 0], bgr[:, :, 1], bgr[:, :, 2], alpha])
		seg_centered, (dx, dy), _ = center_segment(seg_rgba, alpha_thr=alpha_thr_sel)
		cv2.imwrite(seg_path, seg_centered)
		datos_previos = {}
		if old_data:
			for item in old_data:
				if item.get("nombre") == f"segmento_{count+1}":
					datos_previos = item
					break
		segmento = {
			"nombre": f"segmento_{count+1}",
			"x": int(bx),
			"y": int(by),
			"width": int(bw),
			"height": int(bh),
			"imagen": seg_path.replace("\\", "/")
		}
		for campo in ["perfil", "xCuenta", "discord", "vgen", "kofi", "youtube"]:
			segmento[campo] = datos_previos.get(campo, "")
		segmentos_info.append(segmento)
		count += 1

# Guardar coordenadas en JSON
with open(json_path, "w", encoding="utf-8") as f:
	json.dump(segmentos_info, f, indent=4, ensure_ascii=False)

print(f"Segmentos guardados en la carpeta '{OUTPUT_DIR}'. Total: {count}")
print(f"Coordenadas exportadas a '{json_path}'")
