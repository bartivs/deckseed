# Deckseed — Agent-first Markdown presentation generator

**Compact source. Complete deck.** Deckseed turns approved Markdown into polished, self-contained Reveal.js presentations through Pandoc. It is a presentation-as-code workflow for AI coding agents, developers, consultants, and technical teams that want portable HTML slide decks without maintaining generated markup.

- **Token-efficient authoring:** agents edit compact Markdown and CSS, never the generated runtime.
- **Self-contained HTML slides:** Reveal.js, themes, and media are embedded for offline sharing.
- **Presentation themes:** nine accessible presets provide dark, light, editorial, and professional starting points.
- **Source freshness:** SHA-256 validation detects generated decks that no longer match their source.
- **Private by default:** local presentation content stays ignored by Git.
- **Agent workflows included:** shared skills enforce content approval, theming, translation, and validation.

## Quick start

Prerequisites: Node.js 20 or newer, Pandoc 3 or newer, and network access while building the embedded Reveal.js runtime.

```bash
git clone https://github.com/bartivs/deckseed.git
cd deckseed

npm run new -- architecture-review \
  --title "Architecture Review" \
  --language en \
  --theme atlas

# Replace the starter copy with the approved presentation.
npm run build -- architecture-review
npm run validate
```

Open or share:

```text
presentations/architecture-review/index.html
```

The generated file works offline and does not require Deckseed, Pandoc, Node.js, or local assets when viewed.

## Why Deckseed is different

Most presentation generators optimize the final artifact. Deckseed also optimizes the **AI production loop**: the maintained source remains small while Pandoc owns the large runtime output.

| Conventional agent-authored deck | Deckseed |
| --- | --- |
| Copy is repeated across briefs, HTML, and configuration | Approved copy and slide implementation share one `content.md` |
| The model edits verbose generated markup | Generated `index.html` is disposable and never model-authored |
| Runtime translation dictionaries expand context | Each localized deck has a focused Markdown source |
| Source/output drift is found manually | A SHA-256 source stamp makes stale output a validation error |
| Sharing may require local assets or dependencies | Pandoc embeds Reveal.js, CSS, and media into one offline HTML file |

The generated HTML may be large because it contains the complete presentation runtime. The efficiency gain is in what humans and agents maintain: a compact, stable source surface with fewer duplicated edits and fewer opportunities for drift.

## Markdown-to-presentation pipeline

```text
Chat approval
      ↓
content.md + theme.css
      ↓
Pandoc Reveal.js writer
      ↓
self-contained index.html
      ↓
source and portability validation
```

Deckseed uses:

- Pandoc's [`revealjs` writer](https://pandoc.org/MANUAL.html#slide-shows);
- Reveal.js 5.2.1, pinned for reproducible output;
- Pandoc `--embed-resources` for a single portable HTML file;
- semantic CSS variables for reusable presentation themes;
- a SHA-256 build stamp for deterministic freshness checks.

