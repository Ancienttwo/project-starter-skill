# Migration Guide (to 2.2.0)

This guide upgrades existing repositories to current project-initializer conventions.

## Key Changes in 2.2.0

- Team hooks move to `.claude/settings.json`.
- `docs/TODO.md` is removed; `tasks/todo.md` is the only task contract.
- Hook input parsing is hybrid (stdin JSON + env/argv fallback).
- BDD/TDD reminders now route by path.

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

## Manual Follow-up

1. Review `<repo>/.claude/settings.json` for project-specific command exceptions.
2. Confirm `.claude/settings.local.json` only contains personal overrides.
3. Run project smoke checks and basic hook trigger scenarios.
4. Commit migration in one isolated change-set.

## Rollback

- Restore `*.bak.<timestamp>` files created by the migration script.
- Or revert the migration commit.
