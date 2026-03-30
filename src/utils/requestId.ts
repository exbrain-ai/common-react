/**
 * Request ID utilities for client-side API calls.
 *
 * Use these so every request sends X-Request-ID for correlation across
 * gateway, IAM, and backend services. Adopt in all apps (Hello and others).
 *
 * - getRequestId: read from cookie (set by Next.js middleware or similar)
 * - getOrCreateClientBrowserId: cookie, or one stable browser-session UUID shared with
 *   structured logs and outgoing API headers
 * - getOrCreateClientRequestId: backward-compat alias for getOrCreateClientBrowserId
 * - getRequestIdHeader: header object for OpenAPI/fetch (generates fresh UUID per call)
 * - getBrowserIdHeader: header object with X-Browser-ID (stable browser session ID)
 * - fetchWithRequestId: fetch wrapper that adds X-Request-ID and X-Browser-ID to every request
 *
 * Server-side: use @exbrain/common-react/server getOrCreateRequestId and
 * fetchWithTimeout (with requestId option) to forward request ID when proxying.
 */

/** Default cookie name for request ID (set by Next.js middleware). */
export const REQUEST_ID_COOKIE_NAME = 'x-request-id';

/** Header name for request ID (must match backend X-Request-ID). */
export const REQUEST_ID_HEADER = 'X-Request-ID';

/** Default cookie name for browser ID (set by Next.js middleware). */
export const BROWSER_ID_COOKIE_NAME = 'x-browser-id';

/** Header name for browser ID (purely an observability correlator, not auth-related). */
export const BROWSER_ID_HEADER = 'X-Browser-ID';

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

/** Browser-only session fallback when middleware has not set x-browser-id yet (shared with logger). */
let sessionFallbackBrowserId: string | null = null;

/**
 * Returns the browser ID from cookie, or a single UUID for the browser page session
 * when the cookie is not set yet. Same value is used for structured logs and
 * `X-Browser-ID` on outgoing API calls so correlation matches gateway/IAM/engine logs.
 *
 * Returns empty string on server (`document` undefined). Server-side callers should use
 * `@exbrain/common-react/server` helpers.
 *
 * @param cookieName - Cookie name (default BROWSER_ID_COOKIE_NAME)
 */
export function getOrCreateClientBrowserId(cookieName: string = BROWSER_ID_COOKIE_NAME): string {
  if (typeof document === 'undefined') {
    return '';
  }
  const fromCookie = getRequestId(cookieName);
  if (fromCookie) return fromCookie;
  if (!sessionFallbackBrowserId && typeof crypto !== 'undefined' && crypto.randomUUID) {
    sessionFallbackBrowserId = crypto.randomUUID();
  }
  return sessionFallbackBrowserId || '';
}

/**
 * Backward-compat alias for getOrCreateClientBrowserId.
 * Returns the browser session ID (stable across calls in the same browser session).
 *
 * @param cookieName - Cookie name (default BROWSER_ID_COOKIE_NAME)
 */
export function getOrCreateClientRequestId(cookieName: string = BROWSER_ID_COOKIE_NAME): string {
  return getOrCreateClientBrowserId(cookieName);
}

/**
 * Returns headers object with X-Request-ID for API calls.
 * In the browser: generates a fresh UUID per call (per-request correlation).
 * Without `document` (SSR/Node): sends a new UUID per call so server-side requests still carry a header.
 * If `crypto` unavailable in browser, returns empty object.
 */
export function getRequestIdHeader(): Record<string, string> {
  if (typeof document === 'undefined') {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return { [REQUEST_ID_HEADER]: crypto.randomUUID() };
    }
    return {};
  }
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return { [REQUEST_ID_HEADER]: crypto.randomUUID() };
  }
  return {};
}

/**
 * Returns headers object with X-Browser-ID for API calls.
 * In the browser: uses {@link getOrCreateClientBrowserId} (cookie or stable session ID).
 * Without `document` (SSR/Node): returns empty object.
 *
 * @param cookieName - Cookie name (default BROWSER_ID_COOKIE_NAME)
 */
export function getBrowserIdHeader(cookieName: string = BROWSER_ID_COOKIE_NAME): Record<string, string> {
  if (typeof document === 'undefined') {
    return {};
  }
  const browserId = getOrCreateClientBrowserId(cookieName);
  if (!browserId) {
    return {};
  }
  return { [BROWSER_ID_HEADER]: browserId };
}

/**
 * Generates a batch-transport request ID where the first segment is `00000000`.
 * Makes batch log shipping requests visually distinct from per-request IDs in Grafana/Loki.
 * Format: `00000000-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
 */
export function createBatchRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const random = crypto.randomUUID();
    // Replace the first 8-hex segment with zeros to mark this as a batch transport ID.
    return '00000000' + random.slice(8);
  }
  return '';
}

/** Log function slot — set once by logger.ts via registerFetchLogger to avoid circular imports. */
type LogFn = (message: string, context?: Record<string, unknown>) => void;
let _fetchLogger: LogFn | null = null;

/**
 * Registers the debug log function used by fetchWithRequestId and logOutgoingRequest.
 * Called once by logger.ts after the logger instance is created, avoiding a circular import.
 */
export function registerFetchLogger(fn: LogFn): void {
  _fetchLogger = fn;
}

/**
 * Logs an outgoing request at info level with its request_id so the frontend log can be
 * cross-referenced with backend (gateway / IAM / engine) logs in Grafana.
 * Requires logger.ts to have called registerFetchLogger — guaranteed by module load order.
 */
export function logOutgoingRequest(requestId: string, method: string, url: string): void {
  if (_fetchLogger && requestId) {
    _fetchLogger(`→ ${method.toUpperCase()} ${url}`, { requestId });
  }
}

/**
 * Fetch with X-Request-ID and X-Browser-ID set on every request.
 * Automatically logs the outgoing request via the registered fetch logger (see registerFetchLogger),
 * so the frontend log shares the same request_id as the backend logs in Grafana.
 *
 * @param input - URL or Request (same as fetch)
 * @param init - RequestInit (same as fetch)
 * @param cookieName - Cookie name for browser ID (default BROWSER_ID_COOKIE_NAME)
 */
export function fetchWithRequestId(
  input: RequestInfo | URL,
  init?: RequestInit,
  cookieName: string = BROWSER_ID_COOKIE_NAME
): Promise<Response> {
  const requestId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '';
  const headers = new Headers(init?.headers);
  if (requestId) headers.set(REQUEST_ID_HEADER, requestId);
  const bid = getBrowserIdHeader(cookieName);
  Object.entries(bid).forEach(([k, v]) => headers.set(k, v));
  const url = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.href
      : (input as Request).url;
  const method = init?.method ?? (!(typeof input === 'string' || input instanceof URL) ? (input as Request).method : undefined) ?? 'GET';
  logOutgoingRequest(requestId, method, url);
  return fetch(input, { ...init, headers });
}
