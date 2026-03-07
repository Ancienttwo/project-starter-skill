#!/bin/bash
# Prompt Guard Hook — UserPromptSubmit
# Detects bug-fix / feature requests and injects TDD/BDD context.
# Detects research/plan annotation changes and enforces "don't implement yet".

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
. "$SCRIPT_DIR/hook-input.sh"

PROMPT_TEXT="$(hook_get_prompt "${1:-}")"
CHANGED_PATHS=""
CHANGED_PATHS_READY=0

is_git_repo() {
  git rev-parse --is-inside-work-tree >/dev/null 2>&1
}

load_changed_paths() {
  if [[ "$CHANGED_PATHS_READY" -eq 1 ]]; then
    return
  fi

  CHANGED_PATHS_READY=1
  if ! is_git_repo; then
    return
  fi

  CHANGED_PATHS="$(
    git status --porcelain=v1 --untracked-files=no 2>/dev/null \
      | awk '{
          path = substr($0, 4)
          rename_idx = index(path, " -> ")
          if (rename_idx > 0) {
            path = substr(path, rename_idx + 4)
          }
          print path
        }'
  )"
}

has_changes() {
  local file="$1"

  load_changed_paths

  if [[ -n "$CHANGED_PATHS" ]] && printf '%s\n' "$CHANGED_PATHS" | grep -Fxq -- "$file"; then
    return 0
  fi
  return 1
}

has_changes_glob() {
  local pattern="$1"
  local changed

  load_changed_paths

  changed="$(printf '%s\n' "$CHANGED_PATHS" | grep -E "$pattern" | head -1)"

  if [ -n "$changed" ]; then
    printf '%s' "$changed"
    return 0
  fi
  return 1
}

is_implement_intent() {
  echo "$PROMPT_TEXT" | grep -qEi "(implement|execute|build it|do it|实现|执行|开始写|动手)"
}

is_done_intent() {
  echo "$PROMPT_TEXT" | grep -qEi "(done|complete|completed|finished|mark done|完成|结束|收工)"
}

is_spa_day_intent() {
  echo "$PROMPT_TEXT" | grep -qEi "(spa day|audit rules|consolidate|cleanup rules|规则清理|规则审计|合并规则|瘦身)"
}

get_latest_plan() {
  local latest
  latest="$(find plans -maxdepth 1 -type f -name 'plan-*.md' 2>/dev/null | sort | tail -1)"
  if [ -n "$latest" ]; then
    printf '%s' "$latest"
    return 0
  fi
  return 1
}

get_active_plan() {
  get_latest_plan
}

get_plan_status() {
  local plan_file="$1"
  awk '/\*\*Status\*\*:/ {sub(/^.*\*\*Status\*\*: */, ""); gsub(/\r/, ""); print; exit}' "$plan_file" | xargs
}

get_todo_source_plan() {
  if [ ! -f "tasks/todo.md" ]; then
    return 1
  fi

  awk -F': ' '/^\> \*\*Source Plan\*\*:/ {print $2; exit}' tasks/todo.md | xargs
}

derive_contract_path() {
  local plan_file="$1"
  local base slug

  base="$(basename "$plan_file")"
  slug="$(printf '%s' "$base" | sed -E 's/^plan-[0-9]{8}-[0-9]{4}-//; s/\.md$//')"

  if [ -z "$slug" ] || [ "$slug" = "$base" ]; then
    return 1
  fi

  printf 'tasks/contracts/%s.contract.md' "$slug"
}

implement_intent=0
if is_implement_intent; then
  implement_intent=1
fi

done_intent=0
if is_done_intent; then
  done_intent=1
fi

if [ "$implement_intent" -eq 0 ]; then
  if [ -f "tasks/todo.md" ] && has_changes "tasks/todo.md"; then
    echo "[PlanGuard] tasks/todo.md has been modified. Read annotations and update the plan. Do not implement yet."
  fi

  if [ -f "tasks/lessons.md" ] && has_changes "tasks/lessons.md"; then
    echo "[LessonGuard] tasks/lessons.md has updates. Review prevention rules before coding."
  fi

  if [ -f "tasks/research.md" ] && has_changes "tasks/research.md"; then
    echo "[ResearchGuard] tasks/research.md updated. Review research deeply before planning or implementation."
  fi

  changed_plan="$(has_changes_glob '^plans/plan-.*\.md$' || true)"
  if [ -n "$changed_plan" ]; then
    echo "[AnnotationGuard] ${changed_plan} has annotations. Process all notes and revise. Do not implement yet."
  fi
fi

if [ "$implement_intent" -eq 1 ]; then
  active_plan="$(get_active_plan || true)"
  if [ -z "$active_plan" ] || [ ! -f "$active_plan" ]; then
    echo "[PlanStatusGuard] No active plan found in plans/. Run: bash scripts/ensure-task-workflow.sh --slug <slug> --title <title>"
    exit 1
  fi

  plan_status="$(get_plan_status "$active_plan")"
  if [ "$plan_status" = "Draft" ] || [ "$plan_status" = "Annotating" ]; then
    echo "[PlanStatusGuard] Plan status is '$plan_status' in $active_plan. Complete annotation cycle first."
    exit 1
  fi

  if [ "$plan_status" = "Approved" ] || [ "$plan_status" = "Executing" ]; then
    todo_source="$(get_todo_source_plan || true)"
    if [ "$todo_source" != "$active_plan" ]; then
      echo "[TodoGuard] Active plan is '$plan_status' in $active_plan but tasks/todo.md is not synchronized."
      echo "[TodoGuard] Run: bash scripts/plan-to-todo.sh --plan $active_plan"
      exit 1
    fi
  fi
fi

if [ "$done_intent" -eq 1 ]; then
  active_plan="$(get_active_plan || true)"
  if [ -z "$active_plan" ] || [ ! -f "$active_plan" ]; then
    echo "[ContractGuard] Done intent detected, but no active plan found. Complete plan workflow first."
    exit 1
  fi

  contract_file="$(derive_contract_path "$active_plan" || true)"
  if [ -z "$contract_file" ]; then
    echo "[ContractGuard] Could not derive contract path from plan: $active_plan"
    exit 1
  fi

  if [ ! -f "$contract_file" ]; then
    echo "[ContractGuard] Missing task contract: $contract_file"
    exit 1
  fi

  if [ -f "scripts/verify-contract.sh" ]; then
    if ! bash "scripts/verify-contract.sh" --contract "$contract_file" --strict; then
      echo "[ContractGuard] Contract verification failed: $contract_file"
      exit 1
    fi
  else
    echo "[ContractGuard] verify-contract.sh not found at scripts/verify-contract.sh (degraded mode: skipping strict verification)."
  fi
fi

if is_spa_day_intent; then
  if [ -f "docs/reference-configs/spa-day-protocol.md" ]; then
    echo "[SpaDay] Follow docs/reference-configs/spa-day-protocol.md for consolidation."
  else
    echo "[SpaDay] spa-day protocol missing. Add docs/reference-configs/spa-day-protocol.md."
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
