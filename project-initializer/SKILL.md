---
name: project-initializer
description: |
  Initialize new projects with comprehensive tech stack configuration and vibe coding setup.
  Generates CLAUDE.md/AGENTS.md (AI development guides), project structure, and initialization scripts
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
C) C-Side with SEO (Dynamic)    → Plan A: Remix
D) AI Chat / Assistant App      → Plan C + Ant Design X
E) Landing Page / Marketing      → Plan E2: Astro + Starwind UI ⭐
F) Mobile App                   → Plan F: Expo + NativeWind
G) Monorepo (Multi-project)     → Plan D: Bun + Turborepo
H) AI Quantitative Trading      → Plan G: FastAPI + Vite Frontend
I) Financial Trading (FIX/RFQ)  → Plan H: FIX/Rust + Hono + Vite
J) Web3 DApp (NFT/DeFi/Agent)  → Plan I: Astro Landing + Vite + Wagmi ⭐
K) AI Coding Agent / TUI Tool   → Plan J: OpenTUI + TypeScript ⭐
L) Custom Configuration         → Manual selection
```

**Q3: Package Manager**
```
A) bun (Fastest, default for all new projects) ⭐
B) pnpm (Stable alternative, great for monorepos)
C) npm (Last resort — only when bun/pnpm incompatible, too slow)
```
> **Priority: bun > pnpm > npm**. Use bun unless the framework explicitly requires npm/pnpm.

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
- Styling: NativeWind (default) or HeroUI Native?
- Navigation: Expo Router (default) or React Navigation?

**For Web3 DApp (Plan I):**
- Target Chain: BNB Chain (default), Ethereum, Base, or Other EVM?
- Wallet UI: ConnectKit (default) or RainbowKit?
- Contract Framework: Hardhat (default) or Foundry?
- Need Landing Page? Yes (Astro + Starwind UI) or No (App only)?
- DApp Type: NFT/Marketplace, DeFi, DAO, Agent/NFA, or Custom?

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
- Default: ALWAYS present 2-3 options with trade-offs at ambiguous decision points — never silently choose
- Default: ALWAYS push back on requests that violate CLAUDE.md rules, even if explicitly asked
- Add: (user input)

### Phase 4: Claude Code Plugins & Hooks

**Q7: Install Recommended Plugins**

Auto-selection rules:

| Condition | Auto-selected Plugins |
|-----------|----------------------|
| All projects | feature-dev, frontend-design, code-simplifier, code-review, ast-grep, hookify, agent-browser |
| Cloudflare-native (Plan A/C/D/G/H) | cf-agents-sdk |
| Mobile (Plan F) | expo-app-design, expo-deployment |
| React/TS (Plan A/C/D/J) | typescript-lsp |
| Python (Plan G) | pyright-lsp |
| Rust (Plan H) | rust-analyzer-lsp |
| Java (Plan B) | jdtls-lsp |

Full plugin catalog with descriptions and installation: See `references/plugins-core.md`

**Q8: Configure Hooks**
```
A) Standard Hooks + TDD Guard + Doc Drift + Context Pressure (recommended)
   → UserPromptSubmit: Quality guard + TDD/BDD context injection
   → PreToolUse (Edit|Write): TDD guard — checks test file exists before src modification
   → PostToolUse (Edit|Write): Anti-simplification check + Doc drift guard
   → PostToolUse (*): Performance monitoring + Context pressure tracking

B) Standard Hooks + TDD Guard + Doc Drift (no context pressure)
   → Same as A without PostToolUse(*) context counter

C) Standard Hooks (no TDD guard)
   → UserPromptSubmit: Quality guard notification
   → PostToolUse (Edit|Write): Anti-simplification check + Doc drift guard

D) Minimal Hooks
   → UserPromptSubmit only

E) No Hooks
   → Skip hook configuration

F) Custom Hooks
   → Specify custom hook configuration
