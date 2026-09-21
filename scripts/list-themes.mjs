import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { themePresets } from "../src/theme-presets.js";
import { isThemePackageCandidate, resolveThemePackage } from "./theme-package.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const dependencyNames = new Set([
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
  ...Object.keys(packageJson.optionalDependencies ?? {}),
]);
const candidates = [...dependencyNames].filter(isThemePackageCandidate).sort();
let failed = false;

console.log("Built-in themes:");
for (const [id, theme] of Object.entries(themePresets)) console.log(`  ${id} — ${theme.label} (${theme.colorScheme})`);

if (candidates.length === 0) {
  console.log("\nInstalled external themes: none");
} else {
  console.log("\nInstalled external themes:");
  for (const specifier of candidates) {
    try {
      const theme = await resolveThemePackage({ root, specifier });
      const version = theme.packageVersion ? ` v${theme.packageVersion}` : "";
      console.log(`  ${theme.id} — ${theme.label} (${specifier}${version})`);
    } catch (error) {
      failed = true;
      console.error(`  INVALID ${specifier}: ${error.message}`);
    }
  }
}

if (failed) process.exitCode = 1;
