export function normalizeLanguage(code) {
  return String(code ?? "")
    .trim()
    .replaceAll("_", "-")
    .toLowerCase();
}

export function matchLanguage(requested, available) {
  const normalizedAvailable = available.map(normalizeLanguage);
  const normalizedRequested = normalizeLanguage(requested);
  if (!normalizedRequested) return undefined;

  const exactIndex = normalizedAvailable.indexOf(normalizedRequested);
  if (exactIndex >= 0) return available[exactIndex];

  const base = normalizedRequested.split("-")[0];
  const baseIndex = normalizedAvailable.findIndex(
    (language) => language === base || language.split("-")[0] === base,
  );
  return baseIndex >= 0 ? available[baseIndex] : undefined;
}

export function selectLanguage({
  available,
  query,
  stored,
  navigatorLanguages = [],
  defaultLanguage = "auto",
  fallbackLanguage,
}) {
  if (!Array.isArray(available) || available.length === 0) {
    throw new Error("At least one presentation language must be configured.");
  }

  const candidates = [query, stored];
  if (defaultLanguage === "auto") candidates.push(...navigatorLanguages);
  else candidates.push(defaultLanguage);
  candidates.push(fallbackLanguage, available[0]);

  for (const candidate of candidates) {
    const match = matchLanguage(candidate, available);
    if (match) return match;
  }

  return available[0];
}

export function lookupTranslation(translations, language, key, fallbackLanguage) {
  return (
    translations?.[language]?.[key] ??
    translations?.[fallbackLanguage]?.[key] ??
    key
  );
}
