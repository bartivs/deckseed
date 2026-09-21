import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  parseThemeManifest,
  resolveThemePackage,
  validateThemeCss,
} from "../scripts/theme-package.mjs";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = path.join(root, "test", "fixtures", "themes", "valid");
const fixtureCss = await readFile(path.join(fixture, "theme.css"), "utf8");

async function createTheme(manifest, css = fixtureCss) {
  const directory = await mkdtemp(path.join(root, "test", ".theme-package-"));
  await writeFile(path.join(directory, "deckseed-theme.json"), JSON.stringify(manifest));
  await writeFile(path.join(directory, "theme.css"), css);
  return directory;
}

async function fakePandoc() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "fake-pandoc-theme-"));
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

const validManifest = {
  schemaVersion: 1,
  id: "fixture",
  label: "Fixture",
  colorScheme: "light",
  css: "./theme.css",
};

test("resolves and validates a local theme package", async () => {
  const theme = await resolveThemePackage({ root, specifier: "test/fixtures/themes/valid" });
  assert.equal(theme.id, "fixture");
  assert.equal(theme.label, "Fixture");
  assert.equal(theme.packageVersion, "1.0.0");
  await assert.rejects(
    resolveThemePackage({ root, specifier: "test/fixtures/themes/valid", expectedId: "other" }),
    /declares id.*other/,
  );
  assert.match(theme.cssSource, /--harness-bg:/);
  assert.match(theme.baseTheme, /fixture/);
});

test("rejects invalid theme manifests and CSS", async () => {
  assert.throws(() => parseThemeManifest({}), /must be valid JSON|JSON/);
  assert.throws(() => parseThemeManifest(JSON.stringify({ ...validManifest, schemaVersion: 2 }), "fixture"), /schemaVersion 1/);
  assert.throws(() => parseThemeManifest(JSON.stringify({ ...validManifest, id: "Not Valid" }), "fixture"), /must define id/);
  assert.throws(() => validateThemeCss(fixtureCss.replace("--harness-text", "--wrong-text"), "fixture"), /--harness-text/);
  assert.throws(() => validateThemeCss(`${fixtureCss}\n@import url(\"x.css\");`, "fixture"), /@import/);
  assert.throws(() => validateThemeCss(`${fixtureCss}\nbackground: url(https://example.com/x);`, "fixture"), /remote URLs/);
  assert.throws(() => validateThemeCss(`${fixtureCss}\nbackground: url(icons/x.svg);`, "fixture"), /data: URLs/);
  assert.doesNotThrow(() => validateThemeCss(`${fixtureCss}\nbackground: url(data:image/svg+xml;base64,abc);`, "fixture"));
});

test("rejects CSS paths outside a theme package", async () => {
  const directory = await createTheme({ ...validManifest, css: "../outside.css" });
  try {
    await assert.rejects(
      resolveThemePackage({ root, specifier: path.relative(root, directory) }),
      /escapes the package directory/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("external scaffolding records the package and creates local overrides", async () => {
  const slug = `external-theme-${process.pid}-${Date.now()}`;
  const output = path.join(root, "presentations", slug);
  try {
    await execFileAsync(process.execPath, [path.join(root, "scripts", "new-deck.mjs"), slug, "--theme", "test/fixtures/themes/valid"]);
    const [content, theme] = await Promise.all([
      readFile(path.join(output, "content.md"), "utf8"),
      readFile(path.join(output, "theme.css"), "utf8"),
    ]);
    assert.match(content, /harness-theme: "fixture"/);
    assert.match(content, /harness-theme-package: "test\/fixtures\/themes\/valid"/);
    assert.doesNotMatch(theme, /--harness-bg:/);
    assert.match(theme, /Local overrides/);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test("external build passes package CSS before local overrides", async () => {
  const slug = `external-build-${process.pid}-${Date.now()}`;
  const output = path.join(root, "presentations", slug);
  const fake = await fakePandoc();
  const argsPath = path.join(fake.directory, "args.json");
  try {
    await execFileAsync(process.execPath, [path.join(root, "scripts", "new-deck.mjs"), slug, "--theme", "test/fixtures/themes/valid"]);
    await execFileAsync(process.execPath, [path.join(root, "scripts", "build-deck.mjs"), slug], {
      env: { ...process.env, PANDOC_BIN: fake.executable, FAKE_PANDOC_ARGS: argsPath },
    });
    const args = JSON.parse(await readFile(argsPath, "utf8"));
    const cssArgs = args.filter((argument) => argument.startsWith("--css="));
    assert.equal(cssArgs.length, 3);
    assert.match(cssArgs[0], /src[\\/]pandoc\.css$/);
    assert.match(cssArgs[1], /test[\\/]fixtures[\\/]themes[\\/]valid[\\/]theme\.css$/);
    assert.match(cssArgs[2], new RegExp(`${slug}[\\/]theme\\.css$`));
  } finally {
    await Promise.all([
      rm(output, { recursive: true, force: true }),
      rm(fake.directory, { recursive: true, force: true }),
    ]);
  }
});

test("theme package inputs participate in source hashing", async () => {
  const first = await resolveThemePackage({ root, specifier: "test/fixtures/themes/valid" });
  assert.notEqual(first.baseTheme, "");
  assert.notEqual(first.baseTheme, JSON.stringify({ specifier: first.specifier, manifest: first.manifestSource, css: `${first.cssSource}\nchanged` }));
});
