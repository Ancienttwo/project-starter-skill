# Project Initializer Skill

> AI-powered project scaffolding with comprehensive tech stack configuration and vibe coding setup.

## Features

- **Guided Q&A Setup** - Interactive project initialization flow
- **10 Project Types** - From B2B SaaS to Financial Trading Platforms
- **Cloudflare Native First** - Optimized for edge deployment
- **AI Native Stack** - Built for vibe coding with Claude Code
- **Plugin Recommendations** - Essential Claude Code plugins auto-configured

## Quick Start

```bash
# Run the skill
/project-initializer

# Or with options
/project-init --stack vite-tanstack --name my-app
```

## Project Types

| Type | Plan | Stack |
|------|------|-------|
| B2B SaaS / Internal Tools | Plan C | Vite + TanStack Router |
| Traditional Enterprise | Plan B | UmiJS + Ant Design Pro |
| C-Side with SEO | Plan A | Remix |
| AI Chat / Assistant | Plan C+ | Vite + Ant Design X |
| Mobile App | Plan F | Expo + NativeWind |
| Monorepo | Plan D | Bun + Turborepo |
| AI Quantitative Trading | Plan G | FastAPI + Vite |
| Financial Trading (FIX/RFQ) | Plan H | FIX/Rust + Hono + Vite |
| AI Coding Agent / TUI | Plan J | OpenTUI + TypeScript ⭐ |
| Custom Configuration | Plan K | Manual selection |

## Generated Files

```
project/
├── CLAUDE.md           # AI development guide
├── AGENTS.md           # Agent execution protocol guide
├── .gitignore          # Comprehensive ignore rules
├── init-project.sh     # Project initialization script
├── docs/
│   ├── brief.md        # 产品简介 + MVP scope (from Q1.5, Q1.6)
│   ├── tech-stack.md   # 技术栈决策 + 成本预估
│   ├── decisions.md    # 架构决策记录 ADR (from Q1.7, Q2)
│   ├── architecture/   # System design docs
│   ├── api/            # API documentation
│   ├── guides/         # Developer guides
│   ├── archives/       # Archived progress logs
│   ├── reference-configs/ # Verbose workflow/release reference configs
│   ├── PROGRESS.md     # AI development log (2000 lines max)
│   ├── TODO.md         # Pending tasks only
│   └── CHANGELOG.md    # Version history
├── ops/                # DO NOT COMMIT
│   ├── database/       # Migrations, seeds, backups
│   ├── scripts/        # Deployment scripts
│   ├── docker/         # Docker configs
│   └── secrets/        # API keys, certificates
└── artifacts/          # Build outputs (ignored)
```

## Development Tracking Rules

### docs/PROGRESS.md

```yaml
MAX_LINES: 2000
ARCHIVE_TRIGGER: When exceeding 2000 lines
ARCHIVE_TO: docs/archives/PROGRESS-{YYYY-MM-DD}.md
KEEP_RECENT: 200 lines only
```

### docs/TODO.md

```yaml
RULES:
  - ONLY keep tasks NOT YET STARTED
  - DELETE immediately when task begins or completes
  - NO "done" or "completed" markers
```

## Reference Files

See [references/](references/) for:

**Core:**
- `tech-stacks.md` - Technology stack details and init commands
- `best-practices.md` - Engineering standards
- `plugins-core.md` - Plugin sources, hooks, and installation guide

**Architecture (by project type):**
- `arch/mobile.md` - Mobile APP 架构 (Expo, KMP, Flutter)
- `arch/tui.md` - TUI Terminal 架构 (OpenTUI, Ink, Ratatui)
- `arch/ai-backend.md` - AI Agent 后端架构
- `arch/toolchain.md` - 工具链推荐
- `arch/quant-python.md` - Python 量化金融
- `arch/crypto-trading.md` - 加密货币量化交易
- `arch/trading-terminal.md` - Trading Terminal

## Skill Structure

```
project-initializer/
├── SKILL.md                    # Main skill definition
├── README.md                   # This file
├── assets/
│   ├── partials/               # CLAUDE template partials
│   ├── partials-agents/        # AGENTS template partials
│   ├── reference-configs/      # Verbose workflow reference configs
│   └── CLAUDE.template.md      # Legacy full template (reference)
├── scripts/
│   ├── setup-plugins.sh        # Plugin installation script
│   ├── init-project.sh         # Project setup script
│   └── assemble-template.ts    # CLAUDE/AGENTS template assembler
└── references/
    ├── tech-stacks.md          # Technology stack details
    ├── best-practices.md       # Engineering standards
    ├── plugins-core.md         # Plugin configuration
    └── arch/                   # Architecture references
        ├── mobile.md
        ├── tui.md
        ├── ai-backend.md
        ├── toolchain.md
        ├── quant-python.md
        ├── crypto-trading.md
        └── trading-terminal.md
```

## Core Principles

- **极客 (Geek)** - Cutting-edge, developer-first
- **开源 (Open Source)** - Prefer open source solutions
- **先进 (Advanced)** - Latest stable versions
- **AI Native** - Built for AI-assisted development
- **Vibe Coding** - Seamless human-AI collaboration

## Version

- **Skill Version**: 2.1.0
- **Last Updated**: 2026-01-10

---

*Built with Claude Code*
