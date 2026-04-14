#!/usr/bin/env bash
# Ensure a UI app declares every npm package that common-react SOURCE imports.
# When Vitest inlines common-react via alias (../../common-react/src), resolution
# is from the app — so any external import in common-react must exist in the app's
# node_modules. This script fails if a package is missing, avoiding CI-only failures.
#
# Usage: check-common-react-test-deps.sh <path-to-app-package.json>
#   e.g. from exbrain-ui root: ../common-react/scripts/check-common-react-test-deps.sh ./package.json
#   e.g. from hello root:      ../common-react/scripts/check-common-react-test-deps.sh ./ui/package.json
#
# Requires common-react at ../common-react relative to the calling app (standard monorepo layout).
set -e

APP_UI_PKG="${1:-}"

if [ -z "$APP_UI_PKG" ]; then
  echo "[ERROR] Usage: $0 <path-to-app-package.json>" >&2
  exit 1
fi

if [ ! -f "$APP_UI_PKG" ]; then
  echo "[ERROR] package.json not found at $APP_UI_PKG" >&2
  exit 1
fi

# Resolve common-react: accept COMMON_REACT_ROOT env override, else use sibling ../common-react.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMON_REACT_ROOT="${COMMON_REACT_ROOT:-$(cd "${SCRIPT_DIR}/.." && pwd)}"
COMMON_REACT_SRC="${COMMON_REACT_ROOT}/src"

if [ ! -d "$COMMON_REACT_SRC" ]; then
  echo "[ERROR] common-react/src not found at $COMMON_REACT_SRC" >&2
  echo "        Set COMMON_REACT_ROOT env var or ensure common-react is a sibling directory." >&2
  exit 1
fi

# External packages that common-react source imports (excluding: provided by app or mocked in tests)
SKIP_PACKAGES="react|react-dom|next|vitest|@testing-library|@auth0/auth0-react|node:"

# Extract package names from: from 'pkg' / from "pkg" / from 'pkg/...'
PACKAGES="$(
  grep -rh "from ['\"]" "$COMMON_REACT_SRC" --include='*.ts' --include='*.tsx' 2>/dev/null \
  | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/" \
  | grep -v '^\.' \
  | sort -u
)" || true

# Normalize to root package name (e.g. @scope/pkg or pkg)
normalize() {
  local name="$1"
  if [[ "$name" == @* ]]; then
    echo "$name" | cut -d/ -f1-2
  else
    echo "$name" | cut -d/ -f1
  fi
}

MISSING=""
for raw in $PACKAGES; do
  pkg=$(normalize "$raw")
  if [ -z "$pkg" ]; then continue; fi
  if echo "$pkg" | grep -qE "^($SKIP_PACKAGES)"; then continue; fi
  if node -e "
    const fs = require('fs');
    const j = JSON.parse(fs.readFileSync('$APP_UI_PKG', 'utf8'));
    const deps = { ...(j.dependencies || {}), ...(j.devDependencies || {}) };
    process.exit(deps['$pkg'] ? 0 : 1);
  " 2>/dev/null; then
    : # present
  else
    MISSING="${MISSING}${MISSING:+ }$pkg"
  fi
done

if [ -n "$MISSING" ]; then
  echo "[ERROR] common-react source imports these packages, but $APP_UI_PKG does not declare them." >&2
  echo "        Vitest resolves from the app, so CI will fail with 'Failed to resolve import'." >&2
  echo "        Add the following to $APP_UI_PKG (dependencies or devDependencies):" >&2
  for p in $MISSING; do echo "          - $p"; done
  exit 1
fi

echo "[OK] All common-react inlined dependencies are declared in $APP_UI_PKG"
