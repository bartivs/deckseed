export function renderThemeCss(id, theme) {
  const variables = Object.entries(theme.variables)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join("\n");
  return `/* ${theme.label} — generated from src/theme-presets.js. Customize locally as needed. */
:root {
${variables}
  --r-background-color: var(--harness-bg);
  --r-main-color: var(--harness-text);
  --r-heading-color: var(--harness-heading);
  --r-link-color: var(--harness-accent);
  color-scheme: ${theme.colorScheme};
}

/* Stable identifier used by validation and documentation. */
body { --harness-theme-id: "${id}"; }
`;
}
