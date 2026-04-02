/**
 * Return URL validation utility
 *
 * Validates return URLs to prevent open redirect attacks.
 * Implements defence-in-depth validation before encoding return URLs in redirects.
 *
 * Validation rules:
 * - Same-origin only: relative paths, no scheme or host
 * - Must start with '/'
 * - No '//' (double-slash) after the leading slash
 * - No '../' path traversal
 * - No ASCII control characters (0x00–0x1F, 0x7F)
 */

/**
 * Validates a return URL and returns a safe value.
 *
 * @param returnUrl  - The candidate return URL (from a query param etc.).
 * @param defaultUrl - Fallback returned when validation fails. Defaults to '/'.
 * @returns The validated relative URL, or `defaultUrl` if validation fails.
 */
export function validateReturnUrl(
  returnUrl: string | null | undefined,
  defaultUrl = '/',
): string {
  if (!returnUrl || returnUrl.trim() === '') return defaultUrl;

  const trimmed = returnUrl.trim();

  // Reject absolute URLs (http://, https://, //, foo://)
  if (/^(https?:\/\/|\/\/|.*:\/\/)/i.test(trimmed)) return defaultUrl;

  // Must be a relative path starting with '/'
  if (!trimmed.startsWith('/')) return defaultUrl;

  // Reject '//' after the leading slash (protocol-relative smuggling)
  if (trimmed.includes('//') && !trimmed.startsWith('//')) return defaultUrl;

  // Reject path traversal
  if (trimmed.includes('../')) return defaultUrl;

  // eslint-disable-next-line no-control-regex -- intentional: rejects ASCII control characters for open-redirect defence
  if (/[\x00-\x1F\x7F]/.test(trimmed)) return defaultUrl;

  return trimmed;
}
