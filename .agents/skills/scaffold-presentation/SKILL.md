---
name: scaffold-presentation
description: Iterates on and obtains approval for presentation ideas, records approved content in Markdown, then creates a local HTML deck from this repository's harness template. Use when asked to create, scaffold, or start a presentation or slide deck. Generated presentations stay under presentations/ and must remain untracked.
license: MIT
compatibility: Node.js 20 or newer
---

# Scaffold a presentation

## Procedure

1. Resolve the repository root containing `package.json`, `templates/content.md`, and `templates/deck.html`.
2. In chat, propose and iterate on the audience, goal, core message, narrative, slide-by-slide outline, and visual theme(s). Do not create or edit presentation files yet.
3. Wait for explicit user approval of the direction and outline. Questions, silence, or a request to keep iterating are not approval.
4. After approval, choose a lowercase kebab-case slug and run:

   ```bash
   npm run new -- <slug> --title "<TITLE>" --languages en,es --default-language auto --theme midnight
   ```

5. Replace the generated `presentations/<slug>/content.md` with the approved brief and slide-by-slide copy before changing the HTML. Treat this Markdown file as the source artifact for the presentation.
6. Implement `index.html` and `deck.config.js` from `content.md`. Do not add ideas or materially change the approved structure without returning to chat and obtaining approval.
7. Edit only the generated files under `presentations/<slug>/` for deck-specific content.
8. Use stable `data-i18n` keys for every user-visible string. Select the fixed presentation theme in `deck.config.js`; do not add a viewer-facing theme selector.
9. Run `npm run bundle -- <slug>` after configuration or shared-runtime changes. The resulting `index.html` must contain its CSS, configuration, and JavaScript inline so it can be shared alone.
10. Run `npm run validate` and `npm test`.
11. Confirm `git status --short` does not show the generated presentation.

## Constraints

- Never force-add files from `presentations/`.
- Do not place private presentation content in tracked templates, tests, examples, or README files.
- Keep reusable navigation, localization, and visual behavior in `src/`; keep deck content local.
- Keep `content.md`, `index.html`, and `deck.config.js` synchronized; Markdown approval does not authorize unrelated additions during HTML implementation.
- Generated `index.html` files must be self-contained: no local stylesheet, configuration, or script dependencies.
- Use `--force` only when the user explicitly approves replacing an existing local deck.
