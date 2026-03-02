#!/bin/bash
# Context Pressure Hook — PostToolUse (all tools)
# Tracks tool call count as a context proxy.
# Uses stable session-id files to avoid cross-session accumulation.

set -eo pipefail

# Resolve repo root — hooks may run from any cwd
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || true
if [[ -z "$REPO_ROOT" ]]; then
  REPO_ROOT="$(cd "$SCRIPT_DIR/../.." 2>/dev/null && pwd)" || true
fi
if [[ -n "$REPO_ROOT" ]]; then
  cd "$REPO_ROOT" 2>/dev/null || true
fi

COUNTER_DIR=".claude/.context-pressure"
SESSION_ID_FILE=".claude/.session-id"
mkdir -p "$COUNTER_DIR"

new_session_id() {
  if command -v uuidgen >/dev/null 2>&1; then
    uuidgen
    return
  fi

  printf 'session-%s-%s' "$(date +%Y%m%d%H%M%S)" "$RANDOM"
}

SESSION_KEY="${CLAUDE_SESSION_ID:-${CODEX_SESSION_ID:-${SESSION_KEY:-}}}"
if [[ -z "$SESSION_KEY" ]]; then
  if [[ -s "$SESSION_ID_FILE" ]]; then
    SESSION_KEY="$(cat "$SESSION_ID_FILE" 2>/dev/null || true)"
  fi
fi
if [[ -z "$SESSION_KEY" ]]; then
  SESSION_KEY="$(new_session_id)"
  echo "$SESSION_KEY" > "$SESSION_ID_FILE"
fi

SESSION_SAFE_KEY="$(echo "$SESSION_KEY" | tr -c 'A-Za-z0-9._-' '_')"
COUNT_FILE="$COUNTER_DIR/${SESSION_SAFE_KEY}.count"
WARN_FILE="$COUNTER_DIR/${SESSION_SAFE_KEY}.warned"
RED_FILE="$COUNTER_DIR/${SESSION_SAFE_KEY}.red"

COUNT=0
if [[ -f "$COUNT_FILE" ]]; then
  COUNT="$(cat "$COUNT_FILE" 2>/dev/null || echo 0)"
fi
if ! [[ "$COUNT" =~ ^[0-9]+$ ]]; then
  COUNT=0
fi
COUNT=$((COUNT + 1))

echo "$COUNT" > "$COUNT_FILE"
echo "$COUNT" > ".claude/.tool-call-count"

if [[ "$COUNT" -ge 30 && ! -f "$WARN_FILE" ]]; then
  echo "[ContextMonitor] Yellow zone (~40-50%). Finish current subtask, then /compact."
  touch "$WARN_FILE"
fi

if [[ "$COUNT" -ge 50 && ! -f "$RED_FILE" ]]; then
  echo "[ContextMonitor] Red zone (~60%+). STOP and generate handoff summary now."

  HANDOFF_FILE=".claude/.session-handoff.md"
  {
    echo "## Session Handoff Summary (auto-generated)"
    echo ""
    echo "**Session key**: $SESSION_SAFE_KEY"
    echo "**Tool calls this session**: $COUNT"
    echo ""
    echo "### Files Modified (since last commit)"
    echo '```'
    git diff --stat HEAD 2>/dev/null || echo "(no git repo or no commits)"
    echo '```'
    echo ""
    echo "### Staged Changes"
    echo '```'
    git diff --cached --stat 2>/dev/null || echo "(none)"
    echo '```'
    echo ""
    echo "### Untracked Files"
    echo '```'
    git ls-files --others --exclude-standard 2>/dev/null | head -20 || echo "(none)"
    echo '```'
    echo ""
    echo "> Edit this file with task context, then paste into a new session."
  } > "$HANDOFF_FILE"

  touch "$RED_FILE"
fi
