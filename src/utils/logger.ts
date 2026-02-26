/**
 * Structured Logger using Pino
 *
 * Provides high-performance structured logging for both browser and server contexts.
 * Outputs JSON logs compatible with Loki log aggregation.
 *
 * Supports:
 * - Next.js: NEXT_PUBLIC_LOG_LEVEL environment variable
 * - React/Vite: REACT_APP_LOG_LEVEL environment variable (backward compatibility)
 * - Automatic detection of browser vs server context
 * - Configurable log levels: 'debug' | 'info' | 'warn' | 'error'
 * - Client-side log shipping to same-origin /api/logs (basePath-aware; onebox and cloud)
 */

import pino from 'pino';
import { LOG_SCHEMA_FIELDS } from './log-schema';
import { apiUrl } from './paths';
import { getRequestId } from './requestId';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Re-export unified schema field names (same as common-go/logger/schema.go) for use in app loggers */
export { LOG_SCHEMA_FIELDS } from './log-schema';

/**
 * Detect if we're running in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Client-only: fallback request ID when cookie is not set yet (e.g. first log before middleware response).
 * Reused for all logs in the same page session so we never emit requestId: undefined.
 */
let clientSessionRequestId: string | null = null;

function getClientRequestIdForLog(): string {
  if (!isBrowser) return '';
  const fromCookie = getRequestId();
  if (fromCookie) return fromCookie;
  if (!clientSessionRequestId && typeof crypto !== 'undefined' && crypto.randomUUID) {
    clientSessionRequestId = crypto.randomUUID();
  }
  return clientSessionRequestId || '';
}

/**
 * Log shipping endpoint: same-origin POST to /api/logs (basePath-aware).
 * Canonical path only; no env override. Works in onebox and cloud.
 */
function getLogShippingEndpoint(): string | null {
  if (!isBrowser || typeof window === 'undefined') {
    return null;
  }
  return apiUrl('/api/logs');
}

/**
 * Client-side log batching and shipping
 * Batches logs and sends them to the configured endpoint (when set).
 */
class ClientLogShipper {
  private logQueue: Array<{
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    timestamp: string;
  }> = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL_MS = 5000; // 5 seconds
  private readonly endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Add log to queue and schedule flush if needed
   */
  addLog(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    this.logQueue.push({
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    });

    // Flush immediately if batch size reached
    if (this.logQueue.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (!this.flushTimer) {
      // Schedule flush after interval
      this.flushTimer = setTimeout(() => {
        this.flush();
      }, this.FLUSH_INTERVAL_MS);
    }
  }

  /**
   * Flush logs to backend endpoint (fire-and-forget)
   */
  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) {
      return;
    }

    // Clear timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Get current batch
    const batch = [...this.logQueue];
    this.logQueue = [];

    // Request ID for correlation (cookie or client-session fallback; in body since sendBeacon cannot set headers)
    let requestId = this.getRequestIdFromCookie() || getClientRequestIdForLog();
    if (!requestId && typeof crypto !== 'undefined' && crypto.randomUUID) {
      requestId = crypto.randomUUID();
    }

    try {
      // Send to backend endpoint (fire-and-forget)
      // Include requestId in body so server can correlate (sendBeacon does not support custom headers)
      const payload = JSON.stringify({
        requestId: requestId || undefined,
        logs: batch,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      // Try sendBeacon first (more reliable, works during page unload)
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(this.endpoint, blob);
      } else {
        // Fallback to fetch (may fail during page unload)
        fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(requestId && { 'X-Request-ID': requestId }),
          },
          body: payload,
          keepalive: true, // Keep request alive even if page unloads
        }).catch((err: unknown) => {
          // Silently fail - logging should never break the app
          if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
            console.warn('[logger] Failed to ship logs to server:', err);
          }
        });
      }
    } catch (error) {
      // Silently fail - logging should never break the app
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        console.warn('[logger] Failed to ship logs:', error);
      }
    }
  }

  /**
   * Get request ID from cookie for correlation
   */
  private getRequestIdFromCookie(): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'x-request-id') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * Force flush remaining logs (call on page unload)
   */
  forceFlush(): void {
    if (this.logQueue.length > 0) {
      // Use sendBeacon for immediate flush (works during page unload)
      this.flush();
    }
  }
}

