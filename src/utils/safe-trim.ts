/**
 * Coerce unknown values to a trimmed string for API / JSON shapes where fields may be
 * non-strings. `(x || "")` is wrong for truthy non-strings (e.g. numeric IDs).
 */
export function safeTrim(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
}
