import { execFile } from "node:child_process";
import { copyFile, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolvePresentationDirectory } from "./pandoc-lib.mjs";
import {
  collectProposalAssets,
  proposalReferencePath,
  proposalRemoteMedia,
  proposalSourceHash,
} from "./proposal-lib.mjs";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requested = process.argv.slice(2).find((argument) => !argument.startsWith("-"));

if (!requested) {
  console.error("Usage: npm run proposal -- <presentation>");
  process.exit(1);
}

let directory;
try {
  directory = resolvePresentationDirectory(root, requested);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const proposalPath = path.join(directory, "proposal.md");
const contentPath = path.join(directory, "content.md");
const filterPath = path.join(root, "scripts", "proposal-pagebreak.lua");
const outputPath = path.join(directory, "proposal.pdf");
const stampPath = path.join(directory, "proposal.sha256");
const temporaryOutputPath = path.join(directory, `.proposal.pdf.${process.pid}.tmp`);
const temporaryStampPath = path.join(directory, `.proposal.sha256.${process.pid}.tmp`);
let temporaryDirectory;

async function requireFile(file) {
  try {
    if (!(await stat(file)).isFile()) throw new Error();
  } catch {
    throw new Error(`Missing proposal source: ${path.relative(root, file)}`);
  }
}

try {
  const referencePath = await proposalReferencePath(root, directory);
  for (const file of [proposalPath, contentPath, referencePath, filterPath]) await requireFile(file);

  const [proposal, content, reference, filter, assets] = await Promise.all([
    readFile(proposalPath, "utf8"),
    readFile(contentPath, "utf8"),
    readFile(referencePath),
    readFile(filterPath, "utf8"),
    collectProposalAssets(directory),
  ]);
  const remoteMedia = proposalRemoteMedia(proposal);
  if (remoteMedia.length) throw new Error(`Proposal media must be local: ${remoteMedia.join(", ")}`);
  const hash = proposalSourceHash({ proposal, content, reference, filter, assets });

  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "deckseed-proposal-"));
  const temporaryDocx = path.join(temporaryDirectory, "proposal.docx");
  const convertedPdf = path.join(temporaryDirectory, "proposal.pdf");
  const libreOfficeProfile = path.join(temporaryDirectory, "libreoffice-profile");
  const resourcePath = [directory, root].join(path.delimiter);
  const pandocArgs = [
    "proposal.md",
    "--from=markdown+fenced_divs+bracketed_spans+raw_attribute",
    "--to=docx",
    "--standalone",
    `--resource-path=${resourcePath}`,
    `--reference-doc=${referencePath}`,
    `--lua-filter=${filterPath}`,
    `--output=${temporaryDocx}`,
  ];
  await execFileAsync(process.env.PANDOC_BIN || "pandoc", pandocArgs, {
    cwd: directory,
    maxBuffer: 10 * 1024 * 1024,
  });

  const libreOfficeArgs = [
    "--headless",
    "--nologo",
    "--nodefault",
    "--nofirststartwizard",
    `-env:UserInstallation=${pathToFileURL(libreOfficeProfile).href}`,
    "--convert-to",
    "pdf",
    "--outdir",
    temporaryDirectory,
    temporaryDocx,
  ];
  await execFileAsync(process.env.LIBREOFFICE_BIN || "libreoffice", libreOfficeArgs, {
    maxBuffer: 10 * 1024 * 1024,
  });

  await requireFile(convertedPdf);
  const pdf = await readFile(convertedPdf);
  if (pdf.length < 5 || pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("LibreOffice did not produce a valid PDF");
  }

  await copyFile(convertedPdf, temporaryOutputPath);
  await writeFile(temporaryStampPath, `${hash}\n`);
  await rm(outputPath, { force: true });
  await rm(stampPath, { force: true });
  await rename(temporaryOutputPath, outputPath);
  await rename(temporaryStampPath, stampPath);
  console.log(`Built proposal PDF: ${path.relative(root, outputPath)}`);
} catch (error) {
  await Promise.all([
    rm(temporaryOutputPath, { force: true }),
    rm(temporaryStampPath, { force: true }),
  ]);
  if (error.code === "ENOENT" && error.syscall?.startsWith("spawn")) {
    const program = error.path || "required program";
    console.error(`${program} is required. Install Pandoc and LibreOffice, or set PANDOC_BIN/LIBREOFFICE_BIN.`);
  } else {
    console.error(error.stderr?.trim() || error.message);
  }
  process.exitCode = 1;
} finally {
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
}
