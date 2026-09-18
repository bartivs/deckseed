import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { bundleDeckHtml } from "./bundle-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const presentationsRoot = path.join(root, "presentations");
const requested = process.argv.slice(2).find((argument) => !argument.startsWith("-"));

if (!requested) {
  console.error("Usage: npm run bundle -- <presentation>");
  process.exit(1);
}

const normalized = requested.replace(/^presentations[\\/]/u, "").replace(/[\\/]index\.html$/u, "");
const directory = path.resolve(presentationsRoot, normalized);
if (directory === presentationsRoot || !directory.startsWith(`${presentationsRoot}${path.sep}`)) {
  console.error("Presentation must be a directory under presentations/");
  process.exit(1);
}

const htmlPath = path.join(directory, "index.html");
const configPath = path.join(directory, "deck.config.js");
try {
  if (!(await stat(htmlPath)).isFile() || !(await stat(configPath)).isFile()) throw new Error();
} catch {
  console.error(`Presentation source not found: ${path.relative(root, directory)}`);
  process.exit(1);
}

const [html, configSource] = await Promise.all([
  readFile(htmlPath, "utf8"),
  readFile(configPath, "utf8"),
]);
await writeFile(htmlPath, await bundleDeckHtml({ root, html, configSource }));
console.log(`Bundled self-contained presentation: ${path.relative(root, htmlPath)}`);
