/**
 * Locale registry — single source of truth for all supported locales.
 *
 * To add a new language:
 *   1. Append one entry to LOCALE_REGISTRY below.
 *   2. Create hello/ui/messages/{code}.json with translated strings.
 *   That's it. Direction (RTL/LTR), middleware allowlist, TypeScript types,
 *   and the language-switcher UI all derive from this registry automatically.
 */
export const LOCALE_REGISTRY = [
  { code: 'en', nativeName: 'English' },
  { code: 'es', nativeName: 'Español' },
  { code: 'ar', nativeName: 'العربية' },
  { code: 'fa', nativeName: 'فارسی' },
] as const;

export type LocaleEntry = (typeof LOCALE_REGISTRY)[number];