```

**Hook files** — Copy from `assets/hooks/` into project's `.claude/hooks/`:

| Asset File | Target | Trigger |
|-----------|--------|---------|
| `assets/hooks/tdd-guard-hook.sh` | `.claude/hooks/tdd-guard-hook.sh` | PreToolUse (Edit\|Write) |
| `assets/hooks/pre-code-change.sh` | `.claude/hooks/pre-code-change.sh` | PreToolUse (Edit\|Write) |
| `assets/hooks/post-bash.sh` | `.claude/hooks/post-bash.sh` | PostToolUse (Bash) |
| `assets/hooks/prompt-guard.sh` | `.claude/hooks/prompt-guard.sh` | UserPromptSubmit (TDD/BDD + plan annotation detection) |
| `assets/hooks/doc-drift-guard.sh` | `.claude/hooks/doc-drift-guard.sh` | PostToolUse (Edit\|Write) |
| `assets/hooks/context-pressure-hook.sh` | `.claude/hooks/context-pressure-hook.sh` | PostToolUse (*) |
| `assets/hooks/settings.template.json` | `.claude/settings.local.json` | — (config) |

Customization notes for doc-drift-guard.sh:
- For non-monorepo projects (Plans A/B/C/E/F without packages/), remove triggers #1 and #2
- For non-Expo projects, remove the Metro config trigger (#4)
- For non-Turborepo projects, remove trigger #5

---

## Output Generation

After collecting all answers, generate:

### 1. CLAUDE.md + AGENTS.md

**Architecture**: Composable partials with runtime assembly.

**CLAUDE Partial Files** (in `assets/partials/`):
```
01-header.partial.md        # Project title + metadata
02-iron-rules.partial.md    # Iron Rules 1-6
03-philosophy.partial.md    # Core philosophy (DO NOT SPLIT)
04-project-structure.partial.md  # Project structure + file management
05-workflow.partial.md      # Plan loop, progress tracking, task protocol
06-cloudflare.partial.md    # Cloudflare deployment (conditional)
07-footer.partial.md        # Deep docs index + first principles
08-orchestration.partial.md # Plan/Subagent/Verification orchestration
```

**AGENTS Partial Files** (in `assets/partials-agents/`):
```
01-header.partial.md
02-operating-mode.partial.md
03-orchestration.partial.md
04-task-protocol.partial.md
05-coding-constraints.partial.md
06-quality-safety.partial.md
07-cloudflare.partial.md    # Cloudflare deployment (conditional)
08-deep-docs.partial.md
```

**Assembly Process**:
1. Concatenate partials in order (see `assets/partials/_assembly-order.md`)
2. Apply conditional logic (`{{#IF CLOUDFLARE_NATIVE}}...{{/IF}}`)
3. Substitute variables with user-provided values
4. Output final CLAUDE.md or AGENTS.md based on target

**Assembly Script**:
```bash
bun scripts/assemble-template.ts --plan C --name "MyProject" --var USER_NAME=Dev
bun scripts/assemble-template.ts --target agents --plan C --name "MyProject"
```

**Variable Substitutions**:
- `{{USER_NAME}}` - Developer's name/nickname (from Q0)
- `{{PROJECT_NAME}}` - User's project name
- `{{SERVICE_TARGET}}` - Based on interaction style
- `{{TECH_STACK_TABLE}}` - From tech stack selection
- `{{PROHIBITIONS}}` - Merged default + custom
- `{{PROJECT_STRUCTURE}}` - From selected plan template
- `{{DEEP_DOCS_TABLE}}` - Documentation index table linking to generated docs
- `{{CALVER_VERSION}}` - CalVer version string (e.g., `v2026.02.0`)

**Conditional Sections**:
- `06-cloudflare.partial.md` included only for: Plan A, C, C+, D, G (partial), H (partial)
- `cf-agents-sdk` skill auto-recommended for: Plan A, C, C+, D, G, H (Cloudflare-native)
- Excluded for: Plan B, E, F, J

**Version Variables** (from `assets/versions.json`):
- `{{VERSION_VITE}}` - Vite version (6.x)
- `{{VERSION_REACT}}` - React version (19)
- `{{VERSION_TYPESCRIPT}}` - TypeScript version (5.x)
- And more... see `assets/versions.json` for full list

### 2-7. Documentation Files

Generate from templates in `assets/templates/`:

| Output File | Template Source | Generated From |
|-------------|---------------|----------------|
| `docs/brief.md` | `assets/templates/brief.template.md` | Q1.5 + Q1.6 input |
| `docs/tech-stack.md` | `assets/templates/tech-stack.template.md` | Q2 tech stack selection |
| `docs/decisions.md` | `assets/templates/decisions.template.md` | Q2 + Q1.7 choices |
| `docs/architecture.md` | `assets/templates/architecture.template.md` | Scan actual project tree |
| `docs/packages.md` | `assets/templates/packages.template.md` | Monorepo only (Plan D) |
| `docs/PROGRESS.md` | `assets/templates/progress.template.md` | Q1.6 MVP + iteration plan |
| `docs/reference-configs/changelog-versioning.yaml.md` | `assets/reference-configs/changelog-versioning.yaml.md` | Release/changelog deep reference |
| `docs/reference-configs/git-strategy.yaml.md` | `assets/reference-configs/git-strategy.yaml.md` | Git branching/commit deep reference |
| `docs/reference-configs/release-deploy.yaml.md` | `assets/reference-configs/release-deploy.yaml.md` | Release/deploy deep reference |
| `docs/reference-configs/ai-workflows.yaml.md` | `assets/reference-configs/ai-workflows.yaml.md` | AI workflow deep reference |

**Conditional guides** (only generate for matching plan):

| Output File | Template Source | Condition |
|-------------|---------------|-----------|
| `docs/guides/metro-esm-gotchas.md` | `assets/templates/guides/metro-esm-gotchas.template.md` | Plan F (Mobile/Expo) |
| `docs/guides/jotai-agent-patterns.md` | — (generate inline) | Plan D + Jotai |
| `docs/guides/cf-deployment.md` | — (generate inline) | Cloudflare-native plans |

Generation instructions per template are in `<!-- comments -->` at the top of each template file.

### 8. Project Structure

Run `scripts/create-project-dirs.sh` to create the three-layer directory structure:

| Layer | Directories | Nature |
|-------|------------|--------|
| IMMUTABLE (资产层) | `specs/`, `contracts/`, `tests/` | Source of truth |
| MUTABLE (厕纸层) | `src/` | Disposable implementation |
| SUPPORTING (支撑层) | `docs/`, `scripts/`, `ops/`, `artifacts/` | Documentation & tooling |

### 9. .gitignore Generation

Copy `assets/templates/gitignore.template` to project root as `.gitignore`.

### 10. Init Script (init-project.sh)
Generate executable script with:
- Package installation commands
- shadcn/ui initialization (if applicable)
- Directory structure creation
- Environment file setup

### 11. Plugin Setup (if selected in Q7)
Run `scripts/setup-plugins.sh` to:
- Clone official plugins from `https://github.com/anthropics/claude-plugins-official`
- Clone ast-grep skill from `https://github.com/ast-grep/claude-skill`
- Install selected plugins to `~/.claude/skills/`
- Configure hooks in `~/.claude/settings.json`

### 12. Hook Configuration (if selected in Q8)

Copy hook files from `assets/hooks/` to `.claude/hooks/` and merge `assets/hooks/settings.template.json` into `.claude/settings.local.json`. See hook files table in Q8 above.

---

## CLAUDE.md Deep Docs Section

The generated CLAUDE.md must include a **Deep Docs** index table (in `07-footer.partial.md`) that links to all generated documentation. This table tells the AI agent which doc to read for which scenario.

```markdown
## Deep Docs (按需阅读)

CLAUDE.md 只放规则摘要。详细设计、模式、决策记录在 `docs/` 下，**碰到相关任务时去读**。

| 触发场景 | 读哪个文件 |
|----------|-----------|
| 目录结构、分层、依赖图、数据流 | `docs/architecture.md` |
| Package API、exports、模块划分 | `docs/packages.md` |
| 技术选型疑问、版本号确认 | `docs/tech-stack.md` |
| 为什么选了 X 而不是 Y | `docs/decisions.md` (ADR) |
{{#IF PLAN_F}}| Metro ESM 踩坑、SVG 跨平台 | `docs/guides/metro-esm-gotchas.md` |{{/IF}}
{{#IF HAS_JOTAI}}| 写 Jotai 状态 / Agent UI 状态 | `docs/guides/jotai-agent-patterns.md` |{{/IF}}
| 项目简介、产品定位 | `docs/brief.md` |
| 当前进度、里程碑、待办 | `docs/PROGRESS.md` |
| 版本变更历史 | `docs/CHANGELOG.md` |
```

**Generation instructions**:
- Always include architecture.md, tech-stack.md, decisions.md, brief.md, PROGRESS.md, CHANGELOG.md
- packages.md: only for monorepo (Plan D) or multi-package projects
- guides/: only include rows for guides that were actually generated
- This table is the primary way CLAUDE.md stays small (<500 lines) while detailed docs live in `docs/`

---

## CalVer Version Tagging

All generated documentation files must include CalVer version headers:

```markdown
> **Version**: v{{YEAR}}.{{MONTH_PADDED}}.0
> **Last Updated**: {{DATE}}
```

**Rules**:
- Version format: `v{YYYY}.{MM}.{patch}` (e.g., `v2026.02.0`)
- Initial patch is always `0`
- When docs are updated, the `doc-drift-guard` hook reminds to bump the version
- `Last Updated` uses ISO date format (`YYYY-MM-DD`)

**Files that get version headers**: architecture.md, packages.md, tech-stack.md, decisions.md, guides/*.md

**Files that get Last Updated only** (no version): PROGRESS.md, CHANGELOG.md, brief.md

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

See `examples/b2b-config.md` for a minimal B2B SaaS config example.

For full enterprise examples, see `references/tech-stacks.md`.

---

## Workflow After Initialization

1. **Run init script**: `bash init-project.sh`
2. **Plan with annotation loop** (recommended for non-trivial features):
   - AI writes `docs/plan.md`
   - You annotate inline in your editor (add context, delete sections, correct assumptions)
   - Tell AI: "read annotations in docs/plan.md, update accordingly. Don't implement yet."
   - Repeat 1-6 rounds until the plan is project-specific
   - Then: "implement it all"
3. **Start development**: Begin coding with your configured environment

---

## Troubleshooting

**Q: CLAUDE.md too long?**
A: Keep under 500 lines. Move detailed docs to `docs/`.

**Q: Bun compatibility issues?**
A: Fall back to pnpm. Check `references/tech-stacks.md`.
