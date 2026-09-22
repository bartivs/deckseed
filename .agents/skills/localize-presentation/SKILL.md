---
name: localize-presentation
description: Creates or updates a separate localized Pandoc source deck without runtime translation dictionaries or language selectors.
license: MIT
compatibility: Node.js 20 or newer; Pandoc 3 or newer
---

# Localize a presentation

The Pandoc pipeline uses one language per source deck. Localization produces a separate ignored deck, normally with a language suffix such as `<slug>-es`, and a separate self-contained `index.html`.

## Procedure

1. Confirm the target language and whether the approved structure must remain exact.
2. Scaffold the localized deck using the same theme:

   ```bash
   npm run new -- <slug>-es --title "<LOCALIZED TITLE>" --language es --theme atlas
   ```

3. Translate the complete source from the original `content.md` into the new `content.md`:
   - preserve the exact source slide order, including any intentionally non-numeric narrative ordering;
   - map localized blocks by their source slide identity/title, never by assuming numeric labels equal file order;
   - preserve visual classes and structural wrappers;
   - translate headings, body text, labels, footers, notes, alt text, and metadata;
   - set `lang` to the target BCP 47 language code;
   - preserve facts, URLs, numbers, and approved caveats.
4. Copy only necessary deck-specific CSS adjustments into the localized `theme.css`.
5. Compare localized and source slide counts and ordered title sequence before building.
6. Build and validate both decks:

   ```bash
   npm run build -- <slug>
   npm run build -- <slug>-es
   npm run validate
   ```

## Constraints

- Do not add runtime language selectors or translation dictionaries.
- Do not leave later slides in the source language.
- Do not combine multiple languages in one `content.md` unless the approved presentation itself is bilingual.
- Keep all localized presentation files ignored and untracked.
