---
name: project-initializer
description: |
  Initialize new projects with comprehensive tech stack configuration and vibe coding setup.
  Generates CLAUDE.md (AI development guide), project structure, and initialization scripts
  through guided Q&A.

  Use when:
  - Starting a new React/TypeScript/Node.js project
  - Setting up vibe coding environment for AI-assisted development
  - Need project scaffolding with best practices

  Trigger phrases:
  - "Initialize a new project"
  - "Set up a new React app"
  - "Create project configuration"
  - "Generate CLAUDE.md for my project"
---

# Project Initializer

Initialize projects with comprehensive tech stack and vibe coding configuration.

## Quick Start

For users who know what they want:

```
/project-init --stack vite-tanstack --name my-app --flow full
```

For guided setup, just run `/project-init` and follow the questions.

---

## Quick Mode (`--quick`)

For rapid project initialization with minimal questions (5 questions only):

```
/project-init --quick
```

### Quick Mode Questions

| # | Question | Purpose |
|---|----------|---------|
| Q1 | Project Name | Used for CLAUDE.md header and directory |
| Q2 | Project Type | Determines tech stack (Plan A-K) |
| Q3 | Package Manager | bun / pnpm / npm |
| Q4 | Developer Name | Personalization in CLAUDE.md |
| Q5 | Brief Description | One-line product summary |

### Quick Mode Defaults

When using `--quick`, the following defaults apply:

| Setting | Default Value |
|---------|---------------|
| Service Target | "User" |
| Interaction Style | "Technical, concise" |
| Cloudflare Native | Auto-detected from Plan Type |
| Team Size | Solo (1 person) |
| MVP Scope | Skipped (can add later) |

### Quick vs Full Mode

| Feature | Quick Mode | Full Mode |
|---------|------------|-----------|
| Questions | 5 | 15+ |
| MVP Definition | Skipped | Detailed |
| Architecture Decisions | Defaults | Guided |
| Tech Stack Customization | Plan defaults | Full options |
| Output Structure | **Same** | **Same** |
| Core Philosophy | **Same** | **Same** |

**Important**: Both modes generate identical CLAUDE.md structure with the complete core philosophy (IMMUTABLE/MUTABLE layers). Quick mode just uses sensible defaults for optional questions.

---

## Full Mode (Default)

## Guided Initialization Flow

### Phase 1: Project Basics

**Q0: Your Name**
- Ask for the developer's name or nickname
- This will be used in CLAUDE.md header for personalization
- Example: "哥", "Alex", "Team Lead"

**Q1: Project Name**
- Ask for the project name (kebab-case recommended)
- Default to current directory name if not specified

**Q1.5: Product Brief (产品简介)**
- Ask user to describe the product in 2-5 sentences
- Key questions to guide the user:
  - 这个产品解决什么问题？目标用户是谁？
  - 核心功能有哪些？
  - 有什么独特价值或竞争优势？
- Example response: "一个面向独立开发者的 AI 代码审查工具，通过 Claude 自动分析 PR，识别潜在 bug 和安全问题，比 GitHub Copilot 更专注于代码质量而非代码生成"
- This will be saved to `docs/brief.md`

**Q1.6: MVP Scope (MVP 范围定义)**
- Help user define the minimum viable product scope
- Key questions:
  - 第一版本必须包含的核心功能是什么？（最多 3 个）
  - 哪些功能可以留到后续版本迭代？
  - MVP 的用户验收标准是什么？（用户能完成什么任务算成功？）
- Example response:
  ```
  核心功能 (v1.0):
  1. GitHub PR 自动分析
  2. 安全漏洞检测报告
  3. 一键修复建议

  后续迭代:
  - v1.1: 自定义规则配置
  - v1.2: 团队仪表盘
  - v2.0: CI/CD 集成

  验收标准:
  - 用户可以在 5 分钟内完成首次 PR 分析
  - 检测准确率 > 80%
  ```
