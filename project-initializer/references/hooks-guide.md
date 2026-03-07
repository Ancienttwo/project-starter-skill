# Hooks Configuration Guide

Use this guide for **Q8: Configure Hooks** details.

## Project Hook Source of Truth

- Repo-local `tasks/` files are the primary cross-agent contract.
- Repo-local `plans/` files are the sole source of truth for the active plan.
- Team-configurable hooks: `.claude/settings.json` (committable).
- Personal overrides only: `.claude/settings.local.json` (optional).
- Hook scripts directory: `.claude/hooks/`.

Use hooks as Claude-specific accelerators, not as the only source of workflow enforcement.

## Hook Presets

### A) Balanced Shared Guardrails (recommended)
- Runtime profile: Plan-only (recommended), configurable to Permissionless/Standard.
- `PreToolUse (Edit|Write)`: worktree guard (warn by default, opt-in hard block), pre-edit guard (TDD/BDD + asset-layer reminders).
- `PostToolUse (Edit|Write)`: post-edit guard (doc drift + task handoff summary).
- `UserPromptSubmit`: prompt guard (plan sync + TDD/BDD reminders).
- Automatic checkpoint commits are disabled in the shared default.

### B) Balanced + Release Guard
- Same as A, plus `changelog-guard.sh` for repos that want release reminders.

### C) Balanced + Advisory Extras
- Same as A, plus optional advisory hooks like `anti-simplification.sh`, `post-bash.sh`, or `context-pressure-hook.sh` when teams explicitly want more reminders.

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
| `assets/hooks/run-hook.sh` | `.claude/hooks/run-hook.sh` |
| `assets/hooks/worktree-guard.sh` | `.claude/hooks/worktree-guard.sh` |
| `assets/hooks/pre-edit-guard.sh` | `.claude/hooks/pre-edit-guard.sh` |
| `assets/hooks/post-edit-guard.sh` | `.claude/hooks/post-edit-guard.sh` |
| `assets/hooks/prompt-guard.sh` | `.claude/hooks/prompt-guard.sh` |
| `assets/hooks/settings.template.json` | `.claude/settings.json` |

Optional hook assets:
- `assets/hooks/tdd-guard-hook.sh`
- `assets/hooks/pre-code-change.sh`
- `assets/hooks/doc-drift-guard.sh`
- `assets/hooks/task-handoff.sh`
- `assets/hooks/anti-simplification.sh`
- `assets/hooks/post-bash.sh`
- `assets/hooks/context-pressure-hook.sh`
- `assets/hooks/changelog-guard.sh`
- `assets/hooks/atomic-pending.sh`
- `assets/hooks/atomic-commit.sh`

## Customization Notes

- Non-monorepo projects can remove package-related doc drift triggers.
- Non-Expo projects can remove Metro config drift checks.
- Non-Turborepo projects can remove `turbo.json` drift checks.
