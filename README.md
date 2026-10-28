# TORBA24 — interactive design concepts

Six Polish-language static ecommerce prototypes, plus a comparison gallery. Built with native HTML, CSS and JavaScript. No framework or build step.

## Routes
- `/` — gallery
- `/glassy/` — Soft glass
- `/silver/` — Silver studio
- `/dark/` — After dark
- `/organic/` — Good impression
- `/catalog/` — product filters and search
- `/creator/` — local logo upload and print positioning

## Preview
Run `python3 -m http.server 8080` in this directory.

## Interactions
Material/color/quantity selection, category navigation, searchable catalog, size/color/material filters, local PNG/JPG/SVG upload, draggable and keyboard-movable print, print size and ink color, preview front/back, browser-local project settings and demonstration cart. Load saved settings via `creator/?restore=1`. Uploaded logos are not persisted or sent to any server.

## Scope
Concept brand and illustrative product assortment. No checkout backend, payments, real prices, customer accounts or submitted orders. Front/back views are illustrative. Some color variants are CSS-tinted sample photographs; production photography would replace them.

## Assets
Product images generated with the built-in image generation tool for these prototypes. Brief: isolated transparent product photography of an evergreen paper shopping bag, natural blank cotton tote, and kraft paper bag; neutral studio light and full handles visible. The preview gallery uses the six original generated UI concepts. Fonts: Google Fonts, Manrope and DM Sans with local sans-serif fallbacks.

## Deployment
GitHub Pages, branch `main`, repository root. All URLs are relative to the script location and support repository subpaths.
