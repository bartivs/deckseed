---
name: theme-presentation
description: Defines, customizes, or validates the fixed CSS theme for a Pandoc and Reveal.js presentation.
license: MIT
compatibility: Node.js 20 or newer; Pandoc 3 or newer
---

# Theme a presentation

Themes are build-time presentation configuration, not viewer preferences. The generator writes the selected preset into `presentations/<slug>/theme.css`; the UI must not expose a theme selector.

Available presets are `midnight`, `paper`, `ember`, `atlas`, `solar`, `ocean`, `plum`, `mono`, and `meadow`. Their source is `src/theme-presets.js`, and README previews are regenerated with `npm run themes:previews`.

## Procedure

1. Select a preset during scaffolding:

   ```bash
   npm run new -- <slug> --theme atlas
   ```

2. For an existing deck, edit its ignored `theme.css`. Keep semantic `--harness-*` variables and Reveal mappings such as `--r-background-color`.
3. Record the stable theme name in the `harness-theme` field of `content.md`.
4. Keep resources local: no `@import` or remote `url(...)` declarations.
5. Check text, muted text, and accents for contrast against backgrounds and panels.
6. Check cards, tables, code, focus states, print output, and scaled mobile rendering.
7. Rebuild after every source change:

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
