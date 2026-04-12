/**
 * Framework-neutral i18n React context contract.
 * Consumers (hello/ui via next-intl, Storybook, tests) provide their own implementation.
 * No Next.js imports.
 */
import { createContext, useContext } from 'react';
import type { SupportedLocale } from './i18n';

/** Translation function signature matching next-intl / ICU patterns. */
export type TranslationFn = (key: string, values?: Record<string, string | number>) => string;

export interface I18nContextValue {
  locale: SupportedLocale;
  t: TranslationFn;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}

/**
 * Provider for shared components. In hello/ui, wrap with next-intl values.
 * In Storybook/tests, use the fixture provider below.
 */
export const I18nProvider = I18nContext.Provider;

/**
 * Test/Storybook fixture: returns the key as-is (with interpolated values appended).
 */
export function createFixtureI18n(locale: SupportedLocale = 'en'): I18nContextValue {
  return {
    locale,
    t: (key, values) => {
      if (!values) return key;
      const suffix = Object.entries(values)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
      return `${key} (${suffix})`;
    },
  };
}
