import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function generate(slug, ...args) {
  return execFileAsync(process.execPath, [path.join(root, "scripts", "new-deck.mjs"), slug, ...args]);
}

test("the deck generator creates an approved source and self-contained HTML", async () => {
  const slug = `generator-test-${process.pid}-${Date.now()}`;
  const output = path.join(root, "presentations", slug);

  try {
    const { stdout } = await generate(slug, "--title", "Approved Architecture", "--theme", "paper");
    const [content, html, config] = await Promise.all([
      readFile(path.join(output, "content.md"), "utf8"),
      readFile(path.join(output, "index.html"), "utf8"),
      readFile(path.join(output, "deck.config.js"), "utf8"),
    ]);

    assert.match(content, /^# Approved Architecture$/m);
    assert.match(content, /Approved content source for the presentation HTML/);
    assert.match(html, /<title>Approved Architecture<\/title>/);
    assert.match(html, /<style data-harness-bundle>/);
    assert.match(html, /<script data-presentation-config>/);
    assert.match(html, /<script data-presentation-harness>/);
    assert.match(html, /onclick="window\.presentationMove\(1\)"/);
    assert.doesNotMatch(html, /<script\b[^>]*\bsrc=/i);
    assert.doesNotMatch(html, /<link\b[^>]*\brel=["']?stylesheet/i);
    assert.doesNotMatch(html, /data-theme-(?:control|select)/);
    assert.match(config, /"id": "generator-test-/);
    assert.match(config, /"theme": "paper"/);
    assert.match(stdout, /Content artifact: content\.md/);
    assert.match(stdout, /self-contained/);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test("the bundle command refreshes the inline presentation definition", async () => {
  const slug = `bundle-test-${process.pid}-${Date.now()}`;
  const output = path.join(root, "presentations", slug);
  const configPath = path.join(output, "deck.config.js");
  const htmlPath = path.join(output, "index.html");

  try {
    await generate(slug);
    const config = await readFile(configPath, "utf8");
    await writeFile(configPath, config.replace(`"id": "${slug}"`, `"id": "${slug}-rebundled"`));
    const { stdout } = await execFileAsync(process.execPath, [path.join(root, "scripts", "bundle-deck.mjs"), slug]);
    const html = await readFile(htmlPath, "utf8");

    assert.match(html, new RegExp(`"id": "${slug}-rebundled"`));
    assert.match(stdout, /Bundled self-contained presentation/);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
