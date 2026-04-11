# Responsive helpers

## `useMediaQuery(query, options?)`

Subscribe to `window.matchMedia(query)` via `useSyncExternalStore` so SSR and hydration stay consistent.

- **Default server snapshot** for `getServerSnapshot`: `false`. Use for `(min-width: …)` branches where the “wide” layout is opt-in after hydration.
- **Mobile-first SSR**: for `(max-width: …)` or “mobile layout” as default, pass `getServerSnapshot: () => true`.

## `useIsMobile()`

`true` when viewport is **strictly below** Tailwind `md` (`max-width: 767px`). Server snapshot is `true` (mobile-first).

## Constants (`MEDIA_*_UP`, `MEDIA_MD_DOWN`)

Generated from `TAILWIND_SCREENS` to match default Tailwind breakpoints. If an app overrides `theme.screens`, mirror those values here or add app-local constants.

## When to use JS vs CSS

- **CSS / container queries**: spacing, typography, hiding non-essential elements, same DOM structure.
- **`useMediaQuery`**: different component trees or interaction models (e.g. cards vs table).
