import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portArgument = process.argv.indexOf("--port");
const port = Number(portArgument >= 0 ? process.argv[portArgument + 1] : process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

function safePath(url) {
  const decoded = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const resolved = path.resolve(root, `.${decoded}`);
  return resolved === root || resolved.startsWith(`${root}${path.sep}`) ? resolved : undefined;
}

function directoryPage(requestPath, entries) {
  const rows = entries.map((entry) => `<li><a href="${path.posix.join(requestPath, entry.name)}${entry.isDirectory() ? "/" : ""}">${entry.name}${entry.isDirectory() ? "/" : ""}</a></li>`).join("");
  return `<!doctype html><meta charset="utf-8"><title>Presentations</title><style>body{font:16px system-ui;max-width:850px;margin:60px auto;padding:0 24px;background:#07111f;color:#f2f7fb}a{color:#56d7e8}li{margin:12px 0}</style><h1>Presentation Harness</h1><ul>${rows || "<li>No local presentations yet.</li>"}</ul>`;
}

createServer(async (request, response) => {
  try {
    if (request.url === "/") {
      response.writeHead(302, { Location: "/presentations/" }); response.end(); return;
    }
    let target = safePath(request.url);
    if (!target) { response.writeHead(403); response.end("Forbidden"); return; }
    let info = await stat(target);
    if (info.isDirectory()) {
      const requestUrl = new URL(request.url, "http://localhost");
      if (!requestUrl.pathname.endsWith("/")) {
        response.writeHead(308, { Location: `${requestUrl.pathname}/${requestUrl.search}` });
        response.end();
        return;
      }
      const index = path.join(target, "index.html");
      try { if ((await stat(index)).isFile()) { target = index; info = await stat(index); } }
      catch {
        const entries = await readdir(target, { withFileTypes: true });
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(directoryPage(new URL(request.url, "http://localhost").pathname, entries.filter((entry) => !entry.name.startsWith("."))));
        return;
      }
    }
    response.writeHead(200, { "Content-Type": types[path.extname(target)] ?? "application/octet-stream", "Content-Length": info.size, "Cache-Control": "no-store" });
    createReadStream(target).pipe(response);
  } catch (error) {
    response.writeHead(error?.code === "ENOENT" ? 404 : 500);
    response.end(error?.code === "ENOENT" ? "Not found" : "Internal server error");
  }
}).listen(port, host, () => console.log(`Presentation harness: http://${host}:${port}`));
