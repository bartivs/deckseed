# Presentation Harness

A token-efficient presentation pipeline built on Pandoc's Reveal.js writer. Authors maintain one approved `content.md` source and one `theme.css`; the build produces a self-contained `index.html` with navigation, touch controls, fullscreen, progress, print support, and embedded assets. Presentation content stays local and ignored by Git.

## Why Pandoc

Pandoc keeps the model-facing source compact: slide copy, document metadata, and layout annotations live in Markdown instead of duplicated HTML and JavaScript translation dictionaries. Generated HTML is disposable and must never be hand-edited.

```text
Chat approval → content.md + theme.css → Pandoc/Reveal.js → index.html → validation
```

The build uses:

- Pandoc's `revealjs` writer;
- Reveal.js 5.2.1, pinned for reproducible output;
- `--embed-resources` for a single shareable HTML file;
- a SHA-256 source stamp so validation detects stale output.

See the official [Pandoc slide-show documentation](https://pandoc.org/MANUAL.html#slide-shows) and [installation guide](https://pandoc.org/installing.html).

## Prerequisites

- Node.js 20 or newer
- Pandoc 3 or newer available as `pandoc`
- Network access during builds so Pandoc can fetch the pinned Reveal.js assets; generated decks work offline

Check the installation:

```bash
node --version
pandoc --version
```

Set `PANDOC_BIN=/path/to/pandoc` when the executable is not on `PATH`.

## Production pipeline

### 1. Approve the content

First agree in chat on the audience, goal, core message, narrative, slide outline, language, and visual direction. Do not create presentation files before approval.

### 2. Scaffold the source

```bash
npm run new -- architecture-review \
  --title "Architecture Review" \
  --language en \
  --theme atlas
```

This creates only source files:

```text
presentations/architecture-review/
├── content.md   Approved metadata, copy, and Pandoc slide structure
└── theme.css    Fixed presentation theme and local visual overrides
```

### 3. Implement in Markdown

`content.md` is both the approval artifact and production source:

```markdown
---
pagetitle: "Architecture Review"
lang: "en"
harness-theme: "atlas"
audience: "Engineering and product leadership"
goal: "Agree on the target architecture"
core-message: "A smaller platform surface improves delivery speed"
controls: true
progress: true
slideNumber: true
transition: fade
---

<div class="eyebrow">Architecture</div>

# Architecture Review

A smaller platform surface improves delivery speed.

---

# Decision

- Consolidate shared services
- Publish stable contracts
- Migrate incrementally
```

Horizontal rules separate slides. Use ordinary Markdown by default, fenced divs for layout groups, and trusted local HTML only when the design requires it.

### 4. Build

```bash
npm run build -- architecture-review
```

The resulting `presentations/architecture-review/index.html` contains its Reveal.js runtime, shared CSS, deck CSS, and media inline. `npm run bundle -- <slug>` remains as a compatibility alias.

### 5. Validate

```bash
npm test
npm run validate
git diff --check
git status --short --ignored
```

Validation rejects missing sources, remote theme resources, external scripts or stylesheets, non-Reveal output, and stale generated HTML.

### 6. Preview or share

The normal deliverable is the generated static file:

```text
presentations/<slug>/index.html
```

It can be copied or opened directly without the repository. Start the local server only when an interactive browser preview is requested:

```bash
npm run open -- <slug>
```

## Privacy boundary

Everything inside `presentations/` is ignored except `.gitkeep`:

```gitignore
presentations/*
!presentations/.gitkeep
```

Never use `git add -f` for a presentation. Decks may contain internal plans, customer information, or unpublished research.

## Themes

Theme choice is part of the presentation source, not a viewer preference. The generator writes the selected preset to `theme.css`; there is no runtime theme selector.

The presets are original interpretations of common families in [Reveal.js themes](https://revealjs.com/themes/), [Marp's built-in themes](https://github.com/marp-team/marp-core/blob/main/themes/README.md), and popular minimalist/professional template categories. These references identify recurring styles, not an objective popularity ranking.

| Theme | Preview | Designed for |
| --- | --- | --- |
| `midnight` | <img src="docs/theme-previews/midnight.svg" alt="Midnight theme demo" width="240"> | Technical talks, product launches, data-heavy stories |
| `paper` | <img src="docs/theme-previews/paper.svg" alt="Paper theme demo" width="240"> | Editorial narratives, reports, thoughtful long-form decks |
| `ember` | <img src="docs/theme-previews/ember.svg" alt="Ember theme demo" width="240"> | Bold keynotes, launches, energetic pitches |
| `atlas` | <img src="docs/theme-previews/atlas.svg" alt="Atlas theme demo" width="240"> | Executive reviews, strategy, premium proposals |
| `solar` | <img src="docs/theme-previews/solar.svg" alt="Solar theme demo" width="240"> | Workshops, documentation, warm technical decks |
| `ocean` | <img src="docs/theme-previews/ocean.svg" alt="Ocean theme demo" width="240"> | Education, healthcare, calm explanatory stories |
| `plum` | <img src="docs/theme-previews/plum.svg" alt="Plum theme demo" width="240"> | Creative technology, demos, modern night-mode decks |
| `mono` | <img src="docs/theme-previews/mono.svg" alt="Mono theme demo" width="240"> | Minimal portfolios, architecture, sharp product narratives |
| `meadow` | <img src="docs/theme-previews/meadow.svg" alt="Meadow theme demo" width="240"> | Sustainability, people, lifestyle, organic brands |

Customize the ignored `theme.css` after scaffolding. Rebuild whenever it changes. Run `npm run themes:previews` after changing the tracked preset library.

## Localization

One source deck has one language. A translated presentation gets a separate source and generated HTML, for example:

```text
presentations/quarterly-review/
presentations/quarterly-review-es/
```

This avoids large runtime translation dictionaries and keeps each Markdown source readable. Preserve slide structure, translate the complete deck, set the correct `lang`, and build both outputs independently.

## Commands

```bash
npm run new -- <slug> [options]  # Create ignored Pandoc sources
npm run build -- <slug>          # Generate self-contained Reveal.js HTML
npm run bundle -- <slug>         # Compatibility alias for build
npm run serve                    # Serve local decks on port 4173
npm run open -- <slug>           # Start the server and open a deck
npm run themes:previews          # Regenerate README theme demos
npm run validate                 # Validate source and generated output
npm test                         # Run the test suite
```

Generator options:

- `--title "Title"`
- `--language en|es|pt-BR|...`
- `--theme midnight|paper|ember|atlas|solar|ocean|plum|mono|meadow`
- `--force` to replace an existing local deck

## Repository structure

```text
src/pandoc.css                Shared Reveal.js presentation styling
src/theme-presets.js          Generator theme presets
scripts/build-deck.mjs        Pandoc build and self-contained-output checks
scripts/new-deck.mjs          Source scaffolding
scripts/validate.mjs          Freshness, portability, and privacy validation
templates/content.md          Tracked Pandoc starter source
presentations/                Ignored source decks and generated output
docs/theme-previews/          README theme demos
test/                         Harness tests
```

## License

MIT
