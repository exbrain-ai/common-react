/**
 * Frontend logging utility
 * Provides structured logging with different levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor(level: LogLevel = 'info', isDevelopment: boolean = false) {
    this.level = level;
    this.isDevelopment = isDevelopment;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      level,
      message,
      timestamp,
      context,
    };

    if (this.isDevelopment) {
      // In development, use console methods for better debugging
      const consoleMethod = level === 'debug' ? 'log' : level;
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      console[consoleMethod](`${prefix} ${message}`, context || '');
      return message;
    }

    // In production, return structured JSON for log aggregation
    return JSON.stringify(logEntry);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      this.formatMessage('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      this.formatMessage('info', message, context);
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      this.formatMessage('warn', message, context);
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      this.formatMessage('error', message, context);
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

// Create logger instance
const logger = new Logger(
  (process.env.REACT_APP_LOG_LEVEL as LogLevel) || 'info',
  process.env.NODE_ENV === 'development'
);

export default logger;


