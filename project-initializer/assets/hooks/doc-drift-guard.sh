#!/bin/bash
# Doc Drift Guard — PostToolUse on Edit|Write
# Detects structural changes that may require docs update
#
# Triggers when:
# 1. package.json exports changed → docs/packages.md may be stale
# 2. New directory created under packages/ or apps/ → docs/architecture.md may be stale
# 3. New hook or component directory created → docs/packages.md may be stale
# 4. tsconfig or metro config changed → docs/guides/ may be stale
# 5. turbo.json changed → docs/architecture.md pipeline may be stale
#
# Customization notes:
# - For non-monorepo projects (Plans A/B/C/E/F without packages/), remove triggers #1 and #2
# - For non-Expo projects, remove the Metro config trigger (#4)
# - For non-Turborepo projects, remove trigger #5
# - The hook is additive — it only prints reminders, never blocks

export LC_ALL=C
FILE_PATH="${CLAUDE_FILE_PATH:-}"

[[ -z "$FILE_PATH" ]] && exit 0

BASENAME=$(basename "$FILE_PATH")
DIRNAME=$(dirname "$FILE_PATH")

# 1. package.json exports 变更 → packages.md 可能过时
if [[ "$BASENAME" == "package.json" ]] && echo "$DIRNAME" | grep -q "packages/"; then
  PKG_NAME=$(echo "$DIRNAME" | grep -oP 'packages/[^/]+' | head -1)
  if [[ -n "$PKG_NAME" ]]; then
    echo "[DocDrift] $PKG_NAME/package.json changed"
    echo "   Check: docs/packages.md exports table may need updating"
  fi
fi

# 2. 新模块目录 (packages/*/src/ 下新增子目录)
if echo "$FILE_PATH" | grep -qE "packages/[^/]+/src/[^/]+/index\.ts$"; then
  MODULE=$(echo "$FILE_PATH" | grep -oP 'packages/[^/]+/src/\K[^/]+')
  PKG=$(echo "$FILE_PATH" | grep -oP 'packages/\K[^/]+')
  echo "[DocDrift] New module '$MODULE' in $PKG"
  echo "   Check: docs/packages.md and docs/architecture.md may need updating"
fi

# 3. apps 结构变更 (新增 app 路由或组件目录)
if echo "$FILE_PATH" | grep -qE "apps/[^/]+/src/(app|components|hooks)/[^/]+/"; then
  echo "[DocDrift] App structure changed: $FILE_PATH"
  echo "   Check: docs/architecture.md source tree may need updating"
fi

# 4. Metro 或 tsconfig 配置变更
if [[ "$BASENAME" == "metro.config.js" ]] || [[ "$BASENAME" == "metro.config.ts" ]]; then
  echo "[DocDrift] Metro config changed"
  echo "   Check: docs/guides/metro-esm-gotchas.md may need updating"
fi

if [[ "$BASENAME" == "tsconfig.json" ]] && echo "$DIRNAME" | grep -qE "(packages|apps)/"; then
  echo "[DocDrift] TypeScript config changed in $(basename "$DIRNAME")"
  echo "   Check: docs/packages.md may need updating"
fi

# 5. turbo.json 变更
if [[ "$BASENAME" == "turbo.json" ]]; then
  echo "[DocDrift] Turborepo config changed"
  echo "   Check: docs/architecture.md pipeline section may need updating"
fi
