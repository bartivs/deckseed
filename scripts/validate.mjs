import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { validateTheme } from "../src/theme.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = [{ html: path.join(root, "templates", "deck.html") }];
const presentations = path.join(root, "presentations");
for (const entry of await readdir(presentations, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const html = path.join(presentations, entry.name, "index.html");
  const config = path.join(presentations, entry.name, "deck.config.js");
  try { if ((await stat(html)).isFile()) targets.push({ html, config }); }
  catch { /* Ignore non-deck directories. */ }
}

function readConfig(source, file) {
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: file, timeout: 1_000 });
  return context.window.PRESENTATION_CONFIG;
}

function validateConfig(source, file) {
  const errors = [];
  let config;
  try { config = readConfig(source, file); }
  catch (error) { return [`invalid configuration JavaScript: ${error.message}`]; }
  if (!config || typeof config !== "object") return ["PRESENTATION_CONFIG is missing"];
  const languages = Object.keys(config.languages ?? {});
  if (languages.length === 0) errors.push("at least one language is required");
  if (!languages.includes(config.fallbackLanguage)) errors.push("fallbackLanguage must be configured");
  if (config.defaultLanguage !== "auto" && !languages.includes(config.defaultLanguage)) errors.push("defaultLanguage must be auto or configured");
  const fallbackKeys = Object.keys(config.translations?.[config.fallbackLanguage] ?? {});
  for (const language of languages) {
    const translation = config.translations?.[language];
    if (!translation) { errors.push(`translations are missing for ${language}`); continue; }
    const missing = fallbackKeys.filter((key) => !(key in translation));
    if (missing.length) errors.push(`${language} is missing keys: ${missing.join(", ")}`);
  }
  const themes = Object.keys(config.themes ?? {});
  if (themes.length === 0) errors.push("at least one theme is required");
  if (!themes.includes(config.theme)) errors.push("theme must name a configured theme");
  if (config.fallbackTheme && !themes.includes(config.fallbackTheme)) errors.push("fallbackTheme must be configured");
  for (const theme of themes) {
    errors.push(...validateTheme(config.themes[theme]).map((error) => `${theme}: ${error}`));
  }
  return errors;
}

let failed = false;
for (const target of targets) {
  const html = await readFile(target.html, "utf8");
  const errors = [];
  if (!/class="[^"]*slide/.test(html)) errors.push("missing .slide element");
  if (!html.includes("data-language-select")) errors.push("missing language selector");
  if (html.includes("data-theme-select") || html.includes("data-theme-control")) errors.push("runtime theme selector is not allowed");
  if (!html.includes("data-i18n=")) errors.push("missing translation keys");
  if (!html.includes("data-harness-bundle")) errors.push("missing inline harness CSS");
  if (!html.includes("data-presentation-config")) errors.push("missing inline presentation config");
  if (!html.includes("data-presentation-harness")) errors.push("missing inline presentation runtime");
  if (/<script\b[^>]*\bsrc=/iu.test(html)) errors.push("external script dependency is not allowed");
  if (/<link\b[^>]*\brel=["']?stylesheet/iu.test(html)) errors.push("external stylesheet dependency is not allowed");
  if (target.config) {
    try {
      const configSource = await readFile(target.config, "utf8");
      errors.push(...validateConfig(configSource, target.config));
      const inlineSource = html.match(/<script\s+data-presentation-config[^>]*>([\s\S]*?)<\/script>/iu)?.[1];
      if (!inlineSource) errors.push("inline presentation config cannot be read");
      else {
        errors.push(...validateConfig(inlineSource, target.html));
        if (JSON.stringify(readConfig(configSource, target.config)) !== JSON.stringify(readConfig(inlineSource, target.html))) {
          errors.push("inline presentation config is stale; run npm run bundle");
        }
      }
    } catch { errors.push("deck.config.js is missing or invalid"); }
  }
  if (errors.length) {
    failed = true;
    console.error(`FAIL ${path.relative(root, target.html)}: ${errors.join("; ")}`);
  } else console.log(`PASS ${path.relative(root, target.html)}`);
}

const skillsRoot = path.join(root, ".agents", "skills");
for (const entry of await readdir(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
  const source = await readFile(skillPath, "utf8");
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/u)?.[1] ?? "";
  const name = frontmatter.match(/^name:\s*(.+)$/mu)?.[1]?.trim();
  const description = frontmatter.match(/^description:\s*(.+)$/mu)?.[1]?.trim();
  const errors = [];
  if (name !== entry.name) errors.push(`name must match directory (${entry.name})`);
  if (!description) errors.push("description is required");
  if (errors.length) {
    failed = true;
    console.error(`FAIL ${path.relative(root, skillPath)}: ${errors.join("; ")}`);
  } else console.log(`PASS ${path.relative(root, skillPath)}`);
}

if (failed) process.exit(1);
