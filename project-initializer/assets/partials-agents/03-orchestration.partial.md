## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for any non-trivial task.
- Keep active checklist items in `tasks/todo.md`.
- Re-plan immediately when execution drifts.

### 2. Subagent Strategy
- Offload research and exploration to focused subagents.
- Parallelize only independent tracks.
- Keep one clear ownership boundary per subagent.

### 3. Self-Improvement Loop
- After user correction, append lesson in `tasks/lessons.md`.
- Convert correction into a prevention rule.
- Review relevant lessons before execution starts.

### 4. Verification Before Done
- No task completion without proof.
- Run impact-based checks (typecheck/tests/lint/build).
- Validate before/after behavior when relevant.

### 5. Demand Elegance (Balanced)
- For non-trivial changes, ask whether a cleaner path exists.
- Redesign hacky fixes before shipping.
- Avoid overengineering for simple fixes.

### 6. Autonomous Bug Fixing
- Start fixing when logs/errors/failing tests provide enough evidence.
- Reduce user context switching and keep momentum.

---
