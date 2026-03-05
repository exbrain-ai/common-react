#!/usr/bin/env bash
# Run the same checks as CI locally. From repo root: ./scripts/run-ci-local.sh
# No dependency on common-go.
set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "=== Golden check ==="
bash scripts/check-golden.sh

echo ""
echo "=== Lint ==="
npm run lint

echo ""
echo "=== Test (coverage) ==="
npm run test:coverage

echo ""
echo "=== Build ==="
npm run build

echo ""
echo "All CI checks passed locally."
