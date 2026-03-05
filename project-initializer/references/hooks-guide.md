# Hooks Configuration Guide

Use this guide for **Q8: Configure Hooks** details.

## Project Hook Source of Truth

- Repo-local `tasks/` files are the primary cross-agent contract.
- Team-configurable hooks: `.claude/settings.json` (committable).
- Personal overrides only: `.claude/settings.local.json` (optional).
- Hook scripts directory: `.claude/hooks/`.

Use hooks as Claude-specific accelerators, not as the only source of workflow enforcement.

## Hook Presets

### A) Standard + TDD + Doc Drift + Context Pressure (recommended)
- Runtime profile: Plan-only (recommended), configurable to Permissionless/Standard.
- `PreToolUse (Edit|Write)`: worktree guard (warn by default, opt-in hard block), TDD/BDD guard, asset-layer guard.
- `PostToolUse (Edit|Write)`: anti-simplification, doc drift, task handoff summary, atomic pending marker.
- `PostToolUse (Bash)`: post-bash feedback, atomic checkpoint commit, changelog guard.
- `PostToolUse (*)`: context pressure tracking.
- `UserPromptSubmit`: prompt guard (plan sync + TDD/BDD reminders).

### B) Standard + TDD + Doc Drift (no context pressure)
- Same as A, without context pressure hook.

### C) Standard (no TDD guard)
- Keep worktree/doc drift/prompt guard with fewer constraints.

### D) Minimal
- `UserPromptSubmit` only.

### E) No Hooks
- Skip project-level hook config.

### F) Custom
- Define explicit matcher + command sets.

## Hook Files to Copy

| Asset File | Target Path |
|---|---|
| `assets/hooks/hook-input.sh` | `.claude/hooks/hook-input.sh` |
| `assets/hooks/worktree-guard.sh` | `.claude/hooks/worktree-guard.sh` |
| `assets/hooks/tdd-guard-hook.sh` | `.claude/hooks/tdd-guard-hook.sh` |
| `assets/hooks/pre-code-change.sh` | `.claude/hooks/pre-code-change.sh` |
| `assets/hooks/anti-simplification.sh` | `.claude/hooks/anti-simplification.sh` |
| `assets/hooks/doc-drift-guard.sh` | `.claude/hooks/doc-drift-guard.sh` |
| `assets/hooks/task-handoff.sh` | `.claude/hooks/task-handoff.sh` |
| `assets/hooks/atomic-pending.sh` | `.claude/hooks/atomic-pending.sh` |
| `assets/hooks/post-bash.sh` | `.claude/hooks/post-bash.sh` |
| `assets/hooks/atomic-commit.sh` | `.claude/hooks/atomic-commit.sh` |
| `assets/hooks/changelog-guard.sh` | `.claude/hooks/changelog-guard.sh` |
| `assets/hooks/context-pressure-hook.sh` | `.claude/hooks/context-pressure-hook.sh` |
| `assets/hooks/prompt-guard.sh` | `.claude/hooks/prompt-guard.sh` |
| `assets/hooks/settings.template.json` | `.claude/settings.json` |

## Customization Notes

- Non-monorepo projects can remove package-related doc drift triggers.
- Non-Expo projects can remove Metro config drift checks.
- Non-Turborepo projects can remove `turbo.json` drift checks.
