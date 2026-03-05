#!/usr/bin/env bash
# Golden check for common-react only (no dependency on common-go).
# Runs hardcoded-literal check on src/. From repo root: ./scripts/check-golden.sh
set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

echo "Golden checks (common-react)..."
echo ""

FAILED=0
if command -v node >/dev/null 2>&1 && [ -f "$SCRIPT_DIR/check-hardcoded.js" ]; then
  HARDCODED_OUT="$(node "$SCRIPT_DIR/check-hardcoded.js" "$REPO_ROOT" src 2>/dev/null)" || true
  if [ -n "$HARDCODED_OUT" ]; then
    echo "  FAIL no hardcoded literals (add // ALLOW: or // golden-allow: if intentional)"
    echo "$HARDCODED_OUT" | sed 's/^/    /'
    FAILED=1
  else
    echo "  OK   no hardcoded literals (or ALLOW/golden-allow)"
  fi
else
  echo "  SKIP no hardcoded literals (node or check-hardcoded.js not found)"
fi

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "All golden checks passed."
  exit 0
else
  echo "One or more golden checks failed. Fix before merging."
  exit 1
fi
