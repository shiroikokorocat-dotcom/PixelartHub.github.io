// Nubes pixelart animadas en el fondo
window.addEventListener('DOMContentLoaded', () => {
    // Ajustes de layout para móviles (pantallas largas)
    function ajustarInfoPanelMovil() {
        if (!infoPanel) return;
        const isMovil = isMovilAspect();
        if (isMovil) {
            // Layout principal: fila con dos columnas (izquierda y derecha)
            if (infoPanel) {
                infoPanel.style.display = 'flex';
                infoPanel.style.flexDirection = 'row';
                infoPanel.style.justifyContent = 'space-between';
                infoPanel.style.alignItems = 'stretch';
                infoPanel.style.gap = '16px';
            }
            // Sección izquierda: review, paleta, stats
            const infoLeft = document.querySelector('.info-left');
            if (infoLeft) {
                infoLeft.style.display = 'flex';
                infoLeft.style.flexDirection = 'column';
                infoLeft.style.alignItems = 'stretch';
                infoLeft.style.gap = '12px';
                // Permitir contracción sin desbordar, dejando que el grid/flex calcule el ancho
                infoLeft.style.flex = '1 1 0';
                infoLeft.style.maxWidth = '';
                infoLeft.style.minWidth = '0';
                // Reubicar stats debajo de la paleta
                if (statsEl && statsEl.parentElement !== infoLeft) {
                    const after = paletteWrap && paletteWrap.parentElement === infoLeft ? paletteWrap.nextSibling : null;
                    if (after) infoLeft.insertBefore(statsEl, after);
                    else infoLeft.appendChild(statsEl);
                }
            }
            if (segmentPreview) {
                segmentPreview.style.width = '100%';
                segmentPreview.style.maxWidth = '100%';
                segmentPreview.style.height = 'auto';
                segmentPreview.style.marginBottom = '8px';
            }
            if (paletteWrap) {
                paletteWrap.style.width = '100%';
                paletteWrap.style.maxWidth = '100%';
                paletteWrap.style.marginBottom = '8px';
            }
            if (statsEl) {
                statsEl.style.display = 'block';
                statsEl.style.width = '100%';
                statsEl.style.marginBottom = '0';
            }
            // Sección derecha: pfp, nombre, redes sociales
            const infoRight = document.querySelector('.info-right');
            if (infoRight) {
                infoRight.style.display = 'flex';
                infoRight.style.flexDirection = 'column';
                infoRight.style.alignItems = 'flex-start';
                infoRight.style.gap = '12px';
                infoRight.style.flex = '2 1 0';
            }
            if (pfpImage) {
                pfpImage.style.width = '128px';
                pfpImage.style.height = '128px';
                pfpImage.style.marginBottom = '8px';
            }
            if (nombreElem) {
                nombreElem.style.fontSize = '2.2em';
                nombreElem.style.marginTop = '0';
                nombreElem.style.marginBottom = '8px';
            }
            const socialWrap = document.getElementById('social-links');
            if (socialWrap) {
                socialWrap.style.marginTop = '8px';
                socialWrap.style.fontSize = '1.3em';
                socialWrap.style.display = 'block';
                socialWrap.style.textAlign = 'left';
            }
        } else {
            // Restablecer estilos si no es móvil
            if (infoPanel) {
                infoPanel.style.display = '';
                infoPanel.style.flexDirection = '';
                infoPanel.style.justifyContent = '';
                infoPanel.style.alignItems = '';
                infoPanel.style.gap = '';
            }
            // Restaurar .info-right al grid por defecto (se pudo quedar en flex)
            const infoRight = document.querySelector('.info-right');
            if (infoRight) {
                infoRight.style.display = '';
                infoRight.style.flexDirection = '';
                infoRight.style.alignItems = '';
                infoRight.style.gap = '';
                infoRight.style.flex = '';
            }
            // Restaurar .info-left a sus estilos por defecto
            const infoLeft = document.querySelector('.info-left');
            if (infoLeft) {
                infoLeft.style.display = '';
                infoLeft.style.flexDirection = '';
                infoLeft.style.alignItems = '';
                infoLeft.style.gap = '';
                infoLeft.style.flex = '';
            }
            // Regresar stats a la columna derecha antes de la sección meta
            const meta = infoRight ? infoRight.querySelector('.meta') : null;
            if (statsEl && infoRight && statsEl.parentElement !== infoRight) {
                if (meta) infoRight.insertBefore(statsEl, meta);
                else infoRight.appendChild(statsEl);
            }
            if (pfpImage) {
                pfpImage.style.width = '';
                pfpImage.style.height = '';
            }
            if (nombreElem) {
                nombreElem.style.fontSize = '';
                nombreElem.style.marginTop = '';
                nombreElem.style.marginBottom = '';
            }
            if (statsEl) {
                // limpiar estilos inline para que el grid y el CSS tomen control
                statsEl.style.display = '';
                statsEl.style.width = '';
                statsEl.style.marginBottom = '';
            }
            if (segmentPreview) {
                segmentPreview.style.width = '';
                segmentPreview.style.maxWidth = '';
                segmentPreview.style.height = '';
                segmentPreview.style.marginBottom = '';
            }
            if (paletteWrap) {
                paletteWrap.style.display = '';
                paletteWrap.style.flexDirection = '';
                paletteWrap.style.alignItems = '';
                paletteWrap.style.width = '';
                paletteWrap.style.marginBottom = '';
            }
            const socialWrap = document.getElementById('social-links');
            if (socialWrap) {
                socialWrap.style.marginTop = '';
                socialWrap.style.fontSize = '';
                socialWrap.style.display = '';
                socialWrap.style.textAlign = '';
            }
        }
        // Ajustar tamaño de sprites en la página principal según alto disponible
        if (typeof ajustarSpritesPaginaPrincipal === 'function') {
            ajustarSpritesPaginaPrincipal();
        }
    }
    window.addEventListener('resize', ajustarInfoPanelMovil);
    window.addEventListener('DOMContentLoaded', ajustarInfoPanelMovil);
    // Unificar onload: no sobreescribir más abajo
    window.addEventListener('load', () => {
        cargarSegmentos();
        ajustarInfoPanelMovil();
    });
// Ajustar tamaño de sprites en la página principal según alto disponible (solo móviles)
function ajustarSpritesPaginaPrincipal() {
    const isMovil = isMovilAspect();
    if (!isMovil) return;
    // Buscar todos los sprites principales
    const spriteElems = document.querySelectorAll('.sprite-main');
    if (!spriteElems.length) return;
    // Calcular tamaño ideal según alto disponible
    const vh = window.innerHeight;
    let ideal = Math.max(32, Math.floor(vh * 0.12)); // 12% del alto
    spriteElems.forEach(el => {
        el.style.width = ideal + 'px';
        el.style.height = ideal + 'px';
    });
}
    const nubesCanvas = document.getElementById('nubes-canvas');
    if (!nubesCanvas) return;
    nubesCanvas.width = window.innerWidth;
    nubesCanvas.height = window.innerHeight;
    const ctx = nubesCanvas.getContext('2d');


    // Detectar modo debug solo si la URL contiene '?debug=1'
    var debugMode = window.location.search.includes('debug=1');
    // Definir 4 tipos de nubes pixelart
    const nubePixelTypes = [
        [ // Tipo 1
            [1,1,1,1,1,1],
            [0,1,1,1,1,0],
            [0,0,0,0,0,0]
        ],
        [ // Tipo 2
            [1,1,0,0],
            [1,1,0,0],
            [0,0,1,1],
            [0,0,1,1]
        ],
        [ // Tipo 3
            [0,0,1,1,1,0,0],
            [0,1,1,1,1,1,0],
            [1,1,1,1,1,1,1],
            [0,1,1,1,1,1,0],
            [0,0,1,1,1,0,0]
        ],
        [ // Tipo 4
            [0,0,0,1,0],
            [0,1,1,1,1],
            [1,1,1,1,1],
            [0,1,1,1,0]
        ]
    ];
    const nubeColor = '#fff';
    const pixelSize = 8;


    // Generar nubes con posiciones, velocidades y tipo aleatorio
    const nubes = [];
    const maxNubes = 8;
    let nubeTimer = 0;
    let nubeInterval = 180; // frames entre aparición de nubes (más alto = menos frecuente)
    for (let i = 0; i < 4; i++) {
        const tipo = Math.floor(Math.random() * nubePixelTypes.length);
        nubes.push({
            x: Math.random() * nubesCanvas.width,
            y: 20 + Math.random() * (nubesCanvas.height * 0.7),
            speed: 0.12 + Math.random() * 0.18,
            size: pixelSize * (1 + Math.floor(Math.random()*2)), // 8 o 16
            tipo: tipo
        });
    }

    function dibujarNube(nube) {
        const nubePixel = nubePixelTypes[nube.tipo];
        // Dibuja solo la nube principal (sin sombra)
        for (let py = 0; py < nubePixel.length; py++) {
            for (let px = 0; px < nubePixel[py].length; px++) {
                if (nubePixel[py][px]) {
                    ctx.fillStyle = nubeColor;
                    ctx.fillRect(
                        nube.x + px * nube.size,
                        nube.y + py * nube.size,
                        nube.size,
                        nube.size
                    );
                }
            }
        }
    }

    function animarNubes() {
        ctx.clearRect(0, 0, nubesCanvas.width, nubesCanvas.height);
        nubes.forEach(nube => {
            dibujarNube(nube);
            nube.x += nube.speed;
        });
        // Eliminar nubes que salieron de pantalla
        for (let i = nubes.length - 1; i >= 0; i--) {
            const nube = nubes[i];
            const nubePixel = nubePixelTypes[nube.tipo];
            const nubeWidth = nubePixel[0].length * nube.size;
            if (nube.x > nubesCanvas.width) {
                nubes.splice(i, 1);
            }
        }
        // Añadir nuevas nubes en bucle con ritmo lento
        nubeTimer++;
        if (nubeTimer >= nubeInterval && nubes.length < maxNubes) {
            nubeTimer = 0;
            const tipo = Math.floor(Math.random() * nubePixelTypes.length);
            const size = pixelSize * (1 + Math.floor(Math.random()*2)); // 8 o 16
            const nubePixel = nubePixelTypes[tipo];
            const nubeWidth = nubePixel[0].length * size;
            nubes.push({
                x: -nubeWidth,
                y: 20 + Math.random() * (nubesCanvas.height * 0.7),
                speed: 0.12 + Math.random() * 0.18,
                size: size,
                tipo: tipo
            });
        }
        requestAnimationFrame(animarNubes);
    }
    animarNubes();
    window.addEventListener('resize', () => {
        nubesCanvas.width = window.innerWidth;
        nubesCanvas.height = window.innerHeight;
    });
});