- This will be saved to `docs/brief.md` (MVP section)

**Q1.7: Team Size (团队规模)** *(Optional)*
- Ask about team size to influence architecture recommendations
- Options:
  ```
  A) Solo (1人)       → 单体优先，避免过度设计
  B) Small (2-5人)    → 模块化设计，清晰边界
  C) Medium (5-10人)  → 考虑 Monorepo + 模块分离
  D) Large (10+人)    → 微服务架构，需要治理规范
  ```
- This affects architecture recommendations in `docs/decisions.md`

**Q2: Project Type**
```
A) B2B SaaS / Internal Tools     → Plan C: Vite + TanStack Router
B) Traditional Enterprise        → Plan B: UmiJS + Ant Design Pro
C) C-Side with SEO              → Plan A: Remix
D) AI Chat / Assistant App      → Plan C + Ant Design X
E) Mobile App                   → Plan F: Expo + NativeWind
F) Monorepo (Multi-project)     → Plan D: Bun + Turborepo
G) AI Quantitative Trading      → Plan G: FastAPI + Vite Frontend
H) Financial Trading (FIX/RFQ)  → Plan H: FIX/Rust + Hono + Vite
J) AI Coding Agent / TUI Tool   → Plan J: OpenTUI + TypeScript ⭐
K) Custom Configuration         → Manual selection
```

**Q3: Package Manager**
```
A) bun (Fastest, recommended for new projects)
B) pnpm (Stable, great for monorepos)
C) npm (Maximum compatibility)
```

### Phase 2: Tech Stack Details

Based on project type, ask additional questions:

**For B2B SaaS (Plan C):**
- UI Library: shadcn/ui (default) or Ant Design?
- State Management: Zustand (default) or Jotai?
- Backend: Supabase (default), Cloudflare Workers, or Custom API?

**For AI Apps:**
- AI Provider: Claude (default), OpenAI, or Both?
- Streaming support needed? (Yes/No)

**For Mobile:**
- Styling: NativeWind (default) or Tamagui?
- Navigation: Expo Router (default) or React Navigation?

**For AI Quantitative Trading (Plan G):**
- Market Data Provider: Polygon.io, Alpaca, Binance, or Custom?
- Broker Integration: Alpaca (default), Interactive Brokers, or Custom?
- Backtesting Engine: VectorBT (default) or Backtrader?
- AI Integration: Claude (default), OpenAI, or Both?
- Database: TimescaleDB (default) or InfluxDB?

**For Financial Trading Platform (Plan H):**
- Trading Core Language:
  ```
  A) Java + QuickFIX/J    → Best for FIX protocol, Enterprise
  B) Rust + Tokio         → Best for custom binary protocol, Ultra-low latency
  C) Both (Hybrid)        → FIX for exchange, Rust for internal
  ```
- RFQ Support: Yes (default) / No
- Market Data: UDP Multicast (HFT) / WebSocket (Standard) / Both
- Frontend Grid: AG-Grid Enterprise (default) or TanStack Table?

**For AI Coding Agent / TUI Tool (Plan J):**
- TUI Framework:
  ```
  A) OpenTUI (@opentui/react)  → High performance, React patterns (Recommended)
  B) OpenTUI (@opentui/core)   → Maximum performance, signals-based
  C) Ink                       → Simpler, React + Flexbox
  ```
- AI Provider: Claude (default), OpenAI, or Both?
- Features needed:
  - [ ] Multi-session support
  - [ ] Code syntax highlighting
  - [ ] Git integration
  - [ ] LSP support
  - [ ] Theme switching

### Phase 3: Customization

**Q4: Interaction Style**
```
A) 哥 (Chinese casual, Linus Torvalds style)
B) Professional English
C) Custom (specify)
```

**Q5: Code Quality Rules**
Confirm or customize the default rules:
- Max file lines: 800
- Max function lines: 20
- Max nesting levels: 3
- Max branches: 3

