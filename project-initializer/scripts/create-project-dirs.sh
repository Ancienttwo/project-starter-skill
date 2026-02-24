#!/bin/bash
# Create standard project directory structure
# Usage: bash scripts/create-project-dirs.sh
#
# Creates the three-layer project structure:
#   IMMUTABLE LAYER (资产层): specs, contracts, tests
#   MUTABLE LAYER (厕纸层): src
#   SUPPORTING (支撑层): docs, scripts, .ops, artifacts, tasks

set -euo pipefail

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
mkdir -p tasks
mkdir -p scripts
mkdir -p .ops/database
mkdir -p .ops/secrets
mkdir -p artifacts

# ===== Initial Files =====
touch docs/PROGRESS.md
touch docs/CHANGELOG.md
touch docs/TODO.md
touch docs/plan.md
touch docs/brief.md
touch docs/tech-stack.md
touch docs/decisions.md

touch docs/reference-configs/changelog-versioning.yaml.md
touch docs/reference-configs/git-strategy.yaml.md
touch docs/reference-configs/release-deploy.yaml.md
touch docs/reference-configs/ai-workflows.yaml.md

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

cat > docs/TODO.md << 'DOCS_TODO_EOF'
# TODO List (Legacy Compatibility)

This file is retained for backward compatibility.
Primary execution checklist lives in `tasks/todo.md`.
DOCS_TODO_EOF

cat > docs/plan.md << 'DOCS_PLAN_EOF'
# Deep Plan Notes (Compatibility)

Use this file for detailed architecture/spec context.
Primary execution checklist lives in `tasks/todo.md`.
DOCS_PLAN_EOF

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

echo "🗑️  Deleting implementation: src/modules/$MODULE"
rm -rf "src/modules/$MODULE"
mkdir -p "src/modules/$MODULE"

echo "✅ Module $MODULE cleared. Ready for rewrite."
echo ""
echo "Preserved assets:"
echo "  - specs/modules/$MODULE.spec.md"
echo "  - contracts/modules/$MODULE.contract.ts"
echo "  - tests/unit/$MODULE/"
echo "  - tests/integration/$MODULE/"
REGENERATE_EOF
chmod +x scripts/regenerate.sh

touch .ops/.gitkeep
echo "# This folder contains sensitive operations files - DO NOT COMMIT" > .ops/README.md

echo "✅ Project directory structure created successfully."
