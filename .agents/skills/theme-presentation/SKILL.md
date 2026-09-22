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

## Theme creation guidelines

### Canvas and spacing

- Use a 1600×900 authored canvas by default.
- Keep a desktop safe area of at least 48px vertically and 64px horizontally. Reserve 120px at the bottom-right for controls and slide numbers when enabled.
- Keep at least 24px horizontal padding on narrow screens.
- Use 16–24px gaps between cards, panels, table regions, and diagram nodes.
- Give cards at least 16px internal padding on desktop and 12px on narrow screens.
- Preserve distinct spacing between eyebrow, heading, main content, verdict/callout, and source note.
- Reduce typography, gaps, or content density before shrinking safe-area margins.

### Visual system

- Define all semantic `--harness-*` variables and Reveal mappings such as `--r-background-color`.
- Establish a clear hierarchy for eyebrow, display heading, section heading, body, muted text, labels, and source notes.
- Use one primary accent plus restrained semantic status colors. Accent color must communicate hierarchy, not decorate every surface.
- Use consistent panel backgrounds, borders, radii, and shadows. Avoid mixing unrelated visual treatments within one deck.
- Ensure body text, muted text, borders, links, tables, and code remain readable against every surface.
- Keep diagrams visually distinct from cards while sharing the same spacing and color system.
- Reset Reveal defaults for custom elements such as `pre.code`, tables, and raw HTML containers. Markdown-looking text inside a custom panel must render literally, not as unintended headings or lists.
- Define visible keyboard focus states and usable print styles.

### Visual review

Do not approve a theme from the title slide alone. Build and inspect representative title, card-grid, diagram, table, and code/dense slides with the headless screenshot workflow in `validate-presentation`.

## Procedure

1. Select a preset during scaffolding:

   ```bash
   npm run new -- <slug> --theme atlas
   ```

2. For an existing built-in deck, edit its ignored `theme.css`. Keep semantic variables and the safe-area rules above.
3. Record the stable theme name in the `harness-theme` field of `content.md`.
4. For an external package, install it and scaffold with `npm run new -- <slug> --theme <package-name>`, or pass a local theme path. The source records both `harness-theme` and `harness-theme-package`; its local `theme.css` is an override layer.
5. Use `npm run themes` to list built-ins and installed external themes.
6. Keep resources local: no `@import` or remote `url(...)` declarations.
7. Rebuild after every source change:

   ```bash
   npm run build -- <slug>
   npm test
   npm run validate
   ```

8. Run the headless screenshot review, inspect each PNG with the `read` tool, and iterate on margins, wrapping, contrast, overflow, and visual balance.

## Constraints

- Do not add a runtime theme selector.
- Do not hand-edit generated `index.html`.
- Keep presentation-specific CSS under the ignored presentation directory.
- Keep reusable structural styles in `src/pandoc.css`.
- Keep reusable external theme CSS in its own package repository; do not copy package CSS into a presentation.
