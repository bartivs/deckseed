---
name: open-presentation
description: Starts the local presentation server and opens a presentation in the user's browser. Use when asked to open, launch, preview, show, or present a local slide deck.
license: MIT
compatibility: Node.js 20 or newer; xdg-open, open, or a Windows desktop browser
---

# Open a presentation

## Procedure

1. Resolve the repository root containing `package.json` and `scripts/open.mjs`.
2. Identify the requested deck under `presentations/`. Accept a directory deck, an HTML filename, or a basename without `.html`.
3. Build it from the approved Pandoc source if `content.md` or `theme.css` changed:

   ```bash
   npm run build -- <presentation>
   ```

4. Run:

   ```bash
   npm run open -- <presentation>
   ```

   If exactly one presentation exists, the name may be omitted:

   ```bash
   npm run open
   ```

5. Report the local URL so the user can reopen it on the same machine. Directory deck URLs must end with `/` so relative navigation remains well-defined.
6. Remind the user that the generated `index.html` is self-contained and can be copied or opened directly when they need to share it.

## Headless environments

Use `--no-browser` to start the server and print the URL without launching a desktop application:

```bash
npm run open -- <presentation> --no-browser
```

## Constraints

- Open only paths contained by `presentations/`.
- Never copy or force-add presentation content to Git.
- Reuse an existing server on port `4173`; otherwise start the bundled server in the background.
- Never hand-edit generated `index.html`.
- Do not report success unless the server responds and the presentation path exists.