Set `PANDOC_BIN=/path/to/pandoc` when Pandoc is not available on `PATH`. See the official [Pandoc installation guide](https://pandoc.org/installing.html).

## Authoring a presentation

### 1. Approve the content

Before creating files, agree on the audience, goal, core message, narrative, slide outline, language, and visual direction. Deckseed's included Agent Skills treat this approval as a required production gate.

### 2. Scaffold the Markdown source

```bash
npm run new -- quarterly-strategy \
  --title "Quarterly Strategy" \
  --language en \
  --theme midnight
```

Deckseed creates only maintainable source files:

```text
presentations/quarterly-strategy/
├── content.md   Approved metadata, copy, and Pandoc slide structure
└── theme.css    Fixed presentation theme and local visual overrides
```

### 3. Write slides in Markdown

`content.md` is both the approval artifact and the production source:

```markdown
---
pagetitle: "Quarterly Strategy"
lang: "en"
harness-theme: "midnight"
audience: "Product and engineering leadership"
goal: "Agree on the next-quarter priorities"
core-message: "Fewer priorities create faster delivery"
controls: true
progress: true
slideNumber: true
transition: fade
---

<div class="eyebrow">Strategy</div>

# Quarterly Strategy

Fewer priorities create faster delivery.

---

# Three priorities

- Improve activation
- Reduce operational drag
- Retain high-value customers
```

Horizontal rules separate slides. Use ordinary Markdown by default, fenced divs for layout groups, and trusted local HTML only when a visual treatment requires it.

### 4. Generate the presentation

```bash
npm run build -- quarterly-strategy
```

Pandoc produces `index.html` with the Reveal.js runtime, shared styles, deck theme, and media inline. `npm run bundle -- <slug>` remains a compatibility alias.

### 5. Validate and preview

```bash
npm test
npm run validate
git diff --check
git status --short --ignored
```

Validation rejects missing sources, stale generated output, remote theme resources, external scripts or stylesheets, and non-Reveal HTML.

Start a local preview only when needed:

```bash
npm run open -- quarterly-strategy
```

## Presentation theme gallery

Theme choice belongs to the presentation source, not to a viewer preference. The generator writes the selected preset into `theme.css`; generated decks do not expose a theme selector.

| Theme | Preview | Designed for |
| --- | --- | --- |
| `midnight` | <img src="docs/theme-previews/midnight.svg" alt="Midnight dark technical presentation theme preview" width="240"> | Technical talks, product launches, data-heavy stories |
| `paper` | <img src="docs/theme-previews/paper.svg" alt="Paper editorial presentation theme preview" width="240"> | Editorial narratives, reports, thoughtful long-form decks |
| `ember` | <img src="docs/theme-previews/ember.svg" alt="Ember dark orange presentation theme preview" width="240"> | Bold keynotes, launches, energetic pitches |
| `atlas` | <img src="docs/theme-previews/atlas.svg" alt="Atlas executive presentation theme preview" width="240"> | Executive reviews, strategy, premium proposals |
| `solar` | <img src="docs/theme-previews/solar.svg" alt="Solar warm light presentation theme preview" width="240"> | Workshops, documentation, warm technical decks |
| `ocean` | <img src="docs/theme-previews/ocean.svg" alt="Ocean light blue presentation theme preview" width="240"> | Education, healthcare, calm explanatory stories |
| `plum` | <img src="docs/theme-previews/plum.svg" alt="Plum purple dark presentation theme preview" width="240"> | Creative technology, demos, modern night-mode decks |
| `mono` | <img src="docs/theme-previews/mono.svg" alt="Mono black and white presentation theme preview" width="240"> | Minimal portfolios, architecture, sharp product narratives |
| `meadow` | <img src="docs/theme-previews/meadow.svg" alt="Meadow green presentation theme preview" width="240"> | Sustainability, people, lifestyle, organic brands |

The presets are original interpretations of recurring families found in [Reveal.js themes](https://revealjs.com/themes/), [Marp themes](https://github.com/marp-team/marp-core/blob/main/themes/README.md), and minimalist or professional presentation templates. Customize the ignored `theme.css` after scaffolding and rebuild whenever it changes.

## Deckseed compared with other slide workflows

| Workflow | Authoring source | Output model | Best fit |
| --- | --- | --- | --- |
| **Deckseed** | Approved Pandoc Markdown plus CSS | Self-contained Reveal.js HTML | Agent-assisted, private, presentation-as-code workflows |
| Raw Reveal.js | HTML, JavaScript, or Reveal Markdown | Interactive web presentation | Bespoke browser interactions and plugin-heavy talks |
| Marp | Marp-flavored Markdown | HTML, PDF, PPTX, and images | Concise general-purpose Markdown slides |
| Pandoc alone | General Markdown and CLI options | Multiple slide formats | Users who want direct control without an opinionated workflow |
| Traditional AI slide service | Prompt and proprietary editor | Hosted or exported deck | Fast visual drafting without source-controlled authoring |

Deckseed does not replace Pandoc or Reveal.js. It packages them into a repeatable approval, authoring, theming, validation, and privacy workflow for coding agents.

## Use cases

- **Technical presentations:** architecture reviews, engineering proposals, incident reviews, and product demonstrations.
- **Consulting deliverables:** reusable private decks that remain outside Git history.
- **Executive communication:** strategy updates, investment analyses, and decision briefs.
- **Presentation as code:** reviewable Markdown sources with generated, disposable output.
- **Offline HTML slides:** a single file that can be copied, archived, emailed, or opened without a server.
- **Agent-generated presentations:** bounded workflows for Pi, Codex, Claude Code, and OpenCode.

## Localization

One source deck has one language. A translated presentation gets a separate Markdown source and generated HTML:

```text
presentations/quarterly-review/
presentations/quarterly-review-es/
```

This avoids large runtime translation dictionaries and keeps each source readable. Preserve slide structure, translate the complete deck, set the correct `lang`, and build both outputs independently.

## Privacy model

Everything inside `presentations/` is ignored except `.gitkeep`:

```gitignore
presentations/*
!presentations/.gitkeep
```

Never use `git add -f` for a presentation. Decks may contain internal plans, customer information, financial analysis, or unpublished research.

## Frequently asked questions

### What is a Markdown presentation generator?

A Markdown presentation generator converts structured Markdown into slides. Deckseed uses Pandoc to parse the source and Reveal.js to provide browser navigation, scaling, transitions, and presentation controls.

### Can Pandoc generate a self-contained Reveal.js presentation?

Yes. Deckseed invokes Pandoc's Reveal.js writer with standalone and embedded-resource options, then verifies that the result has no external script, stylesheet, or media dependencies.

### Why is Deckseed more token-efficient for AI agents?

Agents maintain `content.md` and `theme.css` instead of reading or rewriting the generated Reveal.js runtime. This keeps generated megabytes outside the normal model context and eliminates duplicated copy in configuration and HTML.

### Does the generated presentation work offline?

Yes. The generated `index.html` embeds its runtime and presentation assets. Network access is needed during the build so Pandoc can fetch the pinned Reveal.js files, but not while presenting the finished deck.

### Can Deckseed export PDF or PowerPoint?

The primary artifact is self-contained HTML. Reveal.js presentations can be printed to PDF. Pandoc also supports PowerPoint output, but Deckseed does not currently wrap or validate that output path.

### Does Deckseed require an AI service?

No. Deckseed is a local build and validation pipeline. Agent Skills improve AI-assisted production, but Markdown authoring and Pandoc generation work without an AI provider.

### How are custom themes created?

Start from one of the nine presets, then edit the ignored deck-specific `theme.css`. Shared structural styles live in `src/pandoc.css`.

## Commands

```bash
npm run new -- <slug> [options]  # Create ignored Pandoc sources
npm run build -- <slug>          # Generate self-contained Reveal.js HTML
npm run bundle -- <slug>         # Compatibility alias for build
npm run serve                    # Serve local decks on port 4173
npm run open -- <slug>           # Start the server and open a deck
npm run themes:previews          # Regenerate README theme previews
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
docs/theme-previews/          README theme previews
test/                         Deckseed tests
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, verification requirements, and the presentation privacy boundary.

## License

Deckseed is available under the [MIT License](LICENSE).
