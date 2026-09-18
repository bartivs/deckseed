# Presentation Harness

A dependency-free HTML presentation harness with keyboard/touch navigation, print support, configurable localization, and user-defined themes. Shared Agent Skills make the same workflows available to Pi, OpenCode, Claude Code, and Codex. The harness is tracked; presentation content stays local and is ignored by Git.

## Quick start

```bash
npm run new -- architecture-review \
  --title "Architecture Review" \
  --languages en,es \
  --default-language auto \
  --themes midnight,paper \
  --default-theme auto

npm run serve
```

Open `http://127.0.0.1:4173/presentations/architecture-review/`.

## Privacy boundary

Everything inside `presentations/` is ignored except `.gitkeep`:

```gitignore
presentations/*
!presentations/.gitkeep
```

Do not use `git add -f` for presentation files. They may contain internal plans, customer information, or unpublished research.

## Configurable languages

Each deck has a local `deck.config.js`:

```js
window.PRESENTATION_CONFIG = {
  id: "architecture-review",
  fallbackLanguage: "en",
  defaultLanguage: "auto",
  languages: {
    en: { label: "English", direction: "ltr" },
    es: { label: "Español", direction: "ltr" },
    ar: { label: "العربية", direction: "rtl" }
  },
  translations: {
    en: { "slides.title.heading": "Architecture Review" },
    es: { "slides.title.heading": "Revisión de arquitectura" },
    ar: { "slides.title.heading": "مراجعة البنية" }
  },
  fallbackTheme: "midnight",
  defaultTheme: "auto",
  themes: {
    midnight: {
      label: "Midnight",
      colorScheme: "dark",
      variables: {
        "--harness-bg": "#07111f",
        "--harness-panel": "#12243a",
        "--harness-text": "#f2f7fb",
        "--harness-muted": "#9db1c7",
        "--harness-accent": "#56d7e8"
      }
    }
  }
};
```

Language selection precedence:

1. `?lang=<code>` URL parameter
2. Saved user selection
3. Browser languages when `defaultLanguage: "auto"`
4. Configured default
5. Fallback language
6. First configured language

The harness matches regional browser values such as `es-ES` to a configured base language such as `es`.

### Translation attributes

```html
<h1 data-i18n="slides.title.heading">Fallback title</h1>
<button data-i18n-aria-label="controls.next">→</button>
<div data-i18n-html="slides.diagram.markup"></div>
```

`data-i18n-html` is intended only for trusted, repository-local translation content.

## User-defined themes

Deck authors define themes in `deck.config.js` with semantic CSS custom properties. The runtime builds the selector from that object; no theme IDs are hard-coded in the browser harness. The generator offers `midnight`, `paper`, and `ember` starting points, which can be renamed or replaced locally.

Theme selection precedence:

1. `?theme=<id>` URL parameter
2. Saved user selection
3. OS light/dark preference when `defaultTheme: "auto"`
4. Configured default
5. Fallback theme
6. First configured theme

The selector is hidden automatically when a deck has only one theme.

## Commands

```bash
npm run new -- <slug> [options]  # Generate an ignored local deck
npm run serve                    # Serve harness and local decks on port 4173
npm run open -- <presentation>   # Start the server and open a deck
npm run validate                 # Validate templates and local decks
npm test                         # Run language-selection tests
```

Generator options:

- `--title "Title"`
- `--languages en,es,fr`
- `--default-language auto|<code>`
- `--themes midnight,paper,ember`
- `--default-theme auto|<id>`
- `--force` to replace an existing generated deck

## Repository structure

```text
src/                         Reusable browser harness
scripts/                     Generator, server, and validation
.agents/skills/              Canonical Agent Skills workflows
.claude/skills -> …           Claude Code discovery alias
.opencode/skills -> …         OpenCode discovery alias
templates/                   Tracked deck template
presentations/               Local ignored presentation content
test/                        Harness tests
```

## Multi-agent skills

The repository separates work into five shared Agent Skills:

- `scaffold-presentation` — generate a new ignored deck
- `open-presentation` — start the server and launch a local deck
- `localize-presentation` — configure languages and translation keys
- `theme-presentation` — define and check user-selectable themes
- `validate-presentation` — test rendering, localization, themes, and privacy boundaries

The canonical skills live in `.agents/skills/`:

- **Pi** discovers `.agents/skills/` and the `pi.skills` package manifest.
- **Codex** discovers `.agents/skills/` directly.
- **OpenCode** discovers `.agents/skills/`; `.opencode/skills` is also provided as an alias.
- **Claude Code** uses the `.claude/skills` alias and reads `CLAUDE.md`, which points to the shared `AGENTS.md` instructions.

All agents use the same files, so workflows cannot drift between agent-specific copies.

To open a deck without launching a desktop browser, use `npm run open -- <presentation> --no-browser`. If only one deck exists, `<presentation>` may be omitted.

## Keyboard controls

- `←` / `PageUp`: previous slide
- `→` / `PageDown` / `Space`: next slide
- `Home` / `End`: first or last slide
- `F`: fullscreen
- `P`: print

## License

MIT