**Q6: Additional Prohibitions**
Add project-specific prohibitions beyond defaults:
- Default: No `any`, no `console.log` in production
- Add: (user input)

### Phase 4: Claude Code Plugins & Hooks

**Q7: Install Recommended Plugins**
```
Essential Plugins (strongly recommended):
  ✓ feature-dev        - Guided feature development with architecture focus
  ✓ frontend-design    - Production-grade UI creation with high design quality
  ✓ code-simplifier    - Code simplification and maintainability
  ✓ code-review        - Code quality review for bugs, security issues
  ✓ ast-grep           - AST-based code search (requires CLI: brew install ast-grep)
  ✓ hookify            - ⭐智能Hook管理器，在hooks中自动激活其他skills

Automation Plugins:
  [ ] ralph-loop        - Iterative auto-loop until task complete (TDD workflow)

Optional Plugins:
  [ ] commit-commands   - Git commit utilities
  [ ] pr-review-toolkit - Pull request review
  [ ] security-guidance - Security best practices
  [ ] agent-sdk-dev     - Agent SDK development tools

LSP Plugins (auto-selected based on Q2 Project Type):
  Plan A/C/D/J (React/TS)  → typescript-lsp
  Plan G (Python)          → pyright-lsp
  Plan H (Rust)            → rust-analyzer-lsp
  Plan B (Java)            → jdtls-lsp
  Plan F (Mobile/Expo)     → typescript-lsp

Obsidian Skills (for documentation):
  [ ] obsidian-markdown - Wikilinks, embeds, callouts
  [ ] obsidian-bases    - Structured data syntax
  [ ] json-canvas       - Visual note organization
```

**Q8: Configure Hooks**
```
A) Standard Hooks (recommended)
   → UserPromptSubmit: Quality guard notification
   → PreToolCall: Code modification alerts (Edit/Write)
   → PostToolCall: Test completion notification

B) Minimal Hooks
   → UserPromptSubmit only

C) No Hooks
   → Skip hook configuration

D) Custom Hooks
   → Specify custom hook configuration
```

---

## Output Generation

After collecting all answers, generate:

### 1. CLAUDE.md
Use template from `assets/CLAUDE.template.md` with substitutions:
- `{{USER_NAME}}` → Developer's name/nickname (from Q0)
- `{{PROJECT_NAME}}` → User's project name
- `{{SERVICE_TARGET}}` → Based on interaction style
- `{{TECH_STACK_TABLE}}` → From tech stack selection
- `{{PROHIBITIONS}}` → Merged default + custom
- `{{PROJECT_STRUCTURE}}` → From selected plan template

### 2. docs/brief.md (产品简介 + MVP)

Generate from Q1.5 and Q1.6 user input:

```markdown
# {{PROJECT_NAME}} - 产品简介

## 产品定位

{{PRODUCT_BRIEF}}

## 目标用户

{{TARGET_USERS}}

## 核心功能

{{CORE_FEATURES}}

## 独特价值

{{UNIQUE_VALUE}}

---

## MVP 范围 (v1.0)

### 核心功能

{{MVP_CORE_FEATURES}}

### 后续迭代计划

{{ITERATION_PLAN}}

### 验收标准

{{ACCEPTANCE_CRITERIA}}

---

*Generated: {{DATE}}*
```

### 3. docs/tech-stack.md (技术栈决策)
Generate detailed tech stack documentation:
```markdown
# {{PROJECT_NAME}} - 技术栈

## 架构概览

| 层级 | 技术选型 | 版本 | 选择理由 |
|------|----------|------|----------|
{{TECH_STACK_TABLE_DETAILED}}

## 关键依赖

### 核心框架
{{CORE_DEPENDENCIES}}

### 开发工具
{{DEV_TOOLS}}

## 部署方案 / Deployment
{{DEPLOYMENT_PLAN}}

## 成本预估 / Cost Estimation

| 服务 Service | 免费层 Free Tier | 月成本 (1K MAU) | 月成本 (10K MAU) |
|--------------|------------------|-----------------|------------------|
{{COST_ESTIMATION_TABLE}}

---
*Generated: {{DATE}}*
*Plan: {{PLAN_TYPE}}*
```

