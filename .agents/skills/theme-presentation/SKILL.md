---
name: theme-presentation
description: Defines, customizes, or validates built-in and external CSS themes for a Pandoc and Reveal.js presentation.
license: MIT
compatibility: Node.js 20 or newer; Pandoc 3 or newer
---

# Theme a presentation

Themes are build-time presentation configuration, not viewer preferences. The generator records the selected theme in `content.md`; the UI must not expose a theme selector.

Available built-in presets are `midnight`, `paper`, `ember`, `atlas`, `solar`, `ocean`, `plum`, `mono`, and `meadow`. Their source is `src/theme-presets.js`, and README previews are regenerated with `npm run themes:previews`.

External themes may be installed as npm packages or supplied as local directories. They must contain `deckseed-theme.json` and `theme.css`. The manifest uses schema version 1 and declares `id`, `label`, `colorScheme`, and a relative CSS path. External CSS must define all `--harness-*` theme variables and cannot use `@import`, remote URLs, or non-data `url(...)` resources. Deckseed never executes package JavaScript.

## Procedure

1. Select a preset during scaffolding:

   ```bash
   npm run new -- <slug> --theme atlas
   ```

2. For an existing built-in deck, edit its ignored `theme.css`. Keep semantic `--harness-*` variables and Reveal mappings such as `--r-background-color`.
3. Record the stable theme name in the `harness-theme` field of `content.md`.
4. For an external package, install it and scaffold with `npm run new -- <slug> --theme <package-name>`, or pass a local theme path. The source records both `harness-theme` and `harness-theme-package`; its local `theme.css` is an override layer.
5. Use `npm run themes` to list built-ins and installed external themes.
6. Keep resources local: no `@import` or remote `url(...)` declarations.
7. Check text, muted text, and accents for contrast against backgrounds and panels.
8. Check cards, tables, code, focus states, print output, and scaled mobile rendering.
9. Rebuild after every source change:

   ```bash
   npm run build -- <slug>
   npm test
   npm run validate
   ```

## Constraints

- Do not add a runtime theme selector.
- Do not hand-edit generated `index.html`.
- Keep presentation-specific CSS under the ignored presentation directory.
- Keep reusable structural styles in `src/pandoc.css`.
- Keep reusable external theme CSS in its own package repository; do not copy package CSS into a presentation.
