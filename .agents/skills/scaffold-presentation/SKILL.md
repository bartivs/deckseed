---
name: scaffold-presentation
description: Iterates on and obtains approval for presentation ideas, then creates a local Pandoc Markdown deck with a fixed theme and self-contained Reveal.js output.
license: MIT
compatibility: Node.js 20 or newer; Pandoc 3 or newer
---

# Scaffold a presentation

## Procedure

1. Resolve the repository root containing `package.json` and `templates/content.md`.
2. In chat, propose and iterate on the audience, goal, core message, narrative, slide-by-slide outline, language, and visual direction.
3. Wait for explicit approval. Questions, silence, or a request to keep iterating are not approval.
4. Create the ignored source files:

   ```bash
   npm run new -- <slug> --title "<TITLE>" --language en --theme midnight
   ```

5. Replace the starter material in `presentations/<slug>/content.md` with the approved metadata and complete slide copy. This file is both the approval artifact and Pandoc source.
6. Use Pandoc Markdown, fenced divs, and minimal trusted local HTML only when a visual layout needs it. Never edit generated `index.html`.
7. Customize `theme.css` only for deck-specific visual requirements.
8. Build and validate:

   ```bash
   npm run build -- <slug>
   npm test
   npm run validate
   ```

9. Confirm `git status --short --ignored` shows the presentation only as ignored.

## Constraints

- Never force-add presentation files.
- Do not put private copy in tracked templates, tests, examples, or documentation.
- Do not materially change approved content without renewed approval.
- Keep one language per source deck; use the localization skill for another language.
- The generated HTML must remain self-contained, with no external script or stylesheet tags.
- Use `--force` only when the user explicitly approves replacing an existing local deck.
