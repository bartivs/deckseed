import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("the deck generator creates a Markdown source artifact with the HTML deck", async () => {
  const slug = `generator-test-${process.pid}-${Date.now()}`;
  const output = path.join(root, "presentations", slug);

  try {
    const { stdout } = await execFileAsync(process.execPath, [
      path.join(root, "scripts", "new-deck.mjs"),
      slug,
      "--title",
      "Approved Architecture",
    ]);

    const [content, html, config] = await Promise.all([
      readFile(path.join(output, "content.md"), "utf8"),
      readFile(path.join(output, "index.html"), "utf8"),
      readFile(path.join(output, "deck.config.js"), "utf8"),
    ]);

    assert.match(content, /^# Approved Architecture$/m);
    assert.match(content, /Approved content source for the presentation HTML/);
    assert.match(html, /<title>Approved Architecture<\/title>/);
    assert.match(config, /"id": "generator-test-/);
    assert.match(stdout, /Content artifact: content\.md/);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
