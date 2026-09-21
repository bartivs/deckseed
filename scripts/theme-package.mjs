import { createRequire } from "node:module";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const THEME_MANIFEST = "deckseed-theme.json";
export const REQUIRED_THEME_VARIABLES = [
  "--harness-bg",
  "--harness-bg-image",
  "--harness-panel",
  "--harness-text",
  "--harness-heading",
  "--harness-muted",
  "--harness-accent",
  "--harness-border",
  "--harness-font-body",
  "--harness-font-heading",
  "--harness-radius",
  "--harness-shadow",
];

const PACKAGE_NAME_PATTERN = /^(?:@[^/]+\/)?[^/]+$/u;

export function readThemeMetadata(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---(?:\n|$)/u);
  if (!match) throw new Error("content.md must begin with YAML metadata");

  const metadata = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:[ \t]+(.*))?$/u);
    if (!field) continue;
    metadata[field[1]] = parseScalar(field[2] ?? "");
  }
  return metadata;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try { return JSON.parse(trimmed); }
    catch { throw new Error(`Invalid quoted YAML scalar: ${value}`); }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).replaceAll("''", "'");
  return trimmed;
}

export function themePackageSpecifier(content) {
  return readThemeMetadata(content)["harness-theme-package"]?.trim() || "";
}

export function isThemePackageSpecifier(value) {
  return Boolean(value?.trim());
}

export async function resolveThemePackage({ root, specifier, expectedId } = {}) {
  if (!root) throw new Error("Theme resolution requires the repository root");
  if (!specifier?.trim()) throw new Error("Theme package specifier is empty");

  const normalizedSpecifier = specifier.trim();
  const manifestPath = isFilesystemSpecifier(normalizedSpecifier)
    ? await resolveLocalManifest(root, normalizedSpecifier)
    : await resolveInstalledManifest(root, normalizedSpecifier);
  const manifestSource = await readUtf8(manifestPath, `theme manifest for ${normalizedSpecifier}`);
  const manifest = parseThemeManifest(manifestSource, normalizedSpecifier);
  const packageDirectory = path.dirname(manifestPath);
  const cssPath = await resolveThemeCss(packageDirectory, manifest.css, normalizedSpecifier);
  const cssSource = await readUtf8(cssPath, `theme CSS for ${normalizedSpecifier}`);
  validateThemeCss(cssSource, normalizedSpecifier);

  if (expectedId && manifest.id !== expectedId) {
    throw new Error(`Theme package ${normalizedSpecifier} declares id ${JSON.stringify(manifest.id)}, but content.md selects ${JSON.stringify(expectedId)}`);
  }

  let packageVersion;
  try {
    const packageJson = JSON.parse(await readUtf8(path.join(packageDirectory, "package.json"), `package metadata for ${normalizedSpecifier}`));
    packageVersion = typeof packageJson.version === "string" ? packageJson.version : undefined;
  } catch {
    // Local theme directories do not need a package.json.
  }

  return {
    id: manifest.id,
    label: manifest.label,
    colorScheme: manifest.colorScheme,
    specifier: normalizedSpecifier,
    packageVersion,
    manifestPath,
    cssPath,
    manifestSource,
    cssSource,
    baseTheme: JSON.stringify({
      specifier: normalizedSpecifier,
      manifest: manifestSource,
      css: cssSource,
    }),
  };
}

function isFilesystemSpecifier(specifier) {
  return specifier.startsWith(".")
    || specifier.startsWith("/")
    || specifier.startsWith("file:")
    || (specifier.includes("/") && !specifier.startsWith("@"));
}

async function resolveLocalManifest(root, specifier) {
  let requestedPath;
  if (specifier.startsWith("file:")) {
    try { requestedPath = fileURLToPath(specifier); }
    catch { requestedPath = specifier.slice("file:".length); }
  } else {
    requestedPath = specifier;
  }
  const directory = path.resolve(root, requestedPath);
  const manifestPath = path.join(directory, THEME_MANIFEST);
  await ensureFile(manifestPath, `local theme ${specifier}`);
  return manifestPath;
}

