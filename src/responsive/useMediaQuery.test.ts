import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

function mockMatchMedia(matchesByQuery: Record<string, boolean>) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matchesByQuery[query] ?? false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when matchMedia matches false (min-width)', () => {
    mockMatchMedia({ '(min-width: 99999px)': false });

    const { result } = renderHook(() => useMediaQuery('(min-width: 99999px)'));
    expect(result.current).toBe(false);
  });

  it('returns true when matchMedia matches', () => {
    mockMatchMedia({ '(min-width: 1px)': true });

    const { result } = renderHook(() => useMediaQuery('(min-width: 1px)'));
    expect(result.current).toBe(true);
  });
});
