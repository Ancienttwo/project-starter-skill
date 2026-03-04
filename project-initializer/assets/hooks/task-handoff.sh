#!/bin/bash
# Task Handoff Hook — PostToolUse(Edit|Write)
# Generates a task-scoped handoff summary when completed checklist count increases.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
. "$SCRIPT_DIR/hook-input.sh"

FILE_PATH="$(hook_get_file_path "${1:-}")"

if [[ "$FILE_PATH" != "tasks/todo.md" ]]; then
  exit 0
fi

if [[ ! -f "tasks/todo.md" ]]; then
  exit 0
fi

mkdir -p .claude

STATE_FILE=".claude/.task-state.json"
HANDOFF_FILE=".claude/.task-handoff.md"

total_tasks="$(grep -E '^[[:space:]]*-[[:space:]]\[[ xX]\][[:space:]]+' tasks/todo.md | wc -l | tr -d ' ')"
done_tasks="$(grep -E '^[[:space:]]*-[[:space:]]\[[xX]\][[:space:]]+' tasks/todo.md | wc -l | tr -d ' ')"

prev_done=0
if [[ -f "$STATE_FILE" ]]; then
  if command -v jq >/dev/null 2>&1; then
    prev_done="$(jq -r '.done_tasks // 0' "$STATE_FILE" 2>/dev/null || echo 0)"
  else
    prev_done="$(grep -Eo '"done_tasks":[[:space:]]*[0-9]+' "$STATE_FILE" | grep -Eo '[0-9]+' | head -1)"
    prev_done="${prev_done:-0}"
  fi
fi

if [[ "$done_tasks" -le "$prev_done" ]]; then
  cat > "$STATE_FILE" <<EOF_STATE
{"done_tasks": $done_tasks, "total_tasks": $total_tasks}
EOF_STATE
  exit 0
fi

just_completed="$(
  grep -E '^[[:space:]]*-[[:space:]]\[[xX]\][[:space:]]+' tasks/todo.md \
    | sed -E 's/^[[:space:]]*-[[:space:]]\[[xX]\][[:space:]]+//' \
    | tail -1
)"
just_completed="${just_completed:-Task completed}"

remaining_tasks="$(
  grep -E '^[[:space:]]*-[[:space:]]\[[[:space:]]\][[:space:]]+' tasks/todo.md \
    | sed -E 's/^[[:space:]]*-[[:space:]]\[[[:space:]]\][[:space:]]+/- [ ] /'
)"

if [[ -z "$remaining_tasks" ]]; then
  remaining_tasks="- [ ] (none)"
fi

diff_stat="$(git diff --shortstat HEAD 2>/dev/null | tr -d '\n')"
diff_stat="${diff_stat:-no uncommitted diff against HEAD}"

active_plan="(none)"
if [[ -f "docs/plan.md" ]]; then
  parsed="$(awk -F': ' '/^Current Active Plan:/ {print $2; exit}' docs/plan.md | xargs)"
  if [[ -n "$parsed" ]]; then
    active_plan="$parsed"
  fi
fi

cat > "$HANDOFF_FILE" <<EOF_HANDOFF
# Task Handoff Summary

> **Generated**: $(date '+%Y-%m-%d %H:%M:%S')
> **Progress**: ${done_tasks}/${total_tasks}
> **Active Plan**: ${active_plan}

## Just Completed

- ${just_completed}

## Remaining Tasks

${remaining_tasks}

## Working Tree Snapshot

- ${diff_stat}
EOF_HANDOFF

cat > "$STATE_FILE" <<EOF_STATE
{"done_tasks": $done_tasks, "total_tasks": $total_tasks}
EOF_STATE

echo "[TaskHandoff] Task completion advanced (${done_tasks}/${total_tasks}). Wrote ${HANDOFF_FILE}."

