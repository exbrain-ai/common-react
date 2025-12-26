#!/bin/bash
# Dependency Validation Script for React/Node Projects
# Validates that all dependencies in package.json are in the approved library list
# Usage: ./scripts/validate-dependencies.sh [package.json path]
#   package.json path: Path to package.json file (default: ./package.json)

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get package.json path from argument or use default
PACKAGE_JSON_PATH="${1:-./package.json}"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
STANDARDS_FILE="${PROJECT_ROOT}/.cursor/rules/library-standards.mdc"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if package.json exists
if [ ! -f "$PACKAGE_JSON_PATH" ]; then
    print_error "package.json file not found: $PACKAGE_JSON_PATH"
    exit 1
fi

# Check if standards file exists
if [ ! -f "$STANDARDS_FILE" ]; then
    print_error "Library standards file not found: $STANDARDS_FILE"
    exit 1
fi

print_info "Validating dependencies in: $PACKAGE_JSON_PATH"
print_info "Using standards file: $STANDARDS_FILE"

# Check if jq is available (for JSON parsing)
if ! command -v jq &> /dev/null; then
    print_warning "jq not found, using basic grep parsing (may be less accurate)"
    USE_JQ=false
else
    USE_JQ=true
fi

# Extract dependencies from package.json
if [ "$USE_JQ" = true ]; then
    # Use jq to extract dependencies and devDependencies
    DEPENDENCIES=$(jq -r '.dependencies // {}, .devDependencies // {} | to_entries[] | .key' "$PACKAGE_JSON_PATH" 2>/dev/null || echo "")
else
    # Fallback: basic grep (less accurate but works without jq)
    DEPENDENCIES=$(grep -E '^\s*"[^"]+":' "$PACKAGE_JSON_PATH" | grep -E '(dependencies|devDependencies)' -A 1000 | grep -E '^\s*"[^"]+":' | sed 's/.*"\([^"]*\)".*/\1/' | grep -v '^[{}]' || echo "")
fi

# Extract approved libraries from standards file
# Look for patterns like: - **package-name version** - description
APPROVED_LIBS=$(grep -E "^\s*-\s*\*\*[@a-zA-Z0-9./_-]+" "$STANDARDS_FILE" | sed 's/.*\*\*\([@a-zA-Z0-9./_-]*\).*/\1/' | tr '\n' '|' | sed 's/|$//')

# Track results
UNAPPROVED_COUNT=0
APPROVED_COUNT=0
WARNINGS=()

print_info "Checking dependencies against approved library list..."

# Check each dependency
while IFS= read -r dep; do
    # Skip empty lines
    [ -z "$dep" ] && continue
    
    # Skip internal dependencies
    if [[ "$dep" =~ ^@example-org/ ]]; then
        print_success "  ✓ $dep (internal dependency)"
        ((APPROVED_COUNT++))
        continue
    fi
    
    # Check if it's in approved list
    if echo "$APPROVED_LIBS" | grep -qE "(^|\|)$dep(\||$)"; then
        print_success "  ✓ $dep (approved)"
        ((APPROVED_COUNT++))
    else
        print_error "  ✗ $dep (NOT in approved list)"
        WARNINGS+=("$dep")
        ((UNAPPROVED_COUNT++))
    fi
done <<< "$DEPENDENCIES"

# Print summary
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
    print_error "  3. If this library is needed, add it to: $STANDARDS_FILE"
    print_error "  4. Document why this library is required"
    echo ""
    exit 1
else
    print_success "All dependencies are approved!"
    exit 0
fi










