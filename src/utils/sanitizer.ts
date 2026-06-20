/**
 * Input sanitization utilities for XSS prevention
 */

/**
 * Sanitizes a plaintext string. Strips only angle brackets so the value can
 * never be read as an HTML tag, and trims. It deliberately PRESERVES legitimate
 * text — "AT&T", "O'Brien", "José Núñez" come back unchanged (features#1374).
 * XSS safety is output encoding (React auto-escapes; use sanitizeHTML for HTML
 * sinks) plus the backend's strict sanitizer — never input character-stripping
 * (golden §15.5.6).
 */
export function sanitizeString(input: string): string {
  if (!input) {
    return '';
  }

  return input.replace(/[<>]/g, '').trim();
}

/**
 * Sanitizes a plaintext name. Same data-preserving behavior as sanitizeString.
 */
export function sanitizeName(input: string): string {
  if (!input) {
    return '';
  }

  return input.replace(/[<>]/g, '').trim();
}

/**
 * Sanitizes a plaintext title. Same data-preserving behavior as sanitizeString.
 */
export function sanitizeTitle(input: string): string {
  if (!input) {
    return '';
  }

  return input.replace(/[<>]/g, '').trim();
}

/**
 * Sanitizes HTML content by escaping HTML entities
 */
export function sanitizeHTML(input: string): string {
  if (!input) {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}


