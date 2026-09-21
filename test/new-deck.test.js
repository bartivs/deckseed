import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { assertSelfContainedReveal, presentationSourceHash, readEmbeddedSourceHash } from "../scripts/pandoc-lib.mjs";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function generate(slug, ...args) {
  return execFileAsync(process.execPath, [path.join(root, "scripts", "new-deck.mjs"), slug, ...args]);
}

async function fakePandoc() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "fake-pandoc-"));
  const executable = path.join(directory, "pandoc");
  await writeFile(executable, `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
const output = args.find((argument) => argument.startsWith("--output=")).slice(9);
if (process.env.FAKE_PANDOC_ARGS) fs.writeFileSync(process.env.FAKE_PANDOC_ARGS, JSON.stringify(args));
fs.writeFileSync(output, "<!doctype html><html><head><title>Generated</title></head><body><div class=\\"reveal\\"><div class=\\"slides\\"><section>Generated</section></div></div><script>globalThis.Reveal={initialize(){}};<\\/script></body></html>");
`);
  await chmod(executable, 0o755);
  return { directory, executable };
}

test("the generator scaffolds canonical Pandoc sources without generated output", async () => {
  const slug = `generator-test-${process.pid}-${Date.now()}`;
  const output = path.join(root, "presentations", slug);
  try {
    const { stdout } = await generate(slug, "--title", "Approved Architecture", "--language", "es", "--theme", "paper");
    const [content, theme] = await Promise.all([
      readFile(path.join(output, "content.md"), "utf8"),
      readFile(path.join(output, "theme.css"), "utf8"),
    ]);
    assert.match(content, /^---$/m);
    assert.match(content, /pagetitle: "Approved Architecture"/);
    assert.match(content, /lang: "es"/);
    assert.match(content, /harness-theme: "paper"/);
    assert.match(content, /^# Approved Architecture$/m);
    assert.match(theme, /--harness-bg: #f5f1e8/);
    await assert.rejects(readFile(path.join(output, "index.html")), /ENOENT/);
    await assert.rejects(readFile(path.join(output, "deck.config.js")), /ENOENT/);
    assert.match(stdout, /Canonical source: content\.md/);
    assert.match(stdout, /npm run build/);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test("the build command invokes Pandoc and stamps self-contained output", async () => {
  const slug = `build-test-${process.pid}-${Date.now()}`;
  const output = path.join(root, "presentations", slug);
  const fake = await fakePandoc();
  const argsPath = path.join(fake.directory, "args.json");
  try {
    await generate(slug);
    const { stdout } = await execFileAsync(process.execPath, [path.join(root, "scripts", "build-deck.mjs"), slug], {
      env: { ...process.env, PANDOC_BIN: fake.executable, FAKE_PANDOC_ARGS: argsPath },
    });
    const [html, pandocArgs] = await Promise.all([
      readFile(path.join(output, "index.html"), "utf8"),
      readFile(argsPath, "utf8").then(JSON.parse),
    ]);
    assert.match(html, /class="reveal"/);
    assert.match(html, /presentation-source-sha256/);
    assert.equal(readEmbeddedSourceHash(html)?.length, 64);
    assert.doesNotMatch(html, /<script\b[^>]*\bsrc=/iu);
    assert.doesNotMatch(html, /<link\b[^>]*\brel=["']?stylesheet/iu);
    assert.ok(pandocArgs.includes("--to=revealjs"));
    assert.ok(pandocArgs.includes("--standalone"));
    assert.ok(pandocArgs.includes("--embed-resources"));
    assert.ok(pandocArgs.includes("--slide-level=0"));
    assert.ok(pandocArgs.includes("--variable=revealjs-url=https://unpkg.com/reveal.js@5.2.1"));
    assert.match(stdout, /Built self-contained Pandoc presentation/);
  } finally {
    await Promise.all([
      rm(output, { recursive: true, force: true }),
      rm(fake.directory, { recursive: true, force: true }),
    ]);
  }
});

test("validation rejects generated output after an authored source changes", async () => {
  const slug = `stale-test-${process.pid}-${Date.now()}`;
  const output = path.join(root, "presentations", slug);
  const fake = await fakePandoc();
  try {
    await generate(slug);
    await execFileAsync(process.execPath, [path.join(root, "scripts", "build-deck.mjs"), slug], {
      env: { ...process.env, PANDOC_BIN: fake.executable },
    });
    const sourcePath = path.join(output, "content.md");
    await writeFile(sourcePath, `${await readFile(sourcePath, "utf8")}\n<!-- changed -->\n`);
    await assert.rejects(
      execFileAsync(process.execPath, [path.join(root, "scripts", "validate.mjs")]),
      (error) => /generated index\.html is stale/.test(error.stderr),
    );
  } finally {
    await Promise.all([
      rm(output, { recursive: true, force: true }),
      rm(fake.directory, { recursive: true, force: true }),
    ]);
  }
});

test("the source hash changes when any authored input changes", () => {
  const base = { content: "deck", theme: "theme", sharedCss: "shared" };
  const hash = presentationSourceHash(base);
  assert.notEqual(presentationSourceHash({ ...base, content: "changed" }), hash);
  assert.notEqual(presentationSourceHash({ ...base, theme: "changed" }), hash);
  assert.notEqual(presentationSourceHash({ ...base, sharedCss: "changed" }), hash);
  assert.notEqual(presentationSourceHash({ ...base, baseTheme: "installed-theme" }), hash);
});

test("self-contained output validation rejects external media", () => {
  assert.throws(
    () => assertSelfContainedReveal('<div class="reveal"><div class="slides"><section><img src="https://example.com/image.png"></section></div></div>'),
    /external media/,
  );
});

test("the generator rejects unknown themes", async () => {
  const slug = `invalid-theme-${process.pid}-${Date.now()}`;
  await assert.rejects(generate(slug, "--theme", "unknown"), /--theme must be one of/);
});

test("the build command rejects paths outside presentations", async () => {
  await assert.rejects(
    execFileAsync(process.execPath, [path.join(root, "scripts", "build-deck.mjs"), "../README.md"]),
    /Presentation must be a directory under presentations/,
  );
});
