import { describe, it, expect } from 'vitest';
import { mapAuthError, extractAuthError, type AuthError } from './auth-error-mapper';

describe('auth error mapper', () => {
  describe('mapAuthError', () => {
    it('should return default message when errorCode is undefined', () => {
      const result = mapAuthError(undefined);
      expect(result).toBe('An error occurred. Please try again.');
    });

    it('should return custom default message when errorCode is undefined', () => {
      const result = mapAuthError(undefined, 'Custom error message');
      expect(result).toBe('Custom error message');
    });

    it('should map invalid_credentials error', () => {
      const result = mapAuthError('invalid_credentials');
      expect(result).toBe('Invalid email or password. Please check your credentials and try again.');
    });

    it('should map invalid_email error', () => {
      const result = mapAuthError('invalid_email');
      expect(result).toBe('Please enter a valid email address.');
    });

    it('should map invalid_password error', () => {
      const result = mapAuthError('invalid_password');
      expect(result).toBe('Password does not meet requirements. Please check the password policy.');
    });

    it('should map user_already_exists error', () => {
      const result = mapAuthError('user_already_exists');
      expect(result).toBe('An account with this email already exists. Please sign in instead.');
    });

    it('should map email_already_registered error', () => {
      const result = mapAuthError('email_already_registered');
      expect(result).toBe('An account with this email already exists. Please sign in instead.');
    });

    it('should map csrf_token_invalid error', () => {
      const result = mapAuthError('csrf_token_invalid');
      expect(result).toBe('Security token expired. Please refresh the page and try again.');
    });

    it('should map csrf_token_missing error', () => {
      const result = mapAuthError('csrf_token_missing');
      expect(result).toBe('Security token missing. Please refresh the page and try again.');
    });

    it('should map csrf_token_expired error', () => {
      const result = mapAuthError('csrf_token_expired');
      expect(result).toBe('Security token expired. Please refresh the page and try again.');
    });

    it('should map rate_limit_exceeded error', () => {
      const result = mapAuthError('rate_limit_exceeded');
      expect(result).toBe('Too many attempts. Please wait a moment and try again.');
    });

    it('should map account_locked error', () => {
      const result = mapAuthError('account_locked');
      expect(result).toBe('Account temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.');
    });

    it('should map account_suspended error', () => {
      const result = mapAuthError('account_suspended');
      expect(result).toBe('Your account has been suspended. Please contact support for assistance.');
    });

    it('should map service_unavailable error', () => {
      const result = mapAuthError('service_unavailable');
      expect(result).toBe('Authentication service is temporarily unavailable. Please try again in a moment.');
    });

    it('should map internal_error error', () => {
      const result = mapAuthError('internal_error');
      expect(result).toBe('An unexpected error occurred. Please try again.');
    });

    it('should map network_error error', () => {
      const result = mapAuthError('network_error');
      expect(result).toBe('Network error. Please check your connection and try again.');
    });

    it('should map timeout error', () => {
      const result = mapAuthError('timeout');
      expect(result).toBe('Request timed out. Please try again.');
    });

    it('should return default message for unknown error code', () => {
      const result = mapAuthError('unknown_error_code');
      expect(result).toBe('An error occurred. Please try again.');
    });

    it('should return custom default message for unknown error code', () => {
      const result = mapAuthError('unknown_error_code', 'Custom error message');
      expect(result).toBe('Custom error message');
    });

    it('should handle empty string error code', () => {
      const result = mapAuthError('');
      expect(result).toBe('An error occurred. Please try again.');
    });
  });

  describe('extractAuthError', () => {
    it('should return null for null input', () => {
      const result = extractAuthError(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = extractAuthError(undefined);
      expect(result).toBeNull();
    });

    it('should return null for non-object input', () => {
      const result = extractAuthError('string');
      expect(result).toBeNull();
    });

    it('should return null for object without error property', () => {
      const result = extractAuthError({ data: 'value' });
      expect(result).toBeNull();
    });

    it('should extract error from string format', () => {
      const result = extractAuthError({ error: 'Error message' });
      expect(result).toEqual({
        code: 'unknown',
        message: 'Error message',
      });
    });

    it('should extract error from object format with code and message', () => {
      const result = extractAuthError({
        error: {
          code: 'invalid_credentials',
          message: 'Invalid credentials',
        },
      });
      expect(result).toEqual({
        code: 'invalid_credentials',
        message: 'Invalid email or password. Please check your credentials and try again.',
      });
    });

    it('should extract error from object format with code only', () => {
      const result = extractAuthError({
        error: {
          code: 'invalid_email',
        },
      });
      expect(result).toEqual({
        code: 'invalid_email',
        message: 'Please enter a valid email address.',
      });
    });

    it('should extract error from object format with message only', () => {
      const result = extractAuthError({
        error: {
          message: 'Custom error message',
        },
      });
      expect(result).toEqual({
        code: 'unknown',
        message: 'Custom error message',
      });
    });

    it('should handle malformed error object', () => {
      const result = extractAuthError({
        error: {
          code: null,
          message: null,
        },
      });
      expect(result).toEqual({
        code: 'unknown',
        message: 'An error occurred. Please try again.',
      });
    });

    it('should handle error with unknown code', () => {
      const result = extractAuthError({
        error: {
          code: 'unknown_code',
          message: 'Custom message',
        },
      });
      expect(result).toEqual({
        code: 'unknown_code',
        message: 'Custom message',
      });
    });

    it('should handle nested error structure', () => {
      const result = extractAuthError({
        error: {
          code: 'csrf_token_invalid',
          message: 'CSRF token is invalid',
        },
        other: 'data',
      });
      expect(result).toEqual({
        code: 'csrf_token_invalid',
        message: 'Security token expired. Please refresh the page and try again.',
      });
    });
  });
});
