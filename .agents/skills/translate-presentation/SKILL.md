---
name: translate-presentation
description: Translates every slide in a presentation without leaving later slides in the source language, using complete translation-key coverage, preserved markup, selector verification, and responsive validation.
license: MIT
compatibility: Node.js 20 or newer
---

# Translate a presentation

Use this skill when adding or updating a presentation language, especially when a deck already contains substantial HTML content.

## Required contract

Every configured language must have the same translation keys as the fallback language:

```js
window.PRESENTATION_CONFIG = {
  fallbackLanguage: "en",
  defaultLanguage: "auto",
  languages: {
    en: { label: "English", direction: "ltr" },
    es: { label: "Español", direction: "ltr" }
  },
  translations: {
    en: { "slides.01.html": "..." },
    es: { "slides.01.html": "..." }
  }
};
```

Keep product names, API identifiers, enum values, code, URLs, commit SHAs, event names, and protocol tokens unchanged unless localization is intentional.

## Procedure

1. Read `localize-presentation/SKILL.md` and preserve its language-selection precedence.
2. Inventory **every** slide, not only the title slide. Count the sections and create one stable translation key per slide or per semantic text node.
3. Mark all user-visible content with translation attributes:
   - `data-i18n` for plain text.
   - `data-i18n-html` only for trusted, local markup that must retain structure.
   - `data-i18n-aria-label` and `data-i18n-title` for accessible labels and titles.
4. For a deck with dense existing markup, put a complete slide body behind a key such as `slides.02.html`. Apply that key to the corresponding `<section>`. Do not translate only the first slide or only headings.
5. Add every slide key to the fallback language and every configured language. A translated slide body must preserve required HTML structure, links, code blocks, tables, diagrams, and product identifiers.
6. Audit the translated language for unexpected unchanged prose. Explicitly allow intentional technical tokens and brand names, but do not silently accept unchanged sentences or later slides.
7. Verify:
   - selector options show all configured languages;
   - `?lang=<code>` translates slide 1, a middle slide, and the final slide;
   - navigation does not reset the language;
   - browser-language selection and local-storage precedence still work;
   - accessible labels change with the language;
   - RTL languages set `direction: "rtl"` and render correctly.
8. Run:

   ```bash
   npm test
   npm run validate
   git diff --check
   ```

9. Check both a desktop viewport and a narrow mobile viewport. Wait for slide transitions before judging screenshots; an old slide can briefly remain visible during the animation.

## Failure conditions

Treat any of these as defects:

- only the first slide changes language;
- a slide displays a translation key or source-language prose unexpectedly;
- a configured language has missing keys;
- translated trusted markup breaks the slide structure;
- URLs, code, API identifiers, enum values, or product names are corrupted;
- accessible names remain in the fallback language;
- presentation content is staged or committed. Presentation files under `presentations/` must remain ignored.
