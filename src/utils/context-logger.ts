/**
 * Context Logger — mirrors common-go/logger.NewContextLogger for the frontend.
 *
 * Creates a logger that **automatically** includes structured fields (service,
 * request_id, browser_id, user_id) in every log entry. Call sites cannot forget
 * mandatory fields because the context logger injects them.
 *
 * Usage (component / hook):
 *   const log = createContextLogger('MyHellos');
 *   log.error('Failed to delete', { resourceUuid });
 *   // → { service: 'MyHellos', request_id: '...', browser_id: '...', message: 'Failed to delete', resourceUuid: '...' }
 *
 * Usage (mutation onError with API error):
 *   const log = createContextLogger('useDeleteGreeting');
 *   log.error('Failed to delete greeting', { resourceUuid }, error);
 *   // → extracts request_id from ApiError body if present
 *
 * Design decisions:
 * - request_id: read from x-request-id cookie (set by middleware), or generated fresh
 * - browser_id: stable per-session via getOrCreateClientBrowserId()
 * - service: passed at creation time (component/hook name) — like common-go's "service" field
 * - user_id: NOT included automatically (would require Redux coupling). Pass in extra fields if needed.
 */

import defaultLogger from './logger';
import type { Logger } from './logger';
import { LOG_SCHEMA_FIELDS } from './log-schema';
import { getOrCreateClientBrowserId } from './requestId';

const REQUEST_ID_COOKIE = 'x-request-id';

/** Read x-request-id cookie value. Returns '' on server or when not set. */
function readRequestIdCookie(): string {
  if (typeof document === 'undefined') return '';
  for (const cookie of document.cookie.split(';')) {
    const trimmed = cookie.trim();
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    if (trimmed.slice(0, eq).trim() === REQUEST_ID_COOKIE) {
      const val = trimmed.slice(eq + 1).trim();
      try { return decodeURIComponent(val); } catch { return val; }
    }
  }
  return '';
}

/** Get a request_id: prefer cookie, then generate fresh UUID. */
function getRequestId(): string {
  const fromCookie = readRequestIdCookie();
  if (fromCookie) return fromCookie;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return '';
}

/**
 * Try to extract request_id from an ApiError body.
 * Backend responses include `request_id` at the top level.
 */
function extractApiRequestId(error: unknown): string {
  if (error == null || typeof error !== 'object') return '';
  const body = (error as { body?: { request_id?: string } }).body;
  if (body && typeof body.request_id === 'string') return body.request_id;
  return '';
}

/** A logger bound to a service/component with automatic structured fields. */
export interface ContextLogger {
  debug(message: string, extra?: Record<string, unknown>): void;
  info(message: string, extra?: Record<string, unknown>): void;
  warn(message: string, extra?: Record<string, unknown>): void;
  /**
   * Log an error. If `error` is an ApiError, its body.request_id is preferred
   * over the cookie request_id for better cross-service correlation.
   */
  error(message: string, extra?: Record<string, unknown>, error?: unknown): void;
}

/**
 * Create a context logger for a component, hook, or module.
 *
 * @param service  Name of the component/hook (e.g. 'MyHellos', 'useCreateGreeting')
 * @param baseLogger  Optional logger override (for testing). Defaults to the singleton.
 */
export function createContextLogger(service: string, baseLogger: Logger = defaultLogger): ContextLogger {
  function buildContext(extra?: Record<string, unknown>, error?: unknown): Record<string, unknown> {
    const requestId = extractApiRequestId(error) || getRequestId();
    const ctx: Record<string, unknown> = {
      [LOG_SCHEMA_FIELDS.service]: service,
      [LOG_SCHEMA_FIELDS.request_id]: requestId,
    };
    const browserId = typeof window !== 'undefined' ? getOrCreateClientBrowserId() : '';
    if (browserId) ctx[LOG_SCHEMA_FIELDS.browser_id] = browserId;
    if (extra) Object.assign(ctx, extra);
    // If an Error was passed, include its message (but not the full stack — that's for debug)
    if (error instanceof Error && !ctx['error_message']) {
      ctx['error_message'] = error.message;
    }
    return ctx;
  }

  return {
    debug(message, extra) { baseLogger.debug(message, buildContext(extra)); },
    info(message, extra) { baseLogger.info(message, buildContext(extra)); },
    warn(message, extra) { baseLogger.warn(message, buildContext(extra)); },
    error(message, extra, error) { baseLogger.error(message, buildContext(extra, error)); },
  };
}
