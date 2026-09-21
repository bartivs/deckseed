import { access, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { themePresets } from "../src/theme-presets.js";
import { renderThemeCss } from "./theme-css.mjs";
import { resolveThemePackage } from "./theme-package.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const slug = args[0];
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

if (!slug || slug.startsWith("-") || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("Usage: npm run new -- <slug> [--title \"Title\"] [--language en] [--theme midnight] [--force]");
  process.exit(1);
}

const title = valueAfter("--title") ?? slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
const language = valueAfter("--language") ?? "en";
const themeSelection = valueAfter("--theme") ?? "midnight";
const force = args.includes("--force");
if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(language)) {
  console.error("--language must be a BCP 47 language code such as en, es, or pt-BR");
  process.exit(1);
}

let themeId = themeSelection;
let externalTheme;
if (!(themeSelection in themePresets)) {
  try {
    externalTheme = await resolveThemePackage({ root, specifier: themeSelection });
    themeId = externalTheme.id;
  } catch (error) {
    console.error(`${error.message}\n--theme must be one of: ${Object.keys(themePresets).join(", ")} or an installed/local Deckseed theme package`);
    process.exit(1);
  }
}

const output = path.join(root, "presentations", slug);
const contentPath = path.join(output, "content.md");
const themePath = path.join(output, "theme.css");
const indexPath = path.join(output, "index.html");
if (!force) {
  for (const artifactPath of [contentPath, themePath, indexPath]) {
    try {
      await access(artifactPath);
      console.error(`Presentation already exists: ${path.relative(root, output)} (use --force to replace it)`);
      process.exit(1);
    } catch { /* Expected for a new deck. */ }
  }
}

const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const template = await readFile(path.join(root, "templates", "content.md"), "utf8");
let content = template
  .replaceAll("{{TITLE_YAML}}", JSON.stringify(title))
  .replaceAll("{{LANGUAGE_YAML}}", JSON.stringify(language))
  .replaceAll("{{THEME_YAML}}", JSON.stringify(themeId))
  .replaceAll("{{THEME_PACKAGE_YAML}}", externalTheme ? JSON.stringify(themeSelection) : "\"\"")
  .replaceAll("{{TITLE}}", escapeHtml(title));
if (!externalTheme) content = content.replace(/^harness-theme-package: ""\n/mu, "");
const localThemeCss = externalTheme
  ? `/* Local overrides for the ${externalTheme.label} theme. */\n:root {\n}\n`
  : renderThemeCss(themeId, themePresets[themeId]);
await mkdir(output, { recursive: true });
await Promise.all([
  writeFile(contentPath, content),
  writeFile(themePath, localThemeCss),
  rm(indexPath, { force: true }),
  rm(path.join(output, "deck.config.js"), { force: true }),
]);
console.log(`Created Pandoc sources in ${path.relative(root, output)}`);
console.log("Canonical source: content.md");
console.log(`Language: ${language}`);
console.log(`Theme: ${themeId}`);
if (externalTheme) console.log(`Theme package: ${themeSelection}`);
console.log(`Build: npm run build -- ${slug}`);
console.log("Presentation files are ignored by Git by design.");
