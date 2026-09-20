import test from "node:test";
import assert from "node:assert/strict";
import { selectTheme, validateTheme } from "../src/theme.js";
import { themePresets } from "../src/theme-presets.js";

const themes = {
  midnight: { label: "Midnight", colorScheme: "dark", variables: { "--harness-bg": "#000" } },
  paper: { label: "Paper", colorScheme: "light", variables: { "--harness-bg": "#fff" } },
};
const available = Object.keys(themes);

function contrastRatio(first, second) {
  const luminance = (hex) => {
    const channels = hex.match(/[0-9a-f]{2}/giu).map((channel) => Number.parseInt(channel, 16) / 255);
    const [red, green, blue] = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

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

test("the preset library exposes complete valid themes", () => {
  assert.deepEqual(Object.keys(themePresets), [
    "midnight", "paper", "ember", "atlas", "solar", "ocean", "plum", "mono", "meadow"
  ]);
  for (const [id, theme] of Object.entries(themePresets)) {
    assert.deepEqual(validateTheme(theme), [], id);
    for (const token of ["--harness-bg", "--harness-panel", "--harness-text", "--harness-heading", "--harness-muted", "--harness-accent", "--harness-border"]) {
      assert.equal(typeof theme.variables[token], "string", `${id} must define ${token}`);
    }
    for (const token of ["--harness-text", "--harness-heading", "--harness-muted", "--harness-accent"]) {
      assert.ok(contrastRatio(theme.variables[token], theme.variables["--harness-bg"]) >= 4.5, `${id} ${token} must contrast with the background`);
    }
    assert.ok(contrastRatio(theme.variables["--harness-text"], theme.variables["--harness-panel"]) >= 4.5, `${id} text must contrast with panels`);
  }
});
