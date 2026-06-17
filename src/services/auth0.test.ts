/**
 * Unit tests for services/auth0.ts
 *
 * Focus (golden features#1293):
 *  - §7 logging: failures are logged via the structured context logger, NOT raw
 *    console.*, and NEVER include the raw error object or any token material.
 *  - §1 fallbacks: getAccessToken preserves its null-return contract for genuine
 *    failures while making the failure observable; the missing-refresh-token case
 *    is surfaced as a thrown, user-facing error.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture the context-logger calls so we can assert on what is (and is not) logged.
// Hoisted so it is initialized before the (also-hoisted) vi.mock factory runs.
const mockLog = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../utils/context-logger', () => ({
  createContextLogger: () => mockLog,
}));

import { getAccessToken } from './auth0';
import { MSG_MISSING_REFRESH_TOKEN } from '../lib/messages';

/** Serialize every argument passed to a mock call into one string for leak checks. */
function allLoggedText(): string {
  const calls = [
    ...mockLog.debug.mock.calls,
    ...mockLog.info.mock.calls,
    ...mockLog.warn.mock.calls,
    ...mockLog.error.mock.calls,
  ];
  return JSON.stringify(calls);
}

describe('getAccessToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the token on success and logs nothing', async () => {
    const token = await getAccessToken(async () => 'the-secret-access-token');
    expect(token).toBe('the-secret-access-token');
    expect(mockLog.error).not.toHaveBeenCalled();
    expect(mockLog.warn).not.toHaveBeenCalled();
  });

  it('returns null and logs (observable) on a generic acquisition failure', async () => {
    const token = await getAccessToken(async () => {
      throw new Error('login_required');
    });
    expect(token).toBeNull();
    expect(mockLog.error).toHaveBeenCalledTimes(1);
    expect(mockLog.error).toHaveBeenCalledWith('Failed to get access token', {
      reason: 'login_required',
    });
  });

  it('throws a user-facing error for the missing-refresh-token case', async () => {
    await expect(
      getAccessToken(async () => {
        throw new Error('Missing Refresh Token (audience: ..., scope: ...)');
      })
    ).rejects.toThrow(MSG_MISSING_REFRESH_TOKEN);
    expect(mockLog.error).toHaveBeenCalledTimes(1);
    expect(mockLog.error).toHaveBeenCalledWith(
      expect.stringContaining('missing refresh token'),
      { reason: 'missing_refresh_token' }
    );
  });

  it('handles a non-Error thrown value without leaking its raw form', async () => {
    const token = await getAccessToken(async () => {
      throw { token: 'leaked-token', secret: 'leaked-secret' };
    });
    expect(token).toBeNull();
    expect(mockLog.error).toHaveBeenCalledWith('Failed to get access token', {
      reason: 'non-error value of type object',
    });
  });

  it('SECURITY: never logs the access token or raw error object', async () => {
    // Success path must not log the token.
    await getAccessToken(async () => 'super-secret-token-value');
    // Failure path with a credential-bearing error object.
    await getAccessToken(async () => {
      const err = new Error('refresh failed') as Error & { accessToken?: string };
      err.accessToken = 'embedded-credential-material';
      throw err;
    });

    const logged = allLoggedText();
    expect(logged).not.toContain('super-secret-token-value');
    expect(logged).not.toContain('embedded-credential-material');
    // Only the redacted message survives.
    expect(logged).toContain('refresh failed');
  });
});
