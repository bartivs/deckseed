---
name: theme-presentation
description: Defines, customizes, or validates user-selectable presentation themes. Use when changing colors, typography, visual tokens, light/dark behavior, theme defaults, or the runtime theme selector.
license: MIT
compatibility: Node.js 20 or newer
---

# Theme a presentation

## Theme contract

Themes are deck configuration, not hardcoded harness branches:

```js
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
```

## Selection precedence

1. `?theme=<id>` URL override
2. Saved user selection
3. OS light/dark preference when `defaultTheme` is `auto`
4. Configured `defaultTheme`
5. `fallbackTheme`
6. First configured theme

## Procedure

1. Add a stable lowercase theme ID under `themes`.
2. Define a human-readable label, `colorScheme`, and CSS custom properties.
3. Keep theme tokens global and semantic; do not encode slide-specific copy in a theme.
4. Check contrast, focus visibility, diagrams, tables, code blocks, print output, and narrow screens.
5. Verify explicit `?theme=<id>`, saved choice, automatic OS preference, and fallback behavior.
6. Run `npm test` and `npm run validate`.

## Constraints

- Do not interpolate untrusted remote values into theme configuration.
- Custom property names must start with `--`.
- A missing or invalid theme must fall back without breaking slide navigation.
- Deck authors may define any number of themes; the selector is hidden when only one is configured.
