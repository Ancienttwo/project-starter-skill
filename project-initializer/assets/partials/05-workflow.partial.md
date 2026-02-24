### Plan Annotation Protocol

> **Origin**: Research -> Plan -> Annotate -> Implement -> Feedback.

Use `docs/plan.md` as shared mutable state between you and the AI.

```yaml
PLAN_LOOP:
  FILE: docs/plan.md
  GUARD: Do not implement until user explicitly says "implement"
  ROUNDS: 1-6 (iterate until decisions are complete)

  ON_ANNOTATED_PLAN:
    1. Re-read docs/plan.md in full
    2. Identify every user annotation and deletion
    3. Rewrite the plan with those updates
    4. Ask clarifying questions only when ambiguity remains
    5. Stop after updating plan (no implementation)

  ON_IMPLEMENT_COMMAND:
    1. Re-read the final docs/plan.md
    2. Convert plan sections into a task checklist
    3. Execute in phases and keep status synchronized
    4. Record verification evidence for each phase
```

**When to use**: Any feature with 3+ files, architectural choices, or unclear scope.

---

### Task Management Protocol

```yaml
TASK_STATE:
  SOURCE_OF_TRUTH:
    - docs/plan.md
    - docs/TODO.md
    - docs/PROGRESS.md

  RULES:
    - Keep only UNSTARTED tasks in docs/TODO.md
    - Move in-progress/completed details into docs/PROGRESS.md
    - Mark a task complete immediately when verification passes
    - If user says "continue", proceed to next pending step

  EXECUTION_STYLE:
    - Work in batched phases
    - Keep exactly one active task at a time
    - Do not silently expand scope beyond plan
```

### Progress Tracking

```yaml
docs/PROGRESS.md:
  PURPOSE: Development log and decision trail
  MAX_LINES: 2000
  ARCHIVE_TRIGGER: Exceeds 2000 lines
  ARCHIVE_PATH: docs/archives/PROGRESS-{YYYY-MM-DD}.md
  KEEP_RECENT: 200 lines

  SESSION_FORMAT: |
    ## YYYY-MM-DD Session
    ### Completed
    - [x] Task description
    ### In Progress
    - [ ] Current work
    ### Notes
    - Key decisions and blockers

docs/TODO.md:
  PURPOSE: Pending work queue
  RULES:
    - Keep only not-started tasks
    - Delete tasks when started/completed
    - No "done" markers
```

### Release, Git, and Deployment

Detailed reference configs are kept outside the core prompt to reduce noise:
- `docs/reference-configs/changelog-versioning.yaml.md`
- `docs/reference-configs/git-strategy.yaml.md`
- `docs/reference-configs/release-deploy.yaml.md`

Load these only when you are working on release/versioning/deployment workflows.
