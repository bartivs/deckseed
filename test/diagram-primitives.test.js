import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requiredSelectors = [
  ".diagram-compare",
  ".diagram-panel",
  ".diagram-flow",
  ".diagram-node",
  ".diagram-connector",
  ".diagram-converge",
  ".diagram-lanes",
  ".diagram-lane",
  ".diagram-boundary",
  ".logo-strip",
  ".tech-logo",
];

test("shared styles expose responsive diagram and logo primitives", async () => {
  const css = await readFile(path.join(root, "src", "pandoc.css"), "utf8");
  for (const selector of requiredSelectors) assert.ok(css.includes(selector), `missing ${selector}`);
  assert.match(css, /@media \(max-width: 800px\)[\s\S]*\.diagram-compare/u);
  assert.match(css, /@media print[\s\S]*\.diagram-panel/u);
});

test("the starter deck demonstrates the shared before-and-after pattern", async () => {
  const template = await readFile(path.join(root, "templates", "content.md"), "utf8");
  for (const className of ["diagram-compare", "diagram-panel before", "diagram-panel after", "diagram-flow"]) {
    assert.ok(template.includes(`class="${className}"`), `template must demonstrate ${className}`);
  }
  assert.doesNotMatch(template, /<section class="diagram-/u, "diagram examples must not create nested Reveal sections");
});
