#!/bin/bash
# TDD Guard Hook — PreToolUse on Edit|Write
# Warns when modifying src/ files without corresponding test files

export LC_ALL=C
FILE_PATH="${CLAUDE_FILE_PATH:-}"

[[ -z "$FILE_PATH" ]] && exit 0
[[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx|py)$ ]] && exit 0

# Skip non-logic files
for p in "\.config\." "\.d\.ts$" "types\.ts$" "index\.ts$" "constants\." \
         "\.test\." "\.spec\." "__tests__" "__mocks__" "\.stories\."; do
  [[ "$FILE_PATH" =~ $p ]] && exit 0
done

# Derive expected test path
dir=$(dirname "$FILE_PATH")
name="${FILE_PATH##*/}"; name="${name%.*}"
ext="${FILE_PATH##*.}"

found=false
for candidate in \
  "${dir}/${name}.test.${ext}" \
  "${dir}/__tests__/${name}.test.${ext}" \
  "${dir/\/src\//\/tests\/}/${name}.test.${ext}"; do
  [[ -f "$candidate" ]] && found=true && break
done

if [[ "$found" == false ]]; then
  echo "🧪 TDD Guard: No test file found for $(basename "$FILE_PATH")"
  echo "   📋 Reminder: Write failing test FIRST, then implement"
fi
