import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  assertSelfContainedReveal,
  presentationSourceHash,
  readEmbeddedSourceHash,
} from "./pandoc-lib.mjs";
import { readThemeMetadata, resolveThemePackage, themePackageSpecifier } from "./theme-package.mjs";
import {
  collectProposalAssets,
  proposalReferencePath,
  proposalRemoteMedia,
  proposalSourceHash,
} from "./proposal-lib.mjs";

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
    const packageSpecifier = /^---\n[\s\S]*?\n---(?:\n|$)/u.test(content)
      ? themePackageSpecifier(content)
      : "";
    let externalTheme;
    if (packageSpecifier) {
      try {
        const metadata = readThemeMetadata(content);
        externalTheme = await resolveThemePackage({ root, specifier: packageSpecifier, expectedId: metadata["harness-theme"] });
      } catch (error) {
        errors.push(error.message);
      }
    }
    if (!externalTheme && !packageSpecifier) {
      if (!/^\s*--harness-bg\s*:/mu.test(theme)) errors.push("theme.css is missing --harness-bg");
      if (!/^\s*--harness-text\s*:/mu.test(theme)) errors.push("theme.css is missing --harness-text");
    }
    if (/@import\s|url\(\s*["']?(?:https?:)?\/\//iu.test(theme)) errors.push("theme.css must not load remote resources");
    try { assertSelfContainedReveal(html); }
    catch (error) { errors.push(error.message); }
    const expectedHash = presentationSourceHash({ content, theme, sharedCss, baseTheme: externalTheme?.baseTheme ?? "" });
    const actualHash = readEmbeddedSourceHash(html);
    if (!actualHash) errors.push("generated index.html is missing its source hash; run npm run build");
    else if (actualHash !== expectedHash) errors.push("generated index.html is stale; run npm run build");
  }
  const proposalPath = path.join(directory, "proposal.md");
  if (await isFile(proposalPath)) {
    const pdfPath = path.join(directory, "proposal.pdf");
    const stampPath = path.join(directory, "proposal.sha256");
    const filterPath = path.join(root, "scripts", "proposal-pagebreak.lua");
    const referencePath = await proposalReferencePath(root, directory);
    for (const [label, file] of [
      ["content.md", contentPath],
      ["proposal.pdf", pdfPath],
      ["proposal.sha256", stampPath],
      ["proposal reference DOCX", referencePath],
      ["proposal page-break filter", filterPath],
    ]) {
      if (!(await isFile(file))) errors.push(`${label} is missing`);
    }
    if (await Promise.all([contentPath, pdfPath, stampPath, referencePath, filterPath].map(isFile)).then((results) => results.every(Boolean))) {
      const [proposal, content, pdf, stamp, reference, filter, assets] = await Promise.all([
        readFile(proposalPath, "utf8"),
        readFile(contentPath, "utf8"),
        readFile(pdfPath),
        readFile(stampPath, "utf8"),
        readFile(referencePath),
        readFile(filterPath, "utf8"),
        collectProposalAssets(directory),
      ]);
      const remoteMedia = proposalRemoteMedia(proposal);
      if (remoteMedia.length) errors.push(`proposal media must be local: ${remoteMedia.join(", ")}`);
      if (pdf.length < 5 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") errors.push("proposal.pdf is not a valid PDF");
      const expectedHash = proposalSourceHash({ proposal, content, reference, filter, assets });
      if (!/^[a-f0-9]{64}$/u.test(stamp.trim())) errors.push("proposal.sha256 is invalid; run npm run proposal");
      else if (stamp.trim() !== expectedHash) errors.push("proposal.pdf is stale; run npm run proposal");
    }
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
for (const placeholder of ["{{TITLE_YAML}}", "{{LANGUAGE_YAML}}", "{{THEME_YAML}}", "{{THEME_PACKAGE_YAML}}", "{{TITLE}}"] ) {
  if (!template.includes(placeholder)) templateErrors.push(`missing ${placeholder}`);
}
if (!/^---\n[\s\S]*?\n---\n/u.test(template)) templateErrors.push("missing YAML metadata");
if (templateErrors.length) {
  failed = true;
  console.error(`FAIL templates/content.md: ${templateErrors.join("; ")}`);
} else console.log("PASS templates/content.md");

const proposalTemplatePath = path.join(root, "templates", "proposal.md");
const proposalReferencePathDefault = path.join(root, "templates", "proposal-reference.docx");
const proposalFilterPath = path.join(root, "scripts", "proposal-pagebreak.lua");
const proposalTemplateErrors = [];
if (!(await isFile(proposalTemplatePath))) proposalTemplateErrors.push("proposal.md is missing");
else {
  const proposalTemplate = await readFile(proposalTemplatePath, "utf8");
  for (const placeholder of ["{{TITLE}}", "{{AUTHOR}}", "{{DATE}}", "{{LANGUAGE}}", "{{PRESENTATION_SLUG}}", "{{PREVIOUS_DELIVERABLE}}"]) {
    if (!proposalTemplate.includes(placeholder)) proposalTemplateErrors.push(`missing ${placeholder}`);
  }
}
if (!(await isFile(proposalReferencePathDefault))) proposalTemplateErrors.push("proposal-reference.docx is missing");
if (!(await isFile(proposalFilterPath))) proposalTemplateErrors.push("proposal-pagebreak.lua is missing");
if (proposalTemplateErrors.length) {
  failed = true;
  console.error(`FAIL proposal scaffolding: ${proposalTemplateErrors.join("; ")}`);
} else console.log("PASS proposal scaffolding");

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
