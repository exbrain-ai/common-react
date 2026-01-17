import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logAuthEvent, getClientIP, getUserAgent, getBrowserUserAgent, type AuthEventContext } from './auth-events';
import logger from './logger';

// Mock the logger
vi.mock('./logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('auth events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logAuthEvent', () => {
    it('should log info level for success events', () => {
      const context: AuthEventContext = {
        eventType: 'login_success',
        appName: 'hello',
        userId: 'user-123',
        result: 'success',
        endpoint: '/auth/password-login',
      };
      logAuthEvent(context);
      expect(logger.info).toHaveBeenCalledWith('Authentication event', {
        eventType: 'login_success',
        appName: 'hello',
        user_id: 'user-123',
        result: 'success',
        endpoint: '/auth/password-login',
      });
    });

    it('should log error level for failure events', () => {
      const context: AuthEventContext = {
        eventType: 'login_failure',
        appName: 'hello',
        userId: 'user-123',
        result: 'failure',
        errorCode: 'invalid_credentials',
        errorMessage: 'Invalid credentials',
        endpoint: '/auth/password-login',
      };
      logAuthEvent(context);
      expect(logger.error).toHaveBeenCalledWith('Authentication event', {
        eventType: 'login_failure',
        appName: 'hello',
        user_id: 'user-123',
        result: 'failure',
        errorCode: 'invalid_credentials',
        errorMessage: 'Invalid credentials',
        endpoint: '/auth/password-login',
      });
    });

    it('should log error level for auth_error events', () => {
      const context: AuthEventContext = {
        eventType: 'auth_error',
        appName: 'hello',
        errorCode: 'internal_error',
        errorMessage: 'Internal error',
      };
      logAuthEvent(context);
      expect(logger.error).toHaveBeenCalledWith('Authentication event', {
        eventType: 'auth_error',
        appName: 'hello',
        errorCode: 'internal_error',
        errorMessage: 'Internal error',
      });
    });

    it('should always include appName in log output', () => {
      const context: AuthEventContext = {
        eventType: 'login_attempt',
        appName: 'hello',
      };
      logAuthEvent(context);
      expect(logger.info).toHaveBeenCalledWith('Authentication event', {
        eventType: 'login_attempt',
        appName: 'hello',
      });
    });

    it('should not include optional fields when not provided', () => {
      const context: AuthEventContext = {
        eventType: 'login_success',
        appName: 'hello',
      };
      logAuthEvent(context);
      expect(logger.info).toHaveBeenCalledWith('Authentication event', {
        eventType: 'login_success',
        appName: 'hello',
      });
    });

    it('should include requestId when provided', () => {
      const context: AuthEventContext = {
        eventType: 'login_success',
        appName: 'hello',
        requestId: 'req-123',
      };
      logAuthEvent(context);
      expect(logger.info).toHaveBeenCalledWith('Authentication event', {
        eventType: 'login_success',
        appName: 'hello',
        requestId: 'req-123',
      });
    });
  });

  describe('getClientIP', () => {
    it('should extract IP from X-Forwarded-For header (Headers object)', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1');
      const ip = getClientIP(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from X-Real-IP header (Headers object)', () => {
      const headers = new Headers();
      headers.set('x-real-ip', '192.168.1.1');
      const ip = getClientIP(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('should return empty string when no IP header found (Headers object)', () => {
      const headers = new Headers();
      const ip = getClientIP(headers);
      expect(ip).toBe('');
    });

    it('should extract IP from X-Forwarded-For header (Record)', () => {
      const headers: Record<string, string | null> = {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      };
      const ip = getClientIP(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from X-Real-IP header (Record)', () => {
      const headers: Record<string, string | null> = {
        'x-real-ip': '192.168.1.1',
      };
      const ip = getClientIP(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('should handle case-insensitive headers (Record)', () => {
      const headers: Record<string, string | null> = {
        'X-Forwarded-For': '192.168.1.1',
      };
      const ip = getClientIP(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('should return empty string when no IP header found (Record)', () => {
      const headers: Record<string, string | null> = {};
      const ip = getClientIP(headers);
      expect(ip).toBe('');
    });
  });

  describe('getUserAgent', () => {
    it('should extract user agent from headers (Headers object)', () => {
      const headers = new Headers();
      headers.set('user-agent', 'Mozilla/5.0');
      const ua = getUserAgent(headers);
      expect(ua).toBe('Mozilla/5.0');
    });

    it('should return empty string when no user agent found (Headers object)', () => {
      const headers = new Headers();
      const ua = getUserAgent(headers);
      expect(ua).toBe('');
    });

    it('should extract user agent from headers (Record)', () => {
      const headers: Record<string, string | null> = {
        'user-agent': 'Mozilla/5.0',
      };
      const ua = getUserAgent(headers);
      expect(ua).toBe('Mozilla/5.0');
    });

    it('should handle case-insensitive headers (Record)', () => {
      const headers: Record<string, string | null> = {
        'User-Agent': 'Mozilla/5.0',
      };
      const ua = getUserAgent(headers);
      expect(ua).toBe('Mozilla/5.0');
    });

    it('should return empty string when no user agent found (Record)', () => {
      const headers: Record<string, string | null> = {};
      const ua = getUserAgent(headers);
      expect(ua).toBe('');
    });
  });

  describe('getBrowserUserAgent', () => {
    it('should return browser user agent when window is available', () => {
      // Mock window.navigator
      Object.defineProperty(global, 'window', {
        value: {
          navigator: {
            userAgent: 'Mozilla/5.0 (Test)',
          },
        },
        writable: true,
        configurable: true,
      });
      const ua = getBrowserUserAgent();
      expect(ua).toBe('Mozilla/5.0 (Test)');
      // Cleanup
      delete (global as any).window;
    });

    it('should return empty string when window is not available', () => {
      // Ensure window is not defined
      delete (global as any).window;
      const ua = getBrowserUserAgent();
      expect(ua).toBe('');
    });

    it('should return empty string when navigator is not available', () => {
      // Mock window without navigator
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
        configurable: true,
      });
      const ua = getBrowserUserAgent();
      expect(ua).toBe('');
      // Cleanup
      delete (global as any).window;
    });
  });
});
