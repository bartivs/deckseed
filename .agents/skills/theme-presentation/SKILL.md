---
name: theme-presentation
description: Defines, customizes, or validates the presentation-defined theme. Use when changing colors, typography, visual tokens, light/dark styling, or the fixed theme selected by a deck.
license: MIT
compatibility: Node.js 20 or newer
---

# Theme a presentation

## Theme contract

Themes are presentation configuration, not runtime viewer preferences. The deck definition selects exactly one active theme with `theme`; the presentation UI must not expose a theme selector.

```js
window.PRESENTATION_CONFIG = {
  theme: "midnight",
  fallbackTheme: "midnight",
  themes: {
    midnight: {
      label: "Midnight",
      colorScheme: "dark",
      variables: {
        "--harness-bg": "#07111f",
        "--harness-panel": "#12243a",
        "--harness-text": "#f2f7fb",
        "--harness-muted": "#9db1c7",
        "--harness-accent": "#56d7e8"
      }
    }
  }
};
```

The runtime uses `theme`, then `fallbackTheme`, then the first configured theme. URL parameters, local storage, OS preference, and viewer controls do not change it.

## Procedure

1. Add or update the theme under `themes` in `presentations/<slug>/deck.config.js`.
2. Set `theme` to the selected stable lowercase theme ID.
3. Define a human-readable label, `colorScheme`, and semantic CSS custom properties.
4. Keep theme tokens global and semantic; do not encode slide-specific copy in a theme.
5. Run `npm run bundle -- <slug>` to refresh the inline definition in the self-contained HTML.
6. Check contrast, focus visibility, diagrams, tables, code blocks, print output, and narrow screens.
7. Run `npm test` and `npm run validate`.

## Constraints

- Do not add a runtime theme selector.
- Do not interpolate untrusted remote values into theme configuration.
- Custom property names must start with `--`.
- A missing or invalid selected theme must fall back without breaking navigation.
- The bundled `index.html` must remain self-contained and shareable by itself.