### 4. docs/decisions.md (架构决策记录 / ADR)

Generate Architecture Decision Records from project choices:

```markdown
# {{PROJECT_NAME}} - Architecture Decision Records

本文档记录项目的关键技术决策及其理由。
This document records key technical decisions and their rationale.

---

## ADR-001: Tech Stack Selection / 技术栈选择

- **Date / 日期**: {{DATE}}
- **Status / 状态**: Accepted / 已采纳
- **Decider / 决策者**: {{USER_NAME}}

### Context / 上下文

{{PROJECT_BRIEF_SUMMARY}}

### Decision / 决策

选择 **{{PLAN_TYPE}}** 作为项目架构方案。
Selected **{{PLAN_TYPE}}** as the project architecture.

### Rationale / 理由

{{TECH_STACK_RATIONALE}}

### Trade-offs / 权衡

| Alternative / 考虑方案 | Pros / 优点 | Cons / 缺点 | Decision / 决定 |
|------------------------|-------------|-------------|-----------------|
{{ALTERNATIVES_TABLE}}

### Consequences / 后果

- **Positive / 正面**: {{POSITIVE_CONSEQUENCES}}
- **Negative / 负面**: {{NEGATIVE_CONSEQUENCES}}
- **Risks / 风险**: {{RISKS}}

---

## ADR-002: Team Size & Architecture Complexity / 团队规模与架构

- **Date / 日期**: {{DATE}}
- **Status / 状态**: Accepted / 已采纳
- **Team Size / 团队规模**: {{TEAM_SIZE}}

### Decision / 决策

基于团队规模 ({{TEAM_SIZE}})，采用 {{ARCHITECTURE_COMPLEXITY}} 架构策略。
Based on team size ({{TEAM_SIZE}}), adopting {{ARCHITECTURE_COMPLEXITY}} architecture.

### Rationale / 理由

{{TEAM_SIZE_RATIONALE}}

---

## ADR Template / 决策模板

Use this template for future decisions:

\`\`\`markdown
## ADR-XXX: [Title / 标题]

- **Date**: YYYY-MM-DD
- **Status**: Proposed / Accepted / Deprecated / Superseded
- **Decider**: [Name]

### Context
[Background and problem that triggered this decision]

### Decision
[The decision made]

### Rationale
[Why this decision was made]

### Consequences
[Impact of this decision]
\`\`\`

---

*Generated: {{DATE}}*
```

### 5. Project Structure

Create directories:

```bash
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
```

### 6. .gitignore Generation
Generate comprehensive `.gitignore`:
```gitignore
# ===== Operations (sensitive configs) =====
ops/
!ops/.gitkeep

# ===== Build Artifacts =====
artifacts/
dist/
build/
.next/
.nuxt/
.output/
coverage/

# ===== Environment Variables =====
.env
.env.*
!.env.example

# ===== Dependencies =====
node_modules/
.pnpm-store/
bun.lockb

# ===== IDE & OS =====
.DS_Store
.idea/
.vscode/settings.json
*.swp
*.swo

# ===== Logs & Debug =====
*.log
npm-debug.log*
pnpm-debug.log*
debug.log

# ===== Package Archives =====
*.tar.gz
*.tgz
*.zip

# ===== Database =====
*.sqlite
*.db
*.sql.gz

# ===== Secrets & Keys =====
*.pem
*.key
*.p12
secrets/
```

Create `ops/.gitkeep` to preserve empty ops folder structure:
```bash
touch ops/.gitkeep
echo "# This folder contains sensitive operations files - DO NOT COMMIT" > ops/README.md
```

