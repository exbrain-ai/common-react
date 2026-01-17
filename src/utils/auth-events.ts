/**
 * Authentication Event Logging
 * 
 * Structured logging for authentication events (login, signup, password reset).
 * Uses Pino logger for structured JSON logs compatible with Loki log aggregation.
 */

import logger from './logger';

export interface AuthEventContext {
  timestamp?: string
  eventType: 'login_attempt' | 'login_success' | 'login_failure' | 'signup_attempt' | 'signup_success' | 'signup_failure' | 'password_reset_request' | 'auth_error'
  userId?: string // Internal user ID (UUID) - safe to log, replaces email
  result?: 'success' | 'failure'
  errorCode?: string
  errorMessage?: string
  endpoint?: string
  requestId?: string
  appName: string // Application name for identification (REQUIRED)
}

/**
 * Logs authentication event with full context using structured logger
 * 
 * CRITICAL: Never logs PII (email, IP, userAgent) - only logs user_id (internal UUID)
 * 
 * @param context - Event context (timestamp, eventType, userId, result, error code, requestId, appName)
 */
export function logAuthEvent(context: AuthEventContext): void {
  const logContext: Record<string, unknown> = {
    eventType: context.eventType,
    appName: context.appName, // Required - always included in log output
    ...(context.userId && { user_id: context.userId }), // Only log internal user ID, never email
    ...(context.result && { result: context.result }),
    ...(context.errorCode && { errorCode: context.errorCode }),
    ...(context.errorMessage && { errorMessage: context.errorMessage }),
    ...(context.endpoint && { endpoint: context.endpoint }),
    ...(context.requestId && { requestId: context.requestId }),
  };

  // Use structured logger (Pino) instead of console.log
  // This provides consistent JSON format and log level filtering
  if (context.result === 'failure' || context.eventType.includes('failure') || context.eventType === 'auth_error') {
    logger.error('Authentication event', logContext);
  } else {
    logger.info('Authentication event', logContext);
  }
}

/**
 * Gets client IP address from headers
 * Supports both Headers object (server-side) and Record<string, string | null> (client-side)
 * 
 * @param headers - Headers object or Record<string, string | null>
 * @returns Client IP address or empty string if not found
 */
export function getClientIP(headers: Headers | Record<string, string | null>): string {
  if (headers instanceof Headers) {
    // Server-side: Headers object
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return forwardedFor.split(',')[0].trim();
    }
    return headers.get('x-real-ip') || '';
  } else {
    // Client-side: Record<string, string | null>
    const forwardedFor = headers['x-forwarded-for'] || headers['X-Forwarded-For'];
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return String(forwardedFor).split(',')[0].trim();
    }
    return String(headers['x-real-ip'] || headers['X-Real-IP'] || '');
  }
}

/**
 * Gets user agent from headers
 * Supports both Headers object (server-side) and Record<string, string | null> (client-side)
 * 
 * @param headers - Headers object or Record<string, string | null>
 * @returns User agent string or empty string if not found
 */
export function getUserAgent(headers: Headers | Record<string, string | null>): string {
  if (headers instanceof Headers) {
    // Server-side: Headers object
    return headers.get('user-agent') || '';
  } else {
    // Client-side: Record<string, string | null>
    return String(headers['user-agent'] || headers['User-Agent'] || '');
  }
}

/**
 * Gets browser user agent (client-side only)
 * 
 * @returns Browser user agent string or empty string if not available
 */
export function getBrowserUserAgent(): string {
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator.userAgent || '';
  }
  return '';
}
