import { execFile } from "node:child_process";
import { readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  REVEALJS_URL,
  assertSelfContainedReveal,
  injectSourceHash,
  presentationSourceHash,
  resolvePresentationDirectory,
} from "./pandoc-lib.mjs";
import { readThemeMetadata, resolveThemePackage, themePackageSpecifier } from "./theme-package.mjs";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requested = process.argv.slice(2).find((argument) => !argument.startsWith("-"));

let directory;
try {
  directory = resolvePresentationDirectory(root, requested);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const contentPath = path.join(directory, "content.md");
const themePath = path.join(directory, "theme.css");
const sharedCssPath = path.join(root, "src", "pandoc.css");
const outputPath = path.join(directory, "index.html");
const temporaryPath = path.join(directory, `.index.html.${process.pid}.tmp`);

try {
  for (const sourcePath of [contentPath, themePath, sharedCssPath]) {
    try {
      if (!(await stat(sourcePath)).isFile()) throw new Error();
    } catch {
      throw new Error(`Missing build source: ${path.relative(root, sourcePath)}`);
    }
  }
  const [content, theme, sharedCss] = await Promise.all([
    readFile(contentPath, "utf8"),
    readFile(themePath, "utf8"),
    readFile(sharedCssPath, "utf8"),
  ]);
  const metadata = readThemeMetadata(content);
  const packageSpecifier = themePackageSpecifier(content);
  const externalTheme = packageSpecifier
    ? await resolveThemePackage({ root, specifier: packageSpecifier, expectedId: metadata["harness-theme"] })
    : undefined;
  const baseTheme = externalTheme?.baseTheme ?? "";
  const hash = presentationSourceHash({ content, theme, sharedCss, baseTheme });
  const resourcePath = [directory, root, ...(externalTheme ? [path.dirname(externalTheme.cssPath)] : [])].join(path.delimiter);
  const cssArgs = externalTheme
    ? [`--css=${sharedCssPath}`, `--css=${externalTheme.cssPath}`, `--css=${themePath}`]
    : [`--css=${sharedCssPath}`, `--css=${themePath}`];
  const args = [
    "content.md",
    "--from=markdown+fenced_divs+bracketed_spans+raw_html",
    "--to=revealjs",
    "--standalone",
    "--embed-resources",
    "--slide-level=0",
    `--variable=revealjs-url=${REVEALJS_URL}`,
    `--resource-path=${resourcePath}`,
    ...cssArgs,
    `--output=${temporaryPath}`,
  ];
  await execFileAsync(process.env.PANDOC_BIN || "pandoc", args, {
    cwd: directory,
    maxBuffer: 10 * 1024 * 1024,
  });
  const generated = await readFile(temporaryPath, "utf8");
  assertSelfContainedReveal(generated);
  await rm(outputPath, { force: true });
  await rename(temporaryPath, outputPath);
  const bundled = injectSourceHash(await readFile(outputPath, "utf8"), hash);
  await writeFile(outputPath, bundled);
  console.log(`Built self-contained Pandoc presentation: ${path.relative(root, outputPath)}`);
  if (externalTheme) console.log(`Theme package: ${externalTheme.specifier} (${externalTheme.id})`);
} catch (error) {
  await rm(temporaryPath, { force: true });
  if (error.code === "ENOENT" && error.syscall?.startsWith("spawn")) {
    console.error("Pandoc is required. Install it from https://pandoc.org/installing.html or set PANDOC_BIN.");
  } else {
    console.error(error.stderr?.trim() || error.message);
  }
  process.exit(1);
}
