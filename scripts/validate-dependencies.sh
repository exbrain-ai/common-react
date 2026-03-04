#!/bin/bash
# Dependency Validation Script for React/Node Projects
# Validates that all dependencies in package.json are in the approved library list.
# Source of truth: approved-libraries.yaml in the repo root (present in CI and local).
# Usage: ./scripts/validate-dependencies.sh [package.json path]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PACKAGE_JSON_PATH="${1:-./package.json}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
APPROVED_YAML="${PROJECT_ROOT}/approved-libraries.yaml"

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

[ ! -f "$PACKAGE_JSON_PATH" ] && print_error "package.json file not found: $PACKAGE_JSON_PATH" && exit 1
[ ! -f "$APPROVED_YAML" ] && print_error "Approved libraries file not found: $APPROVED_YAML" && exit 1

print_info "Validating dependencies in: $PACKAGE_JSON_PATH"
print_info "Using allowlist: $APPROVED_YAML"

if ! command -v jq &> /dev/null; then
    print_warning "jq not found, using basic grep parsing (may be less accurate)"
    USE_JQ=false
else
    USE_JQ=true
fi

if [ "$USE_JQ" = true ]; then
    DEPENDENCIES=$(jq -r '.dependencies // {}, .devDependencies // {} | to_entries[] | .key' "$PACKAGE_JSON_PATH" 2>/dev/null || echo "")
else
    DEPENDENCIES=$(grep -E '^\s*"[^"]+":' "$PACKAGE_JSON_PATH" | grep -E '(dependencies|devDependencies)' -A 1000 | grep -E '^\s*"[^"]+":' | sed 's/.*"\([^"]*\)".*/\1/' | grep -v '^[{}]' || echo "")
fi

# Extract approved package names from approved-libraries.yaml (- name: package-name)
TEMP_FILE=$(mktemp)
trap 'rm -f "$TEMP_FILE"' EXIT
grep -E "^\s+-\s+name:\s+" "$APPROVED_YAML" | sed -E 's/^[[:space:]]*-[[:space:]]+name:[[:space:]]+//' | sed 's/^"//;s/"$//' | while IFS= read -r pkg || [ -n "$pkg" ]; do
    [ -z "$pkg" ] && continue
    echo "$pkg" >> "$TEMP_FILE"
done

APPROVED_ARRAY=()
while IFS= read -r line; do
    [ -n "$line" ] && APPROVED_ARRAY+=("$line")
done < "$TEMP_FILE"

UNAPPROVED_COUNT=0
APPROVED_COUNT=0
WARNINGS=()

print_info "Checking dependencies against approved library list..."

while IFS= read -r dep; do
    [ -z "$dep" ] && continue

    # Internal dependencies (example-org golden app; exbrain company scope)
    if [[ "$dep" =~ ^@(example-org|exbrain)/ ]]; then
        print_success "  ✓ $dep (internal dependency)"
        ((APPROVED_COUNT++))
        continue
    fi

    FOUND=false
    for approved in "${APPROVED_ARRAY[@]}"; do
        if [ "$dep" = "$approved" ]; then
            print_success "  ✓ $dep (approved)"
            ((APPROVED_COUNT++))
            FOUND=true
            break
        fi
    done

    if [ "$FOUND" = false ]; then
        print_error "  ✗ $dep (NOT in approved list)"
        WARNINGS+=("$dep")
        ((UNAPPROVED_COUNT++))
    fi
done <<< "$DEPENDENCIES"

echo ""
print_info "Validation Summary:"
print_info "  Approved: $APPROVED_COUNT"
if [ $UNAPPROVED_COUNT -gt 0 ]; then
    print_error "  Unapproved: $UNAPPROVED_COUNT"
    echo ""
    print_error "Unapproved dependencies found:"
    for dep in "${WARNINGS[@]}"; do
        print_error "  - $dep"
    done
    echo ""
    print_error "ACTION REQUIRED:"
    print_error "  1. Review if this dependency is necessary"
    print_error "  2. Check if there's an approved alternative"
    print_error "  3. If this library is needed, add it to: $APPROVED_YAML"
    print_error "  4. Document why this library is required"
    echo ""
    exit 1
else
    print_success "All dependencies are approved!"
    exit 0
fi










