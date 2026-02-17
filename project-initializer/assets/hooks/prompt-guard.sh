#!/bin/bash
# Prompt Guard Hook — UserPromptSubmit
# Detects bug fix / new feature requests and injects TDD/BDD context
# Detects plan.md annotation changes and enforces "don't implement yet"

PROMPT="$1"

# --- Plan Annotation Detection ---
# Check if docs/plan.md has uncommitted user modifications
if [ -f "docs/plan.md" ]; then
  PLAN_DIRTY=$(git diff --name-only 2>/dev/null | grep -c "docs/plan.md")
  PLAN_UNSTAGED=$(git diff --name-only --cached 2>/dev/null | grep -c "docs/plan.md")
  if [ "$PLAN_DIRTY" -gt 0 ] || [ "$PLAN_UNSTAGED" -gt 0 ]; then
    # Only warn if user is NOT explicitly saying "implement"
    if ! echo "$PROMPT" | grep -qEi "(implement|实现|execute|执行|build it|do it)"; then
      echo "📋 docs/plan.md has been modified. Read annotations and update the plan. Don't implement yet."
    fi
  fi
fi

# --- TDD/BDD Context Injection ---
if echo "$PROMPT" | grep -qEi "(fix|修|patch|bug)"; then
  echo "📋 检测到修复请求 - 提醒：先写测试复现 bug，再删模块重写"
fi
if echo "$PROMPT" | grep -qEi "(new feature|新功能|implement|实现)"; then
  echo "📋 检测到新功能请求 - 提醒：先定义 Given-When-Then 验收标准"
fi
