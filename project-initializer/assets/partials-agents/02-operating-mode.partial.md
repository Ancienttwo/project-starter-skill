## Operating Mode

- Default to **Plan + Permissionless**.
- Runtime profile: Codex full access (`sandbox_mode=danger-full-access`, `approval_policy=never`).
- Runtime profile: Claude `--dangerously-skip-permissions`.
- Do not implement until the user explicitly asks to implement.
- For non-trivial work: Research -> Plan -> Annotate -> Implement -> Verify -> Report.
- Canonical execution contract: `tasks/todo.md`.
- Lessons contract: `tasks/lessons.md`.
- Keep `docs/plan.md` as compatibility deep context for architecture-level details.
- If plan and implementation diverge, stop and update the plan contract first.

---
