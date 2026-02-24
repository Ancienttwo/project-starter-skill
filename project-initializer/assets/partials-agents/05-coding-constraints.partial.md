## Coding Constraints

### Good Taste
- Prefer data structures over branch-heavy logic.
- >3 branches or >3 nesting levels is a refactor signal.
- Keep functions small and intention-revealing.

### Pragmatism
- Solve real problems first.
- Implement the simplest correct version before optimizing.

### Zero Compatibility Debt
- Do not keep legacy branches "for compatibility".
- Remove dead code directly.
- Prefer clean upgrades over compatibility shims.

### Red Lines
| Metric | Limit |
|--------|-------|
| File lines | <= 800 |
| Files per folder | <= 8 |
| Function lines | <= 20 |
| Nesting levels | <= 3 |
| Branch count | <= 3 |

---
