import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("public project metadata consistently brands Deckseed", async () => {
  const [readme, packageSource] = await Promise.all([
    readFile(path.join(root, "README.md"), "utf8"),
    readFile(path.join(root, "package.json"), "utf8"),
  ]);
  const packageJson = JSON.parse(packageSource);
  assert.match(readme, /^# Deckseed — Agent-first Markdown presentation generator$/m);
  assert.equal(packageJson.name, "deckseed");
  assert.match(packageJson.description, /Markdown presentation generator/);
  assert.ok(packageJson.keywords.includes("presentation-as-code"));
});

test("the landing page has canonical search and social metadata", async () => {
  const [html, robots, sitemap] = await Promise.all([
    readFile(path.join(root, "docs", "index.html"), "utf8"),
    readFile(path.join(root, "docs", "robots.txt"), "utf8"),
    readFile(path.join(root, "docs", "sitemap.xml"), "utf8"),
  ]);
  const description = html.match(/<meta name="description" content="([^"]+)">/u)?.[1];
  assert.match(html, /<title>Deckseed — Agent-first Markdown Presentation Generator<\/title>/);
  assert.ok(description.length >= 120 && description.length <= 160, `description length is ${description.length}`);
  assert.match(html, /<link rel="canonical" href="https:\/\/bartivs\.github\.io\/deckseed\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/bartivs\.github\.io\/deckseed\/social-preview\.png">/);
  assert.match(html, /"@type": "SoftwareSourceCode"/);
  assert.match(html, /https:\/\/github\.com\/bartivs\/deckseed/);
  assert.match(robots, /Sitemap: https:\/\/bartivs\.github\.io\/deckseed\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/bartivs\.github\.io\/deckseed\/<\/loc>/);
});
