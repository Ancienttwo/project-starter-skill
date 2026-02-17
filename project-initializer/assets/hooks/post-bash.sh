#!/bin/bash
# Post-Bash Hook — PostToolUse on Bash
# Reminds to rewrite (not patch) when tests fail

TOOL_OUTPUT="$1"
EXIT_CODE="$2"
if [ "$EXIT_CODE" != "0" ]; then
  if echo "$TOOL_OUTPUT" | grep -qEi "(FAIL|failed|error.*test)"; then
    echo "🔴 测试失败 - 提醒：失败 = 重写模块，而非打补丁"
  fi
fi