async function resolveInstalledManifest(root, specifier) {
  if (!PACKAGE_NAME_PATTERN.test(specifier) || specifier.includes("\\")) {
    throw new Error(`Invalid theme package name ${JSON.stringify(specifier)}`);
  }
  try {
    const require = createRequire(path.join(root, "package.json"));
    return await realpath(require.resolve(`${specifier}/${THEME_MANIFEST}`));
  } catch (error) {
    throw new Error(`Unable to resolve theme package ${specifier}. Install it in the repository or use a local theme path. ${error.message}`);
  }
}

async function resolveThemeCss(packageDirectory, cssSpecifier, specifier) {
  if (typeof cssSpecifier !== "string" || !cssSpecifier.trim()) {
    throw new Error(`Theme package ${specifier} must define a non-empty relative "css" path`);
  }
  if (path.isAbsolute(cssSpecifier) || cssSpecifier.includes("\\")) {
    throw new Error(`Theme package ${specifier} must use a relative POSIX "css" path`);
  }
  const cssPath = path.resolve(packageDirectory, cssSpecifier);
  if (!isInside(packageDirectory, cssPath)) {
    throw new Error(`Theme package ${specifier} CSS path escapes the package directory`);
  }
  await ensureFile(cssPath, `theme CSS for ${specifier}`);
  const [realPackageDirectory, realCssPath] = await Promise.all([realpath(packageDirectory), realpath(cssPath)]);
  if (!isInside(realPackageDirectory, realCssPath)) {
    throw new Error(`Theme package ${specifier} CSS symlink escapes the package directory`);
  }
  return realCssPath;
}

export function parseThemeManifest(source, specifier = "theme package") {
  let manifest;
  try { manifest = JSON.parse(source); }
  catch (error) { throw new Error(`Theme manifest for ${specifier} is not valid JSON: ${error.message}`); }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error(`Theme manifest for ${specifier} must contain a JSON object`);
  }
  if (manifest.schemaVersion !== 1) throw new Error(`Theme manifest for ${specifier} must use schemaVersion 1`);
  if (typeof manifest.id !== "string" || !/^[a-z0-9][a-z0-9-]*$/u.test(manifest.id)) {
    throw new Error(`Theme manifest for ${specifier} must define id matching ^[a-z0-9][a-z0-9-]*$`);
  }
  if (typeof manifest.label !== "string" || !manifest.label.trim()) {
    throw new Error(`Theme manifest for ${specifier} must define a non-empty label`);
  }
  if (!(["light", "dark"].includes(manifest.colorScheme))) {
    throw new Error(`Theme manifest for ${specifier} must define colorScheme as light or dark`);
  }
  if (typeof manifest.css !== "string" || !manifest.css.trim()) {
    throw new Error(`Theme manifest for ${specifier} must define a non-empty relative css path`);
  }
  return manifest;
}

export function validateThemeCss(source, specifier = "theme package") {
  if (/@import\b/iu.test(source)) throw new Error(`Theme CSS for ${specifier} must not contain @import`);
  if (/(?:https?:)?\/\//iu.test(source)) throw new Error(`Theme CSS for ${specifier} must not contain remote URLs`);
  if (/url\(\s*(?!data:)[^)]*\)/iu.test(source)) throw new Error(`Theme CSS for ${specifier} may only use data: URLs inside url(...)`);
  for (const variable of REQUIRED_THEME_VARIABLES) {
    const pattern = new RegExp(`(?:^|[;{])\\s*${escapeRegExp(variable)}\\s*:`, "mu");
    if (!pattern.test(source)) throw new Error(`Theme CSS for ${specifier} is missing ${variable}`);
  }
}

async function readUtf8(file, description) {
  try { return await readFile(file, "utf8"); }
  catch (error) { throw new Error(`Unable to read ${description} at ${file}: ${error.message}`); }
}

async function ensureFile(file, description) {
  try {
    if (!(await stat(file)).isFile()) throw new Error("not a regular file");
  } catch (error) {
    throw new Error(`Missing ${description} file ${file}: ${error.message}`);
  }
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isThemePackageCandidate(name) {
  return name.startsWith("deckseed-theme-") || name.startsWith("@deckseed/theme-") || name.includes("/deckseed-theme-");
}
