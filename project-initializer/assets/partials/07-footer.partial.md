### AI-Assisted Development Workflows

```yaml
# ===== 1. Code Review =====
AI_CODE_REVIEW:
  TRIGGER: Before commit / PR
  COMMAND: /review
  CHECKS:
    - Security vulnerabilities (OWASP Top 10)
    - Performance anti-patterns
    - Code style violations
    - Missing error handling
    - Test coverage gaps
  OUTPUT: Inline comments + Summary

# ===== 2. Test Generation =====
AI_TEST_GENERATION:
  TRIGGER: After feature implementation
  COMMAND: /generate-tests
  TYPES:
    - Unit tests (function level)
    - Integration tests (API level)
    - E2E tests (critical paths)
  COVERAGE_TARGET: 80%+

# ===== 3. Documentation =====
AI_DOCUMENTATION:
  AUTO_GENERATE:
    - API documentation from code
    - README from project structure
    - JSDoc/TSDoc from function signatures
  KEEP_IN_SYNC: On every commit

# ===== 4. Refactoring Suggestions =====
AI_REFACTORING:
  TRIGGER: Code smell detected
  SUGGESTIONS:
    - Extract function/component
    - Simplify conditionals
    - Remove duplication
    - Improve naming
  APPROVAL: Human review required

# ===== 5. Dependency Management =====
AI_DEPENDENCY_AUDIT:
  TRIGGER: Weekly / Before release
  CHECKS:
    - Outdated packages
    - Security vulnerabilities (npm audit)
    - License compliance
    - Bundle size impact
  AUTO_PR: For patch updates only

# ===== 6. Error Analysis =====
AI_ERROR_ANALYSIS:
  TRIGGER: Production error
  PROCESS:
    1. Parse error stack trace
    2. Find related code context
    3. Search for similar issues (GitHub/SO)
    4. Suggest fix with confidence score
  OUTPUT: Fix PR or investigation notes

# ===== 7. Performance Profiling =====
AI_PERFORMANCE:
  TRIGGER: Before release / On demand
  ANALYZE:
    - Bundle size changes
    - Render performance
    - API response times
    - Memory leaks
  COMPARE: Against previous version

# ===== 8. Database Migration =====
AI_MIGRATION:
  TRIGGER: Schema change detected
  GENERATE:
    - Migration script
    - Rollback script
    - Data validation queries
  REVIEW: DBA approval for production

# ===== 9. API Design Review =====
AI_API_REVIEW:
  TRIGGER: New endpoint added
  CHECK:
    - RESTful conventions
    - Response format consistency
    - Error handling standards
    - Rate limiting considerations
    - Documentation completeness

# ===== 10. Security Scan =====
AI_SECURITY:
  TRIGGER: Before deploy
  SCAN:
    - Secrets in code
    - SQL injection
    - XSS vulnerabilities
    - CSRF protection
    - Auth/AuthZ issues
  BLOCK_DEPLOY: On critical findings
```

**Session Continuity Protocol:**

```yaml
SESSION_HANDOFF:
  # When context limit approaches or session ends
  BEFORE_END:
    1. Update docs/PROGRESS.md with current state
    2. List incomplete tasks in docs/TODO.md
    3. Document any blockers or decisions needed
    4. Create checkpoint commit

  NEXT_SESSION_START:
    1. AI reads docs/PROGRESS.md (latest 200 lines)
    2. AI reads docs/TODO.md for pending work
    3. AI checks git status for uncommitted changes
    4. Resume from last checkpoint

  CONTEXT_PRESERVATION:
    - Key decisions -> docs/architecture/decisions/
    - Technical debt -> docs/TODO.md (Backlog)
    - Learnings -> docs/PROGRESS.md (Notes section)
```

**AI Pair Programming Modes:**

```yaml
MODES:
  DRIVER:
    # AI writes code, human reviews
    - AI implements based on spec
    - Human provides feedback
    - AI iterates until approved

  NAVIGATOR:
    # Human writes code, AI reviews
    - Human implements
    - AI provides real-time suggestions
    - AI catches errors before commit

  ENSEMBLE:
    # Multiple AI agents collaborate
    - Architect designs
    - Developer implements
    - Reviewer critiques
    - Human makes final call

  RUBBER_DUCK:
    # AI asks clarifying questions
    - Human explains intent
    - AI identifies gaps in logic
    - Better solutions emerge through dialogue
```

---

## Core Documentation Index

### Architecture Design

| Document | Path | Description |
|----------|------|-------------|
| Overall Architecture | `docs/architecture/ARCHITECTURE.md` | System architecture overview |
| Tech Stack | `docs/architecture/tech-stack.md` | Technology choices and constraints |
| Database Design | `docs/architecture/database.md` | Database table structure |

### Coding Standards

| Document | Path | Description |
|----------|------|-------------|
| Coding Standards | `docs/coding-standards.md` | Code style guidelines |
| API Design | `docs/api-design.md` | API interface specifications |

### Project Management

| Document | Path | Description |
|----------|------|-------------|
| Progress Tracking | `docs/PROGRESS.md` | Development progress and next steps |
| Changelog | `docs/CHANGELOG.md` | Version history |
| Todo List | `docs/TODO.md` | Pending tasks |

---

## First Principles: State & Code Quality

### The Atomic Truth

```text
UI = f(State)
Therefore: State Count is proportional to Bug Count
Therefore: Minimize State, Maximize Derivation
```

### Two Corollaries

| Principle | Definition | Violation Example |
|-----------|------------|-------------------|
| **Data Minimalism** | Store only what you cannot compute | `filteredUsers` alongside `users` + `filter` |
| **Structural Honesty** | Let data structure eliminate branches | `if (type === 'A') {...} else if (type === 'B')` |

### The Single Question

Before writing code, ask:

```text
"Can this variable be COMPUTED instead of STORED?"
"Can this BRANCH become a DATA LOOKUP?"
```

### Good Taste in Practice

```c
// BAD: Handle special cases with branches
   if (node === head) { ... }
   else if (node === tail) { ... }
   else { node.prev.next = node.next }

// GOOD: Design structure that eliminates special cases
   node.prev.next = node.next  // Sentinel nodes -> no special cases
```

```typescript
// BAD: Store derived state
const [users, setUsers] = useState([])
const [filteredUsers, setFilteredUsers] = useState([])  // REDUNDANT

// GOOD: Compute at render time
const [users, setUsers] = useState([])
const [filter, setFilter] = useState({})
const displayedUsers = useMemo(() => users.filter(applyFilter), [users, filter])
```

---

## Philosophy Reminder

```text
Three-layer traversal:
  Phenomenon -> Collect symptoms, quick fixes
  Essence -> Root cause analysis, system diagnosis
  Philosophy -> Design principles, architectural aesthetics

Ultimate goal:
  From "How to fix" -> "Why it breaks" -> "How to design it right"

Good taste example:
  BAD: if (node == head) {...} else if (node == tail) {...} else {...}
  GOOD: node->prev->next = node->next; node->next->prev = node->prev;
  -> Through sentinel node design, special cases naturally disappear

Remember:
  Simplification is the highest form of complexity
  A branch that can disappear is always more elegant than one written correctly
  True good taste is when someone looks at your code and says: "Damn, this is beautiful"
```

---

*Template Version: 2.0.0*

*Generated by project-initializer skill*
