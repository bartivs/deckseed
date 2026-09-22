# Deckseed Agent Guide

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

- Do not open a GUI browser unless the user explicitly asks for it.
- A headless local server and browser may be used for visual validation without opening a desktop window.
- Build and validate the self-contained static `presentations/<slug>/index.html`, then point the user to that file.
- Ask before opening the static file in the user's default browser.

## Theme and margin rules

- Use a 1600×900 authored canvas unless the approved deck requires another size.
- Keep desktop content inside a safe area of at least 48px vertically and 64px horizontally. Reserve at least 120px at the bottom-right when Reveal controls or slide numbers are enabled.
- At narrow viewports, retain at least 24px horizontal padding. Reduce typography, gaps, or content density before reducing the safe area.
- Cards and panels need at least 16px internal padding on desktop and 12px on narrow screens. Use 16–24px gaps between adjacent panels.
- Keep clear separation between eyebrow, heading, content, callouts, and source notes. Source notes must remain inside the safe area and must not overlap controls.
- Use `box-sizing: border-box`, prevent horizontal overflow, and test dense slides rather than assuming the title slide represents the theme.
- Themes must define a clear type hierarchy, accessible contrast, consistent panel/border/radius treatment, readable tables and code, visible focus states, and restrained accent colors.
- Reset Reveal defaults for custom primitives such as `pre.code`; verify that Markdown-looking text inside HTML containers does not become unintended headings or lists.

## Visual validation

After building, capture representative slides with a headless browser. Check at least a title slide, card grid, diagram, table, and code/dense slide.

```bash
npm run open -- <slug> --no-browser
url='http://127.0.0.1:4173/presentations/<slug>/#/2'
output=/tmp/deck-theme-check.png
manual_review=0

if command -v firefox >/dev/null 2>&1; then
  firefox --headless --window-size 1600,900 \
    --screenshot "$output" "$url" \
    >/tmp/deck-theme-check.log 2>&1
else
  browser=""
  for candidate in chromium chromium-browser google-chrome google-chrome-stable microsoft-edge; do
    if command -v "$candidate" >/dev/null 2>&1; then browser="$candidate"; break; fi
  done
  if [ -n "$browser" ]; then
    "$browser" --headless --disable-gpu --hide-scrollbars \
      --window-size=1600,900 --screenshot="$output" "$url" \
      >/tmp/deck-theme-check.log 2>&1
  else
    echo "No screenshot-capable browser found; opening the default browser for manual review."
    manual_review=1
    npm run open -- <slug>
  fi
fi

if [ "$manual_review" -eq 0 ]; then
  test -s "$output" && echo screenshot-ok
else
  echo manual-review-required
fi
```

Use the `read` tool to inspect `/tmp/deck-theme-check.png` as an image. Iterate until margins, hierarchy, overflow, wrapping, contrast, and visual balance are acceptable. Use different Reveal hashes to inspect other representative slides.

The default-browser fallback is manual only: it does not create a screenshot. Do not claim visual validation is complete unless the user confirms the result or a screenshot-capable browser is installed and its PNG has been inspected.

## Verification

Run:

```bash
npm test
npm run validate
git diff --check
git status --short --ignored
```

The status must show presentation files only as ignored (`!!`), never staged.
