---
name: localize-presentation
description: Adds, removes, or updates configurable presentation languages and translations. Use for language selectors, Spanish or other translations, browser-language defaults, fallback behavior, RTL support, or translation-key audits.
license: MIT
compatibility: Node.js 20 or newer
---

# Localize a presentation

## Configuration contract

Each generated deck defines `window.PRESENTATION_CONFIG` in `deck.config.js`:

```js
window.PRESENTATION_CONFIG = {
  id: "deck-id",
  fallbackLanguage: "en",
  defaultLanguage: "auto",
  languages: {
    en: { label: "English", direction: "ltr" },
    es: { label: "Español", direction: "ltr" }
  },
  translations: {
    en: { "slides.title.heading": "Title" },
    es: { "slides.title.heading": "Título" }
  }
};
```

## Selection precedence

Do not change this order without an explicit compatibility decision:

1. `?lang=<code>` URL override
2. Previously selected language in local storage
3. `navigator.languages` when `defaultLanguage` is `auto`
4. Configured `defaultLanguage`
5. `fallbackLanguage`
6. First configured language

## Procedure

1. Add the language metadata under `languages`.
2. Add the same translation keys under the new language.
3. Mark text with `data-i18n`, trusted local markup with `data-i18n-html`, and accessible labels with `data-i18n-aria-label`.
4. Keep product names, API identifiers, enum values, code, and URLs unchanged unless localization is intentional.
5. Set `direction: "rtl"` for right-to-left languages.
6. Test explicit selection with `?lang=<code>` and automatic selection with the browser language.
7. Run `npm run validate` and `npm test`.

## Failure behavior

A missing translation falls back to `fallbackLanguage`; if still missing, the translation key is shown. Treat visible keys as validation defects rather than silently inventing text.
