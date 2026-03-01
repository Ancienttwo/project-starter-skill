#!/bin/bash
# Migrate an existing project to project-initializer 2.2.0 conventions.
# - Project hooks source of truth: .claude/settings.json
# - Hook scripts synced from assets/hooks
# - docs/TODO.md removed (tasks/todo.md is canonical)
#
# Usage:
#   bash scripts/migrate-project-template.sh --repo /path/to/repo --dry-run
#   bash scripts/migrate-project-template.sh --repo /path/to/repo --apply

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOK_ASSETS_DIR="$SKILL_ROOT/assets/hooks"

MODE="dry-run"
TARGET_REPO=""

usage() {
  cat <<'EOF'
Usage: migrate-project-template.sh --repo <path> [--dry-run|--apply]

Options:
  --repo <path>  Target repository path
  --dry-run      Print planned changes only (default)
  --apply        Apply changes
  --help         Show help
EOF
}

log() {
  echo "[migrate] $*"
}

run_or_echo() {
  local cmd="$1"
  if [[ "$MODE" == "apply" ]]; then
    eval "$cmd"
  else
    echo "[dry-run] $cmd"
  fi
}

backup_if_exists() {
  local path="$1"
  if [[ -f "$path" ]]; then
    run_or_echo "cp \"$path\" \"$path.bak.$(date +%Y%m%d%H%M%S)\""
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --repo)
        TARGET_REPO="${2:-}"
        shift 2
        ;;
      --dry-run)
        MODE="dry-run"
        shift
        ;;
      --apply)
        MODE="apply"
        shift
        ;;
      --help)
        usage
        exit 0
        ;;
      *)
        echo "Unknown argument: $1" >&2
        usage
        exit 1
        ;;
    esac
  done
}

require_repo() {
  if [[ -z "$TARGET_REPO" ]]; then
    echo "--repo is required" >&2
    usage
    exit 1
  fi

  if [[ ! -d "$TARGET_REPO" ]]; then
    echo "Repo path does not exist: $TARGET_REPO" >&2
    exit 1
  fi
}

migrate_hooks() {
  local repo="$1"
  local project_claude_dir="$repo/.claude"
  local project_hooks_dir="$project_claude_dir/hooks"
  local project_settings="$project_claude_dir/settings.json"
  local project_settings_local="$project_claude_dir/settings.local.json"

  run_or_echo "mkdir -p \"$project_hooks_dir\""

  for hook in "$HOOK_ASSETS_DIR"/*.sh; do
    local hook_name
    hook_name="$(basename "$hook")"
    run_or_echo "cp \"$hook\" \"$project_hooks_dir/$hook_name\""
    if [[ "$MODE" == "apply" ]]; then
      chmod +x "$project_hooks_dir/$hook_name" || true
    fi
  done

  backup_if_exists "$project_settings"

  if [[ "$MODE" == "apply" ]]; then
    if [[ -f "$project_settings" ]] && command -v jq >/dev/null 2>&1; then
      jq -s '.[0] * .[1]' "$project_settings" "$HOOK_ASSETS_DIR/settings.template.json" > "$project_settings.tmp"
      mv "$project_settings.tmp" "$project_settings"
      log "Merged hook template into .claude/settings.json"
    else
      cp "$HOOK_ASSETS_DIR/settings.template.json" "$project_settings"
      log "Wrote .claude/settings.json from template"
    fi
  else
    echo "[dry-run] merge/copy \"$HOOK_ASSETS_DIR/settings.template.json\" -> \"$project_settings\""
  fi

  if [[ -f "$project_settings_local" ]]; then
    if [[ "$MODE" == "apply" ]]; then
      if command -v jq >/dev/null 2>&1; then
        if jq -e '.hooks != null' "$project_settings_local" >/dev/null 2>&1; then
          backup_if_exists "$project_settings_local"
          jq -s '.[0] * {hooks: ((.[0].hooks // {}) * (.[1].hooks // {}))}' \
            "$project_settings" "$project_settings_local" > "$project_settings.tmp"
          mv "$project_settings.tmp" "$project_settings"
          jq 'del(.hooks)' "$project_settings_local" > "$project_settings_local.tmp"
          mv "$project_settings_local.tmp" "$project_settings_local"
          log "Moved hooks from settings.local.json into settings.json"
        fi
      else
        log "jq not found; cannot auto-migrate hooks from settings.local.json"
      fi
    else
      echo "[dry-run] inspect and migrate hooks from \"$project_settings_local\" into \"$project_settings\""
    fi
  fi
}

migrate_docs() {
  local repo="$1"
  local legacy_todo="$repo/docs/TODO.md"

  if [[ -f "$legacy_todo" ]]; then
    if [[ "$MODE" == "apply" ]]; then
      rm -f "$legacy_todo"
      log "Removed legacy docs/TODO.md"
    else
      echo "[dry-run] rm -f \"$legacy_todo\""
    fi
  fi
}

print_report() {
  local repo="$1"
  echo
  echo "=== Migration Report ==="
  echo "Mode: $MODE"
  echo "Repo: $repo"
  echo "- Project hooks synced from: $HOOK_ASSETS_DIR"
  echo "- Team hook config target: .claude/settings.json"
  echo "- Legacy docs/TODO.md: removed when present"
  echo "- If jq is installed, hooks in settings.local.json are merged then removed"
}

main() {
  parse_args "$@"
  require_repo

  TARGET_REPO="$(cd "$TARGET_REPO" && pwd)"
  log "Starting migration ($MODE) for $TARGET_REPO"

  migrate_hooks "$TARGET_REPO"
  migrate_docs "$TARGET_REPO"
  print_report "$TARGET_REPO"
}

main "$@"
