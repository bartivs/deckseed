import test from "node:test";
import assert from "node:assert/strict";
import { selectTheme, validateTheme } from "../src/theme.js";

const themes = {
  midnight: { label: "Midnight", colorScheme: "dark", variables: { "--harness-bg": "#000" } },
  paper: { label: "Paper", colorScheme: "light", variables: { "--harness-bg": "#fff" } },
};
const available = Object.keys(themes);

test("theme selection uses the presentation definition", () => {
  assert.equal(selectTheme({ available, configuredTheme: "paper", fallbackTheme: "midnight" }), "paper");
});

test("theme selection falls back safely", () => {
  assert.equal(selectTheme({ available, configuredTheme: "unknown", fallbackTheme: "midnight" }), "midnight");
  assert.equal(selectTheme({ available, configuredTheme: "unknown", fallbackTheme: "unknown" }), "midnight");
  assert.throws(() => selectTheme({ available: [] }), /At least one/);
});

test("theme validation accepts custom properties and rejects unsafe token names", () => {
  assert.deepEqual(validateTheme(themes.midnight), []);
  assert.match(validateTheme({ label: "Bad", variables: { color: "red" } })[0], /start with --/);
});
