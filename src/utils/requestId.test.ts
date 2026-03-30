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
        value: 'x-browser-id=from-cookie',
        configurable: true,
      });
      const { getOrCreateClientRequestId } = await import('./requestId');
      expect(getOrCreateClientRequestId()).toBe('from-cookie');
    });
  });

  describe('getOrCreateClientBrowserId', () => {
    it('returns stable id across calls when cookie absent', async () => {
      const { getOrCreateClientBrowserId } = await import('./requestId');
      const a = getOrCreateClientBrowserId();
      const b = getOrCreateClientBrowserId();
      expect(a).toBe(b);
      expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('prefers x-browser-id cookie over session fallback', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'x-browser-id=browser-cookie',
        configurable: true,
      });
      const { getOrCreateClientBrowserId } = await import('./requestId');
      expect(getOrCreateClientBrowserId()).toBe('browser-cookie');
    });
  });

  describe('getRequestIdHeader', () => {
    it('returns different X-Request-ID on repeated calls when cookie absent (browser)', async () => {
      const { getRequestIdHeader } = await import('./requestId');
      const h1 = getRequestIdHeader() as Record<string, string>;
      const h2 = getRequestIdHeader() as Record<string, string>;
      expect(h1['X-Request-ID']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(h2['X-Request-ID']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(h1['X-Request-ID']).not.toBe(h2['X-Request-ID']);
    });

    it('returns empty object when session id is unavailable (no crypto)', async () => {
      vi.resetModules();
      const prevDoc = globalThis.document;
      const prevCrypto = globalThis.crypto;
      vi.stubGlobal('document', { cookie: '' });
      vi.stubGlobal('crypto', {});
      const { getRequestIdHeader } = await import('./requestId');
      expect(getRequestIdHeader()).toEqual({});
      globalThis.document = prevDoc;
      globalThis.crypto = prevCrypto;
      vi.unstubAllGlobals();
    });

    it('returns UUID header when document undefined (SSR-style)', async () => {
      vi.resetModules();
      const prevDoc = globalThis.document;
      // @ts-expect-error test SSR branch
      delete globalThis.document;
      const { getRequestIdHeader } = await import('./requestId');
      const h = getRequestIdHeader() as Record<string, string>;
      expect(h['X-Request-ID']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      globalThis.document = prevDoc;
    });
  });

  describe('getBrowserIdHeader', () => {
    it('returns X-Browser-ID from cookie', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'x-browser-id=test-browser-id',
        configurable: true,
      });
      const { getBrowserIdHeader } = await import('./requestId');
      expect(getBrowserIdHeader()).toEqual({ 'X-Browser-ID': 'test-browser-id' });
    });

    it('returns empty object when not in browser', async () => {
      vi.resetModules();
      const prevDoc = globalThis.document;
      // @ts-expect-error test SSR branch
      delete globalThis.document;
      const { getBrowserIdHeader } = await import('./requestId');
      expect(getBrowserIdHeader()).toEqual({});
      globalThis.document = prevDoc;
    });
  });

  describe('getRequestId', () => {
    it('returns raw cookie value when decodeURIComponent fails', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'x-request-id=%ZZ',
        configurable: true,
      });
      const { getRequestId } = await import('./requestId');
      expect(getRequestId()).toBe('%ZZ');
    });
  });

  describe('fetchWithRequestId', () => {
    it('merges X-Request-ID (fresh) and X-Browser-ID (cookie) into request headers', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'x-browser-id=fetch-rid',
        configurable: true,
      });
      const fetchMock = vi.fn().mockResolvedValue(new Response());
      vi.stubGlobal('fetch', fetchMock);
      const { fetchWithRequestId } = await import('./requestId');
      await fetchWithRequestId('http://api.example/x');
      expect(fetchMock).toHaveBeenCalledWith(
        'http://api.example/x',
        expect.objectContaining({
          headers: expect.any(Headers),
        })
      );
      const init = fetchMock.mock.calls[0][1] as RequestInit;
      const h = new Headers(init.headers);
      expect(h.get('X-Browser-ID')).toBe('fetch-rid');
      expect(h.get('X-Request-ID')).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      vi.unstubAllGlobals();
    });
  });
});
