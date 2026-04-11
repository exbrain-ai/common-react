'use client';

import { useSyncExternalStore } from 'react';

export interface UseMediaQueryOptions {
  /**
   * Value returned on the server and before hydration.
   * - For `(min-width: …)` “desktop features”: default **`false`** (narrow-first).
   * - For `(max-width: …)` / “mobile”: pass **`() => true`** so SSR matches mobile-first layouts.
   */
  getServerSnapshot?: () => boolean;
}

/**
 * SSR-safe viewport query via `useSyncExternalStore`.
 *
 * Use when **structure or behavior** changes by breakpoint (e.g. cards vs table).
 * Prefer CSS / container queries for spacing, typography, and visibility-only tweaks.
 */
export function useMediaQuery(query: string, options?: UseMediaQueryOptions): boolean {
  const getServerSnapshot = options?.getServerSnapshot ?? (() => false);

  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined') {
        return () => {};
      }
      const mq = window.matchMedia(query);
      const handler = () => onChange();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    },
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
    getServerSnapshot
  );
}
