# Template Split Plan

## Overview

| Metric | Value |
|--------|-------|
| Source File | `assets/CLAUDE.template.md` |
| Total Lines | 1053 |
| Proposed Partials | 7 |
| Analysis Date | 2026-01-29 |

## Partials

### 01-header.partial.md
- **Lines**: 1-9
- **Content**: Project title, metadata variables ({{PROJECT_NAME}}, {{USER_NAME}}, {{SERVICE_TARGET}}, {{INTERACTION_STYLE}})
- **Conditional**: No
- **Variables**: 
  - `{{PROJECT_NAME}}`
  - `{{USER_NAME}}`
  - `{{SERVICE_TARGET}}`
  - `{{INTERACTION_STYLE}}`

---

### 02-iron-rules.partial.md
- **Lines**: 10-61
- **Content**: Iron Rules sections 1-6
  - 1. Good Taste
  - 2. Pragmatism
  - 3. Stand on Giants' Shoulders
  - 4. Zero Compatibility Debt
  - 5. Code Quality Red Lines
  - 6. Prohibitions
- **Conditional**: No
- **Variables**: 
  - `{{PROHIBITIONS}}` - Custom project prohibitions

---

### 03-philosophy.partial.md ⭐ DO NOT SPLIT
- **Lines**: 62-170 (expanded)
- **Content**: Development Protocol (Multi-Agent Philosophy) + TDD/BDD
  - Core Philosophy statement ("Token unlimited = Code is toilet paper")
  - IMMUTABLE LAYER / MUTABLE LAYER diagram
  - Response Protocol with BDD+TDD integration:
    - NEW_FEATURE_FLOW (includes Given-When-Then acceptance criteria + Red-Green-Refactor)
    - MODIFICATION_FLOW
    - BUG_FIX_FLOW (enhanced with test verification steps)
  - Module Boundary definitions
  - **Test Quality Standards** (NEW: naming, AAA, isolation, forbidden patterns)
  - Forbidden Actions (expanded)
- **Conditional**: No
- **Variables**: None

**⚠️ CRITICAL**: This section MUST remain as ONE UNIT. It contains the core philosophy from `_ref/archi.md` that defines the entire development approach. Splitting would destroy conceptual integrity.

**Key Elements (all must be preserved):**
- `IMMUTABLE LAYER (Assets)` diagram
- `MUTABLE LAYER (Toilet Paper)` diagram
- `NEW_FEATURE_FLOW` with BDD Given-When-Then + TDD Red-Green-Refactor
- `MODIFICATION_FLOW` / `BUG_FIX_FLOW`
- Test Quality Standards (TEST_STANDARDS)
- Module deletion scope definitions

---

### 04-project-structure.partial.md
- **Lines**: 152-246
- **Content**: Project Structure + File Management
  - `{{PROJECT_STRUCTURE}}` variable
  - Tech Stack table with `{{TECH_STACK_TABLE}}`
  - Directory structure rules (IMMUTABLE LAYER, MUTABLE LAYER, SUPPORTING)
- **Conditional**: No
- **Variables**:
  - `{{PROJECT_STRUCTURE}}`
  - `{{TECH_STACK_TABLE}}`

---

### 05-workflow.partial.md
- **Lines**: 247-530 (expanded)
- **Content**: Workflow Rules
  - **Plan Annotation Protocol** (NEW: Boris-style iterative annotation loop)
  - Progress Tracking (PROGRESS.md, TODO.md rules)
  - Changelog & Versioning (Semantic Versioning)
  - AI-Driven Version Control Strategy (Git branches, commit format)
- **Conditional**: No
- **Variables**: None

**Plan Annotation Protocol** teaches the iterative plan refinement workflow:
1. AI writes `docs/plan.md`
2. User annotates inline in editor
3. AI reads annotations and updates plan (no implementation)
4. Repeat 1-6 rounds until plan is project-specific
5. User says "implement it all"

---

### 06-cloudflare.partial.md
- **Lines**: 489-788
- **Content**: Cloudflare-Specific Deployment & Services
  - Cloudflare Deployment Options (Pages, Workers, Containers)
  - Cloudflare AI Services (Workers AI, AI Gateway, AutoRAG, Vectorize)
  - Durable Objects documentation
- **Conditional**: YES - Include only for Cloudflare-focused projects
- **Condition**: `{{#IF CLOUDFLARE_NATIVE}}`
- **Variables**: None

**Note**: This is the largest single section (~300 lines). For non-Cloudflare projects, this entire section should be excluded.

---

### 07-footer.partial.md
- **Lines**: 789-1053
- **Content**: AI Workflows + Documentation + Philosophy
  - AI-Assisted Development Workflows (Code Review, Test Generation, etc.)
  - Session Continuity Protocol
  - AI Pair Programming Modes
  - Core Documentation Index
  - First Principles: State & Code Quality
  - Philosophy Reminder (final summary)
  - Template Version
- **Conditional**: No
- **Variables**: None

---

## Conditional Logic

### Plan-Specific Sections

| Plan Type | Include 06-cloudflare? |
|-----------|----------------------|
| Plan A (Remix) | Yes |
| Plan B (UmiJS) | No |
| Plan C (Vite + TanStack) | Yes |
| Plan D (Monorepo) | Yes |
| Plan F (Mobile/Expo) | No |
| Plan G (Python Quant) | Partial (Containers only) |
| Plan H (Trading) | Partial (Workers only) |
| Plan J (TUI) | No |

### Implementation Strategy

```
{{#IF CLOUDFLARE_NATIVE}}
[Include 06-cloudflare.partial.md content]
{{/IF}}
```

---

## Line Count Summary

| Partial | Lines | Percentage |
|---------|-------|------------|
| 01-header | 9 | 0.9% |
| 02-iron-rules | 52 | 4.9% |
| 03-philosophy ⭐ | 120 | 10.9% |
| 04-project-structure | 95 | 9.0% |
| 05-workflow | 290 | 25.8% |
| 06-cloudflare (conditional) | 300 | 28.5% |
| 07-footer | 265 | 25.2% |
| **Total** | **1101** | **100%** |

---

## Assembly Order

```
01-header.partial.md
02-iron-rules.partial.md
03-philosophy.partial.md
04-project-structure.partial.md
05-workflow.partial.md
{{#IF CLOUDFLARE_NATIVE}}06-cloudflare.partial.md{{/IF}}
07-footer.partial.md
```

---

*Analysis completed for Task 2 of skill-refactor plan*