const infoPanel = document.getElementById('info-panel');
const panelCloseBtn = document.getElementById('panel-close');
const nombreElem = document.getElementById('personaje-nombre');
const xElem = document.getElementById('personaje-x');
const statsEl = document.getElementById('stats');
const discordElem = document.getElementById('personaje-discord');
const imageUpload = document.getElementById('image-upload');
const userImage = document.getElementById('user-image');
const segmentPreview = document.getElementById('segment-preview');
const pfpImage = document.getElementById('pfp-image');
const linkX = document.getElementById('link-x');
const linkBluesky = document.getElementById('link-bluesky');
const linkVgen = document.getElementById('link-vgen');
const linkKofi = document.getElementById('link-kofi');
const linkYoutube = document.getElementById('link-youtube');
const linkTwitch = document.getElementById('link-twitch');
const linkPortfolio = document.getElementById('link-portfolio');
const paletteWrap = document.getElementById('palette');
const paletteSwatches = document.getElementById('color-palette');
// Etiquetas visibles a la izquierda del link
if (linkX) linkX.dataset.site = 'X';
if (linkBluesky) linkBluesky.dataset.site = 'BS';
if (linkVgen) linkVgen.dataset.site = 'VG';
if (linkKofi) linkKofi.dataset.site = 'KF';
if (linkYoutube) linkYoutube.dataset.site = 'YT';
if (linkTwitch) linkTwitch.dataset.site = 'TTV';
if (linkPortfolio) linkPortfolio.dataset.site = 'PF';

// Imagen transparente 1x1 para evitar icono de imagen rota
const BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

// Confirmación antes de abrir un enlace externo
function attachConfirm(linkEl) {
    if (!linkEl) return;
    linkEl.addEventListener('click', (e) => {
        const href = linkEl.getAttribute('href');
        if (!href) return;
        // mensaje simple de confirmación
        const site = linkEl.dataset.site || 'el sitio externo';
        const msg = `Se abrirá ${site}:\n${href}\n\n¿Deseas continuar?`;
        const ok = window.confirm(msg);
        if (!ok) {
            e.preventDefault();
            e.stopPropagation();
        } else {
            window.SFX?.play('clickA', 0.4);
        }
        // si acepta, el link con target=_blank abrirá nueva pestaña por defecto
    });
}
attachConfirm(linkX);
attachConfirm(linkBluesky);
attachConfirm(linkVgen);
attachConfirm(linkKofi);
attachConfirm(linkYoutube);
attachConfirm(linkTwitch);
attachConfirm(linkPortfolio);

// Utilidad: ajustar el tamaño del nombre para que sea lo más grande posible sin romper el layout
function fitNameToHeader(attempt = 0) {
    if (!nombreElem) return;
    const header = nombreElem.closest('.header');
    if (!header) return;
    // Si el panel o el header aún no son medibles (display:none), reintentar pronto
    const MAX_ATTEMPTS = 5;
    if ((header.offsetParent === null || header.clientWidth === 0) && attempt < MAX_ATTEMPTS) {
        requestAnimationFrame(() => fitNameToHeader(attempt + 1));
        return;
    }
    // Usar ancho disponible del header
    // margen de seguridad para evitar corte visual por contornos/bordes
    const SAFETY = 6; // px coincide con padding-right
    const available = Math.max(0, header.clientWidth - SAFETY);
    // límites desde CSS variables
    const panel = document.getElementById('info-panel');
    const minPx = parseFloat(getComputedStyle(panel).getPropertyValue('--name-min-px')) || 12;
    const maxPx = parseFloat(getComputedStyle(panel).getPropertyValue('--name-max-px')) || 34;
    const twoLineThreshold = parseFloat(getComputedStyle(panel).getPropertyValue('--name-two-line-threshold-px')) || 18;
    // búsqueda binaria para encontrar el mayor tamaño que quepa
    let lo = minPx, hi = maxPx, best = minPx;
    const measure = (sz) => {
        nombreElem.style.fontSize = sz + 'px';
        // medir en una línea estricta
        nombreElem.classList.remove('two-line');
        nombreElem.style.whiteSpace = 'nowrap';
        // forzar reflow
        void nombreElem.offsetWidth;
        return nombreElem.scrollWidth <= available;
    };
    // inicio con tamaño inicial si ayuda a converger
    const init = parseFloat(getComputedStyle(panel).getPropertyValue('--name-initial-px')) || Math.min(28, maxPx);
    nombreElem.style.fontSize = Math.min(init, maxPx) + 'px';
    // búsqueda binaria clásica
    for (let i = 0; i < 12; i++) {
        const mid = Math.floor((lo + hi) / 2);
        if (measure(mid)) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    nombreElem.style.fontSize = best + 'px';
    // Si quedó demasiado pequeño, permitir dos líneas y reintentar ajuste para aprovechar más alto
    if (best <= twoLineThreshold) {
        nombreElem.classList.add('two-line');
        nombreElem.style.whiteSpace = '';
        // con dos líneas, podemos aumentar un poco dentro del maximo
        // re-evaluar con ancho del header y altura de dos líneas implícita
        lo = best; hi = maxPx; // partir desde el tamaño ya hallado
        for (let i = 0; i < 8; i++) {
            const mid = Math.floor((lo + hi) / 2);
            nombreElem.style.fontSize = mid + 'px';
            // permitir 2 líneas: comprobar si el bloque no desborda el ancho (con margen) al menos a nivel de caja
            void nombreElem.offsetWidth;
            const fitsWidth = nombreElem.scrollWidth <= (header.clientWidth - SAFETY);
            if (fitsWidth) { lo = mid + 1; best = mid; } else { hi = mid - 1; }
        }
        nombreElem.style.fontSize = best + 'px';
    } else {
        nombreElem.classList.remove('two-line');
    }
}

let segmentos = [];
let segmentoElems = [];
let highlightElem = null;
// Cooldown por sprite para sonido de hover
const hoverSoundCooldowns = Object.create(null);
const HOVER_SOUND_COOLDOWN_MS = 100;
// Cooldown global para todos los sonidos de la ventana principal
let lastGlobalSfxTime = 0;
const GLOBAL_SFX_COOLDOWN_MS = 40;
let isLocked = false; // selección fijada mediante click
let lockedIdx = null; // índice del segmento fijado
let currentIdx = null; // índice actualmente resaltado
let skipNextDocUnlock = false; // evita desbloquear por el mismo click que bloquea
// índice del área (hitbox) actualmente bajo el cursor para controlar aperturas repetidas
let hoverIdx = null;
// Control de animación del panel para evitar condiciones de carrera entre ocultar/mostrar
let panelAnimToken = 0;
let hideTimerId = null;
// Timers y banderas para estabilizar hover (zona combinada trigger+panel)
let hoverOpenTimerId = null;
let hoverCloseTimerId = null;
let lastHoverIdxForOpen = null;
let overPanel = false;
// Delays ajustables para sensación de rapidez
const HOVER_OPEN_DELAY = 16;   // antes 50ms
const HOVER_CLOSE_DELAY = 110; // antes 150ms
const PANEL_INTERACT_ENABLE_DELAY = 30; // antes 80ms
// límite base de alto de sprite y valores del preview
const BASE_SPRITE_VH = 40; // fallback para escritorio u otros casos
const PREVIEW_MAX_SPRITE_HO = 20; // porcentaje horizontal ideal (vw)
const PREVIEW_MAX_SPRITE_VH = 16; // porcentaje vertical ideal (vh)

// Umbral de relación de aspecto para considerar "modo móvil" (pantalla alta)
const MOBILE_ASPECT_THRESHOLD = 1.6; // h > w * numero

// Valor dinámico para el alto máximo del sprite (vh) según viewport en móvil
let CURRENT_SPRITE_VH = BASE_SPRITE_VH;
function computeDynamicSpriteVH() {
    const w = window.innerWidth || 0;
    const h = window.innerHeight || 0;
    const isMovil = h > w * MOBILE_ASPECT_THRESHOLD; // criterio de pantalla "alta"
    if (!isMovil) return BASE_SPRITE_VH;
    // Mapear altura de ventana a un rango mayor en móvil para sprites más grandes
    // Anteriormente: 38..56; ahora: 48..64 (el grid móvil capeará a ~58vh)
    const minH = 560;  // a ~560px empieza a crecer
    const maxH = 1200; // a 1200px alcanza el tope
    const tRaw = (h - minH) / (maxH - minH);
    const t = Math.max(0, Math.min(1, tRaw));
    const minVH = 56, maxVH = 64;
    return Math.round(minVH + t * (maxVH - minVH));
}
function updateDynamicSpriteCaps() {
    CURRENT_SPRITE_VH = computeDynamicSpriteVH();
    document.documentElement.style.setProperty('--sprite-max-vh', `${CURRENT_SPRITE_VH}vh`);
}
// Propagar caps iniciales a CSS
updateDynamicSpriteCaps();
document.documentElement.style.setProperty('--preview-max-vh', `${PREVIEW_MAX_SPRITE_VH}vh`);
document.documentElement.style.setProperty('--preview-max-vw', `${PREVIEW_MAX_SPRITE_HO}vw`);
let resizeRebuildTimer = null;

// Helper: detectar modo móvil por relación de aspecto (pantalla alta)
function isMovilAspect() {
    return (window.innerHeight || 0) > (window.innerWidth || 0) * MOBILE_ASPECT_THRESHOLD;
}

// Utilidad: ¿el nodo B está dentro de A?
function within(root, el) {
    return !!(root && el) && (root === el || root.contains(el));
}

function updateSafeZone() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    const isVisible = !infoPanel.classList.contains('hidden');
    if (isVisible) {
        // Reservar espacio inferior igual a la altura del panel + margen
        const h = infoPanel.offsetHeight || 0;
        container.style.marginBottom = (h + 16) + 'px';
    } else {
        container.style.marginBottom = '0px';
    }
}

