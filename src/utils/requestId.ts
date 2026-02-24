/**
 * Request ID utilities for client-side API calls.
 *
 * Use these so every request sends X-Request-ID for correlation across
 * gateway, IAM, and backend services. Adopt in all apps (Hello and others).
 *
 * - getRequestId: read from cookie (set by Next.js middleware or similar)
 * - getRequestIdHeader: header object for OpenAPI/fetch (cookie or new UUID)
 * - fetchWithRequestId: fetch wrapper that adds X-Request-ID to every request
 *
 * Server-side: use @exbrain/common-react/server getOrCreateRequestId and
 * fetchWithTimeout (with requestId option) to forward request ID when proxying.
 */

/** Default cookie name for request ID (set by Next.js middleware). */
export const REQUEST_ID_COOKIE_NAME = 'x-request-id';

/** Header name for request ID (must match backend X-Request-ID). */
export const REQUEST_ID_HEADER = 'X-Request-ID';

/**
 * Gets the request ID from cookies (client-side only).
 * Returns empty string on server or when cookie is not set.
 *
 * @param cookieName - Cookie name (default REQUEST_ID_COOKIE_NAME)
 */
export function getRequestId(cookieName: string = REQUEST_ID_COOKIE_NAME): string {
  if (typeof document === 'undefined') {
    return '';
  }
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const name = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (name === cookieName && value) {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return '';
}

/**
 * Returns headers object with X-Request-ID for API calls.
 * Uses cookie when available; otherwise generates a new UUID so every
 * outgoing request has an ID for correlation (request + response + IAM).
 *
 * @param cookieName - Cookie name (default REQUEST_ID_COOKIE_NAME)
 */
export function getRequestIdHeader(cookieName: string = REQUEST_ID_COOKIE_NAME): Record<string, string> {
  const requestId = getRequestId(cookieName);
  if (requestId) {
    return { [REQUEST_ID_HEADER]: requestId };
  }
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return { [REQUEST_ID_HEADER]: crypto.randomUUID() };
  }
  return {};
}

/**
 * Fetch with X-Request-ID set on every request.
 * Use for all client-side calls to APIs or IAM so gateway and backends can correlate logs.
 *
 * @param input - URL or Request (same as fetch)
 * @param init - RequestInit (same as fetch)
 * @param cookieName - Cookie name for request ID (default REQUEST_ID_COOKIE_NAME)
 */
export function fetchWithRequestId(
  input: RequestInfo | URL,
  init?: RequestInit,
  cookieName: string = REQUEST_ID_COOKIE_NAME
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const rid = getRequestIdHeader(cookieName);
  Object.entries(rid).forEach(([k, v]) => headers.set(k, v));
  return fetch(input, { ...init, headers });
}
