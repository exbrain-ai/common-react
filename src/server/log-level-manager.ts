/**
 * Log Level Manager — shared via @exbrain/common-react/server/log-level-manager.
 *
 * Manages runtime log level for the current server process.
 * State is module-level (one instance per process) which is correct for Next.js:
 * each deployed app is a separate process, so state is never shared between apps.
 *
 * For multi-instance deployments, extend setLogLevel to write to Redis and add a
 * polling/pub-sub mechanism so all pods pick up the change.
 *
 * NOTE: Uses a local LogLevel type (not re-exported from the main index) to avoid
 * circular imports — server-logger imports log-level-manager, and the main index
 * imports the logger. Breaking the cycle requires local types here.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const VALID_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

function resolveDefaultLevel(): LogLevel {
  const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel;
  if (envLevel && (VALID_LEVELS as readonly string[]).includes(envLevel)) return envLevel;
  return process.env.NODE_ENV === 'development' ? 'debug' : 'info';
}

let currentLogLevel: LogLevel = resolveDefaultLevel();

const loggerInstances: Array<{ setLevel: (level: LogLevel) => void }> = [];

/**
 * Register a logger instance to receive dynamic level updates.
 * Called once on import by server-logger to hook the pino logger into this manager.
 */
export function registerLogger(logger: { setLevel: (level: LogLevel) => void }): void {
  loggerInstances.push(logger);
  logger.setLevel(currentLogLevel);
}

/** Returns the current active log level. */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

/**
 * Sets the log level and propagates the change to all registered logger instances.
 * Returns the previous log level (useful for admin audit logging).
 */
export function setLogLevel(level: LogLevel): LogLevel {
  const previousLevel = currentLogLevel;
  currentLogLevel = level;
  for (const instance of loggerInstances) {
    try {
      instance.setLevel(level);
    } catch {
      // Avoid importing the logger here — that would create a circular dependency.
      console.error('[log-level-manager] Failed to update logger instance level to', level);
    }
  }
  return previousLevel;
}
