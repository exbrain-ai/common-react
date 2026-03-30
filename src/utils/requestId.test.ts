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
    it('returns empty object when browser ID cannot be generated (no crypto, no cookie)', async () => {
      vi.resetModules();
      vi.stubGlobal('document', { cookie: '' });
      vi.stubGlobal('crypto', {});
      const { getBrowserIdHeader } = await import('./requestId');
      expect(getBrowserIdHeader()).toEqual({});
      vi.unstubAllGlobals();
    });

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

  describe('createBatchRequestId', () => {
    it('returns UUID with 00000000 first segment', async () => {
      const { createBatchRequestId } = await import('./requestId');
      const id = createBatchRequestId();
      expect(id).toMatch(/^00000000-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('returns empty string when crypto is unavailable', async () => {
      vi.resetModules();
      vi.stubGlobal('crypto', {});
      const { createBatchRequestId } = await import('./requestId');
      expect(createBatchRequestId()).toBe('');
      vi.unstubAllGlobals();
    });
  });

  describe('registerFetchLogger and logOutgoingRequest', () => {
    it('logOutgoingRequest does nothing when no logger registered', async () => {
      vi.resetModules();
      const { logOutgoingRequest } = await import('./requestId');
      expect(() => logOutgoingRequest('req-id', 'GET', '/api')).not.toThrow();
    });

    it('calls registered logger when requestId is set', async () => {
      vi.resetModules();
      const { registerFetchLogger, logOutgoingRequest } = await import('./requestId');
      const mockLog = vi.fn();
      registerFetchLogger(mockLog);
      logOutgoingRequest('req-123', 'POST', '/api/data');
      expect(mockLog).toHaveBeenCalledWith('→ POST /api/data', { requestId: 'req-123' });
    });

    it('logOutgoingRequest does nothing when requestId is empty', async () => {
      vi.resetModules();
      const { registerFetchLogger, logOutgoingRequest } = await import('./requestId');
      const mockLog = vi.fn();
      registerFetchLogger(mockLog);
      logOutgoingRequest('', 'GET', '/api');
      expect(mockLog).not.toHaveBeenCalled();
    });
  });

  describe('fetchWithRequestId', () => {
    it('extracts method from Request object input', async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response());
      vi.stubGlobal('fetch', fetchMock);
      const { fetchWithRequestId } = await import('./requestId');
      const req = new Request('http://api.example/y', { method: 'DELETE' });
      await fetchWithRequestId(req);
      expect(fetchMock).toHaveBeenCalledWith(
        req,
        expect.objectContaining({ headers: expect.any(Headers) }),
      );
      const init = fetchMock.mock.calls[0][1] as RequestInit;
      const h = new Headers(init.headers);
      expect(h.get('X-Request-ID')).toMatch(/^[0-9a-f-]{36}$/i);
      vi.unstubAllGlobals();
    });

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
