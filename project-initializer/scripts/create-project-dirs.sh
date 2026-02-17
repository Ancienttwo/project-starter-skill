#!/bin/bash
# Create standard project directory structure
# Usage: bash scripts/create-project-dirs.sh
#
# Creates the three-layer project structure:
#   IMMUTABLE LAYER (资产层): specs, contracts, tests
#   MUTABLE LAYER (厕纸层): src
#   SUPPORTING (支撑层): docs, scripts, ops, artifacts

set -euo pipefail

# ===== IMMUTABLE LAYER (资产层) =====
# Specs - 功能规格
mkdir -p specs/modules

# Contracts - 接口契约
mkdir -p contracts/modules

# Tests - 测试是真理
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e

# ===== MUTABLE LAYER (厕纸层) =====
# Source - 实现代码（可随时重写）
mkdir -p src/modules

# ===== SUPPORTING (支撑层) =====
# Documentation
mkdir -p docs/architecture
mkdir -p docs/api
mkdir -p docs/guides
mkdir -p docs/archives

# Scripts - 自动化脚本
mkdir -p scripts

# Operations (DO NOT commit)
mkdir -p ops/database
mkdir -p ops/secrets

# Artifacts (DO NOT commit)
mkdir -p artifacts

# ===== Initial Files =====
# Documentation files
touch docs/PROGRESS.md
touch docs/CHANGELOG.md
touch docs/TODO.md
touch docs/brief.md
touch docs/tech-stack.md
touch docs/decisions.md

# Specs overview
cat > specs/overview.md << 'EOF'
# Project Specifications

> **Spec is the Source of Truth. 规格是唯一真理的来源。**

## How to Use

1. Write spec first, then implement
2. Changing spec = rewrite downstream
3. No implementation without spec

## Modules

- Add module specs in `modules/` directory
- Format: `{module-name}.spec.md`
EOF

# Contracts types
cat > contracts/types.ts << 'EOF'
/**
 * Shared Type Definitions
 *
 * IMMUTABLE: Changes here require downstream rewrites
 */

// Add shared types here
export {}
EOF

# Test README
cat > tests/README.md << 'EOF'
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
EOF

# Regenerate script - 一键删除重写模块
cat > scripts/regenerate.sh << 'EOF'
#!/bin/bash
# Regenerate a module: delete implementation, keep spec/contract/tests
# Usage: ./scripts/regenerate.sh <module-name>

MODULE=$1

if [ -z "$MODULE" ]; then
  echo "Usage: ./scripts/regenerate.sh <module-name>"
  echo "Example: ./scripts/regenerate.sh auth"
  exit 1
fi

# Check if module exists
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
EOF
chmod +x scripts/regenerate.sh

# Ops .gitkeep
touch ops/.gitkeep
echo "# This folder contains sensitive operations files - DO NOT COMMIT" > ops/README.md

echo "✅ Project directory structure created successfully."
