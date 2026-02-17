#!/bin/bash
# Pre-Code Change Hook — PreToolUse on Edit|Write
# Warns when modifying asset layer files (contracts, specs, tests)

TOOL_INPUT="$1"
if echo "$TOOL_INPUT" | grep -qE "(\.contract\.|\.spec\.md|/tests/)"; then
  echo "⚠️  警告: 正在修改「资产层」文件"
  echo "   根据开发协议，修改这些文件意味着下游实现需要重写。"
fi
