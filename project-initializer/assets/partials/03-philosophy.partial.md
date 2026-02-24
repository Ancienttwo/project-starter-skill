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
- If they diverge: update Spec first, then Contract, then Tests, then rewrite Implementation.

#### Response Protocol

```yaml
NEW_FEATURE_FLOW:
  trigger: When user says "new feature" or "new function"
  steps:
    # BDD Layer — Define WHAT (Human + LLM collaborate)
    1. Define acceptance criteria in Given-When-Then format:
       - Minimum 3 scenarios (happy path, edge case, error path)
       - Format: |
           Feature: [Name]
             Scenario: [Happy path]
               Given [precondition]
               When [action]
               Then [expected outcome]
             Scenario: [Edge case]
               Given [precondition]
               When [boundary action]
               Then [expected handling]
             Scenario: [Error path]
               Given [precondition]
               When [invalid action]
               Then [error response]
    2. Output Spec first (functionality description, boundary conditions, exception handling)
    3. STOP and wait for confirmation
    4. Output Interface Contract (types, function signatures)
    5. STOP and wait for confirmation
    # TDD Layer — Define HOW (LLM generates, Human reviews)
    6. Write failing tests from acceptance scenarios (Red)
    7. Write minimal implementation to pass tests (Green)
    8. Refactor only after all tests pass (Refactor)
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
    2. Verify the test FAILS (confirms bug exists)
    3. Delete the affected module entirely
    4. Rewrite from scratch (never patch)
    5. Verify all tests pass
    6. FORBIDDEN: "I think it's fixed" without test proof
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

#### TDD vs BDD Selection Guide

```yaml
# 按模块性质选择测试策略，不是按前后端划分

TDD_TARGETS:  # 输入输出明确，纯逻辑
  - API endpoints (request → response)
  - Business logic / algorithms / utils
  - React Hooks / state logic (useXxx → returns data)
  - Smart Contracts (mint() → balanceOf === 1)
  - Data transformations / parsers
  - Database queries / ORM operations
  tool: Vitest (unit) + Hardhat (contracts)
  pattern: Red → Green → Refactor

BDD_TARGETS:  # 用户行为驱动，场景级
  - User flows / acceptance criteria
  - UI component interactions (click → see result)
  - E2E tests (full page scenarios)
  - Feature acceptance (Given-When-Then)
  - Cross-module integration from user perspective
  tool: Playwright (E2E) + Testing Library (component)
  pattern: Given → When → Then

HYBRID_EXAMPLE:
  # React component with business logic
  AgentCard:
    BDD: "renders agent skills and hire button"           # 行为
    TDD: "calculates reputation score from history data"  # 逻辑

  # API + User flow
  MintNFA:
    TDD: "contract mints token with correct URI"          # 合约逻辑
    BDD: "user uploads config, clicks mint, sees success" # 用户流程
```

#### Test Quality Standards

```yaml
TEST_STANDARDS:
  NAMING: should_[expected]_when_[condition]
  STRUCTURE: Arrange-Act-Assert (AAA)
  ISOLATION: Each test independent, no shared mutable state
  DETERMINISM: No Math.random(), no Date.now(), no network calls in unit tests
  COVERAGE_TARGET: 80%+ for business logic, 100% for algorithms
  PREFERENCE: Property-based tests over example-based for algorithms

  FORBIDDEN_PATTERNS:
    - Tests that only check implementation details (spy counts, call order)
    - Tests that duplicate source code logic
    - Tests with no assertions
    - Tests that always pass regardless of implementation
    - Writing implementation before its test exists

  EXCEPTIONS (skip TDD for):
    - Config files, type definitions, constants
    - CSS/style-only changes
    - Documentation-only changes
    - Prototype/spike exploration (must be marked as such)
```

#### Forbidden Actions (Development Protocol)

- No patching code to fix bugs (must rewrite)
- No changing interface without Spec update
- No writing code without corresponding tests
- No modifying tests to make buggy code pass
- No deleting code beyond the scope of failing tests
- No implementing features not covered by acceptance criteria

---
