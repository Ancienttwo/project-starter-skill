#!/bin/bash
# Atomic Commit Hook — PostToolUse on Bash
# Commits a minimal checkpoint after successful green checks.

set -u

TOOL_OUTPUT="${1:-}"
EXIT_CODE="${2:-1}"
TOOL_INPUT="${3:-${TOOL_INPUT:-}}"
MARKER=".claude/.atomic_pending"

# Only continue on successful commands.
if [[ "$EXIT_CODE" != "0" ]]; then
  exit 0
fi

# Only checkpoint after explicit validation commands.
if ! echo "$TOOL_INPUT" | grep -Eiq "(^|[[:space:]])(test|typecheck|lint|build)([[:space:]]|$)"; then
  exit 0
fi

# Need pending mutations marker.
if [[ ! -f "$MARKER" ]]; then
  exit 0
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  rm -f "$MARKER" >/dev/null 2>&1 || true
  exit 0
fi

# No changed files => clear marker and exit.
if git diff --quiet && git diff --cached --quiet; then
  rm -f "$MARKER" >/dev/null 2>&1 || true
  exit 0
fi

git add -A
STAMP="$(date "+%Y-%m-%d %H:%M:%S")"
if git commit -m "chore(atom): checkpoint $STAMP" >/dev/null 2>&1; then
  echo "✅ Atomic checkpoint committed: $STAMP"
  rm -f "$MARKER" >/dev/null 2>&1 || true
else
  echo "⚠️ Atomic checkpoint commit skipped (commit failed)."
fi

exit 0
