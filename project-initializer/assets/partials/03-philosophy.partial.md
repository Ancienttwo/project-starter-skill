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

#### Response Protocol

```yaml
NEW_FEATURE_FLOW:
  trigger: When user says "new feature" or "new function"
  steps:
    1. Output Spec first (functionality description, boundary conditions, exception handling)
    2. STOP and wait for confirmation
    3. Output Interface Contract (types, function signatures)
    4. STOP and wait for confirmation
    5. Output Implementation + Tests together
  rule: Test code quantity >= Implementation quantity

MODIFICATION_FLOW:
  trigger: When user says "change" or "modify"
  steps:
    1. Ask: "Change Spec or just Implementation?"
    2. If Spec changes -> Regenerate everything from Spec
    3. If only Impl changes -> Delete and rewrite module, keep interface

BUG_FIX_FLOW:
  trigger: When user says "bug"
  steps:
    1. Write a test that reproduces the bug FIRST
    2. Delete the affected module entirely
    3. Rewrite from scratch (never patch)
    4. Verify all tests pass
```

#### Module Boundary (Deletion Scope Definition)

```yaml
MODULE_DEFINITION:
  # Minimum unit: one test file corresponds to one module
  UNIT: Single function/class -> Delete that function/class file
  INTEGRATION: Multiple functions collaborating -> Delete entire src/modules/{name}/ directory
  E2E: Cross-module flow -> Only delete modules involved in failed path

DELETION_SCOPE:
  # Determine deletion scope based on test type
  tests/unit/auth.test.ts fails:
    -> Only delete src/modules/auth/
    -> Keep contracts/modules/auth.contract.ts

  tests/integration/checkout.test.ts fails:
    -> Delete src/modules/checkout/
    -> If contract itself has issues -> First change spec, then delete all downstream

  tests/e2e/user-flow.test.ts fails:
    -> Locate the specific failing module (check stack trace)
    -> Only delete that module, not the entire chain

ESCALATION_RULE:
  # When to change upstream
  Multiple modules rewritten but still failing -> Problem is in Contract -> Go back to Spec layer
  Contract changes -> All modules depending on that Contract must be rewritten
```

#### Forbidden Actions (Development Protocol)

- No patching code to fix bugs (must rewrite)
- No changing interface without Spec update
- No writing code without corresponding tests
- No modifying tests to make buggy code pass
- No deleting code beyond the scope of failing tests

---
