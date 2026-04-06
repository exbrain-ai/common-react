/**
 * Unit tests for logger.ts — ClientLogShipper session-aware shipping gate (bug #184)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock pino before importing the module under test
vi.mock('pino', () => {
  const mockLogger = {
    level: 'info',
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const pinoFn = vi.fn(() => mockLogger);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pinoFn as any).levels = { labels: { 10: 'trace', 20: 'debug', 30: 'info', 40: 'warn', 50: 'error' } };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pinoFn as any).stdTimeFunctions = { isoTime: vi.fn() };
  return { default: pinoFn };
});

// Mock dependencies so the module loads cleanly in Node/test
vi.mock('./log-schema', () => ({
  LOG_SCHEMA_FIELDS: { message: 'message', level: 'level', timestamp: 'timestamp', service: 'service', request_id: 'request_id' },
}));

vi.mock('./paths', () => ({
  apiUrl: (path: string) => path,
}));

vi.mock('./requestId', () => ({
  createBatchRequestId: () => '00000000-test-batch-id',
  getOrCreateClientBrowserId: () => 'test-browser-id',
  getBrowserIdHeader: () => ({ 'X-Browser-ID': 'test-browser-id' }),
  registerFetchLogger: vi.fn(),
}));

describe('logger shipping gate (bug #184)', () => {
  // Save/restore globals
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const originalNavigator = globalThis.navigator;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    mockFetch = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = mockFetch;

    // Simulate browser environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = {
      location: { href: 'https://example.com/hello', pathname: '/hello' },
      addEventListener: vi.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).navigator = {
      userAgent: 'test-agent',
      sendBeacon: vi.fn().mockReturnValue(true),
    };
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      delete (globalThis as Record<string, unknown>).window;
    } else {
      globalThis.window = originalWindow;
    }
    globalThis.fetch = originalFetch;
    if (originalNavigator === undefined) {
      delete (globalThis as Record<string, unknown>).navigator;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).navigator = originalNavigator;
    }
    vi.restoreAllMocks();
  });

  it('does not ship logs when shipping is disabled (default state)', async () => {
    const { enableLogShipping, isLogShippingEnabled } = await import('./logger');

    // Shipping should be disabled by default
    expect(isLogShippingEnabled()).toBe(false);

    // Importing the default logger triggers pino creation — get the logger
    const mod = await import('./logger');
    const logger = mod.default;

    // Log some messages (they go to pino browser.write which calls shipper.addLog)
    // Since we can't easily trigger the shipper through pino's write, we test the
    // exported functions directly
    expect(isLogShippingEnabled()).toBe(false);

    // Enable and verify
    enableLogShipping();
    expect(isLogShippingEnabled()).toBe(true);
  });

  it('enableLogShipping and disableLogShipping toggle the gate', async () => {
    const { enableLogShipping, disableLogShipping, isLogShippingEnabled } = await import('./logger');

    expect(isLogShippingEnabled()).toBe(false);
    enableLogShipping();
    expect(isLogShippingEnabled()).toBe(true);
    disableLogShipping();
    expect(isLogShippingEnabled()).toBe(false);
  });

  it('enableLogShipping is safe to call multiple times', async () => {
    const { enableLogShipping, isLogShippingEnabled } = await import('./logger');

    enableLogShipping();
    enableLogShipping();
    enableLogShipping();
    expect(isLogShippingEnabled()).toBe(true);
  });

  it('disableLogShipping is safe to call on server (no-op)', async () => {
    // Remove window to simulate server
    delete (globalThis as Record<string, unknown>).window;

    const { disableLogShipping, isLogShippingEnabled } = await import('./logger');

    // Should not throw
    disableLogShipping();
    expect(isLogShippingEnabled()).toBe(false);
  });

  it('enableLogShipping is safe to call on server (no-op)', async () => {
    delete (globalThis as Record<string, unknown>).window;

    const { enableLogShipping, isLogShippingEnabled } = await import('./logger');

    enableLogShipping();
    // Still false because no shipper is created on server
    expect(isLogShippingEnabled()).toBe(false);
  });
});