// Create singleton log shipper for client-side (lazy initialization)
let logShipper: ClientLogShipper | null = null;

/**
 * Get or create log shipper instance (lazy initialization)
 * Only creates instance when endpoint is configured and when first log is shipped
 */
function getLogShipper(): ClientLogShipper | null {
  if (!isBrowser || typeof window === 'undefined') {
    return null;
  }
  const endpoint = getLogShippingEndpoint();
  if (!endpoint) {
    return null;
  }
  if (!logShipper) {
    logShipper = new ClientLogShipper(endpoint);
    
    // Register page unload handlers once when shipper is first created
    window.addEventListener('beforeunload', () => {
      logShipper?.forceFlush();
    });
    window.addEventListener('pagehide', () => {
      logShipper?.forceFlush();
    });
  }
  
  return logShipper;
}

/**
 * Get log level from environment variables
 * Supports both Next.js (NEXT_PUBLIC_*) and React/Vite (REACT_APP_*) conventions
 */
function getLogLevel(): LogLevel {
  // Next.js convention (takes precedence)
  const nextLogLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel;
  if (nextLogLevel && ['debug', 'info', 'warn', 'error'].includes(nextLogLevel)) {
    return nextLogLevel;
  }

  // React/Vite convention (backward compatibility)
  const reactLogLevel = process.env.REACT_APP_LOG_LEVEL as LogLevel;
  if (reactLogLevel && ['debug', 'info', 'warn', 'error'].includes(reactLogLevel)) {
    return reactLogLevel;
  }

  // Default based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? 'debug' : 'info';
}

/**
 * Create Pino logger instance
 * 
 * Browser context: Uses browser's console API with structured output
 * - Development: Pretty-prints to console AND ships to /api/logs endpoint
 * - Production: Outputs JSON to console AND ships to /api/logs endpoint
 * Server context: Uses stdout with JSON output (collected by Promtail → Loki)
 */
