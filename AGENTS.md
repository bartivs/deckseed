# Presentation Harness Agent Guide

## Privacy boundary

- Presentation content belongs under `presentations/` and must remain ignored and untracked.
- Never use `git add -f` for a presentation.
- Before every commit, confirm no presentation path is staged.

## Workflow

Use the shared Agent Skills under `.agents/skills/`:

- `scaffold-presentation` to create a deck.
- `open-presentation` to launch a local deck in the browser.
- `localize-presentation` to configure languages and translations.
- `theme-presentation` to define and test user-selectable themes.
- `validate-presentation` before completion.

## Architecture

- Reusable browser behavior belongs in `src/`.
- Generator/server/validation logic belongs in `scripts/`.
- Tracked scaffolding belongs in `templates/`.
- Deck-specific copy, translations, images, and configuration belong in ignored `presentations/`.
- Keep the harness dependency-free unless a requirement cannot reasonably be implemented with browser and Node.js standard APIs.

## Verification

Run:

```bash
npm test
npm run validate
git diff --check
git status --short --ignored
```

The status must show presentation files only as ignored (`!!`), never staged.
