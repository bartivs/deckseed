import { createHash } from "node:crypto";
import path from "node:path";

export const REVEALJS_URL = "https://unpkg.com/reveal.js@5.2.1";
export const BUILD_SIGNATURE = JSON.stringify({
  from: "markdown+fenced_divs+bracketed_spans+raw_html",
  to: "revealjs",
  standalone: true,
  embedResources: true,
  slideLevel: 0,
  revealjsUrl: REVEALJS_URL,
});

export function resolvePresentationDirectory(root, requested) {
  if (!requested) throw new Error("Usage: npm run build -- <presentation>");
  const normalized = requested
    .replace(/^presentations[\\/]/u, "")
    .replace(/[\\/](?:index\.html|content\.md)$/u, "");
  const presentationsRoot = path.join(root, "presentations");
  const directory = path.resolve(presentationsRoot, normalized);
  if (directory === presentationsRoot || !directory.startsWith(`${presentationsRoot}${path.sep}`)) {
    throw new Error("Presentation must be a directory under presentations/");
  }
  return directory;
}

export function presentationSourceHash({ content, theme, sharedCss, baseTheme = "" }) {
  const hash = createHash("sha256")
    .update(BUILD_SIGNATURE)
    .update("\0content\0")
    .update(content)
    .update("\0theme\0")
    .update(theme);
  if (baseTheme) hash.update("\0base-theme\0").update(baseTheme);
  return hash
    .update("\0shared-css\0")
    .update(sharedCss)
    .digest("hex");
}

export function assertSelfContainedReveal(html) {
  const errors = [];
  if (!/class=["'][^"']*\breveal\b/iu.test(html) || !/class=["'][^"']*\bslides\b/iu.test(html)) {
    errors.push("generated output is not a Reveal.js presentation");
  }
  if (!/<section\b/iu.test(html)) errors.push("generated output contains no slides");
  if (/<script\b[^>]*\bsrc\s*=/iu.test(html)) errors.push("generated output contains an external script");
  if (/<link\b[^>]*\brel\s*=\s*["']?stylesheet/iu.test(html)) errors.push("generated output contains an external stylesheet");
  if (/<(?:img|video|audio|source|iframe|embed)\b[^>]*\b(?:src|srcset)\s*=\s*["'](?:https?:)?\/\//iu.test(html)) {
    errors.push("generated output contains external media");
  }
  if (/<object\b[^>]*\bdata\s*=\s*["'](?:https?:)?\/\//iu.test(html)) errors.push("generated output contains external media");
  if (errors.length) throw new Error(errors.join("; "));
}

export function injectSourceHash(html, hash) {
  const marker = `<meta name="presentation-source-sha256" content="${hash}">`;
  if (!html.includes("</head>")) throw new Error("Pandoc output is missing </head>");
  return html.replace("</head>", `  ${marker}\n</head>`);
}

export function readEmbeddedSourceHash(html) {
  return html.match(/<meta\s+name=["']presentation-source-sha256["']\s+content=["']([a-f0-9]{64})["']/iu)?.[1];
}
