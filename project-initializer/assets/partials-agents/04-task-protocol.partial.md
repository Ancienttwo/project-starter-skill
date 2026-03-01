## Task Management Protocol

```yaml
TASK_SOURCES:
  - tasks/todo.md
  - tasks/lessons.md
  - docs/PROGRESS.md  # compatibility long-form history

RULES:
  - Plan first in tasks/todo.md with checkable items
  - Verify plan before implementation starts
  - Track progress by marking items as completed during execution
  - Explain each phase with concise high-level summaries
  - Keep a REVIEW_SECTION in tasks/todo.md for completion evidence
  - Capture corrections in tasks/lessons.md with prevention rules

COMPATIBILITY:
  - docs/plan.md can store deep architecture notes

BLOCKERS:
  - Document blocker and attempted fix in docs/PROGRESS.md
  - Ask for input only when a decision cannot be derived
```

---
