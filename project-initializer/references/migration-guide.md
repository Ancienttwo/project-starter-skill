# Migration Guide (to 2.3.x)

This guide upgrades existing repositories to current project-initializer conventions.

## Key Changes in 2.3.x

- **Version control**: Single source of truth at `assets/skill-version.json`; version stamped into generated projects at `.claude/.skill-version`.
- **Lifecycle hooks**: 7 hook events (`pre-init`, `post-init`, `pre-assemble`, `post-assemble`, `pre-migrate`, `post-migrate`, `on-version-change`) configured in `assets/skill-hooks.json`.
- **Version consistency checker**: `bun scripts/check-skill-version.ts` validates version sync across `package.json`, `skill-version.json`, and `SKILL.md`.
- Team hooks move to `.claude/settings.json`.
- `docs/TODO.md` is removed; `tasks/todo.md` is the only task contract.
- Hook input parsing is hybrid (stdin JSON + env/argv fallback).
- BDD/TDD reminders now route by path.
- Runtime mode is configurable via template variables:
  - `{{RUNTIME_MODE}}`
  - `{{RUNTIME_PROFILE}}`
- Question pack is now kept under `assets/initializer-question-pack.v1.json`.
- Plan G/H default package manager is `uv`.

## Automated Migration

```bash
# Preview only
bash scripts/migrate-project-template.sh --repo /path/to/project --dry-run

# Apply migration
bash scripts/migrate-project-template.sh --repo /path/to/project --apply
```

## What the Script Does

1. Syncs hook scripts from `assets/hooks/` to `<repo>/.claude/hooks/`.
2. Creates or merges `<repo>/.claude/settings.json` from `settings.template.json`.
3. If `jq` exists, moves `hooks` from `settings.local.json` into `settings.json`.
4. Removes legacy `docs/TODO.md` if present.
5. Prints a migration report.
6. Keeps hooks references valid by copying available scripts from `assets/hooks/`, with warning when missing.

## Manual Follow-up

1. Review `<repo>/.claude/settings.json` for project-specific command exceptions.
2. Confirm `.claude/settings.local.json` only contains personal overrides.
3. Run project smoke checks and basic hook trigger scenarios.
4. Commit migration in one isolated change-set.
5. If your old docs referenced `governance/` contracts or skill-audit scripts, remove those references and use `assets/initializer-question-pack.v1.json` as the Q&A source of truth.

## Rollback

- Restore `*.bak.<timestamp>` files created by the migration script.
- Or revert the migration commit.