function createLogger(): pino.Logger {
  const level = getLogLevel();
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isBrowser) {
    // Browser context: Use browser console with structured JSON output
    // In production, also ship logs to /api/logs endpoint for aggregation
    return pino({
      level,
      browser: {
        asObject: false, // Output as JSON string (not object)
        write: (o: object) => {
          const logEntry = typeof o === 'string' ? JSON.parse(o) : o;
          const { level: levelNum, msg, ...context } = logEntry as { level: number; msg: string; [key: string]: unknown };
          const levelLabel = pino.levels.labels[levelNum] || 'info';
          const logLevel = levelLabel as LogLevel;

          // Always ship logs to backend for aggregation (works in both dev and prod)
          // Include requestId in every log (cookie or client-session fallback so never undefined in browser)
          const requestId = getClientRequestIdForLog();
          const contextWithRequestId = { ...context, requestId: requestId || undefined };
          const shipper = getLogShipper();
          if (shipper) {
            shipper.addLog(logLevel, msg, contextWithRequestId);
          }

          // Console output: one valid JSON line per log (same format as server/engine) so pipeline is consistent.
          // Do not pass an object as third arg — that makes the console render it with unquoted keys (invalid JSON).
          const consoleMethod = levelLabel === 'error' ? 'error' : 
                               levelLabel === 'warn' ? 'warn' : 
                               levelLabel === 'debug' ? 'log' : 'info';
          const levelStyles: Record<string, string> = {
            debug: 'color: #888; font-weight: 500',
            info: 'color: #1e88e5; font-weight: 600',
            warn: 'color: #f57c00; font-weight: 600',
            error: 'color: #c62828; font-weight: 700',
          };
          const style = levelStyles[levelLabel] ?? 'font-weight: 500';
          const badge = `[${levelLabel.toUpperCase()}]`;
          const logObj = {
            level: levelLabel,
            message: msg,
            timestamp: new Date().toISOString(),
            ...contextWithRequestId,
          };
          const jsonLine = JSON.stringify(logObj);
          console[consoleMethod](`%c ${badge} %c ${jsonLine}`, style, 'color: inherit; font-weight: normal');
        },
      },
    });
  } else {
    // Server context: Always one JSON line per log (same as common-go engine).
    // Enables: ob logs | json-log-pretty.sh (color) and Promtail → Loki → Grafana (same pipeline as engine).
    // No pino-pretty; color is only from the post-process script.
    return pino({
      level,
      messageKey: LOG_SCHEMA_FIELDS.message,
      formatters: {
        level: (label) => ({ [LOG_SCHEMA_FIELDS.level]: label }),
        log: (obj) => {
          if (obj.time) obj[LOG_SCHEMA_FIELDS.timestamp] = obj.time;
          return obj;
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }
}

// Create singleton logger instance
const logger = createLogger();

/**
 * Logger interface matching common-go logger pattern
 * Provides consistent API across client and server
 */
export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

/**
 * Logger wrapper that provides consistent API
 */
class LoggerWrapper implements Logger {
  private pinoLogger: pino.Logger;

  constructor(pinoLogger: pino.Logger) {
    this.pinoLogger = pinoLogger;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.pinoLogger.debug(context, message);
    } else {
      this.pinoLogger.debug(message);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.pinoLogger.info(context, message);
    } else {
      this.pinoLogger.info(message);
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.pinoLogger.warn(context, message);
    } else {
      this.pinoLogger.warn(message);
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.pinoLogger.error(context, message);
    } else {
      this.pinoLogger.error(message);
    }
  }

  setLevel(level: LogLevel): void {
    this.pinoLogger.level = level;
  }

  getLevel(): LogLevel {
    return this.pinoLogger.level as LogLevel;
  }
}

// Export wrapped logger instance (used by patchConsoleForStructuredLogging)
const defaultLogger = new LoggerWrapper(logger);
export default defaultLogger;

export interface PatchConsoleOptions {
  /** Service name for log correlation (e.g. "hello-ui", "next.js"). Default "app". */
  service?: string;
}

/**
 * Patches global console.log/info/warn/error/debug (Node only) to use the structured pino logger.
 * Call once at server startup (e.g. from Next.js instrumentation.ts or custom server) so that
 * Next.js framework logs and any other console usage emit structured JSON (same format as app logs).
 * No-op in browser.
 */
export function patchConsoleForStructuredLogging(options?: PatchConsoleOptions): void {
  if (typeof window !== 'undefined') return;

  const service = options?.service ?? 'app';

  function serializeArgs(args: unknown[]): { message: string; context?: Record<string, unknown> } {
    if (args.length === 0) return { message: '' };
    const first = args[0];
    const rest = args.slice(1);
    const message = typeof first === 'string' ? first : JSON.stringify(first);
    // Unified schema: service + request_id (same fields as common-go schema.go)
    const context: Record<string, unknown> = {
      [LOG_SCHEMA_FIELDS.service]: service,
      [LOG_SCHEMA_FIELDS.request_id]: '',
    };
    if (rest.length > 0) context.args = rest.length === 1 ? rest[0] : rest;
    return { message, context };
  }

  console.log = (...args: unknown[]) => {
    const { message, context } = serializeArgs(args);
    defaultLogger.info(message, context);
  };
  console.info = (...args: unknown[]) => {
    const { message, context } = serializeArgs(args);
    defaultLogger.info(message, context);
  };
  console.warn = (...args: unknown[]) => {
    const { message, context } = serializeArgs(args);
    defaultLogger.warn(message, context);
  };
  console.error = (...args: unknown[]) => {
    const { message, context } = serializeArgs(args);
    defaultLogger.error(message, context);
  };
  console.debug = (...args: unknown[]) => {
    const { message, context } = serializeArgs(args);
    defaultLogger.debug(message, context);
  };
}
