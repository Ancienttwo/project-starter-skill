## Task Management Protocol

```yaml
TASK_SOURCES:
  - docs/plan.md
  - docs/TODO.md
  - docs/PROGRESS.md

RULES:
  - Keep docs/TODO.md for not-started tasks only
  - Track in-progress and completed work in docs/PROGRESS.md
  - Keep checklist state synchronized with real execution
  - Continue to next task when user says "continue"

BLOCKERS:
  - Document blocker and attempted fix in docs/PROGRESS.md
  - Ask for input only when a decision cannot be derived
```

---
