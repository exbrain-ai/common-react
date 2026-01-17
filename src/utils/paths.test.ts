import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getBasePath,
  apiUrl,
  appUrl,
  withoutBasePath,
  hasBasePath,
  getDashboardHomePath,
} from './paths';

describe('path utilities', () => {
  const originalEnv = process.env.NEXT_PUBLIC_BASE_PATH;
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset environment variable
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    // Reset window object
    delete (global as any).window;
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_BASE_PATH = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_BASE_PATH;
    }
    // Restore original window
    if (originalWindow !== undefined) {
      global.window = originalWindow;
    } else {
      delete (global as any).window;
    }
  });

  describe('getBasePath', () => {
    it('should return empty string when basePath is not set', () => {
      expect(getBasePath()).toBe('');
    });

    it('should return basePath from environment variable (server-side)', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(getBasePath()).toBe('/hello');
    });

    it('should return basePath from environment variable (client-side)', () => {
      global.window = {} as any;
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(getBasePath()).toBe('/hello');
    });

    it('should handle empty basePath', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '';
      expect(getBasePath()).toBe('');
    });
  });

  describe('apiUrl', () => {
    it('should return path as-is when basePath is not set', () => {
      expect(apiUrl('/api/auth/signup')).toBe('/api/auth/signup');
    });

    it('should add basePath to path when basePath is set', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(apiUrl('/api/auth/signup')).toBe('/hello/api/auth/signup');
    });

    it('should add leading slash to path if missing', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(apiUrl('api/auth/signup')).toBe('/hello/api/auth/signup');
    });

    it('should handle empty path', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(apiUrl('')).toBe('/hello/');
    });

    it('should handle root path', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(apiUrl('/')).toBe('/hello/');
    });
  });

  describe('appUrl', () => {
    it('should return path as-is when basePath is not set', () => {
      expect(appUrl('/dashboard/home')).toBe('/dashboard/home');
    });

    it('should add basePath to path when basePath is set', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(appUrl('/dashboard/home')).toBe('/hello/dashboard/home');
    });

    it('should add leading slash to path if missing', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(appUrl('dashboard/home')).toBe('/hello/dashboard/home');
    });

    it('should handle empty path', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(appUrl('')).toBe('/hello/');
    });

    it('should handle root path', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(appUrl('/')).toBe('/hello/');
    });
  });

  describe('withoutBasePath', () => {
    it('should return path as-is when basePath is not set', () => {
      expect(withoutBasePath('/dashboard/home')).toBe('/dashboard/home');
    });

    it('should remove basePath from path when present', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(withoutBasePath('/hello/dashboard/home')).toBe('/dashboard/home');
    });

    it('should return path as-is when basePath is not at start', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(withoutBasePath('/dashboard/hello/home')).toBe('/dashboard/hello/home');
    });

    it('should return root path when path equals basePath', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(withoutBasePath('/hello')).toBe('/');
    });

    it('should handle empty path', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(withoutBasePath('')).toBe('');
    });
  });

  describe('hasBasePath', () => {
    it('should return false when basePath is not set', () => {
      expect(hasBasePath('/dashboard/home')).toBe(false);
    });

    it('should return true when path starts with basePath', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(hasBasePath('/hello/dashboard/home')).toBe(true);
    });

    it('should return false when path does not start with basePath', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(hasBasePath('/dashboard/home')).toBe(false);
    });

    it('should return true when path equals basePath', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(hasBasePath('/hello')).toBe(true);
    });

    it('should return false for empty path', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(hasBasePath('')).toBe(false);
    });
  });

  describe('getDashboardHomePath', () => {
    it('should return dashboard home path without basePath', () => {
      expect(getDashboardHomePath()).toBe('/dashboard/home');
    });

    it('should return dashboard home path with basePath', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/hello';
      expect(getDashboardHomePath()).toBe('/hello/dashboard/home');
    });
  });
});
