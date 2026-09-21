import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  assertSelfContainedReveal,
  presentationSourceHash,
  readEmbeddedSourceHash,
} from "./pandoc-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const presentationsRoot = path.join(root, "presentations");
const sharedCss = await readFile(path.join(root, "src", "pandoc.css"), "utf8");
let failed = false;

async function isFile(file) {
  try { return (await stat(file)).isFile(); }
  catch { return false; }
}

for (const entry of await readdir(presentationsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const directory = path.join(presentationsRoot, entry.name);
  const contentPath = path.join(directory, "content.md");
  const themePath = path.join(directory, "theme.css");
  const htmlPath = path.join(directory, "index.html");
  const errors = [];
  for (const [label, file] of [["content.md", contentPath], ["theme.css", themePath], ["index.html", htmlPath]]) {
    if (!(await isFile(file))) errors.push(`${label} is missing`);
  }
  if (await isFile(path.join(directory, "deck.config.js"))) errors.push("legacy deck.config.js must be removed");
  if (errors.length === 0) {
    const [content, theme, html] = await Promise.all([
      readFile(contentPath, "utf8"),
      readFile(themePath, "utf8"),
      readFile(htmlPath, "utf8"),
    ]);
    if (!/^---\n[\s\S]*?\n---\n/u.test(content)) errors.push("content.md must begin with YAML metadata");
    for (const field of ["pagetitle", "lang", "harness-theme", "audience", "goal", "core-message"]) {
      if (!new RegExp(`^${field}:`, "mu").test(content)) errors.push(`content.md metadata is missing ${field}`);
    }
    if (!/^\s*--harness-bg\s*:/mu.test(theme)) errors.push("theme.css is missing --harness-bg");
    if (!/^\s*--harness-text\s*:/mu.test(theme)) errors.push("theme.css is missing --harness-text");
    if (/@import\s|url\(\s*["']?https?:/iu.test(theme)) errors.push("theme.css must not load remote resources");
    try { assertSelfContainedReveal(html); }
    catch (error) { errors.push(error.message); }
    const expectedHash = presentationSourceHash({ content, theme, sharedCss });
    const actualHash = readEmbeddedSourceHash(html);
    if (!actualHash) errors.push("generated index.html is missing its source hash; run npm run build");
    else if (actualHash !== expectedHash) errors.push("generated index.html is stale; run npm run build");
  }
  if (errors.length) {
    failed = true;
    console.error(`FAIL ${path.relative(root, directory)}: ${errors.join("; ")}`);
  } else {
    console.log(`PASS ${path.relative(root, directory)}`);
  }
}

const template = await readFile(path.join(root, "templates", "content.md"), "utf8");
const templateErrors = [];
for (const placeholder of ["{{TITLE_YAML}}", "{{LANGUAGE_YAML}}", "{{THEME_YAML}}", "{{TITLE}}"] ) {
  if (!template.includes(placeholder)) templateErrors.push(`missing ${placeholder}`);
}
if (!/^---\n[\s\S]*?\n---\n/u.test(template)) templateErrors.push("missing YAML metadata");
if (templateErrors.length) {
  failed = true;
  console.error(`FAIL templates/content.md: ${templateErrors.join("; ")}`);
} else console.log("PASS templates/content.md");

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
