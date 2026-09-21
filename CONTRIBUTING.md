# Contributing to Deckseed

Thanks for helping improve Deckseed, an agent-first Markdown presentation generator built with Pandoc and Reveal.js.

## Development requirements

- Node.js 20 or newer
- Pandoc 3 or newer
- Git

Deckseed has no npm runtime dependencies. External theme packages are optional development dependencies and must follow the declarative `deckseed-theme.json` and `theme.css` contract.

## Local verification

Before submitting a change, run:

```bash
npm test
npm run validate
git diff --check
git status --short --ignored
```

Changes to `content.md`, `theme.css`, or `src/pandoc.css` require rebuilding affected local decks:

```bash
npm run build -- <slug>
```

## Presentation privacy boundary

Everything under `presentations/` is intentionally ignored except `.gitkeep`. Never force-add a presentation. Test fixtures must not contain private deck content and must be removed when a test completes.

Before committing, confirm that no presentation path is staged:

```bash
git diff --cached --name-only -- presentations
```

The command must return no paths.

## Project structure

- `src/` contains shared CSS and built-in theme presets.
- `scripts/` contains scaffolding, build, theme resolution, server, and validation logic.
- `templates/` contains tracked starter sources.
- `.agents/skills/` contains the canonical agent workflows.
- `docs/` contains public project and theme assets.
- `test/` contains Node.js tests.

## Change guidelines

- Keep `content.md` as the canonical presentation source and `index.html` as disposable generated output.
- Preserve self-contained HTML output: no external scripts, stylesheets, or media.
- Keep theme tokens semantic and maintain accessible contrast.
- External themes must be declarative CSS packages; never execute package JavaScript during discovery or builds.
- Reject remote theme resources and keep package CSS paths inside the theme package.
- Add or update tests for build, validation, theme, or routing behavior.
- Keep commits atomic and describe the change accurately.

## Proposing features

For significant changes, explain the target user, production problem, expected source format, generated behavior, failure cases, and verification plan before implementation.
