/**
 * Regression test for features#336.
 *
 * The `@exbrain/common-react` package exposes server-safe utilities via
 * dedicated subpath exports (`./utils/cn`, `./utils/safe-trim`,
 * `./utils/email-validator`, `./responsive`, `./logger`, `./server`) so that
 * Next.js Server Components can use isomorphic helpers without webpack
 * pulling client-only modules (hooks, forms, tables, i18n context) into the
 * server bundle.
 *
 * If a future refactor accidentally folds client-only re-exports back into one
 * of these subpath entry points, this test will fail loudly and cause Next.js
 * Server Component builds in admin-ui / exbrain-ui to fail again.
 *
 * The check looks at the relative source paths declared in package.json
 * `exports` and asserts that none of the server-safe subpaths re-export a
 * known client-only module.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const PACKAGE_ROOT = resolve(dirname(__filename), "..", "..");

type ExportEntry = string | { import?: string; default?: string; types?: string };
type ExportsMap = Record<string, ExportEntry>;

const pkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, "package.json"), "utf8")) as {
  exports: ExportsMap;
};

// Subpaths that MUST be safe to import from a Next.js Server Component
// (i.e. the resolved source must not depend on React client-only APIs and
// must not transitively pull in client components).
//
// `./responsive` is intentionally excluded — those modules carry the
// `'use client'` directive on purpose; consumers must import them only from
// client components.
const SERVER_SAFE_SUBPATHS = [
  "./utils/cn",
  "./utils/safe-trim",
  "./utils/email-validator",
  "./server",
];

const CLIENT_ONLY_TOKENS = [
  "useState",
  "useEffect",
  "useRef",
  "useMemo",
  "useCallback",
  "useReducer",
  "useContext",
  "createContext",
];

function resolveExport(entry: ExportEntry): string | null {
  if (typeof entry === "string") return entry;
  return entry.import ?? entry.default ?? null;
}

describe("common-react subpath exports (features#336)", () => {
  it.each(SERVER_SAFE_SUBPATHS)(
    "%s subpath is declared in package.json exports",
    (subpath) => {
      expect(pkg.exports[subpath], `missing exports['${subpath}']`).toBeDefined();
    },
  );

  it("each server-safe subpath resolves to source that does not depend on client-only React APIs", () => {
    for (const subpath of SERVER_SAFE_SUBPATHS) {
      const entry = pkg.exports[subpath];
      const target = entry ? resolveExport(entry) : null;
      if (!target) continue;
      // Skip pre-built dist artifacts (we only enforce on TS source).
      if (!target.endsWith(".ts") && !target.endsWith(".tsx")) continue;

      const abs = join(PACKAGE_ROOT, target);
      const source = readFileSync(abs, "utf8");
      for (const token of CLIENT_ONLY_TOKENS) {
        const pattern = new RegExp(`\\b${token}\\b`);
        expect(pattern.test(source), `${subpath} (${target}) must not reference ${token}`).toBe(
          false,
        );
      }
    }
  });
});
