---
name: export-proposal-pdf
description: Creates or updates a concise written proposal PDF companion for a Deckseed presentation. Use when asked for a proposal, executive document, follow-up brief, PDF version, or printable narrative derived from an approved deck.
license: MIT
compatibility: Node.js 20+, Pandoc 3+, LibreOffice, and Poppler tools for visual PDF review
---

# Export a proposal PDF

Create a written decision document, not a slide printout. The proposal distills an approved presentation into a readable 3–6 page PDF similar to an executive Word proposal, while preserving facts, ownership, sources, and the relationship to earlier decisions.

## Approval gate

1. Read `presentations/<slug>/content.md` completely and identify any predecessor deck or document.
2. In chat, propose:
   - audience and decision owner;
   - purpose and relationship to the earlier proposal;
   - title, status, author, and language;
   - 3–6 page outline;
   - figures or tables to include;
   - exact decision requested.
3. Wait for explicit approval before creating or materially changing `proposal.md`.
4. If the document introduces facts, scope, ownership, costs, or recommendations absent from the approved deck, call them out and obtain approval.

## Source and output contract

Keep all private proposal material inside the ignored presentation directory:

```text
presentations/<slug>/
├── content.md
├── proposal.md                 # approved proposal source
├── proposal-assets/            # optional local figures
├── proposal-reference.docx     # optional deck-specific style override
├── proposal.pdf                # generated output
└── proposal.sha256             # generated freshness stamp
```

Never force-add these files. `proposal.md` is the canonical proposal source; never edit `proposal.pdf` manually.

## Required narrative

Adapt `templates/proposal.md`. A complete proposal normally contains:

1. title, type, status, author, and associated presentation;
2. the idea in one sentence;
3. relationship to the previous proposal: what remains, what changes, and why now;
4. problem and current state;
5. recommended approach and scope boundaries;
6. end-to-end workflow or pipeline;
7. ownership and responsibilities;
8. benefits and measurable outcomes;
9. risks, controls, and stop conditions;
10. phases and decision requested;
11. references and the date on which volatile figures were verified.

Keep claims aligned with `content.md`. Do not copy every slide or reproduce speaker notes. Prefer short prose, bullets, compact tables, and no more than three purposeful figures.

## Continuity rules

For a follow-up document, make the lineage explicit near the beginning:

- name and date the previous proposal;
- list inherited decisions and assumptions;
- identify evidence or constraints learned since then;
- distinguish unchanged architecture from the new initiative;
- state the new decision without reopening settled questions unnecessarily.

Use wording such as “Esta propuesta operacionaliza…” or “Como segunda etapa…” only when that relationship is supported by the approved materials.

## Figures

- Store proposal-specific diagrams under `proposal-assets/`.
- Use local PNG, JPEG, or SVG resources only.
- Reuse facts and structure from the deck, but simplify diagrams for a portrait page.
- Give each figure a caption and reference it from the surrounding text.
- Do not embed full-slide screenshots unless the user explicitly wants them.

Insert a page break with:

```markdown
::: {.pagebreak}
:::
```

## Build

From the repository root:

```bash
npm run proposal -- <slug>
```

The builder uses Pandoc to create a DOCX internally and LibreOffice to convert it to `proposal.pdf`. It uses `templates/proposal-reference.docx` unless the deck supplies `proposal-reference.docx`. The freshness stamp includes `proposal.md`, the associated `content.md`, the reference document, the page-break filter, and everything under `proposal-assets/`.

## Validation

Run:

```bash
npm test
npm run validate
git diff --check
git status --short --ignored
```

If `proposal.md` exists, validation requires a fresh `proposal.pdf` and `proposal.sha256`.

Visually review the PDF rather than trusting a successful conversion:

```bash
pdfinfo presentations/<slug>/proposal.pdf
mkdir -p /tmp/deckseed-proposal-review
pdftoppm -png -r 140 presentations/<slug>/proposal.pdf \
  /tmp/deckseed-proposal-review/page
```

Use the image-reading tool to inspect at least the first page, the densest table, every diagram page, and the final page. Check:

- page margins and readable body type;
- no clipped tables, figures, captions, or URLs;
- no orphan heading at a page bottom;
- consistent title hierarchy and table treatment;
- figures remain legible in portrait orientation;
- page count is proportionate to the approved scope;
- costs, dates, sources, and ownership match the deck.

Iterate on `proposal.md` or approved local figures, rebuild, and repeat the review.

## Constraints

- Keep the proposal in the same language as its source deck unless a separate localized proposal is approved.
- Do not treat the PDF as an alternate canonical source for slide content.
- Do not introduce remote resources, runtime selectors, or confidential text in tracked templates/tests.
- Do not claim the proposal is visually validated until rendered PDF pages have been inspected.
