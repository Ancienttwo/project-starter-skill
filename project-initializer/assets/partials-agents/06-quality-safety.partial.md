## Quality & Safety

### Verification Gate
- Never mark work done without verification output.
- Run impact-based checks after each phase:
  - typecheck
  - tests
  - lint/build

### Safety Rules
- Do not silently expand scope beyond approved plan.
- Enforce safety through worktree isolation + atomic commits + easy rollback.
- Block write operations in the primary working tree; mutate only in linked worktrees.
- If unexpected repo changes appear, stop and ask.
- Prefer modifying existing files over unnecessary file creation.

### Final Response Contract
Include all of the following:
1. What changed
2. Verification evidence
3. Known risks or gaps
4. Optional next steps

---
