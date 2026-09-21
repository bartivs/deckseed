---
name: translate-presentation
description: Translates every slide of a Pandoc presentation into a separate complete source deck while preserving structure, markup, facts, and theme behavior.
license: MIT
compatibility: Node.js 20 or newer; Pandoc 3 or newer
---

# Translate a complete presentation

## Procedure

1. Read the source deck's `content.md` completely before translating.
2. Create a separate target-language deck with `npm run new -- <slug>-<language> --language <language>`.
3. Translate all viewer-facing content into the target `content.md`, including metadata, headings, cards, tables, footers, notes, captions, and alternative text.
4. Preserve horizontal slide separators, fenced div structure, raw HTML tags, CSS classes, numbers, URLs, and evidence qualifiers.
5. Search the target source for source-language remnants. Review every slide, not only early slides.
6. Build the localized output and verify that the number and order of slides match:

   ```bash
   npm run build -- <localized-slug>
   npm run validate
   ```

7. Check dense slides for wrapping or overflow caused by translated text.

## Constraints

- Never translate by editing generated HTML.
- Do not omit difficult tables or later slides.
- Do not materially reinterpret approved claims.
- Do not add a runtime language selector.
