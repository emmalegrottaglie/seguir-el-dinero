// Shared name folding. Plain JS so the build scripts and the app use the very
// same implementation: portrait lookup only works while the key written by
// scripts/fetch-photos.mjs is byte-identical to the one lib/photos.ts computes.

/** Accent-folded, lowercased text for substring search ("Díaz" -> "diaz"). */
export function foldText(s) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/** Accent-folded word tokens, punctuation dropped. */
export function foldTokens(s) {
  return foldText(s)
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Order-independent identity key for a person's name, so "Apellidos, Nombre"
 * (roll calls) and "Nombre Apellidos" (registers) resolve to the same value.
 */
export function nameKey(s) {
  return foldTokens(s).sort().join(" ");
}
