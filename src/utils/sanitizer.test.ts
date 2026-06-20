import { describe, it, expect } from 'vitest';
import { sanitizeName, sanitizeTitle, sanitizeString, sanitizeHTML } from './sanitizer';

// features#1374: plaintext sanitizers must PRESERVE legitimate text instead of
// stripping & ' " / and non-ASCII (which mangled "AT&T" -> "ATT", "José" -> "Jos").
describe('sanitizer (features#1374 data preservation)', () => {
  const preserved = ['AT&T', "O'Brien", 'Procter & Gamble', 'José Núñez', 'A/B Corp', 'Dwayne "Rock" John'];

  it('preserves legitimate names and titles', () => {
    for (const v of preserved) {
      expect(sanitizeName(v)).toBe(v);
      expect(sanitizeTitle(v)).toBe(v);
      expect(sanitizeString(v)).toBe(v);
    }
  });

  it('strips angle brackets so values cannot be read as tags', () => {
    expect(sanitizeName('<script>Bob')).not.toContain('<');
    expect(sanitizeName('<script>Bob')).not.toContain('>');
    expect(sanitizeTitle('a<b>c')).toBe('abc');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeName('  Bob  ')).toBe('Bob');
  });

  it('sanitizeHTML still entity-encodes for HTML sinks', () => {
    expect(sanitizeHTML('<b>&"')).toBe('&lt;b&gt;&amp;&quot;');
  });
});