function cargarSegmentos() {
    fetch('assets/segmentos/segmentos.json')
        .then(res => res.json())
        .then(data => {
            segmentos = data;
            // Exponer globalmente para utilidades externas (p.ej., PFP volador)
            try { window.segmentos = data; } catch {}
            mostrarSegmentos();
        })
        .catch(err => {
            console.error('No se pudo cargar segmentos.json:', err);
        });
}

function mostrarSegmentos() {
    const container = document.getElementById('canvas-container');
    container.innerHTML = '';
    segmentoElems = [];
    // Configuración de retícula uniforme (responsive)
    const MAX_COLS = 20;   // máximo extendido
    const gap = 8;         // separación entre celdas
    const maxW = Math.max(...segmentos.map(s => s.width));
    const maxH = Math.max(...segmentos.map(s => s.height));
    const GROUND_H = 12;   // altura del piso (pasto + tierra)
    // Calcular escala por altura de ventana usando valor dinámico (vh)
    const maxPx = Math.max(1, Math.floor(window.innerHeight * (CURRENT_SPRITE_VH / 100)));
    let cellW = 1, cellH = 1; // basados en dimensiones ESCALADAS
    {
        let maxScaledW = 1, maxScaledH = 1;
        for (const s of segmentos) {
            const scale = Math.min(1, maxPx / Math.max(1, s.height));
            const sw = Math.max(1, Math.round(s.width * scale));
            const sh = Math.max(1, Math.round(s.height * scale));
            if (sw > maxScaledW) maxScaledW = sw;
            if (sh > maxScaledH) maxScaledH = sh;
        }
        cellW = maxScaledW;
        cellH = maxScaledH + GROUND_H;
    }
    // En móvil: priorizar ajuste vertical del grid
    const isMovil = isMovilAspect();
    let columnas = 1;
    let filas = 1;
    if (isMovil) {
    // Altura máxima del grid 60vh (tope solicitado)
    const MAX_GRID_VH = 60;
        const MAX_GRID_PX = Math.max(1, Math.floor(window.innerHeight * (MAX_GRID_VH / 100)));
        // Asegurar que una fila quepa: limitar maxPx si fuera necesario (cellH = min(maxH, maxPx) + GROUND_H)
        const capPxForGrid = Math.max(1, MAX_GRID_PX - GROUND_H);
        const maxPxMobile = Math.min(maxPx, capPxForGrid);
        // Recalcular cellW/cellH con el cap para determinar filas/columnas
        let maxScaledW2 = 1, maxScaledH2 = 1;
        for (const s of segmentos) {
            const scale2 = Math.min(1, maxPxMobile / Math.max(1, s.height));
            const sw2 = Math.max(1, Math.round(s.width * scale2));
            const sh2 = Math.max(1, Math.round(s.height * scale2));
            if (sw2 > maxScaledW2) maxScaledW2 = sw2;
            if (sh2 > maxScaledH2) maxScaledH2 = sh2;
        }
        const cellW2 = maxScaledW2;
        const cellH2 = maxScaledH2 + GROUND_H;
        // Máximo de filas que caben en el alto permitido
        const filasMax = Math.max(1, Math.floor((MAX_GRID_PX + gap) / (cellH2 + gap)));
        filas = filasMax; // usar el máximo posible para reducir columnas y respetar altura
        columnas = Math.max(1, Math.ceil(segmentos.length / filas));
        // Aplicar dimensiones basadas en cellW2/child count
        cellW = cellW2;
        cellH = cellH2;
        // Permitir scroll horizontal si el ancho excede la pantalla
        container.style.overflowX = 'auto';
        container.style.maxWidth = '100vw';
        container.style.overflowY = 'hidden';
        // Nota: altura real del contenedor se fijará debajo usando filas*cellH para no superar el tope
    } else {
        // Escritorio: priorizar ajuste horizontal como antes
        const availW = Math.max(1, window.innerWidth - 24); // margen de seguridad
        const canFit = Math.floor((availW + gap) / (cellW + gap));
        columnas = Math.min(MAX_COLS, Math.max(1, canFit));
        if (canFit >= 2) columnas = Math.max(2, Math.min(MAX_COLS, canFit));
        filas = Math.ceil(segmentos.length / columnas);
        container.style.overflowX = '';
        container.style.maxWidth = '';
        container.style.overflowY = '';
    }

    // Dimensiones del contenedor y centrado en móvil si cabe
    container.style.position = 'relative';
    const gridWTotal = (columnas * (cellW + gap) - gap);
    if (isMovil) {
        const vw = window.innerWidth || document.documentElement.clientWidth || 0;
        if (gridWTotal <= vw) {
            // Si el grid es más angosto que la pantalla, centrarlo
            container.style.width = gridWTotal + 'px';
            container.style.maxWidth = '100vw';
            container.style.marginLeft = 'auto';
            container.style.marginRight = 'auto';
            container.style.overflowX = 'hidden';
        } else {
            // Si es más ancho, usar 100vw y permitir scroll horizontal
            container.style.width = '100vw';
            container.style.maxWidth = '100vw';
            container.style.marginLeft = '0';
            container.style.marginRight = '0';
            container.style.overflowX = 'auto';
        }
    } else {
        container.style.width = gridWTotal + 'px';
        container.style.marginLeft = '';
        container.style.marginRight = '';
    }
    // limitar altura en móvil para no exceder ~58vh
    if (isMovil) {
        const MAX_GRID_VH = 60;
        const MAX_GRID_PX = Math.max(1, Math.floor(window.innerHeight * (MAX_GRID_VH / 100)));
        const desiredH = (filas * (cellH + gap) - gap);
        // overflowX configurado arriba según anchura relativa
        container.style.overflowY = 'hidden';
        container.style.height = Math.min(desiredH, MAX_GRID_PX) + 'px';
    } else {
        container.style.height = (filas * (cellH + gap) - gap) + 'px';
        container.style.overflow = 'hidden';
    }

    // Si el cursor sale del contenedor, ocultar info si no está bloqueado
    // pero NO si el puntero entra al panel de información
    container.addEventListener('pointerleave', (e) => {
        if (isLocked) return;
        if (within(infoPanel, e.relatedTarget)) return; // se movió al panel, mantener
        hoverIdx = null;
        quitarResaltado();
    });

    const HITBOX_PAD = 10; // expansión invisible de la zona interactiva
    segmentos.forEach((segmento, idx) => {
        // Crear piso de tierra y pasto por celda
        const fila = Math.floor(idx / columnas);
        const col = idx % columnas;
        const baseLeft = col * (cellW + gap);
        const baseTop = fila * (cellH + gap);

        const ground = document.createElement('div');
        ground.className = 'ground';
        ground.style.position = 'absolute';
        ground.style.left = baseLeft + 'px';
    ground.style.top = (baseTop + (cellH - GROUND_H)) + 'px';
        ground.style.width = cellW + 'px';
        ground.style.height = GROUND_H + 'px';
        ground.style.pointerEvents = 'none';
    ground.style.zIndex = '1';
        // Crear 1-2 matas de pasto pequeñas dentro del piso
        const grassCount = 1 + Math.floor(Math.random() * 2); // 1 a 2
        for (let g = 0; g < grassCount; g++) {
            const tuft = document.createElement('div');
            tuft.className = 'grass-tuft';
            tuft.style.left = (baseLeft + Math.floor(Math.random() * (cellW - 8)) + 4) + 'px';
            tuft.style.top = (baseTop + (cellH - GROUND_H) - 2 - Math.floor(Math.random()*2)) + 'px'; // ligeramente sobre el borde del pasto
            tuft.style.zIndex = '2';
            container.appendChild(tuft);
        }
        // Crear ondulaciones de pasto que “caen” sobre la tierra (menos frecuentes: 1 a 3 por celda)
        const overhangs = 3 + Math.floor(Math.random()*3);
        for (let k = 0; k < overhangs; k++) {
            const oh = document.createElement('div');
            oh.className = 'grass-overhang';
            const x = baseLeft + 2 + Math.floor(Math.random() * (cellW - 4));
            // Priorizar hebras cortas (2-5 px) con sesgo hacia lo corto
            const offsetDown = 2 + Math.floor(Math.random() * 2); // 2-3 px por debajo del borde del pasto
            let len = 4 + Math.floor(Math.pow(Math.random(), 1.7) * 4); // 2-5 px, sesgo a valores bajos
            len = Math.min(len, Math.max(1, GROUND_H - offsetDown));
            oh.style.left = x + 'px';
            oh.style.top = (baseTop + (cellH - GROUND_H) + offsetDown) + 'px';
            oh.style.height = len + 'px';
            // Tonos variados de verdes claros (similares al pasto)
            const lightGreens = ['#66bb6a', '#4caf50', '#81c784', '#8bc34a', '#9ccc65', '#7cb342', '#6fbf73'];
            const color = lightGreens[Math.floor(Math.random() * lightGreens.length)];
            oh.style.backgroundColor = color;
            oh.style.zIndex = '2';
            container.appendChild(oh);
        }
        // Crear 0-1 flor pixelada con color aleatorio
        const flowerCount = Math.floor(Math.random() * 2); // 0 o 1
        if (flowerCount === 1) {
            const flower = document.createElement('div');
            flower.className = 'flower';
            const colors = ['#ffd54f', '#ffffff', '#64b5f6', '#ef5350']; // amarillo, blanco, azul, rojo
            const color = colors[Math.floor(Math.random() * colors.length)];
            flower.style.setProperty('--fl', color);
            flower.style.left = (baseLeft + Math.floor(Math.random() * (cellW - 8)) + 4) + 'px';
            flower.style.top = (baseTop + (cellH - GROUND_H) - 4 - Math.floor(Math.random()*2)) + 'px'; // justo en el borde superior del pasto
            flower.style.zIndex = '2';
            container.appendChild(flower);
        }

        // Piedras en el piso (máximo 1 por celda)
        // 70% sin piedra, 30% exactamente una piedra por piso
        const spawnStoneAt = (el) => {
            const x = baseLeft + 2 + Math.floor(Math.random() * (cellW - 4));
            const yTop = baseTop + (cellH - GROUND_H);
            const y = yTop + 1 + Math.floor(Math.random() * Math.max(1, GROUND_H - 3));
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.zIndex = '2';
            container.appendChild(el);
        };
        if (Math.random() < 0.30) {
            // Distribución cuando aparece: 80% grises, 10% az/na, 7% ro/ve, 2.99% diamante, 0.01% multicolor
            const r = Math.random() * 100;
            if (r < 0.01) {
                const st = document.createElement('div');
                st.className = 'stone multi';
                const h = () => Math.floor(Math.random() * 360);
                const snt = () => 70 + Math.floor(Math.random() * 20);
                const lgt = () => 50 + Math.floor(Math.random() * 12);
                st.style.setProperty('--c1', `hsl(${h()} ${snt()}% ${lgt()}%)`);
                st.style.setProperty('--c2', `hsl(${h()} ${snt()}% ${lgt()}%)`);
                st.style.setProperty('--c3', `hsl(${h()} ${snt()}% ${lgt()}%)`);
                st.style.setProperty('--c4', `hsl(${h()} ${snt()}% ${lgt()}%)`);
                st.style.setProperty('--c5', `hsl(${h()} ${snt()}% ${lgt()}%)`);
                spawnStoneAt(st);
            } else if (r < 0.01 + 2.99) {
                const st = document.createElement('div');
                st.className = 'stone diamond';
                st.style.setProperty('--di', '#cfe9ff');
                spawnStoneAt(st);
            } else if (r < 0.01 + 2.99 + 7) {
                const st = document.createElement('div');
                st.className = 'stone';
                const colors = ['#b64646', '#5aa85a'];
                st.style.setProperty('--st', colors[Math.floor(Math.random() * colors.length)]);
                spawnStoneAt(st);
            } else if (r < 0.01 + 2.99 + 7 + 10) {
                const st = document.createElement('div');
                st.className = 'stone';
                const colors = ['#4f7ca6', '#e59a3a'];
                st.style.setProperty('--st', colors[Math.floor(Math.random() * colors.length)]);
                spawnStoneAt(st);
            } else {
                const st = document.createElement('div');
                st.className = 'stone';
                const grays = ['#5e5e5e', '#6f6f6f', '#7f7f7f', '#8d8d8d', '#9a9a9a'];
                st.style.setProperty('--st', grays[Math.floor(Math.random() * grays.length)]);
                spawnStoneAt(st);
            }
        }

    const img = document.createElement('img');
        // Asegura la ruta relativa a assets/segmentos
        let imgSrc = (segmento.imagen || '').toString().replace(/\\/g, '/');
        if (!/^https?:\/\//i.test(imgSrc)) {
            const file = imgSrc.split('/').pop();
            if (!imgSrc.startsWith('assets/segmentos/')) {
                imgSrc = 'assets/segmentos/' + file;
            }
        }
        // Marcar estado de carga para evitar icono roto y resalto cuando no hay imagen
        img.dataset.loaded = '0';
        img.dataset.blank = '0';
    // oculto inicial para evitar parpadeo hasta onload
    img.classList.add('hidden');
        img.onload = () => {
            if (img.dataset.blank !== '1') {
                img.dataset.loaded = '1';
                img.classList.remove('hidden');
            }
        };
        img.onerror = () => {
            // Ocultar la imagen rota y reemplazar src por transparente para no mostrar icono de archivo roto
            img.dataset.loaded = '0';
            img.dataset.blank = '1';
            img.classList.add('hidden');
            img.src = BLANK_IMG;
        };
        img.src = imgSrc;
        img.alt = segmento.nombre;
        // Calcular escala para limitar altura al porcentaje de la ventana
    const scale = Math.min(1, maxPx / Math.max(1, segmento.height));
        const scaledW = Math.max(1, Math.round(segmento.width * scale));
        const scaledH = Math.max(1, Math.round(segmento.height * scale));
        img.style.width = scaledW + 'px';
        img.style.height = scaledH + 'px';
    img.style.position = 'absolute';
        img.style.pointerEvents = 'none'; // eventos pasan a la hitbox
    img.style.zIndex = '3'; // por encima del piso
    // Mejor nitidez al escalar pixelart
    img.style.imageRendering = 'pixelated';
    // Posición en retícula: centrar horizontalmente y apoyar los pies en el piso
    const offsetX = Math.floor((cellW - scaledW) / 2);
    const offsetY = Math.max(0, (maxH - scaledH)); // top = baseTop + (maxH - hEscalado)
        img.style.left = (baseLeft + offsetX) + 'px';
        img.style.top = (baseTop + offsetY) + 'px';
        img.style.border = '2px solid transparent';
        img.dataset.idx = idx;
        // Crear hitbox invisible ampliada
        const hitbox = document.createElement('div');
        hitbox.className = 'hitbox-segmento';
        hitbox.style.position = 'absolute';
    hitbox.style.left = (baseLeft + Math.max(0, offsetX - HITBOX_PAD)) + 'px';
    hitbox.style.top = (baseTop + Math.max(0, offsetY - HITBOX_PAD)) + 'px';
    hitbox.style.width = (Math.min(cellW, scaledW + HITBOX_PAD * 2)) + 'px';
    hitbox.style.height = (Math.min(cellH, scaledH + HITBOX_PAD * 2)) + 'px';
        hitbox.style.background = 'transparent';
        hitbox.style.zIndex = '5';
        // Eventos en la hitbox (estabilizados con pequeños delays)
    hitbox.addEventListener('pointerenter', () => {
        if (isLocked) return;
        hoverIdx = idx;
        // cancelar cierre si el puntero vuelve
        if (hoverCloseTimerId) { clearTimeout(hoverCloseTimerId); hoverCloseTimerId = null; }
        // programar apertura rápida para evitar parpadeo en microentradas
        if (hoverOpenTimerId) clearTimeout(hoverOpenTimerId);
        lastHoverIdxForOpen = idx;
        hoverOpenTimerId = setTimeout(() => {
            if (isLocked) return;
            if (lastHoverIdxForOpen !== idx) return;
            // Sonido de hover con cooldown por sprite
            const now = Date.now();
            const muteHover = isMovilAspect();
            if (!muteHover) {
                if ((!hoverSoundCooldowns[idx] || now - hoverSoundCooldowns[idx] > HOVER_SOUND_COOLDOWN_MS) && (now - lastGlobalSfxTime > GLOBAL_SFX_COOLDOWN_MS)) {
                    window.SFX?.play('switchA', 0.18);
                    hoverSoundCooldowns[idx] = now;
                    lastGlobalSfxTime = now;
                }
            }
            resaltarSegmento(idx);
            mostrarInfo(segmento);
        }, HOVER_OPEN_DELAY);
    });
        // Evitar spam de abrir mientras se mueve dentro de la misma área (no necesitamos mousemove)
        // hitbox.addEventListener('mousemove', ... ) eliminado a propósito
        hitbox.addEventListener('pointerleave', (e) => {
            if (isLocked) return;
            // Si el cursor entra a cualquier parte de la ventana de información (incluyendo borde y elementos hijos), desactivar interactividad principal
            let target = e.relatedTarget;
            if (target && (target === infoPanel || within(infoPanel, target))) {
                // Simular click: fijar selección y mostrar info
                isLocked = true;
                lockedIdx = idx;
                window.SFX?.play('clickB', 0.20);
                resaltarSegmento(idx);
                mostrarInfo(segmentos[idx], { suppressOpenSfx: true });
                skipNextDocUnlock = true;
                return;
            }
            if (hoverIdx === idx) hoverIdx = null;
            // cerrar con retraso breve para permitir viaje hacia el panel
            if (hoverOpenTimerId) { clearTimeout(hoverOpenTimerId); hoverOpenTimerId = null; }
            if (hoverCloseTimerId) clearTimeout(hoverCloseTimerId);
            hoverCloseTimerId = setTimeout(() => {
                if (isLocked) return;
                // Si el puntero volvió al trigger o está sobre el panel, no cerrar
                const overTriggerAgain = document.elementFromPoint?.(e.clientX, e.clientY) === hitbox;
                if (within(infoPanel, document.activeElement) || overPanel) return;
                quitarResaltado(idx);
                // Iniciar cooldown para este sprite
                hoverSoundCooldowns[idx] = Date.now();
            }, HOVER_CLOSE_DELAY);
        });
        // Click para fijar selección y permitir interactuar con el panel sin perderla
    hitbox.addEventListener('click', (e) => {
            if (!isLocked) {
                // Confirmar selección inicial
        if (hoverOpenTimerId) { clearTimeout(hoverOpenTimerId); hoverOpenTimerId = null; }
        if (hoverCloseTimerId) { clearTimeout(hoverCloseTimerId); hoverCloseTimerId = null; }
                isLocked = true;
                lockedIdx = idx;
                window.SFX?.play('clickB', 0.45);
                resaltarSegmento(idx);
                // Suprimir SFX de apertura para priorizar el click
                mostrarInfo(segmento, { suppressOpenSfx: true });
                // Evita que el manejador global de documento desbloquee inmediatamente
                skipNextDocUnlock = true;
            } else if (lockedIdx !== idx) {
                // Cambiar directamente a la otra selección
        if (hoverOpenTimerId) { clearTimeout(hoverOpenTimerId); hoverOpenTimerId = null; }
        if (hoverCloseTimerId) { clearTimeout(hoverCloseTimerId); hoverCloseTimerId = null; }
                lockedIdx = idx;
                window.SFX?.play('tapB', 0.35);
                resaltarSegmento(idx);
                // Suprimir SFX de apertura para priorizar el click
                mostrarInfo(segmento, { suppressOpenSfx: true });
                // Evitar que el click de cambio lo interprete como desbloqueo
                skipNextDocUnlock = true;
            }
        });
        // Orden: fondo, ground, hitbox, imagen (la imagen queda sobre el piso)
        container.appendChild(ground);
        container.appendChild(hitbox);
        container.appendChild(img);
        segmentoElems.push(img);
    });
}

