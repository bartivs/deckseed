import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { proposalRemoteMedia, proposalSourceHash } from "../scripts/proposal-lib.mjs";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function generate(slug) {
  return execFileAsync(process.execPath, [path.join(root, "scripts", "new-deck.mjs"), slug]);
}

async function fakeExecutables() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "fake-proposal-tools-"));
  const pandoc = path.join(directory, "pandoc");
  const libreoffice = path.join(directory, "libreoffice");
  await writeFile(pandoc, `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
const output = args.find((argument) => argument.startsWith("--output=")).slice(9);
if (process.env.FAKE_PANDOC_ARGS) fs.writeFileSync(process.env.FAKE_PANDOC_ARGS, JSON.stringify(args));
fs.writeFileSync(output, "fake docx");
`);
  await writeFile(libreoffice, `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const args = process.argv.slice(2);
const outdir = args[args.indexOf("--outdir") + 1];
if (process.env.FAKE_LIBREOFFICE_ARGS) fs.writeFileSync(process.env.FAKE_LIBREOFFICE_ARGS, JSON.stringify(args));
fs.writeFileSync(path.join(outdir, "proposal.pdf"), "%PDF-1.7\\nfake proposal");
`);
  await Promise.all([chmod(pandoc, 0o755), chmod(libreoffice, 0o755)]);
  return { directory, pandoc, libreoffice };
}

test("proposal media must use local resources", () => {
  assert.deepEqual(proposalRemoteMedia("![Local](proposal-assets/flow.svg)"), []);
  assert.deepEqual(proposalRemoteMedia("![Remote](https://example.com/flow.svg)"), ["https://example.com/flow.svg"]);
  assert.deepEqual(proposalRemoteMedia('<img src="https://example.com/logo.png">'), ["https://example.com/logo.png"]);
});

test("proposal source hashes include the deck, style, filter, and local assets", () => {
  const base = {
    proposal: "proposal",
    content: "deck",
    reference: Buffer.from("reference"),
    filter: "filter",
    assets: [{ name: "flow.svg", content: Buffer.from("asset") }],
  };
  const hash = proposalSourceHash(base);
  assert.notEqual(proposalSourceHash({ ...base, proposal: "changed" }), hash);
  assert.notEqual(proposalSourceHash({ ...base, content: "changed" }), hash);
  assert.notEqual(proposalSourceHash({ ...base, reference: Buffer.from("changed") }), hash);
  assert.notEqual(proposalSourceHash({ ...base, filter: "changed" }), hash);
  assert.notEqual(proposalSourceHash({ ...base, assets: [{ name: "flow.svg", content: Buffer.from("changed") }] }), hash);
});

test("the proposal builder invokes Pandoc and LibreOffice and writes a freshness stamp", async () => {
  const slug = `proposal-test-${process.pid}-${Date.now()}`;
  const output = path.join(root, "presentations", slug);
  const tools = await fakeExecutables();
  const pandocArgsPath = path.join(tools.directory, "pandoc-args.json");
  const libreOfficeArgsPath = path.join(tools.directory, "libreoffice-args.json");
  try {
    await generate(slug);
    await writeFile(path.join(output, "proposal.md"), "---\ntitle: Test proposal\n---\n\n# Decision\n\nApprove the pilot.\n");
    const { stdout } = await execFileAsync(process.execPath, [path.join(root, "scripts", "build-proposal.mjs"), slug], {
      env: {
        ...process.env,
        PANDOC_BIN: tools.pandoc,
        LIBREOFFICE_BIN: tools.libreoffice,
        FAKE_PANDOC_ARGS: pandocArgsPath,
        FAKE_LIBREOFFICE_ARGS: libreOfficeArgsPath,
      },
    });
    const [pdf, stamp, pandocArgs, libreOfficeArgs] = await Promise.all([
      readFile(path.join(output, "proposal.pdf")),
      readFile(path.join(output, "proposal.sha256"), "utf8"),
      readFile(pandocArgsPath, "utf8").then(JSON.parse),
      readFile(libreOfficeArgsPath, "utf8").then(JSON.parse),
    ]);
    assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
    assert.match(stamp, /^[a-f0-9]{64}\n$/u);
    assert.ok(pandocArgs.includes("--to=docx"));
    assert.ok(pandocArgs.some((argument) => argument.startsWith("--reference-doc=")));
    assert.ok(pandocArgs.some((argument) => argument.startsWith("--lua-filter=")));
    assert.ok(libreOfficeArgs.includes("--convert-to"));
    assert.match(stdout, /Built proposal PDF/);
  } finally {
    await Promise.all([
      rm(output, { recursive: true, force: true }),
      rm(tools.directory, { recursive: true, force: true }),
    ]);
  }
});

test("the proposal builder rejects paths outside presentations", async () => {
  await assert.rejects(
    execFileAsync(process.execPath, [path.join(root, "scripts", "build-proposal.mjs"), "../README.md"]),
    /Presentation must be a directory under presentations/,
  );
});
