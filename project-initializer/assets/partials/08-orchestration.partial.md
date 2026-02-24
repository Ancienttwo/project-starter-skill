## Workflow Orchestration

### 1. Plan Mode Default

- Non-trivial tasks (3+ steps, multiple files, or architecture impact) must start in plan mode.
- Write a concrete implementation spec in `docs/plan.md`.
- Include verification steps in the plan, not only coding tasks.
- If implementation drifts from plan, stop and revise plan first.

### 2. Subagent Strategy

- Use focused subagents for deep research and parallel exploration.
- One subagent should own one narrow objective.
- Use parallel subagents only for independent workstreams.
- Synthesize subagent outputs into one canonical plan before implementation.

### 3. Verification Gate

After each implementation phase, run relevant checks:
- Typecheck (if applicable)
- Unit/integration/E2E tests (as applicable)
- Lint/build checks for impacted modules

If any check fails:
1. Stop
2. Diagnose root cause
3. Update plan and task state
4. Re-run checks after fix

Never declare completion without verification evidence.

### 4. Demand Elegance (Balanced)

- For non-trivial changes, evaluate whether a simpler and cleaner approach exists.
- If the current path feels hacky, redesign before adding complexity.
- Skip this step for obvious one-line fixes.
- Avoid overengineering while still challenging weak designs.

### 5. Autonomous Bug Fixing

- When users report a bug with enough context, start diagnosis and fix immediately.
- Treat failing tests, logs, and stack traces as direct fix triggers.
- Keep the user out of avoidable context-switch loops.

### 6. Final Validation

Before final response:
1. Self-review against acceptance criteria
2. Verify task checklist is fully synchronized
3. Report change summary, verification proof, known risks, and next steps