function ajustarTamañoContainer() {
    // Ajusta el tamaño del contenedor para que se vean todos los segmentos
    let maxX = 0, maxY = 0;
    segmentos.forEach(seg => {
        maxX = Math.max(maxX, seg.x + seg.width);
        maxY = Math.max(maxY, seg.y + seg.height);
    });
    const container = document.getElementById('canvas-container');
    container.style.width = maxX + 'px';
    container.style.height = maxY + 'px';
}

function resaltarSegmento(idx) {
    // Si es el mismo índice ya resaltado, no hacer nada
    if (currentIdx === idx) return;
    // Limpiar solo elementos visuales de highlight previos, sin cerrar el panel
    const hcPrev = document.getElementById('highlight-canvas');
    if (hcPrev) hcPrev.style.display = 'none';
    const clonePrev = document.getElementById('highlight-img-clone');
    if (clonePrev) clonePrev.remove();
    const segmento = segmentos[idx];
    const img = segmentoElems[idx];
    // Si la imagen del sprite no cargó o es el placeholder, no intentes resaltar; además, asegúrate de ocultar cualquier resto previo
    if (!img || img.dataset.loaded !== '1' || img.dataset.blank === '1') {
        const hc = document.getElementById('highlight-canvas');
        if (hc) hc.style.display = 'none';
        const clone = document.getElementById('highlight-img-clone');
        if (clone) clone.remove();
        return;
    }
    currentIdx = idx;
    try { window.currentIdx = idx; } catch {}
    // Crear canvas para analizar el borde real del dibujo
    // Eliminar duplicado anterior si existe
    let imgClone = document.getElementById('highlight-img-clone');
    if (imgClone) {
        imgClone.remove();
    }

    let canvas = document.getElementById('highlight-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'highlight-canvas';
        canvas.style.position = 'absolute';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '10'; // Menor que el z-index de la imagen
        // Insertar el canvas antes de la imagen del segmento
        document.getElementById('canvas-container').insertBefore(canvas, img);
    }
    // Usar dimensiones actuales (escaladas) para el highlight visual
    const scaledWidth = parseInt(img.style.width, 10) || segmento.width;
    const scaledHeight = parseInt(img.style.height, 10) || segmento.height;
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    canvas.style.left = img.style.left;
    canvas.style.top = img.style.top;
    canvas.style.display = 'block';

    // Crear duplicado no interactivo de la imagen por encima del borde
    imgClone = document.createElement('img');
    imgClone.id = 'highlight-img-clone';
    imgClone.src = img.src;
    imgClone.style.position = 'absolute';
    imgClone.style.left = img.style.left;
    imgClone.style.top = img.style.top;
    imgClone.style.width = img.style.width;
    imgClone.style.height = img.style.height;
    imgClone.style.zIndex = '20';
    imgClone.style.pointerEvents = 'none';
    document.getElementById('canvas-container').insertBefore(imgClone, img.nextSibling);
    // Dibujar la imagen en el canvas
    const ctx = canvas.getContext('2d');
    const tempImg = new window.Image();
    tempImg.src = img.src;
    tempImg.onload = function() {
    ctx.clearRect(0, 0, scaledWidth, scaledHeight);
    ctx.drawImage(tempImg, 0, 0, scaledWidth, scaledHeight);
        // Analizar píxeles opacos para encontrar el borde
    const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
        const data = imageData.data;
        ctx.save();
        ctx.strokeStyle = '#ff0';
    ctx.lineWidth = 2; // Disminuido un pixel
        // Algoritmo: recorrer píxeles y dibujar contorno ampliado
        const ampliacion = 2; // píxeles extra alrededor del borde
        for (let y = 1; y < scaledHeight - 1; y++) {
            for (let x = 1; x < scaledWidth - 1; x++) {
                const i = (y * scaledWidth + x) * 4;
                if (data[i + 3] > 32) { // opaco
                    // Revisar vecinos
                    let borde = false;
                    for (let dy = -1 - ampliacion; dy <= 1 + ampliacion; dy++) {
                        for (let dx = -1 - ampliacion; dx <= 1 + ampliacion; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx < 0 || nx >= scaledWidth || ny < 0 || ny >= scaledHeight) continue;
                            const ni = (ny * scaledWidth + nx) * 4;
                            if (data[ni + 3] <= 32) borde = true;
                        }
                    }
                    if (borde) {
                        ctx.beginPath();
                        ctx.rect(x - ampliacion, y - ampliacion, 1 + ampliacion * 2, 1 + ampliacion * 2);
                        ctx.stroke();
                    }
                }
            }
        }
        ctx.restore();
    };
}

