UI textures for the info panel and sub-sections (pixel art style)

Recommended files (PNG, 1x scale, transparent where needed):

- panel_frame.png
  - 9-slice frame for #info-panel (e.g., 48x48 or 64x64). Borders ~8–12 px. Center transparent.
- paper_tile.png
  - Seamless tile (e.g., 16x16 or 24x24) for socials “paper” background.
- table_tile.png
  - Seamless tile (e.g., 16x16) for stats/tables background.
- divider_x.png (optional)
  - Horizontal pixel divider tile (e.g., 2x1 or 4x1) to repeat along X.
- corner_ornament.png (optional)
  - Extra decorative corner or pin.

Tips
- Work on an 8/16 px grid. Keep sharp edges; avoid blur.
- Ensure seamless tiles (edges match).
- Export as PNG with transparency. Do not upscale.
- In CSS, prefer image-rendering: pixelated and use multiples of the tile size for paddings.

Examples and references to study

- Kenney assets (CC0):
  - UI Pack (general shapes, buttons, sliders): https://kenney.nl/assets/ui-pack
  - Pixel UI Pack (pixelated variant): https://kenney.nl/assets/pixel-ui-pack
- Color palettes for consistent pixel styles:
  - Lospec palette list: https://lospec.com/palette-list
- Technique: nine-slice (9-slice) panels in CSS/HTML:
  - CSS border-image (slicing borders to scale cleanly): https://developer.mozilla.org/en-US/docs/Web/CSS/border-image
  - Android 9-patch concept (good mental model): https://developer.android.com/studio/write/draw9patch
- Pixel rendering in CSS:
  - image-rendering: pixelated; reference: https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering
- Asset directories on marketplaces (browse “pixel ui”):
  - itch.io search (pixel art + UI): https://itch.io/game-assets/tag-pixel-art/tag-ui
  - OpenGameArt search (pixel ui): https://opengameart.org/art-search-advanced?keys=pixel+ui&field_art_type_tid%5B%5D=9

What to look for in examples

- 9-slice friendly frames: evenly sized corners and edges (e.g., 8–12 px) with a fully transparent center.
- Seamless tiles: edges match on all sides; test by tiling 3x3.
- Limited palette: 4–16 colors; use one primary hue with light/dark ramps for materials (wood, paper, metal).
- Readability: high-contrast outlines and inner highlights for buttons and labels at small sizes.
- Consistent grid: stick to 1x or 2x pixel grid; avoid sub-pixel shadows/blur.

Notes for implementation here

- Prefer 9-slice for the panel_frame.png using CSS border-image with `image-rendering: pixelated` and exact `border-image-slice` values matching your corner thickness.
- Keep tile sizes small (16×16, 24×24). Use CSS multiples of that size for paddings/margins so seams align.
- Export at 1x. If you need 2x, keep a separate @2x folder and set `image-rendering: pixelated` while scaling by integer multiples.
