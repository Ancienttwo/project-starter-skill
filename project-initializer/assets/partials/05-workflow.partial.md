### Plan Annotation Protocol

Use `tasks/todo.md` as primary execution contract. Use `docs/plan.md` only for deep design notes.

```yaml
PLAN_LOOP:
  MODE: {{RUNTIME_PROFILE}}
  PRIMARY_FILE: tasks/todo.md
  LESSONS_FILE: tasks/lessons.md
  DEEP_SPEC_FILE: docs/plan.md
  EXECUTION_CONTEXT: primary worktree warning by default; enforce via .claude/.require-worktree
  COMMIT_POLICY: atomic checkpoint after green checks
```

### Task Management Protocol

- Plan first in `tasks/todo.md` with checkable items.
- Mark done only with verification evidence.
- Convert user corrections into prevention rules in `tasks/lessons.md`.

### Release, Git, and Deployment References

- `docs/reference-configs/changelog-versioning.yaml.md`
- `docs/reference-configs/git-strategy.yaml.md`
- `docs/reference-configs/release-deploy.yaml.md`
