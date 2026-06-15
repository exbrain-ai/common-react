import { describe, it, expect } from 'vitest';
import { validateReturnUrl } from './return-url-validator';

describe('validateReturnUrl', () => {
  it('returns defaultUrl for null', () => {
    expect(validateReturnUrl(null)).toBe('/');
  });

  it('returns defaultUrl for undefined', () => {
    expect(validateReturnUrl(undefined)).toBe('/');
  });

  it('returns defaultUrl for empty string', () => {
    expect(validateReturnUrl('')).toBe('/');
  });

  it('returns defaultUrl for whitespace-only string', () => {
    expect(validateReturnUrl('   ')).toBe('/');
  });

  it('returns the url for a valid relative path', () => {
    expect(validateReturnUrl('/dashboard')).toBe('/dashboard');
  });

  it('returns the url for a path with query string', () => {
    expect(validateReturnUrl('/hello?param=value')).toBe('/hello?param=value');
  });

  it('returns a custom defaultUrl when validation fails', () => {
    expect(validateReturnUrl(null, '/hello')).toBe('/hello');
  });

  it('rejects http:// absolute URLs', () => {
    expect(validateReturnUrl('http://evil.com')).toBe('/');
  });

  it('rejects https:// absolute URLs', () => {
    expect(validateReturnUrl('https://evil.com')).toBe('/');
  });

  it('rejects protocol-relative // URLs', () => {
    expect(validateReturnUrl('//evil.com')).toBe('/');
  });

  it('rejects arbitrary-scheme URLs', () => {
    expect(validateReturnUrl('javascript://foo')).toBe('/');
  });

  it('rejects paths not starting with /', () => {
    expect(validateReturnUrl('hello')).toBe('/');
  });

  it('rejects path traversal (../)', () => {
    expect(validateReturnUrl('/hello/../evil')).toBe('/');
  });

  it('rejects double-slash after leading slash', () => {
    expect(validateReturnUrl('/hello//evil')).toBe('/');
  });

  it('rejects URLs with control characters', () => {
    expect(validateReturnUrl('/hello\x00evil')).toBe('/');
    expect(validateReturnUrl('/hello\x1Fevil')).toBe('/');
  });

  it('accepts nested valid paths', () => {
    expect(validateReturnUrl('/hello/users/123?tab=profile')).toBe('/hello/users/123?tab=profile');
  });

  // Backslash open-redirect vectors: browsers normalize '\' to '/', so '/\evil.com'
  // resolves to the protocol-relative '//evil.com'.
  it('rejects /\\evil.com (slash-backslash)', () => {
    expect(validateReturnUrl('/\\evil.com')).toBe('/');
  });

  it('rejects /\\/evil.com', () => {
    expect(validateReturnUrl('/\\/evil.com')).toBe('/');
  });

  it('rejects \\\\evil.com (double backslash)', () => {
    expect(validateReturnUrl('\\\\evil.com')).toBe('/');
  });

  it('rejects backslash anywhere in the path', () => {
    expect(validateReturnUrl('/dashboard\\evil')).toBe('/');
  });

  it('rejects percent-encoded backslash %5C', () => {
    expect(validateReturnUrl('/%5Cevil.com')).toBe('/');
    expect(validateReturnUrl('/%5cevil.com')).toBe('/');
  });

  it('still accepts legitimate same-origin paths with query strings', () => {
    expect(validateReturnUrl('/dashboard/home?x=1')).toBe('/dashboard/home?x=1');
  });
});
