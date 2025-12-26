/**
 * Input sanitization utilities for XSS prevention
 */

/**
 * Sanitizes a string by removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input) {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/[&"']/g, '') // Remove &, ", and '
    .replace(/[/\\]/g, '') // Remove / and \
    .trim();
}

/**
 * Sanitizes a name input (more restrictive)
 */
export function sanitizeName(input: string): string {
  if (!input) {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/[&"']/g, '') // Remove &, ", and '
    .replace(/[/\\]/g, '') // Remove / and \
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .trim();
}

/**
 * Sanitizes a title input
 */
export function sanitizeTitle(input: string): string {
  if (!input) {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/[&"']/g, '') // Remove &, ", and '
    .replace(/[/\\]/g, '') // Remove / and \
    .replace(/[^\w\s.-]/g, '') // Remove special characters except word chars, spaces, dots, and hyphens
    .trim();
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


