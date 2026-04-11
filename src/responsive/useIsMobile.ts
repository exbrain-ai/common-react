'use client';

import { MEDIA_MD_DOWN } from './tailwindBreakpoints';
import { useMediaQuery } from './useMediaQuery';

/**
 * `true` when viewport is strictly below Tailwind `md` (max-width 767px).
 * Server snapshot is **mobile-first** (`true`) to align with narrow-first SSR.
 */
export function useIsMobile(): boolean {
  return useMediaQuery(MEDIA_MD_DOWN, { getServerSnapshot: () => true });
}
