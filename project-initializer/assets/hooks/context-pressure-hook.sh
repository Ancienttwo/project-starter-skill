#!/bin/bash
# Context Pressure Hook — PostToolUse (all tools)
# Tracks tool call count as a proxy for context usage and warns at thresholds.
#
# Limitations: Tool call count is a rough proxy for context %.
# Hooks cannot programmatically trigger /compact or start new sessions.
# This hook does: Track → Warn → Prepare handoff summary.

COUNTER_FILE=".claude/.tool-call-count"

# Ensure directory exists
mkdir -p .claude

# Initialize or increment counter
if [[ -f "$COUNTER_FILE" ]]; then
  COUNT=$(cat "$COUNTER_FILE")
  COUNT=$((COUNT + 1))
else
  COUNT=1
fi
echo "$COUNT" > "$COUNTER_FILE"

# Yellow zone warning
if [[ "$COUNT" -eq 30 ]]; then
  echo "[ContextMonitor] Yellow zone (~40-50%). Finish current subtask, then /compact"
fi

# Red zone warning + auto-generate handoff skeleton
if [[ "$COUNT" -eq 50 ]]; then
  echo "[ContextMonitor] Red zone (~60%+). STOP. Generate handoff summary NOW."
fi

if [[ "$COUNT" -ge 50 ]]; then
  # Auto-generate a git-diff-based handoff skeleton
  HANDOFF_FILE=".claude/.session-handoff.md"
  {
    echo "## Session Handoff Summary (auto-generated)"
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
    echo "**Tool calls this session**: $COUNT"
    echo ""
    echo "> Edit this file with task context, then paste into a new session."
  } > "$HANDOFF_FILE"
fi
