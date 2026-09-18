import { access, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const presentationsRoot = path.join(root, "presentations");
const args = process.argv.slice(2);
const noBrowser = args.includes("--no-browser");
const requested = args.find((argument) => !argument.startsWith("-"));
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";
const origin = `http://${host}:${port}`;

async function availablePresentations() {
  const entries = await readdir(presentationsRoot, { withFileTypes: true });
  return entries.filter((entry) => !entry.name.startsWith(".") && (entry.isDirectory() || entry.name.endsWith(".html")));
}

async function resolvePresentation(value) {
  if (!value) {
    const entries = await availablePresentations();
    if (entries.length !== 1) {
      const choices = entries.map((entry) => entry.name).join(", ") || "none";
      throw new Error(`Specify a presentation. Available: ${choices}`);
    }
    value = entries[0].name;
  }

  const normalized = value.replace(/^presentations[\\/]/, "");
  const candidates = [normalized];
  if (!path.extname(normalized)) candidates.push(`${normalized}.html`, path.join(normalized, "index.html"));

  for (const candidate of candidates) {
    const absolute = path.resolve(presentationsRoot, candidate);
    if (absolute !== presentationsRoot && !absolute.startsWith(`${presentationsRoot}${path.sep}`)) continue;
    try {
      const info = await stat(absolute);
      if (info.isDirectory()) {
        const index = path.join(absolute, "index.html");
        await access(index);
        return path.relative(root, `${absolute}${path.sep}`).split(path.sep).map(encodeURIComponent).join("/");
      }
      if (info.isFile() && absolute.endsWith(".html")) {
        return path.relative(root, absolute).split(path.sep).map(encodeURIComponent).join("/");
      }
    } catch { /* Try the next supported shape. */ }
  }
  throw new Error(`Presentation not found under presentations/: ${value}`);
}

async function serverIsReady() {
  try {
    const response = await fetch(origin, { redirect: "manual" });
    return response.status >= 200 && response.status < 400;
  } catch { return false; }
}

async function ensureServer() {
  if (await serverIsReady()) return;
  const child = spawn(process.execPath, [path.join(root, "scripts", "serve.mjs"), "--port", String(port)], {
    cwd: root,
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (await serverIsReady()) return;
  }
  throw new Error(`Presentation server did not start at ${origin}`);
}

function openBrowser(url) {
  const commands = process.platform === "darwin"
    ? [["open", [url]]]
    : process.platform === "win32"
      ? [["cmd", ["/c", "start", "", url]]]
      : [["xdg-open", [url]]];
  const [command, commandArgs] = commands[0];
  const child = spawn(command, commandArgs, { detached: true, stdio: "ignore" });
  child.on("error", (error) => console.error(`Could not launch the browser: ${error.message}`));
  child.unref();
}

try {
  const presentationPath = await resolvePresentation(requested);
  await ensureServer();
  const url = new URL(presentationPath, `${origin}/`).href;
  if (!noBrowser) openBrowser(url);
  console.log(url);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
