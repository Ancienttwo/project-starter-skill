### Plan Annotation Protocol
> **Origin**: Research -> Plan -> Annotate -> Implement -> Feedback.
Use `tasks/todo.md` as the primary execution contract and checklist. Use `docs/plan.md` for deep design context when required.
```yaml
PLAN_LOOP:
  MODE: Plan + Permissionless
  PRIMARY_FILE: tasks/todo.md
  LESSONS_FILE: tasks/lessons.md
  DEEP_SPEC_FILE: docs/plan.md  # compatibility/deep context
  EXECUTION_CONTEXT: git worktree required for mutations
  COMMIT_POLICY: atomic checkpoint after green checks
  GUARD: Do not implement until user explicitly says "implement"

  ON_ANNOTATED_PLAN:
    1. Re-read tasks/todo.md and related comments in full
    2. Re-read tasks/lessons.md for relevant mistake patterns
    3. Update checklist items and success criteria
    4. If architecture details are needed, sync docs/plan.md
    5. Stop after plan update (no implementation)

  ON_IMPLEMENT_COMMAND:
    1. Execute from tasks/todo.md in phases
    2. Mark tasks complete only after verification evidence
    3. Write review notes per completed task
    4. Append new lessons when corrections occur
```

---

### Task Management Protocol

```yaml
TASK_MANAGEMENT:
  STEP_1_PLAN_FIRST:
    - Write plan to tasks/todo.md with checkable items
  STEP_2_VERIFY_PLAN:
    - Confirm scope and acceptance before coding
  STEP_3_TRACK_PROGRESS:
    - Mark checklist items as completed during execution
  STEP_4_EXPLAIN_CHANGES:
    - Keep high-level step summaries for each phase
  STEP_5_DOCUMENT_RESULTS:
    - Add a review section in tasks/todo.md
  STEP_6_CAPTURE_LESSONS:
    - Update tasks/lessons.md after any correction
```

### File Roles (Tasks-Primary + Docs-Compatible)

```yaml
PRIMARY:
  tasks/todo.md:
    PURPOSE: Active execution checklist + review notes
  tasks/lessons.md:
    PURPOSE: Mistake patterns and prevention rules

COMPATIBILITY:
  docs/plan.md:
    PURPOSE: Deep architecture and spec narrative
  docs/TODO.md:
    PURPOSE: Legacy task mirror for existing workflows
  docs/PROGRESS.md:
    PURPOSE: Long-form history and session archive
```

### Progress Tracking

```yaml
docs/PROGRESS.md:
  PURPOSE: Development log and decision trail
  MAX_LINES: 2000
  ARCHIVE_TRIGGER: Exceeds 2000 lines
  ARCHIVE_PATH: docs/archives/PROGRESS-{YYYY-MM-DD}.md
  KEEP_RECENT: 200 lines
```

### Release, Git, and Deployment

Detailed reference configs are kept outside the core prompt to reduce noise:
- `docs/reference-configs/changelog-versioning.yaml.md`
- `docs/reference-configs/git-strategy.yaml.md`
- `docs/reference-configs/release-deploy.yaml.md`

Load these only when you are working on release/versioning/deployment workflows.
