/**
 * Tailwind default `screens` (pixel values).
 * Keep in sync with each app’s Tailwind config if overrides exist.
 * @see https://tailwindcss.com/docs/screens
 */
export const TAILWIND_SCREENS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const mediaMinWidth = (px: number): string => `(min-width: ${px}px)`;

export const mediaMaxWidth = (px: number): string => `(max-width: ${px}px)`;

export const MEDIA_SM_UP = mediaMinWidth(TAILWIND_SCREENS.sm);
export const MEDIA_MD_UP = mediaMinWidth(TAILWIND_SCREENS.md);
export const MEDIA_LG_UP = mediaMinWidth(TAILWIND_SCREENS.lg);
export const MEDIA_XL_UP = mediaMinWidth(TAILWIND_SCREENS.xl);
export const MEDIA_2XL_UP = mediaMinWidth(TAILWIND_SCREENS['2xl']);

/** Viewports strictly below Tailwind `md` (exclusive of 768px). Pair with `useMediaQuery` server snapshot `true` for mobile-first SSR. */
export const MEDIA_MD_DOWN = mediaMaxWidth(TAILWIND_SCREENS.md - 1);
