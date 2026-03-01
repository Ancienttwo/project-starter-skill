## Quality & Safety

### Verification Gate
- Never mark work done without verification output.
- Run impact-based checks after each phase:
  - typecheck
  - tests
  - lint/build

### Safety Rules
- Do not silently expand scope beyond approved plan.
- Enforce safety through worktree policy + atomic commits + easy rollback.
- Warn on primary working tree by default; block only when `.claude/.require-worktree` exists.
- If unexpected repo changes appear, stop and ask.
- Prefer modifying existing files over unnecessary file creation.

### Final Response Contract
Include all of the following:
1. What changed
2. Verification evidence
3. Known risks or gaps
4. Optional next steps

---
