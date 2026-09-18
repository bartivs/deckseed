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
3. Run:

   ```bash
   npm run open -- <presentation>
   ```

   If exactly one presentation exists, the name may be omitted:

   ```bash
   npm run open
   ```

4. Report the local URL so the user can reopen or share it on the same machine.

## Headless environments

Use `--no-browser` to start the server and print the URL without launching a desktop application:

```bash
npm run open -- <presentation> --no-browser
```

## Constraints

- Open only paths contained by `presentations/`.
- Never copy or force-add presentation content to Git.
- Reuse an existing server on port `4173`; otherwise start the bundled server in the background.
- Do not report success unless the server responds and the presentation path exists.
