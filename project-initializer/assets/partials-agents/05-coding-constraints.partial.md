## Coding Constraints

### Good Taste
- Prefer data structures over branch-heavy logic.
- >3 branches or >3 nesting levels is a refactor signal.
- Keep functions small and intention-revealing.

### First Principles
- Reason from invariants and root causes, not surface symptoms.
- Before adding state or branches, ask if the same result can be derived from existing data.

### Pragmatism
- Solve real problems first.
- Implement the simplest correct version before optimizing.

### Zero Compatibility Debt
- Do not keep legacy branches "for compatibility".
- Remove dead code directly.
- Prefer clean upgrades over compatibility shims.
- Rewrite over patch when behavior or data contracts are wrong.

### Single Source of Truth
- Canonical truth is the immutable layer: `specs/`, `contracts/`, `tests/`.
- `src/` is mutable implementation and never overrides upstream truth.
- When conflicts appear: update Spec -> Contract -> Tests -> rewrite Implementation.

### Red Lines
| Metric | Limit |
|--------|-------|
| File lines | <= 800 |
| Files per folder | <= 8 |
| Function lines | <= 20 |
| Nesting levels | <= 3 |
| Branch count | <= 3 |

---
