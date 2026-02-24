### 7. Development Protocol (Multi-Agent Philosophy)

> **Core Philosophy**: Token unlimited = Manpower unlimited = Code is toilet paper = Rewrite over patch

#### The Layered Truth

```
+-----------------------------------------------------+
|                 IMMUTABLE LAYER (Assets)            |
|  +-----------+  +-----------+  +-----------+        |
|  |   Spec    |  | Contract  |  |   Tests   |        |
|  |  (What)   |  |(Interface)|  |  (Truth)  |        |
|  +-----------+  +-----------+  +-----------+        |
|----------------------------------------------------|
|                 MUTABLE LAYER (Toilet Paper)        |
|  +-------------------------------------------+      |
|  |              Implementation               |      |
|  |        (Code that can be deleted anytime) |      |
|  +-------------------------------------------+      |
+-----------------------------------------------------+
```

#### Single Source of Truth

- The source of truth lives in the immutable layer: `specs/`, `contracts/`, `tests/`.
- Implementation in `src/` is disposable and can be rewritten anytime.
- If they diverge: update Spec -> Contract -> Tests -> rewrite Implementation.

#### Response Protocol

```yaml
NEW_FEATURE_FLOW:
  trigger: "new feature" / "new function"
  steps:
    1. Define Given-When-Then acceptance criteria (happy path, edge case, error path)
    2. Output Spec first, then wait for confirmation
    3. Output Interface Contract, then wait for confirmation
    4. Write failing tests (Red)
    5. Write minimal implementation (Green)
    6. Refactor after all tests pass (Refactor)
  rule: Test code quantity >= Implementation quantity

MODIFICATION_FLOW:
  trigger: "change" / "modify"
  steps:
    1. Ask: "Change Spec or only Implementation?"
    2. Spec changed -> regenerate downstream from Spec
    3. Impl-only -> delete and rewrite affected module

BUG_FIX_FLOW:
  trigger: "bug"
  steps:
    1. Write test to reproduce bug first
    2. Verify test fails
    3. Delete affected module scope
    4. Rewrite from scratch (never patch)
    5. Verify all tests pass
```

#### Detailed Playbooks (On Demand)

For full workflows and templates, read:
- `docs/reference-configs/ai-workflows.yaml.md`

#### Forbidden Actions (Development Protocol)

- No patching code to fix bugs (rewrite instead)
- No changing interface without Spec update
- No writing code without corresponding tests
- No modifying tests to make buggy code pass
- No implementing features not covered by acceptance criteria

---
