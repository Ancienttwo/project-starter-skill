#!/bin/bash
# Create standard project directory structure
# Usage: bash scripts/create-project-dirs.sh
#
# Creates the three-layer project structure:
#   IMMUTABLE LAYER (资产层): specs, contracts, tests
#   MUTABLE LAYER (厕纸层): src
#   SUPPORTING (支撑层): docs, scripts, .ops, artifacts, tasks, plans

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASSETS_TEMPLATES_DIR="$SCRIPT_DIR/../assets/templates"

write_runtime_gitignore_block() {
  local gitignore_file=".gitignore"
  local begin_marker="# BEGIN: claude-runtime-temp (managed by project-initializer)"
  local end_marker="# END: claude-runtime-temp"

  local block
  block=$(cat <<'BLOCK_EOF'
# BEGIN: claude-runtime-temp (managed by project-initializer)
.claude/settings.local.json
.claude/.atomic_pending
.claude/.session-id
.claude/.tool-call-count
.claude/.session-handoff.md
.claude/.context-pressure/
.claude/*.tmp
.claude/*.bak
.claude/*.bak.*
.claude/*.backup-*
# END: claude-runtime-temp
BLOCK_EOF
)

  if [ ! -f "$gitignore_file" ]; then
    cat > "$gitignore_file" <<'GITIGNORE_EOF'
# Dependencies
node_modules/

# Build artifacts
artifacts/
coverage/
*.tar.gz
*.tgz

# Environment
.env
.env.*
!.env.example

# OS metadata
.DS_Store
GITIGNORE_EOF
  fi

  if ! grep -Fq "$begin_marker" "$gitignore_file"; then
    printf "\n%s\n" "$block" >> "$gitignore_file"
    return
  fi

  local tmp_file
  tmp_file="$(mktemp)"
  awk -v begin="$begin_marker" -v end="$end_marker" -v repl="$block" '
    $0 == begin {
      print repl
      skipping = 1
      next
    }
    skipping && $0 == end {
      skipping = 0
      next
    }
    !skipping { print }
  ' "$gitignore_file" > "$tmp_file"
  mv "$tmp_file" "$gitignore_file"
}

write_plan_pointer() {
  local active_plan="${1:-}"
  mkdir -p docs
  cat > docs/plan.md <<EOF_POINTER
# Plan Pointer (Compatibility)

Active plans live in \`plans/\`. Create new plans with:
  bash scripts/new-plan.sh --slug my-feature

Current Active Plan: ${active_plan:-\(none\)}
EOF_POINTER
}

write_templates() {
  mkdir -p .claude/templates

  cat > .claude/templates/research.template.md <<'RESEARCH_TEMPLATE_EOF'
# {{PROJECT_NAME}} — Research Notes

> **Last Updated**: {{DATE}}
> **Scope**: (what area of the codebase was researched)

## Codebase Map
| File | Purpose | Key Exports |
|------|---------|-------------|

## Architecture Observations
### Patterns & Conventions
### Implicit Contracts
### Edge Cases & Intricacies

## Technical Debt / Risks

## Research Conclusions
### What to Preserve
### What to Change
### Open Questions
RESEARCH_TEMPLATE_EOF

  cat > .claude/templates/plan.template.md <<'PLAN_TEMPLATE_EOF'
# Plan: {{TITLE}}

> **Status**: Draft
> **Created**: {{TIMESTAMP}}
> **Research**: See `tasks/research.md`

## Approach
### Strategy
### Trade-offs
| Option | Pros | Cons | Decision |
|--------|------|------|----------|

## Detailed Design
### File Changes
| File | Action | Description |
|------|--------|-------------|

### Code Snippets
### Data Flow

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|

## Annotations
<!-- [NOTE]: prefixed inline. Claude processes all and revises. -->

## Task Breakdown
- [ ] ...
PLAN_TEMPLATE_EOF
}

install_workflow_helpers() {
  mkdir -p scripts

  if [[ -d "$ASSETS_TEMPLATES_DIR/helpers" ]]; then
    cp "$ASSETS_TEMPLATES_DIR/helpers/"*.sh scripts/ 2>/dev/null || true
    chmod +x scripts/new-plan.sh scripts/plan-to-todo.sh scripts/archive-workflow.sh 2>/dev/null || true
    return
  fi

  cat > scripts/new-plan.sh <<'NEW_PLAN_STUB_EOF'
#!/bin/bash
set -euo pipefail
echo "Missing helper template: new-plan.sh"
exit 1
NEW_PLAN_STUB_EOF

  cat > scripts/plan-to-todo.sh <<'PLAN_TO_TODO_STUB_EOF'
#!/bin/bash
set -euo pipefail
echo "Missing helper template: plan-to-todo.sh"
exit 1
PLAN_TO_TODO_STUB_EOF

  cat > scripts/archive-workflow.sh <<'ARCHIVE_WORKFLOW_STUB_EOF'
#!/bin/bash
set -euo pipefail
echo "Missing helper template: archive-workflow.sh"
exit 1
ARCHIVE_WORKFLOW_STUB_EOF

  chmod +x scripts/new-plan.sh scripts/plan-to-todo.sh scripts/archive-workflow.sh
}

# ===== IMMUTABLE LAYER (资产层) =====
mkdir -p specs/modules
mkdir -p contracts/modules
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e

# ===== MUTABLE LAYER (厕纸层) =====
mkdir -p src/modules

# ===== SUPPORTING (支撑层) =====
mkdir -p docs/architecture
mkdir -p docs/api
mkdir -p docs/guides
mkdir -p docs/archives
mkdir -p docs/reference-configs
mkdir -p tasks/archive
mkdir -p plans/archive
mkdir -p scripts
mkdir -p .claude/hooks
mkdir -p .ops/database
mkdir -p .ops/secrets
mkdir -p artifacts

# ===== Initial Files =====
touch docs/PROGRESS.md
touch docs/CHANGELOG.md
touch docs/brief.md
touch docs/tech-stack.md
touch docs/decisions.md

touch docs/reference-configs/changelog-versioning.yaml.md
touch docs/reference-configs/git-strategy.yaml.md
touch docs/reference-configs/release-deploy.yaml.md
touch docs/reference-configs/ai-workflows.yaml.md
touch docs/reference-configs/coding-standards.md
touch docs/reference-configs/development-protocol.md
touch docs/reference-configs/workflow-orchestration.md

cat > tasks/todo.md << 'TASK_TODO_EOF'
# Task Execution Checklist (Primary)

## Plan
- [ ] Define scope and acceptance criteria
- [ ] Break down into checkable tasks

## Execution
- [ ] Implement task 1
- [ ] Implement task 2

## Review Section
- Verification evidence:
- Behavior diff notes:
- Risks / follow-ups:
TASK_TODO_EOF

cat > tasks/lessons.md << 'TASK_LESSONS_EOF'
# Lessons Learned (Self-Improvement Loop)

## Template
- Date:
- Triggered by correction:
- Mistake pattern:
- Prevention rule:
- Where to apply next time:
TASK_LESSONS_EOF

cat > tasks/research.md << 'TASK_RESEARCH_EOF'
# Project Research Notes

> **Last Updated**: TBD
> **Scope**: (what area of the codebase was researched)

## Codebase Map
| File | Purpose | Key Exports |
|------|---------|-------------|

## Architecture Observations
### Patterns & Conventions
### Implicit Contracts
### Edge Cases & Intricacies

## Technical Debt / Risks

## Research Conclusions
### What to Preserve
### What to Change
### Open Questions
TASK_RESEARCH_EOF

write_plan_pointer ""
write_templates
write_runtime_gitignore_block

cat > .claude/settings.json << 'PROJECT_SETTINGS_EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "bash .claude/hooks/worktree-guard.sh" },
          { "type": "command", "command": "bash .claude/hooks/tdd-guard-hook.sh" },
          { "type": "command", "command": "bash .claude/hooks/pre-code-change.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "bash .claude/hooks/anti-simplification.sh" },
          { "type": "command", "command": "bash .claude/hooks/doc-drift-guard.sh" },
          { "type": "command", "command": "bash .claude/hooks/atomic-pending.sh" }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "bash .claude/hooks/post-bash.sh" },
          { "type": "command", "command": "bash .claude/hooks/atomic-commit.sh" }
        ]
      },
      {
        "matcher": ".*",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/context-pressure-hook.sh" }]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/prompt-guard.sh" }]
      }
    ]
  }
}
PROJECT_SETTINGS_EOF

cat > specs/overview.md << 'SPECS_OVERVIEW_EOF'
# Project Specifications

> **Spec is the Source of Truth. 规格是唯一真理的来源。**

## How to Use

1. Write spec first, then implement
2. Changing spec = rewrite downstream
3. No implementation without spec

## Modules

- Add module specs in `modules/` directory
- Format: `{module-name}.spec.md`
SPECS_OVERVIEW_EOF

cat > contracts/types.ts << 'CONTRACTS_TYPES_EOF'
/**
 * Shared Type Definitions
 *
 * IMMUTABLE: Changes here require downstream rewrites
 */

// Add shared types here
export {}
CONTRACTS_TYPES_EOF

cat > tests/README.md << 'TESTS_README_EOF'
# Test Directory Structure

> **Test is the new Spec. 测试是唯一的真理。**

## Asset Hierarchy

Tests are IMMUTABLE ASSETS. Implementation is DISPOSABLE.

## Rules

- Test code quantity ≥ Implementation code quantity
- Test failure = Delete module and rewrite
- Never modify tests to make buggy code pass

## Running Tests

```bash
bun test              # Run all tests
bun test --coverage   # With coverage
bun test --watch      # Watch mode
```
TESTS_README_EOF

cat > docs/reference-configs/changelog-versioning.yaml.md << 'REF_CHANGELOG_EOF'
# Changelog & Versioning Reference

Use this file for detailed release-note and semantic-versioning rules.
REF_CHANGELOG_EOF

cat > docs/reference-configs/git-strategy.yaml.md << 'REF_GIT_EOF'
# Git Strategy Reference

Use this file for branch model and commit convention details.
REF_GIT_EOF

cat > docs/reference-configs/release-deploy.yaml.md << 'REF_RELEASE_EOF'
# Release & Deployment Reference

Use this file for release pipeline and deployment trigger details.
REF_RELEASE_EOF

cat > docs/reference-configs/ai-workflows.yaml.md << 'REF_AIWF_EOF'
# AI Workflows Reference

Use this file for extended AI workflow templates and session handoff protocols.
REF_AIWF_EOF

cat > docs/reference-configs/coding-standards.md << 'REF_CODING_STANDARDS_EOF'
# Coding Standards Reference

Use this file for detailed coding constraints and refactor thresholds.
REF_CODING_STANDARDS_EOF

cat > docs/reference-configs/development-protocol.md << 'REF_DEV_PROTOCOL_EOF'
# Development Protocol Reference

Use this file for detailed feature/bug flow playbooks and layer model rules.
REF_DEV_PROTOCOL_EOF

cat > docs/reference-configs/workflow-orchestration.md << 'REF_WORKFLOW_ORCH_EOF'
# Workflow Orchestration Reference

Use this file for advanced plan/execution orchestration patterns.
REF_WORKFLOW_ORCH_EOF

cat > scripts/regenerate.sh << 'REGENERATE_EOF'
#!/bin/bash
# Regenerate a module: delete implementation, keep spec/contract/tests
# Usage: ./scripts/regenerate.sh <module-name>

MODULE=$1

if [ -z "$MODULE" ]; then
  echo "Usage: ./scripts/regenerate.sh <module-name>"
  echo "Example: ./scripts/regenerate.sh auth"
  exit 1
fi

if [ ! -d "src/modules/$MODULE" ]; then
  echo "Module src/modules/$MODULE not found"
  exit 1
fi

echo "Deleting implementation: src/modules/$MODULE"
rm -rf "src/modules/$MODULE"
mkdir -p "src/modules/$MODULE"

echo "Module $MODULE cleared. Ready for rewrite."
echo ""
echo "Preserved assets:"
echo "  - specs/modules/$MODULE.spec.md"
echo "  - contracts/modules/$MODULE.contract.ts"
echo "  - tests/unit/$MODULE/"
echo "  - tests/integration/$MODULE/"
REGENERATE_EOF
chmod +x scripts/regenerate.sh

install_workflow_helpers

touch .ops/.gitkeep
echo "# This folder contains sensitive operations files - DO NOT COMMIT" > .ops/README.md

echo "Project directory structure created successfully."
