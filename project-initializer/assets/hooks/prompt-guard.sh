#!/bin/bash
# Prompt Guard Hook — UserPromptSubmit
# Detects bug-fix / feature requests and injects TDD/BDD context.
# Detects plan/task annotation changes and enforces "don't implement yet".

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
. "$SCRIPT_DIR/hook-input.sh"

PROMPT_TEXT="$(hook_get_prompt "${1:-}")"

is_git_repo() {
  git rev-parse --is-inside-work-tree >/dev/null 2>&1
}

has_changes() {
  local file="$1"
  local dirty staged

  if ! is_git_repo; then
    return 1
  fi

  dirty=$(git diff --name-only 2>/dev/null | grep -Fx "$file" | wc -l | tr -d ' ')
  staged=$(git diff --name-only --cached 2>/dev/null | grep -Fx "$file" | wc -l | tr -d ' ')

  if [ "$dirty" -gt 0 ] || [ "$staged" -gt 0 ]; then
    return 0
  fi
  return 1
}

if ! echo "$PROMPT_TEXT" | grep -qEi "(implement|execute|build it|do it|实现|执行|开始写|动手)"; then
  if [ -f "tasks/todo.md" ] && has_changes "tasks/todo.md"; then
    echo "[PlanGuard] tasks/todo.md has been modified. Read annotations and update the plan. Do not implement yet."
  fi

  if [ -f "tasks/lessons.md" ] && has_changes "tasks/lessons.md"; then
    echo "[LessonGuard] tasks/lessons.md has updates. Review prevention rules before coding."
  fi

  if [ -f "docs/plan.md" ] && has_changes "docs/plan.md"; then
    echo "[PlanGuard] docs/plan.md changed (compatibility deep notes). Sync with tasks/todo.md before implementing."
  fi
fi

# --- TDD/BDD Context Injection ---
if echo "$PROMPT_TEXT" | grep -qEi "(fix|patch|bug|修复|修bug|修 bug|改bug)"; then
  echo "[TDD] Bug-fix intent detected. Reproduce with a failing test first."
  echo "  检测到修复请求：先写失败测试复现问题，再重写实现。"
fi
if echo "$PROMPT_TEXT" | grep -qEi "(new feature|feature|implement|build|新功能|实现|开发功能|执行)"; then
  echo "[BDD] Feature intent detected. Define Given-When-Then acceptance scenarios first."
  echo "  检测到新功能请求：先定义 Given-When-Then 验收场景。"
fi
