import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const PROPOSAL_BUILD_SIGNATURE = JSON.stringify({
  from: "markdown+fenced_divs+bracketed_spans+raw_attribute",
  to: "docx",
  pdfConverter: "libreoffice",
  schemaVersion: 1,
});

export async function isFile(file) {
  try { return (await stat(file)).isFile(); }
  catch { return false; }
}

export async function proposalReferencePath(root, directory) {
  const local = path.join(directory, "proposal-reference.docx");
  return await isFile(local) ? local : path.join(root, "templates", "proposal-reference.docx");
}

export function proposalRemoteMedia(markdown) {
  const matches = [];
  const patterns = [
    /!\[[^\]]*\]\(\s*<?(https?:\/\/[^\s)>]+)>?[^)]*\)/giu,
    /<img\b[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*>/giu,
  ];
  for (const pattern of patterns) {
    for (const match of markdown.matchAll(pattern)) matches.push(match[1]);
  }
  return [...new Set(matches)];
}

export async function collectProposalAssets(directory) {
  const root = path.join(directory, "proposal-assets");
  const assets = [];

  async function visit(current) {
    let entries;
    try { entries = await readdir(current, { withFileTypes: true }); }
    catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) {
        assets.push({
          name: path.relative(root, absolute).split(path.sep).join("/"),
          content: await readFile(absolute),
        });
      }
    }
  }

  await visit(root);
  return assets;
}

export function proposalSourceHash({ proposal, content, reference, filter, assets = [] }) {
  const hash = createHash("sha256")
    .update(PROPOSAL_BUILD_SIGNATURE)
    .update("\0proposal\0")
    .update(proposal)
    .update("\0deck-content\0")
    .update(content)
    .update("\0reference-doc\0")
    .update(reference)
    .update("\0filter\0")
    .update(filter);
  for (const asset of assets) {
    hash.update("\0asset-name\0").update(asset.name).update("\0asset-content\0").update(asset.content);
  }
  return hash.digest("hex");
}
