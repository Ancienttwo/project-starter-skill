# Skill Benchmark Report

Latest iteration: `iteration-20260306-034236-smoke`

Workspace root: `/Users/ancienttwo/.claude/skills/project-initializer-workspace`

Generated: 2026-03-05T19:42:36.550Z

## Command Matrix

| Agent | Profile | Command |
| --- | --- | --- |
| claude | with_skill | `claude -p --output-format text --no-session-persistence --permission-mode bypassPermissions --add-dir /Users/ancienttwo/.claude/skills/project-initializer 'This repo already exists. Fix AGENTS.md so Codex is required to sync tasks/todo.md and tasks/lessons.md, and make the final response mention which task files were updated.'` |
| claude | without_skill | `claude -p --output-format text --no-session-persistence --permission-mode bypassPermissions --disable-slash-commands 'This repo already exists. Fix AGENTS.md so Codex is required to sync tasks/todo.md and tasks/lessons.md, and make the final response mention which task files were updated.'` |
| codex | with_skill | `codex exec -C /Users/ancienttwo/.claude/skills/project-initializer-workspace/iteration-20260306-034236-smoke/codex/with_skill/repair-agents-task-sync --dangerously-bypass-approvals-and-sandbox -o /Users/ancienttwo/.claude/skills/project-initializer-workspace/iteration-20260306-034236-smoke/codex/with_skill/repair-agents-task-sync/final-response.md --add-dir /Users/ancienttwo/.claude/skills/project-initializer 'This repo already exists. Fix AGENTS.md so Codex is required to sync tasks/todo.md and tasks/lessons.md, and make the final response mention which task files were updated.'` |
| codex | without_skill | `codex exec -C /Users/ancienttwo/.claude/skills/project-initializer-workspace/iteration-20260306-034236-smoke/codex/without_skill/repair-agents-task-sync --dangerously-bypass-approvals-and-sandbox -o /Users/ancienttwo/.claude/skills/project-initializer-workspace/iteration-20260306-034236-smoke/codex/without_skill/repair-agents-task-sync/final-response.md 'This repo already exists. Fix AGENTS.md so Codex is required to sync tasks/todo.md and tasks/lessons.md, and make the final response mention which task files were updated.'` |

## claude / with_skill

| Eval | Status | Exit | Duration | Changed Files | Raw Artifacts |
| --- | --- | --- | ---: | ---: | --- |
| repair-agents-task-sync | dry_run | 0 | 0ms | 0 | [workspace](../project-initializer-workspace/iteration-20260306-034236-smoke/claude/with_skill/repair-agents-task-sync) |

### repair-agents-task-sync

- Eval: `2`
- Workspace: [../project-initializer-workspace/iteration-20260306-034236-smoke/claude/with_skill/repair-agents-task-sync](../project-initializer-workspace/iteration-20260306-034236-smoke/claude/with_skill/repair-agents-task-sync)
- Changed files: none
- Diff summary: no diff captured
- Final response excerpt: dry-run: no final response captured
- Expectations:
  - Calls out repo-local task sync as the primary enforcement mechanism.
  - Updates the final response contract to mention changed tasks files.
  - Avoids treating hooks as the only source of enforcement.

## claude / without_skill

| Eval | Status | Exit | Duration | Changed Files | Raw Artifacts |
| --- | --- | --- | ---: | ---: | --- |
| repair-agents-task-sync | dry_run | 0 | 0ms | 0 | [workspace](../project-initializer-workspace/iteration-20260306-034236-smoke/claude/without_skill/repair-agents-task-sync) |

### repair-agents-task-sync

- Eval: `2`
- Workspace: [../project-initializer-workspace/iteration-20260306-034236-smoke/claude/without_skill/repair-agents-task-sync](../project-initializer-workspace/iteration-20260306-034236-smoke/claude/without_skill/repair-agents-task-sync)
- Changed files: none
- Diff summary: no diff captured
- Final response excerpt: dry-run: no final response captured
- Expectations:
  - Calls out repo-local task sync as the primary enforcement mechanism.
  - Updates the final response contract to mention changed tasks files.
  - Avoids treating hooks as the only source of enforcement.

## codex / with_skill

| Eval | Status | Exit | Duration | Changed Files | Raw Artifacts |
| --- | --- | --- | ---: | ---: | --- |
| repair-agents-task-sync | dry_run | 0 | 0ms | 0 | [workspace](../project-initializer-workspace/iteration-20260306-034236-smoke/codex/with_skill/repair-agents-task-sync) |

### repair-agents-task-sync

- Eval: `2`
- Workspace: [../project-initializer-workspace/iteration-20260306-034236-smoke/codex/with_skill/repair-agents-task-sync](../project-initializer-workspace/iteration-20260306-034236-smoke/codex/with_skill/repair-agents-task-sync)
- Changed files: none
- Diff summary: no diff captured
- Final response excerpt: dry-run: no final response captured
- Expectations:
  - Calls out repo-local task sync as the primary enforcement mechanism.
  - Updates the final response contract to mention changed tasks files.
  - Avoids treating hooks as the only source of enforcement.

## codex / without_skill

| Eval | Status | Exit | Duration | Changed Files | Raw Artifacts |
| --- | --- | --- | ---: | ---: | --- |
| repair-agents-task-sync | dry_run | 0 | 1ms | 0 | [workspace](../project-initializer-workspace/iteration-20260306-034236-smoke/codex/without_skill/repair-agents-task-sync) |

### repair-agents-task-sync

- Eval: `2`
- Workspace: [../project-initializer-workspace/iteration-20260306-034236-smoke/codex/without_skill/repair-agents-task-sync](../project-initializer-workspace/iteration-20260306-034236-smoke/codex/without_skill/repair-agents-task-sync)
- Changed files: none
- Diff summary: no diff captured
- Final response excerpt: dry-run: no final response captured
- Expectations:
  - Calls out repo-local task sync as the primary enforcement mechanism.
  - Updates the final response contract to mention changed tasks files.
  - Avoids treating hooks as the only source of enforcement.
