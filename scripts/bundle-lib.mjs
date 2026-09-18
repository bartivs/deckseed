import { readFile } from "node:fs/promises";
import path from "node:path";

function escapeInlineScript(source) {
  return source.replaceAll("</script", "<\\/script").replaceAll("<!--", "<\\!--");
}

function replaceBundle(html, tag, attribute, source) {
  const pattern = new RegExp(`(<${tag}\\s+${attribute}(?:=["'][^"']*["'])?[^>]*>)[\\s\\S]*?(<\\/${tag}>)`, "u");
  if (!pattern.test(html)) throw new Error(`Missing <${tag} ${attribute}> bundle target`);
  return html.replace(pattern, (_match, openingTag, closingTag) => `${openingTag}\n${source.trim()}\n${closingTag}`);
}

export async function buildClassicHarness(root) {
  const [language, theme, harness] = await Promise.all([
    readFile(path.join(root, "src", "language.js"), "utf8"),
    readFile(path.join(root, "src", "theme.js"), "utf8"),
    readFile(path.join(root, "src", "presentation-harness.js"), "utf8"),
  ]);
  return [
    "// Self-contained presentation runtime. Generated from src/ by npm run bundle.",
    language.replace(/^export /gmu, ""),
    theme.replace(/^export /gmu, ""),
    harness.replace(/^import .*$/gmu, ""),
  ].join("\n");
}

export async function bundleDeckHtml({ root, html, configSource }) {
  const [css, harness] = await Promise.all([
    readFile(path.join(root, "src", "harness.css"), "utf8"),
    buildClassicHarness(root),
  ]);
  let bundled = replaceBundle(html, "style", "data-harness-bundle", css);
  bundled = replaceBundle(bundled, "script", "data-presentation-config", escapeInlineScript(configSource));
  bundled = replaceBundle(bundled, "script", "data-presentation-harness", escapeInlineScript(harness));
  return bundled;
}
