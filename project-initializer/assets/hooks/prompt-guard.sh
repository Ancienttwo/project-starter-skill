#!/bin/bash
# Prompt Guard Hook — UserPromptSubmit
# Detects bug fix / new feature requests and injects TDD/BDD context
# Detects plan/task annotation changes and enforces "don't implement yet"

PROMPT="$1"

has_changes() {
  local file="$1"
  local dirty staged

  dirty=$(git diff --name-only 2>/dev/null | grep -Fx "$file" | wc -l | tr -d ' ')
  staged=$(git diff --name-only --cached 2>/dev/null | grep -Fx "$file" | wc -l | tr -d ' ')

  if [ "$dirty" -gt 0 ] || [ "$staged" -gt 0 ]; then
    return 0
  fi
  return 1
}

if ! echo "$PROMPT" | grep -qEi "(implement|实现|execute|执行|build it|do it)"; then
  if [ -f "tasks/todo.md" ] && has_changes "tasks/todo.md"; then
    echo "📋 tasks/todo.md has been modified. Read annotations and update the plan. Don't implement yet."
  fi

  if [ -f "tasks/lessons.md" ] && has_changes "tasks/lessons.md"; then
    echo "🧠 tasks/lessons.md has updates. Review prevention rules before coding."
  fi

  if [ -f "docs/plan.md" ] && has_changes "docs/plan.md"; then
    echo "📎 docs/plan.md changed (compatibility deep notes). Sync with tasks/todo.md before implementing."
  fi
fi

# --- TDD/BDD Context Injection ---
if echo "$PROMPT" | grep -qEi "(fix|修|patch|bug)"; then
  echo "📋 检测到修复请求 - 提醒：先写测试复现 bug，再删模块重写"
fi
if echo "$PROMPT" | grep -qEi "(new feature|新功能|implement|实现)"; then
  echo "📋 检测到新功能请求 - 提醒：先定义 Given-When-Then 验收标准"
fi
