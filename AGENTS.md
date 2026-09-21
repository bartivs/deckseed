# Presentation Harness Agent Guide

## Privacy boundary

- Presentation content belongs under `presentations/` and must remain ignored and untracked.
- Never use `git add -f` for a presentation.
- Before every commit, confirm no presentation path is staged.

## Content approval gate

- Always develop and iterate on presentation ideas, audience, narrative, and slide outline with the user in chat first.
- Do not create or change presentation content until the user explicitly approves the proposed direction and outline.
- After approval, record the brief, metadata, and slide-by-slide copy in `presentations/<slug>/content.md`.
- Treat `content.md` as both the approved source artifact and the Pandoc implementation source. Do not hand-edit generated `index.html`.
- Return to chat for approval before introducing material changes to approved content or structure.

## Workflow

Use the shared Agent Skills under `.agents/skills/`:

- `scaffold-presentation` to create a deck.
- `open-presentation` to launch a local deck.
- `localize-presentation` to create or update a localized source.
- `theme-presentation` to define and test the fixed theme.
- `validate-presentation` before completion.

## Architecture

- Pandoc Markdown and deck metadata live in `presentations/<slug>/content.md`.
- Deck-specific theme overrides live in `presentations/<slug>/theme.css`.
- Generated `presentations/<slug>/index.html` is disposable build output.
- Shared Reveal.js styling belongs in `src/pandoc.css`.
- Generator, build, server, and validation logic belongs in `scripts/`.
- Tracked scaffolding belongs in `templates/`.
- The build must use Pandoc's Reveal.js writer with embedded resources. Generated HTML must have no external script or stylesheet tags.
- Keep the npm package dependency-free; Pandoc is an external CLI prerequisite.

## Build behavior

- Run `npm run build -- <slug>` after changing `content.md`, `theme.css`, or shared CSS.
- `npm run bundle -- <slug>` is a compatibility alias for the same build.
- The builder stamps a SHA-256 of all source inputs into `index.html`; validation rejects stale output.
- One source deck has one language. Localize by producing a separate approved source/deck rather than runtime translation dictionaries.
- The selected theme belongs to the deck definition. Do not add viewer-facing language or theme selectors.

## Preview behavior

- Do not start the local presentation server unless the user explicitly asks for it.
- Build and validate the self-contained static `presentations/<slug>/index.html`, then point the user to that file.
- Ask before opening the static file in the user's default browser.

## Verification

Run:

```bash
npm test
npm run validate
git diff --check
git status --short --ignored
```

The status must show presentation files only as ignored (`!!`), never staged.
