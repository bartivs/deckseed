import { lookupTranslation, selectLanguage } from "./language.js";
import { selectTheme, validateTheme } from "./theme.js";

const config = globalThis.PRESENTATION_CONFIG;
if (!config) throw new Error("PRESENTATION_CONFIG must be defined before loading the harness.");

const languages = Object.keys(config.languages ?? {});
const fallbackLanguage = config.fallbackLanguage ?? languages[0];
const themes = config.themes ?? { default: { label: "Default", colorScheme: "normal", variables: {} } };
const themeIds = Object.keys(themes);
const languageStorageKey = config.languageStorageKey ?? config.storageKey ?? `presentation-language:${config.id ?? "default"}`;
const slides = [...document.querySelectorAll(".slide")];
const counter = document.querySelector("[data-slide-counter]");
const progress = document.querySelector("[data-progress]");
const languageSelect = document.querySelector("[data-language-select]");
const languageControl = document.querySelector("[data-language-control]");
let index = Math.max(0, Math.min(slides.length - 1, Number(location.hash.slice(1)) - 1 || 0));
let touchStartX;
let currentLanguage;
let currentTheme;
let appliedThemeVariables = new Set();

function readStorage(key) {
  try { return localStorage.getItem(key); }
  catch { return undefined; }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, value); }
  catch { /* Storage can be disabled without breaking the deck. */ }
}

function queryOption(name) {
  return new URLSearchParams(location.search).get(name) ?? undefined;
}

function setQueryOption(name, value) {
  const url = new URL(location.href);
  url.searchParams.set(name, value);
  history.replaceState(null, "", `${url.search}${url.hash}`);
}

function translate(key, language = currentLanguage) {
  return lookupTranslation(config.translations, language, key, fallbackLanguage);
}

function applyTranslations(language) {
  document.documentElement.lang = language;
  document.documentElement.dir = config.languages[language]?.direction ?? "ltr";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n, language);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = translate(element.dataset.i18nHtml, language);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", translate(element.dataset.i18nAriaLabel, language));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.setAttribute("title", translate(element.dataset.i18nTitle, language));
  });
  const titleKey = slides[index]?.dataset.titleKey ?? config.titleKey;
  document.title = translate(titleKey, language);
  currentLanguage = language;
  if (languageSelect) languageSelect.value = language;
  writeStorage(languageStorageKey, language);
  dispatchEvent(new CustomEvent("presentation:languagechange", { detail: { language } }));
}

function applyTheme(themeId) {
  const theme = themes[themeId];
  const errors = validateTheme(theme);
  if (errors.length) throw new Error(`Invalid theme ${themeId}: ${errors.join(", ")}`);

  for (const property of appliedThemeVariables) document.documentElement.style.removeProperty(property);
  appliedThemeVariables = new Set(Object.keys(theme.variables ?? {}));
  for (const [property, value] of Object.entries(theme.variables ?? {})) {
    document.documentElement.style.setProperty(property, String(value));
  }
  if (currentTheme) document.documentElement.classList.remove(`theme-${currentTheme}`);
  document.documentElement.classList.add(`theme-${themeId}`);
  document.documentElement.style.colorScheme = theme.colorScheme ?? "normal";
  currentTheme = themeId;
  dispatchEvent(new CustomEvent("presentation:themechange", { detail: { theme: themeId } }));
}

function configureLanguageSelector() {
  if (languageSelect) {
    languageSelect.replaceChildren();
    for (const [code, metadata] of Object.entries(config.languages)) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = metadata.label ?? code;
      languageSelect.append(option);
    }
    if (languageControl) languageControl.hidden = languages.length < 2;
    languageSelect.addEventListener("change", () => {
      setQueryOption("lang", languageSelect.value);
      applyTranslations(languageSelect.value);
    });
  }
}

function render(nextIndex, updateHash = true) {
  index = Math.max(0, Math.min(slides.length - 1, nextIndex));
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === index);
    slide.classList.toggle("before", slideIndex < index);
    slide.setAttribute("aria-hidden", slideIndex === index ? "false" : "true");
  });
  if (counter) counter.textContent = `${index + 1} / ${slides.length}`;
  if (progress) progress.style.width = `${((index + 1) / slides.length) * 100}%`;
  const titleKey = slides[index]?.dataset.titleKey ?? config.titleKey;
  document.title = translate(titleKey);
  if (updateHash) history.replaceState(null, "", `${location.search}#${index + 1}`);
}

function move(delta) { render(index + delta); }
globalThis.presentationMove = move;
document.querySelector(".deck")?.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.target.closest("a, button, select, label")) return;
  move(event.clientX < innerWidth * 0.25 ? -1 : 1);
});
document.addEventListener("keydown", (event) => {
  if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); move(1); }
  if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); move(-1); }
  if (event.key === "Home") { event.preventDefault(); render(0); }
  if (event.key === "End") { event.preventDefault(); render(slides.length - 1); }
  if (event.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.();
  if (event.key.toLowerCase() === "p") print();
});
addEventListener("hashchange", () => {
  const requested = Number(location.hash.slice(1)) - 1;
  if (Number.isFinite(requested)) render(requested, false);
});
document.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
document.addEventListener("touchend", (event) => {
  if (touchStartX === undefined) return;
  const delta = event.changedTouches[0].screenX - touchStartX;
  if (Math.abs(delta) > 55) move(delta < 0 ? 1 : -1);
  touchStartX = undefined;
}, { passive: true });

if (slides.length === 0) throw new Error("The presentation must contain at least one .slide element.");
configureLanguageSelector();
currentTheme = selectTheme({
  available: themeIds,
  configuredTheme: config.theme,
  fallbackTheme: config.fallbackTheme ?? themeIds[0],
});
applyTheme(currentTheme);
currentLanguage = selectLanguage({
  available: languages,
  query: queryOption("lang"),
  stored: readStorage(languageStorageKey),
  navigatorLanguages: navigator.languages ?? [navigator.language],
  defaultLanguage: config.defaultLanguage ?? "auto",
  fallbackLanguage,
});
applyTranslations(currentLanguage);
render(index, false);
requestAnimationFrame(() => document.documentElement.classList.add("presentation-ready"));
