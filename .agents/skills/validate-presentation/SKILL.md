---
name: validate-presentation
description: Validates and previews presentations created with this harness. Use before presenting, sharing the standalone HTML, exporting to PDF, publishing harness changes, or checking navigation, localization, responsive rendering, and Git privacy boundaries.
license: MIT
compatibility: Node.js 20 or newer; a browser is recommended for visual checks
---

# Validate a presentation

## Automated checks

Refresh the self-contained bundle after editing deck configuration or reusable harness files:

```bash
npm run bundle -- <slug>
npm test
npm run validate
```

Then verify the privacy boundary:

```bash
git status --short
git check-ignore -v presentations/<slug>/index.html
```

The presentation must be ignored. Never stage it.

`npm run validate` must reject:

- stale inline configuration;
- external script or stylesheet dependencies;
- a runtime theme selector;
- missing language, translation, or theme definitions.

## Browser checks

1. Start the server with `npm run serve`, or open the self-contained `index.html` directly with `file://`.
2. Open `http://127.0.0.1:4173/presentations/<slug>/` when using the server.
3. Check previous/next buttons, slide-background click, keyboard, touch, Home/End, fullscreen, and print controls.
4. Check every configured language through the selector and `?lang=<code>`.
5. Confirm the browser language and stored language are selected when no URL choice exists.
6. Confirm the theme matches the fixed `theme` value in the presentation definition and that no theme selector is visible.
7. Check 1440×900 and a narrow mobile viewport.
8. Open or copy `index.html` outside the repository and confirm navigation and styling still work without network or local-file requests.
9. Print to PDF and verify slide boundaries.

## Completion criteria

- No missing translation keys are visible.
- Every slide fits or scrolls intentionally.
- Accessible names change with the selected language.
- Language URL overrides, persisted choices, automatic defaults, and fallbacks behave in the documented order.
- The author-selected theme is applied without viewer-facing theme controls.
- `index.html` is fully self-contained and shareable by itself.
- No presentation content appears in the staged diff.
