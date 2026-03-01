# Development Protocol (Reference)

This guide contains detailed protocol steps that do not need to stay in the always-loaded prompt.

## Layer Model

- Immutable: `specs/`, `contracts/`, `tests/`
- Mutable: `src/`

If immutable artifacts and implementation diverge, update immutable artifacts first.

## Feature Flow

1. Define acceptance criteria.
2. Define contract/types.
3. Add or update tests.
4. Implement minimal change.
5. Verify and refactor.

## Bug Flow

1. Reproduce with test.
2. Fix root cause.
3. Re-run impacted checks.
4. Add prevention note to `tasks/lessons.md`.
