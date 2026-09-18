import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function waitForServer(origin) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(origin, { redirect: "manual" });
      if (response.status >= 200 && response.status < 400) return;
    } catch { /* Keep waiting. */ }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(`Server did not start at ${origin}`);
}

test("directory presentation URLs redirect to and open with a trailing slash", async () => {
  const slug = `routing-test-${process.pid}-${Date.now()}`;
  const directory = path.join(root, "presentations", slug);
  const port = 30_000 + (process.pid % 10_000);
  const origin = `http://127.0.0.1:${port}`;
  let server;

  try {
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), "<!doctype html><title>Routing test</title>");
    server = spawn(process.execPath, [path.join(root, "scripts", "serve.mjs"), "--port", String(port)], {
      cwd: root,
      stdio: "ignore",
    });
    await waitForServer(origin);

    const response = await fetch(`${origin}/presentations/${slug}?lang=es`, { redirect: "manual" });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), `/presentations/${slug}/?lang=es`);

    const { stdout } = await execFileAsync(process.execPath, [
      path.join(root, "scripts", "open.mjs"),
      slug,
      "--no-browser",
    ], { env: { ...process.env, PORT: String(port) } });
    assert.equal(stdout.trim(), `${origin}/presentations/${slug}/`);
  } finally {
    server?.kill();
    await rm(directory, { recursive: true, force: true });
  }
});
