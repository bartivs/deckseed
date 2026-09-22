---
name: validate-presentation
description: Builds and validates Pandoc presentations, self-contained Reveal.js output, responsive rendering, source freshness, and Git privacy boundaries.
license: MIT
compatibility: Node.js 20 or newer; Pandoc 3 or newer; Firefox or another headless browser is recommended for visual checks
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

## Headless screenshot review

After building, start or reuse the local server without opening a GUI browser:

```bash
npm run open -- <slug> --no-browser
```

Capture representative slides at the authored 1600×900 canvas. Replace the Reveal hash with the slide under review. Prefer Firefox, fall back to a Chromium-family browser, and use the system default browser only for manual review:

```bash
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

Use the `read` tool to inspect `/tmp/deck-theme-check.png` as an image. Inspect both the full frame and its bottom 140px safety strip. Do not treat a successful screenshot command as visual approval. The default-browser fallback does not produce an inspectable PNG, so do not mark visual validation complete until the user confirms the manual result or a supported headless browser becomes available. Review at least:

- the title slide;
- a multi-card grid;
- a diagram or workflow;
- a table;
- a code or other dense slide.

For each screenshot, verify:

- at least 48px vertical and 64px horizontal desktop safe area;
- at least 96px reserved bottom budget for source notes, progress, controls, and slide numbers;
- no content, source note, control, or slide number overlap;
- at least 16px card padding and 16–24px inter-panel gaps;
- readable heading hierarchy without oversized wrapping;
- no accidental Markdown rendering inside raw HTML or code panels;
- no authored content in the bottom 140px safety strip except source notes and controls;
- no clipping, horizontal scrollbars, dense-slide overflow, or excessive dead space;
- adequate text, muted-text, border, and accent contrast.

Repeat at a narrow viewport with at least 24px horizontal safe area. Reduce font size, gaps, or content density before sacrificing the safe area.

## Interactive and portability checks

1. Open the self-contained `index.html` directly, or use the server when interactive validation is needed.
2. Check arrow, Space, Home/End, overview, fullscreen, touch, and print behavior.
3. Check tables, code, diagrams, contrast, focus visibility, and dense-slide overflow.
4. Open or copy `index.html` outside the repository and verify it works without network access.
5. Print to PDF and verify slide boundaries when PDF is a deliverable.

## Completion criteria

- `content.md` is the approved and complete source.
- `theme.css` contains no remote dependencies.
- `index.html` is fresh, self-contained, and never hand-edited.
- No presentation path is staged or tracked.
