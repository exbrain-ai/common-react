import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  LOCALE_REGISTRY,
  SUPPORTED_LOCALES,
  dirForLocale,
  langAttribute,
  parseLocale,
} from './i18n';

describe('parseLocale', () => {
  it('returns matching SupportedLocale for valid tags', () => {
    expect(parseLocale('en')).toBe('en');
    expect(parseLocale('es')).toBe('es');
    expect(parseLocale('ar')).toBe('ar');
  });

  it('normalizes case', () => {
    expect(parseLocale('EN')).toBe('en');
    expect(parseLocale('Es')).toBe('es');
  });

  it('rejects unsupported locales', () => {
    expect(parseLocale('fr')).toBeNull();
    expect(parseLocale('zh')).toBeNull();
  });

  it('rejects invalid BCP 47 shapes', () => {
    expect(parseLocale('')).toBeNull();
    expect(parseLocale('e')).toBeNull(); // too short
    expect(parseLocale('english')).toBeNull(); // too long primary subtag
    expect(parseLocale('en_US')).toBeNull(); // underscore not dash
    expect(parseLocale('en-')).toBeNull(); // trailing dash
    expect(parseLocale('123')).toBeNull(); // digits only
    expect(parseLocale('../etc')).toBeNull(); // path traversal
    expect(parseLocale('<script>')).toBeNull(); // XSS attempt
  });

  it('accepts valid BCP 47 shapes even if not in allowlist', () => {
    // Shape is valid but not in allowlist → null
    expect(parseLocale('de-DE')).toBeNull();
    expect(parseLocale('zh-Hans')).toBeNull();
  });
});

describe('dirForLocale', () => {
  it('returns rtl for Arabic (Arab script)', () => {
    expect(dirForLocale('ar')).toBe('rtl');
  });

  it('returns rtl for Persian (Arab script via Intl.Locale.maximize)', () => {
    expect(dirForLocale('fa')).toBe('rtl');
  });

  it('returns rtl for Hebrew (Hebr script)', () => {
    expect(dirForLocale('he')).toBe('rtl');
  });

  it('returns rtl for Urdu (Arab script)', () => {
    expect(dirForLocale('ur')).toBe('rtl');
  });

  it('returns ltr for LTR locales', () => {
    expect(dirForLocale('en')).toBe('ltr');
    expect(dirForLocale('es')).toBe('ltr');
    expect(dirForLocale('zh')).toBe('ltr');
    expect(dirForLocale('ja')).toBe('ltr');
  });

  it('returns ltr for unknown/invalid locales (safe fallback)', () => {
    expect(dirForLocale('zzzz-invalid')).toBe('ltr');
  });
});

describe('langAttribute', () => {
  it('returns the locale tag as-is', () => {
    expect(langAttribute('en')).toBe('en');
    expect(langAttribute('ar')).toBe('ar');
  });
});

describe('constants', () => {
  it('DEFAULT_LOCALE is first in SUPPORTED_LOCALES', () => {
    expect(DEFAULT_LOCALE).toBe(SUPPORTED_LOCALES[0]);
  });

  it('SUPPORTED_LOCALES includes expected tags', () => {
    expect(SUPPORTED_LOCALES).toContain('en');
    expect(SUPPORTED_LOCALES).toContain('es');
    expect(SUPPORTED_LOCALES).toContain('ar');
  });

  it('SUPPORTED_LOCALES is derived from LOCALE_REGISTRY', () => {
    expect(SUPPORTED_LOCALES).toEqual(LOCALE_REGISTRY.map((l) => l.code));
  });
});

describe('LOCALE_REGISTRY', () => {
  it('each entry has code and nativeName', () => {
    for (const entry of LOCALE_REGISTRY) {
      expect(typeof entry.code).toBe('string');
      expect(entry.code.length).toBeGreaterThanOrEqual(2);
      expect(typeof entry.nativeName).toBe('string');
      expect(entry.nativeName.length).toBeGreaterThan(0);
    }
  });

  it('codes match SUPPORTED_LOCALES order', () => {
    expect(LOCALE_REGISTRY.map((l) => l.code)).toEqual([...SUPPORTED_LOCALES]);
  });
});
