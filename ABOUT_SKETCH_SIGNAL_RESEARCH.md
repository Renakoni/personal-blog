# About Sketch Signal Research

## Context

The About page should move away from image-pool hero backgrounds. Home can stay image-led, but About needs its own identity system: more technical, more unified, and easier to animate.

The working direction is **Sketch Signal Deck**: hand-drawn line art + technical tracks + credits + year-end-summary-style snap pages. The page can still be expressive or even cute when intentional. Cute is not automatically low-end; uncontrolled template cuteness is the problem.

## Design direction

### Name

**Sketch Signal Deck**

### One-line definition

A seven-page personal signal report built from line art, sketch primitives, numbered tracks, credits, and restrained motion instead of full-image backgrounds.

### Relationship to Home

- Home: emotional opening, image-led anime key visual, rotating image pool.
- About: structured identity system, line-driven, technical but personal.

This separation prevents About from feeling like a weaker copy of Home.

## Visual language

Use:

- Sketch lines
- SVG paths
- hand-drawn circles, arrows, and dividers
- timeline tracks
- numbered sections
- credits-style typography
- light grid/coordinate systems
- animated line drawing
- small playful doodle elements when they serve personality

Avoid:

- generic cyberpunk HUD
- neon tech dashboard language
- static AI-generated full-page images
- random illustration-pack collage
- resume cards and skill badges as the main structure

The tone should be: **quiet technical, cinematic grid, personal archive, opening credits**.

## Recommended implementation stack

### 1. Rough.js

URL: https://roughjs.com/

Use case:

- Generate hand-drawn/sketch-like lines, rectangles, ellipses, paths, and hachure fills.
- Build page-specific background diagrams and signal tracks.
- Keep visual assets code-driven and animatable.

Why it fits:

- Small library, roughly under 9KB gzipped according to its site.
- Supports Canvas and SVG.
- Can draw primitives with controlled roughness.
- Good for a technical page that still feels hand-made.

How to use tastefully:

- Low roughness.
- Thin strokes.
- Low opacity.
- OKLCH muted blue-gray / warm paper tones.
- Avoid childish doodle density.

### 2. CSS SVG line drawing

Reference: https://css-tricks.com/libraries-for-svg-drawing-animations/

Use case:

- Animate SVG paths with `stroke-dasharray` and `stroke-dashoffset`.
- Reveal tracks, dividers, and sketch lines when a slide enters.

Why it fits:

- Zero dependency.
- Works well in Astro.
- Easy to combine with existing IntersectionObserver reveal patterns.
- Good first step before introducing a heavier animation library.

### 3. Anime.js

URL: https://animejs.com/

Use case:

- Timeline/stagger animation for SVG lines, headings, nodes, and credits.
- More advanced sequencing if CSS animation becomes limiting.

Why it fits:

- Free/open-source animation engine.
- Supports SVG, line drawing, motion path, stagger, and scroll utilities.
- Lighter and simpler than a full GSAP scrollytelling setup.

Recommendation:

- Do not add immediately unless needed.
- First try CSS + IntersectionObserver.
- Add Anime.js if per-slide line choreography needs better timing control.

### 4. GSAP / ScrollTrigger

Use case:

- Complex scroll-driven scrollytelling, pinned sections, scrubbed timelines.

Why not now:

- Powerful but may pull the design toward overbuilt continuous product-page animation.
- About currently wants snap-deck structure first, not a full Apple-style scroll film.

Recommendation:

- Keep as a later option only if the page shifts from paged snap into continuous scrollytelling.

## Free / open sketch and doodle resources

### Open Doodles

URLs:

- https://www.opendoodles.com/
- https://www.opendoodles.com/about

License notes from source:

- CC0 / public domain style language.
- Site says assets can be copied, edited, remixed, shared, or redrawn without restriction.

Use case:

- Small human/personality elements.
- A tiny figure, listening/music pose, reading pose, etc.
- Good if About needs a human touch.

Risk:

- Can become too playful if used as the main visual system.
- Use sparingly unless intentionally leaning into warmth/cuteness.

### dddoodle / fffuel

URLs:

- https://fffuel.co/dddoodle/
- https://www.uwarp.design/dddoodle

License notes from source:

- Creative Commons Attribution style language appears in search result/source pages.
- Likely requires attribution. Verify before production use.

Use case:

- Hand-drawn arrows.
- Circles.
- Scribbles.
- Stars.
- Small annotation marks.

Risk:

- Sticker-pack feeling if overused.
- Better as accent material, not the page skeleton.

### Toools.design illustration index

URL: https://www.toools.design/free-open-source-illustrations

Useful categories/resources mentioned:

- SVG Doodles
- Funky Scribbbles
- Highlights
- Handy Arrows
- Open Doodles
- DrawKit
- Sketchvalley

Use case:

- Research and inspiration pool.
- Pull limited accents after checking each resource license.

