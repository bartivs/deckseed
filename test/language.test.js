import test from "node:test";
import assert from "node:assert/strict";
import { lookupTranslation, matchLanguage, selectLanguage } from "../src/language.js";

test("matches exact and regional browser languages", () => {
  assert.equal(matchLanguage("es-ES", ["en", "es"]), "es");
  assert.equal(matchLanguage("pt-BR", ["en", "pt-PT"]), "pt-PT");
  assert.equal(matchLanguage("ja", ["en", "es"]), undefined);
});

test("selection precedence is query, stored, browser, configured default, fallback", () => {
  const base = { available: ["en", "es"], navigatorLanguages: ["es-ES"], defaultLanguage: "auto", fallbackLanguage: "en" };
  assert.equal(selectLanguage({ ...base, query: "en", stored: "es" }), "en");
  assert.equal(selectLanguage({ ...base, stored: "en" }), "en");
  assert.equal(selectLanguage(base), "es");
  assert.equal(selectLanguage({ ...base, navigatorLanguages: [], defaultLanguage: "es" }), "es");
  assert.equal(selectLanguage({ ...base, navigatorLanguages: ["ja"] }), "en");
});

test("translation lookup falls back to the configured language and then the key", () => {
  const translations = { en: { title: "Title" }, es: {} };
  assert.equal(lookupTranslation(translations, "es", "title", "en"), "Title");
  assert.equal(lookupTranslation(translations, "es", "missing", "en"), "missing");
});

test("rejects empty language configuration", () => {
  assert.throws(() => selectLanguage({ available: [] }), /At least one/);
});
