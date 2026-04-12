/**
 * Framework-neutral i18n utilities.
 * No Next.js imports — safe for any React consumer (Storybook, tests, exbrain-ui).
 *
 * To add a new language: edit LOCALE_REGISTRY in ./locale-registry.ts and add
 * the corresponding messages/{code}.json catalog. Everything here derives from that.
 */

export { LOCALE_REGISTRY, type LocaleEntry } from './locale-registry';
import { LOCALE_REGISTRY } from './locale-registry';

/**
 * BCP 47 language tags supported by the platform.
 * Derived from LOCALE_REGISTRY — do not edit manually.
 */
export type SupportedLocale = (typeof LOCALE_REGISTRY)[number]['code'];

/** Ordered list of supported locales; first entry is the default. */
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = LOCALE_REGISTRY.map(
  (l) => l.code,
) as SupportedLocale[];

export const DEFAULT_LOCALE: SupportedLocale = LOCALE_REGISTRY[0].code;

/**
 * RTL Unicode scripts — covers Arabic, Hebrew, Thaana, N'Ko, Mandaic, Syriac, Adlam.
 * Used by dirForLocale to infer text direction via Intl.Locale without a hardcoded list.
 */
const RTL_SCRIPTS = new Set(['Arab', 'Hebr', 'Thaa', 'Nkoo', 'Mand', 'Syrc', 'Adlm']);

/**
 * Simplified BCP 47 shape check: 2-3 letter primary subtag, optional region/script subtags.
 * This validates *shape* only — allowlist comparison is the security boundary.
 */
const BCP47_SHAPE = /^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/;

/**
 * Validate and normalize a locale tag against the allowlist.
 * Returns the matched `SupportedLocale` or `null` if invalid/unsupported.
 */
export function parseLocale(tag: string): SupportedLocale | null {
  if (!BCP47_SHAPE.test(tag)) {
    return null;
  }
  const normalized = tag.toLowerCase();
  const match = SUPPORTED_LOCALES.find((l) => l === normalized);
  return match ?? null;
}

/**
 * Returns `'rtl'` or `'ltr'` for a given locale.
 * Uses `Intl.Locale.maximize()` to infer the likely script — no hardcoded RTL list needed.
 * Falls back to `'ltr'` for any locale the runtime cannot resolve.
 */
export function dirForLocale(locale: string): 'rtl' | 'ltr' {
  try {
    const script = new Intl.Locale(locale).maximize().script;
    return RTL_SCRIPTS.has(script ?? '') ? 'rtl' : 'ltr';
  } catch {
    return 'ltr';
  }
}

/** Returns the BCP 47 `lang` attribute value for an HTML element. */
export function langAttribute(locale: SupportedLocale): string {
  return locale;
}
