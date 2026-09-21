---
name: validate-presentation
description: Builds and validates Pandoc presentations, self-contained Reveal.js output, responsive rendering, source freshness, and Git privacy boundaries.
license: MIT
compatibility: Node.js 20 or newer; Pandoc 3 or newer; a browser is recommended for visual checks
---

# Validate a presentation

## Automated checks

Build after editing `content.md`, `theme.css`, or shared CSS:

```bash
npm run build -- <slug>
npm test
npm run validate
git diff --check
git status --short --ignored
```

`npm run validate` checks:

- required `content.md`, `theme.css`, and generated `index.html` files;
- required approval and document metadata;
- a valid Reveal.js document;
- no external script or stylesheet tags;
- no remote theme resources;
- the embedded source hash, which detects stale generated HTML;
- Agent Skill frontmatter.

The presentation must appear only as ignored (`!!`). Never stage it.

## Browser checks

1. Open the self-contained `index.html` directly, or start the server only when the user asks.
2. Check arrow, Space, Home/End, overview, fullscreen, touch, and print behavior.
3. Check every slide at 1440×900 and at a narrow viewport; Reveal.js scales the authored canvas.
4. Check tables, code, diagrams, contrast, focus visibility, and dense-slide overflow.
5. Open or copy `index.html` outside the repository and verify it works without network access.
6. Print to PDF and verify slide boundaries when PDF is a deliverable.

## Completion criteria

- `content.md` is the approved and complete source.
- `theme.css` contains no remote dependencies.
- `index.html` is fresh, self-contained, and never hand-edited.
- No presentation path is staged or tracked.
