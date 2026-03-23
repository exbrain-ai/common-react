/**
 * Request ID correlation: browser session fallback must match across
 * getRequestIdHeader calls (OpenAPI) and logging (see logger.ts).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('requestId', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
      configurable: true,
    });
  });

  describe('getOrCreateClientRequestId', () => {
    it('returns stable id across calls when cookie is absent', async () => {
      const { getOrCreateClientRequestId } = await import('./requestId');
      const a = getOrCreateClientRequestId();
      const b = getOrCreateClientRequestId();
      expect(a).toBe(b);
      expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('prefers cookie over session fallback', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'x-request-id=from-cookie',
        configurable: true,
      });
      const { getOrCreateClientRequestId } = await import('./requestId');
      expect(getOrCreateClientRequestId()).toBe('from-cookie');
    });
  });

  describe('getRequestIdHeader', () => {
    it('returns same X-Request-ID on repeated calls when cookie absent (browser)', async () => {
      const { getRequestIdHeader } = await import('./requestId');
      const h1 = getRequestIdHeader() as Record<string, string>;
      const h2 = getRequestIdHeader() as Record<string, string>;
      expect(h1['X-Request-ID']).toBe(h2['X-Request-ID']);
      expect(h1['X-Request-ID']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('uses cookie value when present', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'x-request-id=hdr-cookie',
        configurable: true,
      });
      const { getRequestIdHeader } = await import('./requestId');
      expect(getRequestIdHeader()).toEqual({ 'X-Request-ID': 'hdr-cookie' });
    });
  });
});