Risk:

- Mixed visual systems. Do not combine many packs directly.

## Proposed About structure

Keep seven pages, but rebuild each with the Sketch Signal language.

1. **Identity Signal**
   - Opening line, Pan identity, abstract line system.
   - No large image background.

2. **Current State**
   - Three current tracks.
   - Timeline/progress-board feeling.

3. **Build Credits / Tech Stack**
   - Languages, Frontend, Toolkit.
   - Credits / production-notes style, not resume skill cards.

4. **Favorites Shelf**
   - Anime, Manga, Game, Music in one page.
   - Four lanes or playlist tracks.
   - Each can have one current favorite and one short reason.

5. **Taste Statement**
   - Map anime mood to geek structure.
   - Lines connect emotional words and system words.

6. **Channels**
   - Blog, Anime, Projects as signal routes.
   - Route-map or channel-selector style.

7. **Closing Credits**
   - Continue links and footer.
   - Last signal fades out.

## Motion language

Use:

- line drawing
- staggered node activation
- subtle track progress
- text appearing like captions
- credits drift
- snap-section entrance reveals

Avoid:

- bouncing doodles
- neon scans
- heavy parallax
- uncontrolled scroll hijacking

## Next-stage recommendation

Next About phase should focus on creating reusable sketch/signal primitives rather than designing every slide as an unrelated hero:

- `SketchLine` / inline SVG path patterns
- rough hand-drawn panel lines
- timeline/track motifs
- credits lanes
- favorites shelf lanes
- section numbering system

Start with CSS/SVG and only add Rough.js or Anime.js when a specific interaction needs it.

## Design revision: Paper Signal Theatre

After reviewing the first image-led About stage, the stronger direction is to stop borrowing Home's hero/image-pool language entirely. The About page should become a separate object: a scanned private design dossier.

### Definition

**Paper Signal Theatre** is a seven-page personal dossier built from paper texture, pencil structure lines, blue annotation, red correction marks, sketch primitives, and snap-page staging.

It is not:

- a résumé
- a photo hero sequence
- a cyber HUD
- a generic line-art tech page

It should feel like:

- an animation setting sheet
- a production notebook
- a record sleeve insert
- a technical sketchbook
- a private archive scanned into the browser

### Relationship to Home

- Home: emotional image-led opening, anime OP/key visual, rotating image pool.
- About: paper dossier, hand-annotated identity system, structured but personal.

### Visual base

Use a light paper surface as the primary About identity:

- warm rough paper base
- subtle scan grain
- faint fold/shadow marks
- registration marks
- pale pencil construction lines
- blue pencil annotations
- rare red correction marks
- tape-like translucent patches

Dark mode can invert into black paper / blueprint paper later, but the first design pass should prove the light paper version.

### Line system

Three line roles:

1. **Pencil structure lines**
   - 70% of lines
   - pale gray-blue, low opacity
   - page grid, alignment marks, draft geometry

2. **Blue annotation lines**
   - 25% of lines
   - active emphasis, circles, hover routes, selected item marks

3. **Red correction lines**
   - 5% of lines
   - tiny human marks, crosses, arrows, note tags

Suggested visual parameters:

- main stroke: 1.2px
- auxiliary stroke: 0.75px
- annotation stroke: 1.4px
- dashed line: 4px dash / 10px gap
- Rough.js roughness: 0.55-0.9
- Rough.js bowing: 0.6-1.2

### Seven-page dossier structure

1. **Cover Sheet**
   - Huge hand-drawn `PAN` outline.
   - `PERSONAL FILE / 01` label.
   - scan marks, tape patch, paper texture.
   - Small printed metadata like `opened at 2026`.

2. **Current Notes**
   - Project-handbook style.
   - Three paper notes connected by blue pencil lines.

3. **Build Inventory**
   - Technical stack as inventory, not skill badges.
   - LANG / SURFACE / TOOLS sections.

4. **Favorites Index**
   - Anime, manga, game, sound as index-card rows.
   - One page, four lanes.
   - Blue pencil circles the current favorite.

5. **Taste Diagram**
   - Relationship map between emotional objects and structural objects.
   - Words such as night, silence, character, memory, system, archive, code, order.

6. **Route Map**
   - Blog / Projects / Anime as hand-drawn routes through PAN.

7. **Back Cover**
   - `file closed`, continue links, copyright/RSS/sitemap.
   - Quiet final page with print-like footer.

### First implementation target

Start with page 01, Cover Sheet.

Success criteria:

- It no longer uses the About cover image as the identity.
- The screen reads as full-viewport paper, not a card.
- The huge PAN outline feels hand-drawn, not typed text.
- The navigation can sit over the paper surface without hiding content.
- The page has enough paper/scan/line detail to avoid feeling empty.
- Visual quality is high enough to justify extending the system to pages 02-07.