function quitarResaltado() {
    // No ocultar si la selección está fijada
    if (isLocked) return;
    if (highlightElem) {
        highlightElem.style.display = 'none';
    }
    const hc = document.getElementById('highlight-canvas');
    if (hc) hc.style.display = 'none';
    const clone = document.getElementById('highlight-img-clone');
    if (clone) clone.remove();
    ocultarInfo();
}

function mostrarInfo(segmento, opts = {}) {
    // Cancelar ocultado en curso y avanzar el token para invalidar callbacks de hide previos
    panelAnimToken++;
    if (hideTimerId) { clearTimeout(hideTimerId); hideTimerId = null; }
    // Cancelar cierre diferido si existe al mostrar
    if (hoverCloseTimerId) { clearTimeout(hoverCloseTimerId); hoverCloseTimerId = null; }
    infoPanel.classList.remove('hidden');
    // Asegurar estado visible inmediato
    // Evitar que el panel intercepte el puntero durante el fade-in
    infoPanel.style.pointerEvents = 'none';
    infoPanel.style.bottom = '0';
    infoPanel.style.opacity = '1';
    if (!opts.suppressOpenSfx && !isMovilAspect()) {
        window.SFX?.play('switchA', 0.18);
    }

    nombreElem.textContent = segmento.nombre;
    // No ajustar aún: el panel puede estar oculto y no es medible
    // Etiquetas visibles a la izquierda del link
    // Preview del segmento (imagen del sprite) con misma mecánica que el PFP
    let imgSrc = (segmento.imagen || '').toString().replace(/\\/g, '/');
    if (!/^https?:\/\//i.test(imgSrc)) {
        const file = imgSrc.split('/').pop();
        if (!imgSrc.startsWith('assets/segmentos/')) {
            imgSrc = 'assets/segmentos/' + file;
        }
    }
    const trySetPreview = (primary, triedAlt = false) => {
        const reqId = (segmentPreview._reqId = (segmentPreview._reqId || 0) + 1);
        segmentPreview.dataset.blank = '0';
        segmentPreview.alt = '';
        segmentPreview.classList.add('preview-loading');
        segmentPreview.classList.remove('hidden');
        const pre = new Image();
        pre.decoding = 'async';
        pre.fetchPriority = 'high';
        pre.referrerPolicy = 'no-referrer';
        pre.onload = async () => {
            try { if (pre.decode) await pre.decode(); } catch {}
            if (segmentPreview._reqId !== reqId) return; // carrera
            segmentPreview.alt = segmento.nombre || '';
            segmentPreview.src = pre.src;
            segmentPreview.classList.remove('preview-loading');
            segmentPreview.classList.remove('hidden');
            // Calcular paleta de colores del sprite cargado
            computeAndRenderPalette(pre, reqId);
        };
        pre.onerror = () => {
            if (segmentPreview._reqId !== reqId) return;
            if (triedAlt) {
                // fallo definitivo: mostrar placeholder visible sin icono roto
                segmentPreview.dataset.blank = '1';
                segmentPreview.src = BLANK_IMG;
                segmentPreview.alt = '';
                segmentPreview.classList.add('preview-loading');
                segmentPreview.classList.remove('hidden');
                // Limpiar paleta si no hay preview válido
                renderPalette([]);
                return;
            }
            let alt = primary;
            if (/\.png$/i.test(primary)) alt = primary.replace(/\.png$/i, '.jpg');
            else if (/\.jpe?g$/i.test(primary)) alt = primary.replace(/\.jpe?g$/i, '.png');
            else {
                // sin extensión conocida: caer a placeholder
                segmentPreview.dataset.blank = '1';
                segmentPreview.src = BLANK_IMG;
                segmentPreview.alt = '';
                segmentPreview.classList.add('preview-loading');
                segmentPreview.classList.remove('hidden');
                renderPalette([]);
                return;
            }
            trySetPreview(alt, true);
        };
        pre.src = primary;
    };
    trySetPreview(imgSrc);
    // Renderizar estadísticas (usar precomputadas si existen)
    if (statsEl) {
        const renderStats = (w, h, r, g, b, opaque) => {
            statsEl.innerHTML = '<div class="stats-title">Stats:</div>';
            const maxWH = Math.max(100, w, h);
            const maxRGB = Math.max(1, r, g, b);
            const rows = [
                { label:'AN', abbr:'AN', value:w, max:maxWH },
                { label:'AL', abbr:'AL', value:h, max:maxWH },
                { label:'R',  abbr:'R',  value:r, max:maxRGB },
                { label:'G',  abbr:'G',  value:g, max:maxRGB },
                { label:'B',  abbr:'B',  value:b, max:maxRGB },
                { label:'OP', abbr:'OP', value:opaque, max:Math.max(1, w*h) }
            ];
            rows.forEach(row => {
                const wrap = document.createElement('div');
                wrap.className = 'stat-row';
                const lab = document.createElement('div'); lab.className='stat-label'; lab.textContent = row.abbr || row.label;
                const bar = document.createElement('div'); bar.className='stat-bar';
                const fill = document.createElement('div'); fill.className='fill';
                const p = Math.min(100, (row.value/row.max)*100);
                fill.style.width = p + '%';
                if (p <= 30) fill.style.background = '#ef5350';
                else if (p <= 70) fill.style.background = '#ffeb3b';
                else fill.style.background = '#66bb6a';
                bar.appendChild(fill);
                wrap.appendChild(lab); wrap.appendChild(bar);
                statsEl.appendChild(wrap);
            });
        };

        // Si ya tenemos stats precomputadas en el JSON, úsalas
        const s = segmento.stats;
        if (s && Number.isFinite(s.w) && Number.isFinite(s.h) &&
            Number.isFinite(s.r) && Number.isFinite(s.g) && Number.isFinite(s.b) && Number.isFinite(s.opaque)) {
            renderStats(s.w, s.h, s.r, s.g, s.b, s.opaque);
        } else {
            // Calcular una sola vez y cachear en memoria (opcionalmente persistir con script)
            const img = new Image();
            img.onload = () => {
                const w = img.naturalWidth || segmento.width || 0;
                const h = img.naturalHeight || segmento.height || 0;
                const c = document.createElement('canvas');
                c.width = w; c.height = h;
                const ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
                let r=0,g=0,b=0,opaque=0;
                const { data } = ctx.getImageData(0,0,w,h);
                for (let i=0;i<data.length;i+=4){
                    const a = data[i+3];
                    if (a>0) opaque++;
                    r += data[i]; g += data[i+1]; b += data[i+2];
                }
                // Guardar en memoria para esta sesión
                segmento.stats = { w, h, r, g, b, opaque };
                renderStats(w, h, r, g, b, opaque);
            };
            // Usa la ruta del sprite, no la del preview (que podría haberse limpiado si falló)
            img.src = imgSrc;
        }
    }
    // Imagen de perfil si existe
    if (segmento.perfil) {
        let pfpSrc = (segmento.perfil || '').toString().replace(/\\/g, '/');
        // Normalizar a assets/pfp_web o assets/pfp según corresponda si es relativo
        const isUrl = /^https?:\/\//i.test(pfpSrc);
        if (!isUrl) {
            pfpSrc = pfpSrc.replace(/^\.\//, '').replace(/^\//, '');
            if (!pfpSrc.startsWith('assets/')) {
                if (pfpSrc.startsWith('pfp_web/')) pfpSrc = 'assets/' + pfpSrc;
                else if (pfpSrc.startsWith('pfp/')) pfpSrc = 'assets/' + pfpSrc;
                else {
                    // si solo viene el nombre, asumir pfp_web optimizado
                    pfpSrc = 'assets/pfp_web/' + pfpSrc.split('/').pop();
                }
            }
        }
        // Cargar con pequeño fallback entre .png y .jpg si el primero falla
        const trySet = (primary, triedAlt = false) => {
            const reqId = (pfpImage._reqId = (pfpImage._reqId || 0) + 1);
            pfpImage.classList.add('pfp-loading');
            pfpImage.dataset.blank = '0';
            pfpImage.alt = '';
            // Pre-cargar fuera de DOM y decodificar
            const pre = new Image();
            pre.decoding = 'async';
            pre.referrerPolicy = 'no-referrer';
            pre.onload = async () => {
                try { if (pre.decode) await pre.decode(); } catch {}
                if (pfpImage._reqId !== reqId) return;
                pfpImage.alt = segmento.nombre ? `Perfil de ${segmento.nombre}` : '';
                pfpImage.src = pre.src;
                pfpImage.classList.remove('pfp-loading');
                pfpImage.classList.remove('hidden');
            };
            pre.onerror = () => {
                if (pfpImage._reqId !== reqId) return;
                if (triedAlt) {
                    // fallo definitivo: mostrar placeholder animado pero sin icono de roto
                    pfpImage.dataset.blank = '1';
                    pfpImage.src = BLANK_IMG;
                    pfpImage.classList.add('pfp-loading');
                    pfpImage.classList.remove('hidden');
                    pfpImage.alt = '';
                    return;
                }
                let alt = primary;
                if (/\.png$/i.test(primary)) alt = primary.replace(/\.png$/i, '.jpg');
                else if (/\.jpe?g$/i.test(primary)) alt = primary.replace(/\.jpe?g$/i, '.png');
                else return;
                trySet(alt, true);
            };
            pre.src = primary;
        };
        trySet(pfpSrc);
    // visible cuando se completa decode(); mantener oculto si CSS lo requiere
    pfpImage.classList.remove('hidden');
    } else {
        // Sin perfil: mostrar placeholder animado sin icono roto ni texto
        pfpImage.onerror = null;
    pfpImage.dataset.blank = '1';
    pfpImage.src = BLANK_IMG;
        pfpImage.alt = '';
        pfpImage.classList.remove('hidden');
        pfpImage.classList.add('pfp-loading');
    }
    // Enlaces sociales: mostrar el nombre/handle y redirigir a la página correspondiente
    const isUrl = (s) => /^https?:\/\//i.test(s);
    const ensureHttps = (s) => (isUrl(s) ? s : 'https://' + s.replace(/^\/*/, ''));
    const stripProto = (s) => s.replace(/^https?:\/\//i, '');
    const lastPath = (s) => {
        try {
            const u = new URL(isUrl(s) ? s : ensureHttps(s));
            const segs = u.pathname.split('/').filter(Boolean);
            return segs[segs.length - 1] || u.hostname;
        } catch { return s; }
    };
    const setSocial = (el, raw, type) => {
        const rowEl = el ? el.closest('.social-row') : null;
        // limpiar espacios y caracteres invisibles (zero-width)
        const v = (raw || '').toString().replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
        // Si el valor es vacío o es un guion "-", ocultar totalmente la fila
        if (!v || v === '-') {
            if (rowEl) rowEl.classList.add('hidden');
            if (el) { el.classList.add('hidden'); el.removeAttribute('href'); el.textContent = ''; }
            return;
        }
        let href = '', text = '';
        const val = v;
        const clamp = (s, max = 28) => {
            if (!s) return s;
            return s.length > max ? (s.slice(0, max - 1) + '…') : s;
        };
        // Utilidades por plataforma
        const parseUrl = (s) => {
            try { return new URL(isUrl(s) ? s : ensureHttps(s)); } catch { return null; }
        };
        const lastSeg = (u) => {
            if (!u) return '';
            const segs = (u.pathname || '').split('/').filter(Boolean);
            return segs[segs.length - 1] || '';
        };
        const cleanHandle = (s) => s.replace(/^@/, '').trim();
        const only = (s, re) => {
            const m = (s || '').match(re);
            return m ? m[0] : s;
        };
        const toLowerSafe = (s) => (s || '').toLowerCase();
        switch (type) {
            case 'x': {
                // Twitter/X: usar x.com y mostrar solo el handle sin @
                let handle = '';
                const u = parseUrl(val);
                if (u) {
                    if (/twitter\.com$/i.test(u.hostname) || /x\.com$/i.test(u.hostname)) {
                        const segs = u.pathname.split('/').filter(Boolean);
                        if (segs.length) handle = cleanHandle(segs[0]);
                    }
                }
                if (!handle) {
                    // texto suelto o URL de otro sitio: intentar extraer handle tras @ o último segmento
                    handle = cleanHandle(val);
                    if (handle.includes('/')) handle = cleanHandle(handle.split('/').pop());
                }
                // X permite [A-Za-z0-9_]{1,15}
                handle = only(handle, /^[A-Za-z0-9_]{1,15}/);
                if (!handle) { if (rowEl) rowEl.classList.add('hidden'); el.classList.add('hidden'); return; }
                href = 'https://x.com/' + handle;
                text = clamp(handle);
                break;
            }
            case 'bluesky': {
                // Bluesky: https://bsky.app/profile/{handle}
                // Acepta: URL completa, @handle, handle con dominio (example.com o *.bsky.social) o DID (did:plc:...)
                let handle = '';
                const u = parseUrl(val);
                if (u && /(^|\.)bsky\.app$/i.test(u.hostname)) {
                    const segs = (u.pathname || '').split('/').filter(Boolean);
                    const i = segs.indexOf('profile');
                    if (i >= 0 && segs[i + 1]) handle = cleanHandle(segs[i + 1]);
                }
                if (!handle) {
                    const raw = val.trim();
                    if (/^did:plc:[a-z0-9]+$/i.test(raw)) {
                        handle = raw;
                    } else if (raw.startsWith('@')) {
                        handle = cleanHandle(raw);
                    } else if (/[.]/.test(raw)) {
                        // contiene dominio, tomar tal cual
                        handle = cleanHandle(raw);
                    }
                }
                if (!handle) { if (rowEl) rowEl.classList.add('hidden'); el.classList.add('hidden'); return; }
                href = 'https://bsky.app/profile/' + handle;
                text = clamp(handle, 40);
                break;
            }
            case 'discord': {
                // Si se usa Discord en el futuro: mantener formato estándar
                if (isUrl(val)) { href = val; text = stripProto(val); }
                else if (/^discord\.gg\//i.test(val)) { href = ensureHttps(val); text = val; }
                else if (/^[A-Za-z0-9]{6,12}$/.test(val)) { href = 'https://discord.gg/' + val; text = 'discord.gg/' + val; }
                else if (/^\d{17,20}$/.test(val)) { href = 'https://discord.com/users/' + val; text = 'discord.com/users/' + val; }
                else { el.classList.add('hidden'); el.removeAttribute('href'); el.textContent = ''; return; }
                text = clamp(text, 36);
                break;
            }
            case 'vgen': {
                // vgen.co/{username}
                let user = '';
                const u = parseUrl(val);
                if (u && /vgen\.co$/i.test(u.hostname)) user = cleanHandle(lastSeg(u));
                if (!user) user = cleanHandle(val.includes('/') ? val.split('/').pop() : val);
                user = user.replace(/[^A-Za-z0-9_-]/g, '');
                if (!user) { if (rowEl) rowEl.classList.add('hidden'); el.classList.add('hidden'); return; }
                href = 'https://vgen.co/' + user;
                text = clamp(user, 34);
                break;
            }
            case 'kofi': {
                // ko-fi.com/{username}
                let user = '';
                const u = parseUrl(val);
                if (u && /ko-fi\.com$/i.test(u.hostname)) user = cleanHandle(lastSeg(u));
                if (!user) user = cleanHandle(val.includes('/') ? val.split('/').pop() : val);
                user = user.replace(/[^A-Za-z0-9_-]/g, '');
                if (!user) { if (rowEl) rowEl.classList.add('hidden'); el.classList.add('hidden'); return; }
                href = 'https://ko-fi.com/' + user;
                text = clamp(user, 30);
                break;
            }
            case 'youtube': {
                // YouTube: preferir handle @usuario
                let handle = '';
                const u = parseUrl(val);
                if (u && /(^|\.)youtube\.com$/i.test(u.hostname)) {
                    const path = u.pathname || '';
                    const atIdx = path.indexOf('/@');
                    if (atIdx >= 0) {
                        handle = cleanHandle(path.slice(atIdx + 1).split('/')[0]);
                    } else {
                        // /channel/UC..., /user/name, /c/name -> no siempre hay handle
                        const segs = path.split('/').filter(Boolean);
                        if (segs.length >= 2 && ['channel','user','c'].includes(segs[0])) {
                            // usar segs[1] como "usuario" visible si no hay handle
                            handle = segs[1];
                        }
                    }
                }
                if (!handle) {
                    const raw = val.trim();
                    if (raw.startsWith('@')) handle = cleanHandle(raw);
                    else if (!/[.]/.test(raw) && !raw.includes('/')) handle = cleanHandle(raw);
                }
                if (handle) {
                    href = 'https://www.youtube.com/@' + handle;
                    text = clamp(handle, 36);
                } else {
                    // Último recurso: usar la URL dada y mostrar último segmento
                    const u2 = parseUrl(val);
                    href = u2 ? u2.href : ensureHttps(val);
                    const vis = u2 ? lastSeg(u2) : val;
                    text = clamp(vis, 36);
                }
                break;
            }
            case 'twitch': {
                // twitch.tv/{username}
                let handle = '';
                const u = parseUrl(val);
                if (u && /twitch\.tv$/i.test(u.hostname)) handle = cleanHandle(lastSeg(u));
                if (!handle) handle = cleanHandle(val.includes('/') ? val.split('/').pop() : val);
                handle = toLowerSafe(handle).replace(/[^a-z0-9_]/g, '');
                if (!handle) { if (rowEl) rowEl.classList.add('hidden'); el.classList.add('hidden'); return; }
                href = 'https://twitch.tv/' + handle;
                text = clamp(handle, 30);
                break;
            }
            case 'portfolio': {
                // Excepción: para portafolio mostrar el dominio/página completa
                href = ensureHttps(val);
                text = stripProto(href);
                text = clamp(text, 40);
                break;
            }
            default: { href = isUrl(val) ? val : ensureHttps(val); text = stripProto(href); }
        }
        el.href = href;
        el.textContent = text;
        el.classList.remove('hidden');
        if (rowEl) rowEl.classList.remove('hidden');
    };
    setSocial(linkX, segmento.xCuenta || segmento.x || segmento.twitter, 'x');
    setSocial(linkBluesky, segmento.bluesky || segmento.bsky, 'bluesky');
    setSocial(linkVgen, segmento.vgen, 'vgen');
    setSocial(linkKofi, segmento.kofi, 'kofi');
    setSocial(linkYoutube, segmento.youtube, 'youtube');
    setSocial(linkTwitch, segmento.twitch, 'twitch');
    setSocial(linkPortfolio, segmento.portfolio || segmento.portafolio || segmento.web || segmento.sitio, 'portfolio');
    // Placeholder "Espacio en obras" si no hay redes visibles
    try {
        const socialWrap = document.getElementById('social-links');
        if (socialWrap) {
            const rows = Array.from(socialWrap.querySelectorAll('.social-row'));
            const visibleRows = rows.filter(r => !r.classList.contains('hidden'));
            let placeholder = socialWrap.querySelector('.social-placeholder');
            if (visibleRows.length === 0) {
                if (!placeholder) {
                    placeholder = document.createElement('div');
                    placeholder.className = 'social-placeholder';
                    placeholder.setAttribute('aria-live', 'polite');
                    placeholder.textContent = 'Just a cool user';
                    socialWrap.appendChild(placeholder);
                } else {
                    placeholder.classList.remove('hidden');
                }
            } else if (placeholder) {
                placeholder.classList.add('hidden');
            }
        }
    } catch {}
    // Animación suave usando transiciones CSS (rápidas)
    if (!infoPanel.dataset.animated) {
        // Preparar estado inicial (oculto) y reflow, luego animar a visible
        infoPanel.style.opacity = '0';
        infoPanel.style.bottom = '-120px';
        // forzar reflow para que la transición ocurra
        void infoPanel.offsetHeight;
    infoPanel.style.bottom = '0';
    infoPanel.style.opacity = '1';
    // Habilitar interacción tras el breve fade-in
    setTimeout(() => { infoPanel.style.pointerEvents = 'auto'; }, PANEL_INTERACT_ENABLE_DELAY);
        infoPanel.dataset.animated = 'true';
    // Actualizar zona segura casi inmediato acorde a 50ms
    setTimeout(updateSafeZone, 60);
        // Ajustar el nombre ya visible
        requestAnimationFrame(() => fitNameToHeader());
    } else {
        // Asegurar estados finales para que la transición aplique si venía ocultándose
    infoPanel.style.bottom = '0';
    infoPanel.style.opacity = '1';
    // Re-activar interacción por si venía de un cierre
    setTimeout(() => { infoPanel.style.pointerEvents = 'auto'; }, PANEL_INTERACT_ENABLE_DELAY);
        setTimeout(updateSafeZone, 0);
        // Panel ya visible: ajustar inmediatamente y en el próximo frame
        fitNameToHeader();
        requestAnimationFrame(() => fitNameToHeader());
    }
    if (userImage) userImage.classList.add('hidden');
}

function ocultarInfo() {
    if (!infoPanel || infoPanel.classList.contains('hidden')) return;
    // Animar salida: desvanecer y deslizar ligeramente hacia abajo
    infoPanel.style.opacity = '0';
    infoPanel.style.bottom = '-10px';
    if (!isMovilAspect()) window.SFX?.play('switchB', 0.18);
    // Bloquear interacción durante el fade-out para no robar hover del trigger
    infoPanel.style.pointerEvents = 'none';
    const myToken = panelAnimToken; // snapshot del estado en el momento de ocultar
    const onEnd = () => {
        infoPanel.removeEventListener('transitionend', onEnd);
        // Si hubo una nueva solicitud de mostrar, abortar ocultado
        if (panelAnimToken !== myToken) return;
        infoPanel.classList.add('hidden');
        // Restablecer posición final para próximas entradas
        infoPanel.style.bottom = '0';
        updateSafeZone();
    };
    // Escuchar fin de transición o usar un timeout de respaldo
    infoPanel.addEventListener('transitionend', onEnd, { once: true });
    if (hideTimerId) { clearTimeout(hideTimerId); }
    hideTimerId = setTimeout(() => {
        if (panelAnimToken !== myToken) return; // ya se mostró de nuevo
        onEnd();
        hideTimerId = null;
    }, 80);
}

// Capa de fondo oscuro con gradiente que cubre el 30% inferior, más transparente arriba y 100% opacidad abajo
function agregarFondoOscuroDegradado() {
    let fondoOscuro = document.getElementById('fondo-oscuro-degradado');
    if (!fondoOscuro) {
        fondoOscuro = document.createElement('div');
        fondoOscuro.id = 'fondo-oscuro-degradado';
        fondoOscuro.style.position = 'fixed';
        fondoOscuro.style.left = '0';
        // Ubicado en el 30% inferior
        fondoOscuro.style.top = '70vh';
        fondoOscuro.style.width = '100vw';
        fondoOscuro.style.height = '30vh';
        fondoOscuro.style.pointerEvents = 'none';
        fondoOscuro.style.zIndex = '12'; // Por delante de las nubes, detrás de los pisos
    // Gradiente: transparente arriba, 60% opacidad abajo
    fondoOscuro.style.background = 'linear-gradient(to bottom, rgba(20,20,30,0.0) 0%, rgba(20,20,30,0.6) 100%)';
        document.body.appendChild(fondoOscuro);
    }
}
window.addEventListener('DOMContentLoaded', agregarFondoOscuroDegradado);

if (imageUpload) {
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                if (userImage) {
                    userImage.src = ev.target.result;
                    userImage.classList.remove('hidden');
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// El onload global ya es gestionado arriba; evitar sobrescribirlo de nuevo
// window.onload = cargarSegmentos;

// Ajustar zona segura al redimensionar ventana
window.addEventListener('resize', () => {
    updateSafeZone();
    // volver a ajustar nombre por cambios de ancho
    fitNameToHeader();
    // Actualizar caps dinámicos de sprites antes de recalcular retícula
    updateDynamicSpriteCaps();
    // Recalcular escalado/retícula con debounce
    clearTimeout(resizeRebuildTimer);
    resizeRebuildTimer = setTimeout(() => {
        if (!segmentos || !segmentos.length) return;
        mostrarSegmentos();
        // Si hay un hover activo y no está bloqueado, re-aplicar sin animación repetida
        if (!isLocked && hoverIdx != null && segmentos[hoverIdx]) {
            resaltarSegmento(hoverIdx);
            mostrarInfo(segmentos[hoverIdx]);
        }
    }, 100);
});

// Click fuera del panel de información desbloquea la selección y vuelve al modo hover
document.addEventListener('click', (e) => {
    if (!infoPanel) return;
    const clickedInsidePanel = infoPanel.contains(e.target);
    if (!clickedInsidePanel && isLocked) {
        if (skipNextDocUnlock) {
            // Consumir el salto una sola vez (click de confirmación)
            skipNextDocUnlock = false;
            return;
        }
        isLocked = false;
        lockedIdx = null;
        quitarResaltado(); // ahora sí ocultará porque isLocked es false
    }
});

// Programmatic close: from close button or Esc
document.addEventListener('ui:close-panel', () => {
    if (!infoPanel) return;
    isLocked = false;
    lockedIdx = null;
    hoverIdx = null;
    quitarResaltado();
});

// Expose lock state for tooling or optional external checks
try { window.isLocked = isLocked; } catch {}

// Mantener abierto mientras el puntero esté sobre el panel
if (infoPanel) {
    infoPanel.addEventListener('pointerenter', () => {
        overPanel = true;
        if (hoverCloseTimerId) { clearTimeout(hoverCloseTimerId); hoverCloseTimerId = null; }
    });
    infoPanel.addEventListener('pointerleave', (e) => {
        overPanel = false;
        if (isLocked) return;
        // si se regresa al trigger (hitbox) no cerrar inmediatamente
        const target = e.relatedTarget;
        if (target && target.classList && target.classList.contains('hitbox-segmento')) return;
        if (hoverCloseTimerId) clearTimeout(hoverCloseTimerId);
    hoverCloseTimerId = setTimeout(() => {
            if (isLocked || overPanel) return;
            hoverIdx = null;
            quitarResaltado();
    }, HOVER_CLOSE_DELAY);
    });
}

// ===== Paleta de colores del sprite =====
// Cache simple en memoria por URL
const __paletteCache = Object.create(null);

function rgbToHex(r,g,b){
    const h = (n) => n.toString(16).padStart(2,'0');
    return `#${h(r)}${h(g)}${h(b)}`;
}

function rgbToHex8(r,g,b,a=255){
    const h = (n) => n.toString(16).padStart(2,'0');
    return `#${h(r)}${h(g)}${h(b)}${h(a)}`;
}

function renderPalette(colors){
    if (!paletteSwatches) return;
    paletteSwatches.innerHTML = '';
    // Exponer cantidad de swatches para layout responsivo en móvil
    try {
        const count = Math.max(1, colors ? colors.length : 0);
        paletteSwatches.style.setProperty('--swatch-count', count);
        paletteSwatches.style.setProperty('--swatch-cols', Math.min(6, count));
    } catch {}
    if (!colors || !colors.length) {
        // Si no hay colores, dejar vacío (el contenedor mantiene título "Paleta")
        return;
    }
    colors.forEach(c => {
        const d = document.createElement('div');
        d.className = 'swatch';
        d.style.background = c.hex;
        const hex8 = rgbToHex8(c.r, c.g, c.b, 255);
        d.title = `${hex8}${c.percent != null ? ` • ${Math.round(c.percent)}%` : ''}\nClick para copiar`;
        d.tabIndex = 0;
        const copyHex = async () => {
            try {
                await navigator.clipboard.writeText(hex8);
                // pequeña señal visual
                d.style.outline = '2px solid #fff';
                setTimeout(() => { d.style.outline = ''; }, 300);
                window.SFX?.play('tapA', 0.25);
            } catch {
                // Fallback: input temporal
                const inp = document.createElement('input');
                inp.value = hex8;
                document.body.appendChild(inp);
                inp.select();
                try { document.execCommand('copy'); } catch {}
                inp.remove();
            }
        };
        d.addEventListener('click', copyHex);
        d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyHex(); } });
        paletteSwatches.appendChild(d);
    });
}

// Extrae los colores dominantes del sprite usando cuantización por histograma en 12 bits (4 bits por canal)
function extractPaletteFromImage(img, maxColors = 16){
    try{
        const w0 = img.naturalWidth || img.width;
        const h0 = img.naturalHeight || img.height;
        // limitar tamaño de muestreo para rendimiento
        const MAX_DIM = 256;
        let w = w0, h = h0;
        let scale = 1;
        if (Math.max(w0, h0) > MAX_DIM) {
            scale = MAX_DIM / Math.max(w0, h0);
            w = Math.max(1, Math.round(w0 * scale));
            h = Math.max(1, Math.round(h0 * scale));
        }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        // importante para sprites pixel: desactivar suavizado al re-escalar
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        const hist = new Map();
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
            const a = data[i+3];
            if (a < 16) continue; // ignorar casi transparentes
            const r = data[i], g = data[i+1], b = data[i+2];
            // cuantizar a 4 bits por canal
            const rq = r >> 4, gq = g >> 4, bq = b >> 4;
            const key = (rq << 8) | (gq << 4) | bq;
            hist.set(key, (hist.get(key) || 0) + 1);
            total++;
        }
        // ordenar por frecuencia descendente
        const entries = Array.from(hist.entries()).sort((a,b) => b[1] - a[1]);
        const top = entries.slice(0, maxColors).map(([key, count]) => {
            const rq = (key >> 8) & 0xF;
            const gq = (key >> 4) & 0xF;
            const bq = key & 0xF;
            // convertir a 8 bits al centro del bucket
            const r8 = (rq << 4) | 0x8;
            const g8 = (gq << 4) | 0x8;
            const b8 = (bq << 4) | 0x8;
            return { r:r8, g:g8, b:b8, hex: rgbToHex(r8,g8,b8), count, percent: total ? (count/total*100) : 0 };
        });
        return top;
    } catch {
        return [];
    }
}

function computeAndRenderPalette(loadedImg, reqId){
    if (!loadedImg || !loadedImg.src) { renderPalette([]); return; }
    const key = loadedImg.src;
    if (__paletteCache[key]) { renderPalette(__paletteCache[key]); return; }
    // Ejecutar extracción en un frame separado para no bloquear transición
    requestAnimationFrame(() => {
        // Evitar trabajo si ya se cambió la solicitud del preview
        if (reqId != null && segmentPreview && segmentPreview._reqId !== reqId) return;
        const colors = extractPaletteFromImage(loadedImg, 16);
        __paletteCache[key] = colors;
        // Verificar nuevamente que la solicitud sigue vigente antes de renderizar
        if (reqId != null && segmentPreview && segmentPreview._reqId !== reqId) return;
        renderPalette(colors);
    });
}

// Controles de preview (sliders) para ajustar caps de tamaño
// Desactivados por defecto; dejar flag en false para ocultarlos sin borrar estilos/HTML
const ENABLE_PREVIEW_CONTROLS = false;
(() => {
    const root = document.documentElement;
    const getVarNum = (name, fallback) => {
        const v = getComputedStyle(root).getPropertyValue(name).trim();
        if (!v) return fallback;
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : fallback;
    };
    const controlsWrap = document.getElementById('preview-controls');
    if (!ENABLE_PREVIEW_CONTROLS) {
        if (controlsWrap) controlsWrap.classList.add('hidden');
        return; // no inicializar ni leer sessionStorage
    }
    const vhInput = document.getElementById('slider-vh');
    const vwInput = document.getElementById('slider-vw');
    const vhVal = document.getElementById('value-vh');
    const vwVal = document.getElementById('value-vw');
    if (!vhInput || !vwInput) return;
    // inicializar desde CSS vars o sessionStorage
    const savedVH = parseFloat(sessionStorage.getItem('previewMaxVH'));
    const savedVW = parseFloat(sessionStorage.getItem('previewMaxVW'));
    let vh = Number.isFinite(savedVH) ? savedVH : getVarNum('--preview-max-vh', PREVIEW_MAX_SPRITE_VH);
    let vw = Number.isFinite(savedVW) ? savedVW : getVarNum('--preview-max-vw', PREVIEW_MAX_SPRITE_HO);
    vhInput.value = String(Math.round(vh));
    vwInput.value = String(Math.round(vw));
    const updateLabels = () => {
        if (vhVal) vhVal.textContent = vhInput.value + 'vh';
        if (vwVal) vwVal.textContent = vwInput.value + 'vw';
    };
    updateLabels();
    const apply = () => {
        root.style.setProperty('--preview-max-vh', `${vhInput.value}vh`);
        root.style.setProperty('--preview-max-vw', `${vwInput.value}vw`);
        sessionStorage.setItem('previewMaxVH', vhInput.value);
        sessionStorage.setItem('previewMaxVW', vwInput.value);
        updateLabels();
    };
    vhInput.addEventListener('input', apply);
    vwInput.addEventListener('input', apply);
})();

// Barra de carga: duración depende del modo debug
function iniciarBarraCarga() {
    const barra = document.getElementById('loader-progress');
    if (!barra) return;
    barra.style.width = '0%';
    let start = null;
    // Detectar modo debug
    const isDebug = window.DEBUG === true || document.body.classList.contains('debug');
    const normalDuration = 3000;
    const debugDuration = 1000;
    const duration = isDebug ? debugDuration : normalDuration;
    // Generar hasta 4 puntos de pausa aleatorios entre 10% y 90% (solo si no debug)
    let numPauses = isDebug ? 0 : Math.floor(2 + Math.random() * 3); // 0 si debug, 2-4 si normal
    let freezePoints = [];
    for (let i = 0; i < numPauses; i++) {
        freezePoints.push(0.1 + Math.random() * 0.8);
    }
    freezePoints.sort((a, b) => a - b);
    let freezeDurations = freezePoints.map(() => 300 + Math.random() * 700); // 0.3 a 1.0 segundos
    let freezeIdx = 0;
    let frozen = false;
    function animarBarra(ts) {
        if (!start) start = ts;
        let elapsed = ts - start;
        let pct = Math.min(1, elapsed / duration);
        if (freezeIdx < freezePoints.length && pct >= freezePoints[freezeIdx]) {
            if (!frozen) {
                frozen = true;
                setTimeout(() => {
                    frozen = false;
                    freezeIdx++;
                    requestAnimationFrame(animarBarra);
                }, freezeDurations[freezeIdx]);
                return;
            }
        }
        if (!frozen) {
            barra.style.width = (pct * 100) + '%';
            if (pct < 1) {
                requestAnimationFrame(animarBarra);
            } else {
                barra.style.width = '100%';
            }
        }
    }
    requestAnimationFrame(animarBarra);
}
// Llama iniciarBarraCarga() cuando inicie la pantalla de carga
