---
name: validate-presentation
description: Validates and previews presentations created with this harness. Use before presenting, exporting to PDF, publishing harness changes, or checking navigation, localization, responsive rendering, and Git privacy boundaries.
license: MIT
compatibility: Node.js 20 or newer; a browser is recommended for visual checks
---

# Validate a presentation

## Automated checks

From the repository root run:

```bash
npm test
npm run validate
```

Then verify the privacy boundary:

```bash
git status --short
git check-ignore -v presentations/<slug>/index.html
```

The presentation must be ignored. Never stage it.

## Browser checks

1. Start the server:

   ```bash
   npm run serve
   ```

2. Open `http://127.0.0.1:4173/presentations/<slug>/`.
3. Check keyboard, button, touch, Home/End, fullscreen, and print controls.
4. Check every configured language through the selector and `?lang=<code>`.
5. Check every configured theme through the selector and `?theme=<id>`.
6. Confirm the browser language and OS color preference are selected when no URL or stored choice exists.
7. Check 1440×900 and a narrow mobile viewport.
8. Print to PDF and verify slide boundaries.

## Completion criteria

- No missing translation keys are visible.
- Every slide fits or scrolls intentionally.
- Accessible names change with the selected language.
- Language and theme URL overrides, persisted choices, automatic defaults, and fallbacks behave in the documented order.
- No presentation content appears in the staged diff.