### 7. Init Script (init-project.sh)
Generate executable script with:
- Package installation commands
- shadcn/ui initialization (if applicable)
- Directory structure creation
- Environment file setup

### 8. Plugin Setup (if selected in Q7)
Run `scripts/setup-plugins.sh` to:
- Clone official plugins from `https://github.com/anthropics/claude-plugins-official`
- Clone ast-grep skill from `https://github.com/ast-grep/claude-skill`
- Install selected plugins to `~/.claude/skills/`
- Configure hooks in `~/.claude/settings.json`

### 9. Hook Configuration (if selected in Q8)

Create `.claude/hooks/` directory with development protocol hooks:

```bash
mkdir -p .claude/hooks
```

**pre-code-change.sh** - Warn when modifying asset layer files:
```bash
#!/bin/bash
TOOL_INPUT="$1"
if echo "$TOOL_INPUT" | grep -qE "(\.contract\.|\.spec\.md|/tests/)"; then
  echo "⚠️  警告: 正在修改「资产层」文件"
  echo "   根据开发协议，修改这些文件意味着下游实现需要重写。"
fi
```

**post-bash.sh** - Remind to rewrite when tests fail:
```bash
#!/bin/bash
TOOL_OUTPUT="$1"
EXIT_CODE="$2"
if [ "$EXIT_CODE" != "0" ]; then
  if echo "$TOOL_OUTPUT" | grep -qEi "(FAIL|failed|error.*test)"; then
    echo "🔴 测试失败 - 提醒：失败 = 重写模块，而非打补丁"
  fi
fi
```

**prompt-guard.sh** - Detect bug fix requests:
```bash
#!/bin/bash
PROMPT="$1"
if echo "$PROMPT" | grep -qEi "(fix|修|patch|bug)"; then
  echo "📋 检测到修复请求 - 提醒：先写测试，再删模块重写"
fi
```

Update `.claude/settings.local.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/pre-code-change.sh \"$TOOL_INPUT\"" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/post-bash.sh \"$TOOL_OUTPUT\" \"$EXIT_CODE\"" }]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/prompt-guard.sh \"$PROMPT\"" }]
      }
    ]
  }
}
```

---

## Reference Files

When generating configurations, consult:

**Core References:**
- `references/tech-stacks.md` - Technology stack details and init commands
- `references/best-practices.md` - Observability, testing, state management, engineering standards
- `references/plugins-core.md` - Plugin sources, descriptions, hooks, and installation guide

**Architecture References (by project type):**
- `references/arch/mobile.md` - Mobile APP 架构 (Expo, KMP, Flutter)
- `references/arch/tui.md` - TUI Terminal 架构 (OpenTUI, Ink, Ratatui)
- `references/arch/ai-backend.md` - AI Agent 后端架构 (Bun+Hono, FastAPI)
- `references/arch/toolchain.md` - 工具链推荐 (包管理器, Biome, etc.)
- `references/arch/quant-python.md` - Python 量化金融架构
- `references/arch/crypto-trading.md` - 加密货币量化交易架构
- `references/arch/trading-terminal.md` - Trading Terminal 架构

---

## Example Outputs

### Minimal B2B SaaS Config

```markdown
# my-saas-app Development Guide

> **Service Target**: Development Team
> **Interaction Style**: Professional English
> **Thinking Mode**: ultrathink

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite 6.x + React 19 + TypeScript |
| Routing | TanStack Router |
| Data | TanStack Query + Zustand |
| UI | shadcn/ui + Tailwind CSS |
| Backend | Supabase |
```

### Full Enterprise Config

See `references/tech-stacks.md` for complete examples.

---

## Workflow After Initialization

1. **Run init script**: `bash init-project.sh`
2. **Start development**: Begin coding with your configured environment

---

## Troubleshooting

**Q: CLAUDE.md too long?**
A: Keep under 500 lines. Move detailed docs to `docs/`.


**Q: Bun compatibility issues?**
A: Fall back to pnpm. Check `references/tech-stacks.md`.
