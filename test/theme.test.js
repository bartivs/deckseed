import test from "node:test";
import assert from "node:assert/strict";
import { selectTheme, validateTheme } from "../src/theme.js";

const themes = {
  midnight: { label: "Midnight", colorScheme: "dark", variables: { "--harness-bg": "#000" } },
  paper: { label: "Paper", colorScheme: "light", variables: { "--harness-bg": "#fff" } },
};
const base = { available: Object.keys(themes), themes, defaultTheme: "auto", fallbackTheme: "midnight" };

test("theme selection respects query and stored preferences", () => {
  assert.equal(selectTheme({ ...base, query: "paper", stored: "midnight" }), "paper");
  assert.equal(selectTheme({ ...base, stored: "paper" }), "paper");
});

test("automatic theme follows the OS color preference", () => {
  assert.equal(selectTheme({ ...base, prefersDark: true }), "midnight");
  assert.equal(selectTheme({ ...base, prefersDark: false }), "paper");
});

test("theme selection falls back safely", () => {
  assert.equal(selectTheme({ ...base, query: "unknown", defaultTheme: "unknown" }), "midnight");
  assert.throws(() => selectTheme({ available: [] }), /At least one/);
});

test("theme validation accepts custom properties and rejects unsafe token names", () => {
  assert.deepEqual(validateTheme(themes.midnight), []);
  assert.match(validateTheme({ label: "Bad", variables: { color: "red" } })[0], /start with --/);
});
