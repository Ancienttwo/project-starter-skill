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

Initialize a project with low-friction defaults, structured overrides, and progressive disclosure.

## Quick Start

Fast path:

```bash
/project-init --quick
```

Explicit plan path:

```bash
/project-init --stack vite-tanstack --name my-app --flow full
```

Template assembly path:

```bash
bun scripts/assemble-template.ts --plan C --name "MyProject"
bun scripts/assemble-template.ts --target agents --plan C --name "MyProject"
```

## Initialization Model

This skill now follows **infer first, override second**:

1. Infer defaults from plan tier + question pack.
2. Ask grouped confirmation questions.
3. Only ask deeper plan-specific questions if user overrides defaults.
4. Generate concise CLAUDE.md/AGENTS.md and route details to `docs/reference-configs/*`.

## Question Model (8 Decision Points)

Canonical question interface:
- `assets/initializer-question-pack.v1.json`

Decision batches:

1. `project_identity` + `plan_selection`
2. `delivery_constraints` + `runtime_defaults`
3. `plan_overrides` + `quality_rules`
4. `plugin_profile` + `hook_profile`

### Required Decision Points

- Project name / owner / brief
- Plan selection
- MVP scope + acceptance criteria
- Runtime profile confirmation

### Optional Decision Points

- Plan-specific stack overrides
- Additional prohibitions/compliance
- Plugin/hook profile customization

## Plan Architecture

### Core Plans (A-F)

These are first-class choices shown first:

- **Plan A**: C-Side with SEO (Dynamic) → Remix
- **Plan B**: Traditional Enterprise → UmiJS + Ant Design Pro
- **Plan C**: B2B SaaS / Internal Tools → Vite + TanStack Router
- **Plan D**: Monorepo (Multi-project) → Bun + Turborepo
- **Plan E**: Landing Page / Marketing → Astro + Starwind UI
- **Plan F**: Mobile App → Expo + NativeWind

### Custom Presets (G-K)

Shown after user chooses “Custom Presets”:

- **Plan G**: AI Quantitative Trading
- **Plan H**: Financial Trading (FIX/RFQ)
- **Plan I**: Web3 DApp (EVM)
- **Plan J**: AI Coding Agent / TUI Tool
- **Plan K**: Fully Custom Configuration

Canonical mapping lives in `assets/plan-map.json`.

## Full Flow (Grouped)

### Batch 1: Identity + Plan

- Confirm project name, developer name, product brief.
- Choose core plans (A-F) or Custom Presets.
- If presets selected, pick one from G-K.

### Batch 2: Scope + Runtime

- Define MVP scope and acceptance criteria.
- Confirm inferred runtime defaults:
  - package manager priority: `bun > pnpm > npm`
  - Plan G/H default package manager: `uv` (Python-centric presets)
  - Permission mode: Permissionless / Plan-only / Standard (default: Plan-only)

### Batch 3: Overrides + Rules

- Ask only plan-relevant override set.
- Collect project-specific prohibitions.

### Batch 4: Plugins + Hooks

- Select global plugin profile (Q7).
- Select project hook profile (Q8).

Detailed matrices are in:
- `references/plugins-core.md`
- `references/hooks-guide.md`

## Progressive Disclosure Map

`SKILL.md` keeps orchestration and routing only. Detailed content must be loaded on demand.

Load by need:

- Plan/stack details: `references/tech-stacks.md`
- Architecture guides: `references/arch/*.md`
- Hook trigger matrix: `references/hooks-guide.md`
- Plugin catalog: `references/plugins-core.md`
- Migration details: `references/migration-guide.md`
- Engineering defaults: `references/best-practices.md`

## Outputs

Generate the following:

1. `CLAUDE.md` (lean config card + index)
2. `AGENTS.md` (agent operating contract)
3. `docs/brief.md`
4. `docs/tech-stack.md`
5. `docs/decisions.md`
6. `docs/architecture.md`
7. `docs/PROGRESS.md`
8. `tasks/todo.md`
9. `tasks/lessons.md`
10. `docs/reference-configs/*.md`

Conditional output:
- `docs/packages.md` for Plan D
- `docs/guides/metro-esm-gotchas.md` for Plan F
- Cloudflare deployment guide for cloudflare-native plans

## Template Assembly

Partials are assembled in order from:

- `assets/partials/` for CLAUDE target
- `assets/partials-agents/` for AGENTS target

Rules:

1. Apply conditional blocks first (`{{#IF ...}}...{{/IF}}`).
2. Apply variables second (`{{VARIABLE}}`).
3. Fail on unresolved placeholders.
4. Keep each output within line budget.

## Runtime Defaults and Inference

Inference helper scripts:

- `scripts/assemble-template.ts` (plan resolution + variable injection)
- `scripts/initializer-question-pack.ts` (question batching + package manager inference)

Guiding policy:

- Present inferred defaults first.
- Ask user to override only when needed.
- Avoid serial one-question-per-turn flows when grouped confirmation works.

## Script Entry Points

- `scripts/assemble-template.ts`
- `scripts/create-project-dirs.sh`
- `scripts/init-project.sh`
- `scripts/setup-plugins.sh`
- `scripts/migrate-project-template.sh`
- `scripts/check-versions.ts`
## Reference Files

### Core

- `references/tech-stacks.md`
- `references/best-practices.md`
- `references/plugins-core.md`
- `references/hooks-guide.md`
- `references/migration-guide.md`

### Architecture (load by plan)

- `references/arch/mobile.md`
- `references/arch/tui.md`
- `references/arch/ai-backend.md`
- `references/arch/toolchain.md`
- `references/arch/quant-python.md`
- `references/arch/crypto-trading.md`
- `references/arch/trading-terminal.md`

## Troubleshooting

Q: Which plan to use when unsure?
A: Start with core plans A-F. Use G-K only when domain constraints require them.

Q: How to keep output concise?
A: Keep CLAUDE/AGENTS as routing configs, move detailed procedures to `docs/reference-configs/*`.

Q: Package manager fallback?
A: Default is bun; fallback to pnpm then npm. For Plan G/H, primary package manager is `uv`.
