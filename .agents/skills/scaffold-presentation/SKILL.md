---
name: scaffold-presentation
description: Creates a new local HTML presentation from this repository's harness template. Use when asked to create, scaffold, or start a presentation or slide deck. Generated presentations stay under presentations/ and must remain untracked.
license: MIT
compatibility: Node.js 20 or newer
---

# Scaffold a presentation

## Procedure

1. Resolve the repository root containing `package.json` and `templates/deck.html`.
2. Choose a lowercase kebab-case slug.
3. Run:

   ```bash
   npm run new -- <slug> --title "<TITLE>" --languages en,es --default-language auto --themes midnight,paper --default-theme auto
   ```

4. Edit only the generated files under `presentations/<slug>/` for deck-specific content.
5. Use stable `data-i18n` keys for every user-visible string.
6. Ask the user which visual theme(s) they want. Edit the generated `themes` object rather than hardcoding a theme in the harness.
7. Run `npm run validate` and `npm test`.
8. Confirm `git status --short` does not show the generated presentation.

## Constraints

- Never force-add files from `presentations/`.
- Do not place private presentation content in tracked templates, tests, examples, or README files.
- Keep reusable navigation, localization, and visual behavior in `src/`; keep deck content local.
- Use `--force` only when the user explicitly approves replacing an existing local deck.
