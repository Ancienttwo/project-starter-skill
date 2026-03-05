## Task Management Protocol

```yaml
TASK_SOURCES:
  - tasks/research.md
  - tasks/todo.md
  - tasks/contracts/
  - tasks/lessons.md
  - plans/
  - docs/PROGRESS.md

PHASES: research -> plan -> annotate -> todo -> implement -> verify -> feedback

ARCHIVE:
  PLAN: plans/archive/
  TODO: tasks/archive/

RULES:
  - Treat repo-local tasks/ files as the primary cross-agent workflow contract
  - For non-chat tasks, sync tasks/ whenever substantive work changes the repo
  - Research first for unfamiliar areas and persist findings in tasks/research.md
  - Plan with trade-offs in plans/plan-{timestamp}-{slug}.md
  - Process annotation notes before implementing
  - Extract approved plan tasks into tasks/todo.md
  - Define task contracts in tasks/contracts/{slug}.contract.md
  - Verify contracts before claiming completion
  - Track progress with verification evidence in tasks/todo.md
  - Record correction-derived prevention rules in tasks/lessons.md
  - Use docs/PROGRESS.md for milestones only, not active execution logs
  - Archive completed/abandoned plans and todos with metadata

COMPATIBILITY:
  - docs/plan.md points to the current active plan
```

---
