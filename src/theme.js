export function selectTheme({
  available,
  query,
  stored,
  prefersDark = false,
  defaultTheme = "auto",
  fallbackTheme,
  themes = {},
}) {
  if (!Array.isArray(available) || available.length === 0) {
    throw new Error("At least one presentation theme must be configured.");
  }

  const directCandidates = [query, stored];
  for (const candidate of directCandidates) {
    if (candidate && available.includes(candidate)) return candidate;
  }

  if (defaultTheme === "auto") {
    const preferredScheme = prefersDark ? "dark" : "light";
    const systemMatch = available.find((theme) => themes[theme]?.colorScheme === preferredScheme);
    if (systemMatch) return systemMatch;
  } else if (available.includes(defaultTheme)) return defaultTheme;

  if (fallbackTheme && available.includes(fallbackTheme)) return fallbackTheme;
  return available[0];
}

export function validateTheme(theme) {
  if (!theme || typeof theme !== "object") return ["theme must be an object"];
  const errors = [];
  if (!theme.label) errors.push("label is required");
  if (theme.colorScheme && !["light", "dark", "normal"].includes(theme.colorScheme)) {
    errors.push("colorScheme must be light, dark, or normal");
  }
  for (const property of Object.keys(theme.variables ?? {})) {
    if (!property.startsWith("--")) errors.push(`theme variable must start with --: ${property}`);
  }
  return errors;
}
