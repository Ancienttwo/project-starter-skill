### Plan Annotation Protocol

Use `tasks/research.md` for deep codebase understanding, `plans/` for timestamped plans, and `tasks/todo.md` for active execution.

```yaml
PLAN_LOOP:
  MODE: {{RUNTIME_PROFILE}}
  PHASES: research -> plan -> annotate -> todo -> implement -> feedback
  RESEARCH_FILE: tasks/research.md
  PLAN_DIR: plans/
  PLAN_ARCHIVE: plans/archive/
  PRIMARY_FILE: tasks/todo.md
  TODO_ARCHIVE: tasks/archive/
  LESSONS_FILE: tasks/lessons.md
  DEEP_SPEC_FILE: docs/plan.md  # compatibility pointer only
  ANNOTATION_GUARD: do not implement until plan Status is "Approved"
  EXECUTION_CONTEXT: primary worktree warning by default; enforce via .claude/.require-worktree
  COMMIT_POLICY: atomic checkpoint after green checks
```

### Task Management Protocol

- Research deeply first for unfamiliar areas and persist findings in `tasks/research.md`.
- Plan in `plans/plan-YYYYMMDD-HHMM-{slug}.md` with explicit trade-offs and task breakdown.
- Process all annotation notes before implementation.
- Extract approved plan tasks into `tasks/todo.md`, archiving prior todo to `tasks/archive/`.
- Mark done only with verification evidence.
- Convert user corrections into prevention rules in `tasks/lessons.md`.

### Release, Git, and Deployment References

- `docs/reference-configs/changelog-versioning.yaml.md`
- `docs/reference-configs/git-strategy.yaml.md`
- `docs/reference-configs/release-deploy.yaml.md`
