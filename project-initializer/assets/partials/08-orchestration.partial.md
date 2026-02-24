## Workflow Orchestration

### 1. Plan Node Default

- Enter plan mode for any non-trivial task (3+ steps or architectural decisions).
- If something goes sideways, stop and re-plan immediately.
- Use plan mode for verification steps, not only building.
- Write checkable execution tasks in `tasks/todo.md`; keep deep spec details in `docs/plan.md` when needed.

### 2. Subagent Strategy

- Use subagents to keep the main context window clean.
- Offload research, exploration, and parallel analysis to focused subagents.
- For complex problems, parallelize with clear ownership boundaries.
- One track per subagent for focused execution.

### 3. Self-Improvement Loop

- After any correction from the user, append a lesson to `tasks/lessons.md`.
- Write a prevention rule that blocks the same mistake pattern.
- Iterate on lessons until recurring mistakes drop.
- Review relevant lessons at session start before implementation.

### 4. Verification Before Done

- Never mark a task complete without proving behavior.
- Diff behavior before/after when relevant.
- Ask: "Would a staff engineer approve this?"
- Run tests, check logs, and demonstrate correctness evidence.

### 5. Demand Elegance (Balanced)

- For non-trivial changes, pause and ask if a cleaner path exists.
- If a fix feels hacky, redesign with current knowledge before shipping.
- Skip this step for simple obvious fixes.
- Challenge your own approach before presenting final results.

### 6. Autonomous Bug Fixing

- When given a bug report with enough evidence, start fixing directly.
- Treat logs, errors, and failing tests as direct fix triggers.
- Minimize context switching required from the user.
- Resolve failing CI tests without waiting for hand-holding.
