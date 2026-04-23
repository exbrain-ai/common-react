#!/usr/bin/env bash
# check-locale-catalogs.sh — CI guard for locale-catalog coverage.
#
# Background (refs features#344): adding a locale to LOCALE_REGISTRY in
# common-react/src/utils/locale-registry.ts immediately surfaces that locale
# in every consuming app's LanguageSwitcher. If the app hasn't landed the
# corresponding messages/{code}/*.json catalogs, next-intl throws
# MODULE_NOT_FOUND at request time and every request 500s.
#
# The runtime has a graceful-degradation fallback (i18n/request.ts returns
# the DEFAULT_LOCALE catalog on a missing-file crash), but that masks the
# bug. This script is the structural fix — it runs in each consuming app's
# CI and fires at code-review time.
#
# Usage (from the consuming app's CI):
#
#   bash ../common-react/scripts/check-locale-catalogs.sh messages
#
# where `messages` is the path to the app's messages/ directory. Two
# layouts are supported:
#
#   - domain-split: messages/{locale}/{domain}.json (e.g. exbrain-ui)
#     every registered locale must have a directory with at least the same
#     file names as messages/en/.
#   - flat:        messages/{locale}.json           (e.g. hello-ui)
#     every registered locale must have a matching top-level JSON file.
#
# Empty stubs are fine — they only need to exist. They mean "I know this
# locale is registered; the copy is pending."
#
# Exit codes:
#   0 — every registered locale has a catalog directory whose file list
#       covers the English one.
#   1 — one or more locales are missing or incomplete. Details printed to
#       stderr with the specific missing paths.
#   2 — invocation error (bad args / registry unreadable).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGISTRY="${SCRIPT_DIR}/../src/utils/locale-registry.ts"

if [[ $# -ne 1 ]]; then
  echo "usage: $(basename "$0") <path-to-messages-dir>" >&2
  exit 2
fi

MESSAGES_DIR="$1"
if [[ ! -d "$MESSAGES_DIR" ]]; then
  echo "error: messages directory not found: $MESSAGES_DIR" >&2
  exit 2
fi

if [[ ! -f "$REGISTRY" ]]; then
  echo "error: locale registry not found at expected path: $REGISTRY" >&2
  exit 2
fi

# Extract locale codes from LOCALE_REGISTRY. The registry format is stable:
#   { code: 'en', nativeName: '…' },
# Grep the `code:` lines and strip quotes/whitespace.
LOCALES=()
# One capture per line. sed BSD + GNU both accept ERE with -E and \1.
while IFS= read -r code; do
  [[ -n "$code" ]] && LOCALES+=("$code")
done < <(grep -oE "code: *'[^']+'" "$REGISTRY" | sed -E "s/code: *'([^']+)'/\\1/")

if [[ ${#LOCALES[@]} -eq 0 ]]; then
  echo "error: could not parse any locale codes from $REGISTRY" >&2
  exit 2
fi

# Two supported layouts:
#   - domain-split: messages/{locale}/{domain}.json (e.g. exbrain-ui)
#   - flat:        messages/{locale}.json         (e.g. hello-ui)
# The layout is detected from the canonical en entry — whichever of the two
# exists is the one the app uses; every registered locale must mirror it.
LAYOUT=""
EN_DIR="$MESSAGES_DIR/en"
EN_FILE="$MESSAGES_DIR/en.json"
if [[ -d "$EN_DIR" ]]; then
  LAYOUT="split"
elif [[ -f "$EN_FILE" ]]; then
  LAYOUT="flat"
else
  echo "error: neither $EN_DIR/ nor $EN_FILE exists — seed messages/en first." >&2
  exit 2
fi

EN_FILES=()
if [[ "$LAYOUT" == "split" ]]; then
  while IFS= read -r -d '' f; do
    EN_FILES+=("$(basename "$f")")
  done < <(find "$EN_DIR" -maxdepth 1 -type f -name '*.json' -print0 | sort -z)
  if [[ ${#EN_FILES[@]} -eq 0 ]]; then
    echo "error: messages/en/ has no *.json catalog files — nothing to compare against." >&2
    exit 2
  fi
fi

echo "Locale registry: ${LOCALES[*]}"
echo "Layout: $LAYOUT"
if [[ "$LAYOUT" == "split" ]]; then
  echo "Canonical catalogs (en): ${EN_FILES[*]}"
fi
echo

MISSING=0
for locale in "${LOCALES[@]}"; do
  if [[ "$locale" == "en" ]]; then
    continue
  fi
  if [[ "$LAYOUT" == "flat" ]]; then
    target_file="$MESSAGES_DIR/$locale.json"
    if [[ ! -f "$target_file" ]]; then
      echo "✗ missing file: $target_file" >&2
      echo "  seed a stub ({}) or remove the '$locale' entry from LOCALE_REGISTRY." >&2
      MISSING=$((MISSING + 1))
    fi
    continue
  fi
  target_dir="$MESSAGES_DIR/$locale"
  if [[ ! -d "$target_dir" ]]; then
    echo "✗ missing directory: $target_dir" >&2
    echo "  seed stub catalogs or remove the '$locale' entry from LOCALE_REGISTRY." >&2
    MISSING=$((MISSING + 1))
    continue
  fi
  for f in "${EN_FILES[@]}"; do
    if [[ ! -f "$target_dir/$f" ]]; then
      echo "✗ missing file: $target_dir/$f" >&2
      MISSING=$((MISSING + 1))
    fi
  done
done

if [[ "$MISSING" -gt 0 ]]; then
  echo
  echo "FAIL: $MISSING catalog file(s) missing. See features#344." >&2
  exit 1
fi

echo "OK: every registered locale has a catalog directory covering the en set."
exit 0
