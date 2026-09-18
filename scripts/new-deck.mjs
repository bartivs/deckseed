import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { bundleDeckHtml } from "./bundle-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const slug = args.find((argument) => !argument.startsWith("-"));
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("Usage: npm run new -- <slug> [--title \"Title\"] [--languages en,es] [--default-language auto] [--theme midnight] [--force]");
  process.exit(1);
}

const title = valueAfter("--title") ?? slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
const languageCodes = [...new Set((valueAfter("--languages") ?? "en,es").split(",").map((value) => value.trim()).filter(Boolean))];
const defaultLanguage = valueAfter("--default-language") ?? "auto";
const themeId = valueAfter("--theme") ?? "midnight";
const force = args.includes("--force");
if (languageCodes.length === 0 || languageCodes.some((code) => !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(code))) {
  console.error("--languages must contain comma-separated BCP 47 language codes such as en,es,pt-BR");
  process.exit(1);
}
if (defaultLanguage !== "auto" && !languageCodes.includes(defaultLanguage)) {
  console.error("--default-language must be auto or one of the configured languages");
  process.exit(1);
}
const themeLibrary = {
  midnight: { label: "Midnight", colorScheme: "dark", variables: { "--harness-bg": "#07111f", "--harness-panel": "#12243a", "--harness-text": "#f2f7fb", "--harness-muted": "#9db1c7", "--harness-accent": "#56d7e8", "--harness-border": "rgba(157, 177, 199, 0.25)" } },
  paper: { label: "Paper", colorScheme: "light", variables: { "--harness-bg": "#f5f1e8", "--harness-panel": "#ffffff", "--harness-text": "#17202a", "--harness-muted": "#5d6975", "--harness-accent": "#087f91", "--harness-border": "rgba(23, 32, 42, 0.18)" } },
  ember: { label: "Ember", colorScheme: "dark", variables: { "--harness-bg": "#180d0a", "--harness-panel": "#2a1711", "--harness-text": "#fff6ed", "--harness-muted": "#d0a68f", "--harness-accent": "#ff8a3d", "--harness-border": "rgba(255, 176, 122, 0.25)" } }
};
if (!(themeId in themeLibrary)) {
  console.error(`--theme must be one of: ${Object.keys(themeLibrary).join(", ")}`);
  process.exit(1);
}
const output = path.join(root, "presentations", slug);
const contentPath = path.join(output, "content.md");
const indexPath = path.join(output, "index.html");
const configPath = path.join(output, "deck.config.js");

if (!force) {
  for (const artifactPath of [contentPath, indexPath, configPath]) {
    try {
      await access(artifactPath);
      console.error(`Presentation already exists: ${path.relative(root, output)} (use --force to replace it)`);
      process.exit(1);
    } catch { /* Expected for a new deck. */ }
  }
}

const languageLabels = { en: "English", es: "Español", fr: "Français", de: "Deutsch", pt: "Português", it: "Italiano", ca: "Català" };
const english = {
  "controls.language": "Language",
  "controls.navigation": "Presentation navigation",
  "controls.previous": "Previous slide",
  "controls.next": "Next slide",
  "controls.hint": "← → navigate · F fullscreen · P print",
  "slides.title.documentTitle": title,
  "slides.title.eyebrow": "Presentation",
  "slides.title.heading": title,
  "slides.title.lead": "Replace this copy with your presentation's main idea.",
  "slides.title.footer": "Use the arrow keys or Space to navigate.",
  "slides.content.documentTitle": `Example — ${title}`,
  "slides.content.eyebrow": "Example",
  "slides.content.heading": "Compose slides from reusable primitives",
  "slides.content.cardOneTitle": "Clear structure",
  "slides.content.cardOneBody": "Use semantic HTML and stable translation keys.",
  "slides.content.cardTwoTitle": "Configurable languages",
  "slides.content.cardTwoBody": "Add or remove languages in deck.config.js.",
  "slides.content.cardThreeTitle": "Portable controls",
  "slides.content.cardThreeBody": "Navigation, print, fullscreen and touch support are built in.",
  "slides.content.footer": "Presentation content stays local and untracked."
};
const spanish = {
  "controls.language": "Idioma",
  "controls.navigation": "Navegación de la presentación",
  "controls.previous": "Diapositiva anterior",
  "controls.next": "Diapositiva siguiente",
  "controls.hint": "← → navegar · F pantalla completa · P imprimir",
  "slides.title.documentTitle": title,
  "slides.title.eyebrow": "Presentación",
  "slides.title.heading": title,
  "slides.title.lead": "Sustituye este texto por la idea principal de tu presentación.",
  "slides.title.footer": "Usa las flechas o la barra espaciadora para navegar.",
  "slides.content.documentTitle": `Ejemplo — ${title}`,
  "slides.content.eyebrow": "Ejemplo",
  "slides.content.heading": "Crea diapositivas con componentes reutilizables",
  "slides.content.cardOneTitle": "Estructura clara",
  "slides.content.cardOneBody": "Usa HTML semántico y claves de traducción estables.",
  "slides.content.cardTwoTitle": "Idiomas configurables",
  "slides.content.cardTwoBody": "Añade o elimina idiomas en deck.config.js.",
  "slides.content.cardThreeTitle": "Controles portátiles",
  "slides.content.cardThreeBody": "La navegación, impresión, pantalla completa y control táctil vienen incluidos.",
  "slides.content.footer": "El contenido de las presentaciones permanece local y sin seguimiento de Git."
};
const translations = Object.fromEntries(languageCodes.map((code) => [code, code === "es" ? spanish : { ...english }]));
const languages = Object.fromEntries(languageCodes.map((code) => [code, { label: languageLabels[code] ?? code, direction: ["ar", "he", "fa", "ur"].includes(code.split("-")[0]) ? "rtl" : "ltr" }]));
const themes = { [themeId]: themeLibrary[themeId] };
const config = {
  id: slug,
  titleKey: "slides.title.documentTitle",
  fallbackLanguage: languageCodes.includes("en") ? "en" : languageCodes[0],
  defaultLanguage,
  languages,
  translations,
  theme: themeId,
  fallbackTheme: themeId,
  themes,
};

const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const contentTemplate = await readFile(path.join(root, "templates", "content.md"), "utf8");
const htmlTemplate = await readFile(path.join(root, "templates", "deck.html"), "utf8");
const configSource = `window.PRESENTATION_CONFIG = ${JSON.stringify(config, null, 2)};\n`;
const html = await bundleDeckHtml({
  root,
  html: htmlTemplate.replaceAll("{{TITLE}}", escapeHtml(title)),
  configSource,
});
await mkdir(output, { recursive: true });
await writeFile(contentPath, contentTemplate.replaceAll("{{TITLE}}", title));
await writeFile(indexPath, html);
await writeFile(configPath, configSource);
console.log(`Created ${path.relative(root, output)}`);
console.log("Content artifact: content.md (created before the HTML implementation)");
console.log(`Languages: ${languageCodes.join(", ")} (default: ${defaultLanguage})`);
console.log(`Theme: ${themeId} (fixed by the presentation definition)`);
console.log("HTML bundle: index.html is self-contained and can be shared by itself.");
console.log("Presentation files are ignored by Git by design.");
