### Plan Annotation Protocol
> **Origin**: Research -> Plan -> Annotate -> Implement -> Feedback.
Use `tasks/todo.md` as the primary execution contract and checklist. Use `docs/plan.md` only for deep design context.

```yaml
PLAN_LOOP:
  MODE: Plan + Permissionless
  PRIMARY_FILE: tasks/todo.md
  LESSONS_FILE: tasks/lessons.md
  DEEP_SPEC_FILE: docs/plan.md
  EXECUTION_CONTEXT: primary worktree warning by default; enforce via .claude/.require-worktree
  COMMIT_POLICY: atomic checkpoint after green checks
  GUARD: Do not implement until user explicitly says "implement"
  ON_ANNOTATED_PLAN: re-read tasks/todo.md + tasks/lessons.md, update checklist, stop before coding
  ON_IMPLEMENT_COMMAND: execute phases from tasks/todo.md, verify, then append lessons
```

### Four-Phase Execution Cycle

```yaml
FOUR_PHASE_CYCLE:
  1_PLAN: Write/refresh checklist with acceptance criteria
  2_REVIEW_LOOP: Re-read lessons + specs and apply BDD/TDD constraints
  3_CONFIRM: Re-sync scope with user before edits
  4_PERMISSIONLESS_EXEC: Execute, verify, and record evidence
```

### Task Management Protocol

```yaml
TASK_MANAGEMENT:
  PLAN_FIRST: Write checkable tasks in tasks/todo.md
  TRACK_PROGRESS: Mark done only with verification evidence
  CAPTURE_LESSONS: Update tasks/lessons.md after corrections
```

### File Roles

```yaml
PRIMARY:
  tasks/todo.md: Active execution checklist + review notes
  tasks/lessons.md: Mistake patterns + prevention rules
COMPATIBILITY:
  docs/plan.md: Deep architecture/spec narrative
  docs/PROGRESS.md: Long-form history and session archive
```

### Release, Git, and Deployment

Load detailed references only when needed:
- `docs/reference-configs/changelog-versioning.yaml.md`
- `docs/reference-configs/git-strategy.yaml.md`
- `docs/reference-configs/release-deploy.yaml.md`
