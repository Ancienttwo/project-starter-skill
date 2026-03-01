# {{PROJECT_NAME}} Development Guide

> **Developer**: {{USER_NAME}}
> **Service Target**: {{SERVICE_TARGET}}
> **Interaction Style**: {{INTERACTION_STYLE}}
> **Thinking Mode**: ultrathink - Three-layer traversal (Phenomenon -> Essence -> Philosophy -> Output)
> **Default Runtime Profile**: Plan + Permissionless | Codex full access (`sandbox_mode=danger-full-access`, `approval_policy=never`) | Claude `--dangerously-skip-permissions` | Mutations only in linked worktrees with atomic checkpoints

---


## Iron Rules

### 1. Good Taste
- Eliminate special cases instead of adding if/else
- More than 3 branches -> Stop, refactor data structure
- More than 3 levels of nesting -> Design error, must refactor
- More than 20 lines per function -> Ask if you're doing it wrong

### 2. Pragmatism
- Solve real problems, not hypothetical threats
- Write the simplest working implementation first, then optimize

### 3. Stand on Giants' Shoulders

**New feature development flow:**
1. **Search for mature solutions** - Use Context7 / GitHub / npm for best practices
2. **Analyze project constraints** - Evaluate against existing codebase and tech stack
3. **Propose integration plan** - Don't reinvent wheels, but don't blindly copy either

### 4. Zero Compatibility Debt

```yaml
FORBIDDEN:
  - Writing special branches for backward compatibility
  - Keeping deprecated APIs or functions
  - Feature detection to support multiple implementations
  - "for compatibility" or "legacy support" comments
  - Backward-compatible shims or polyfills
  - Renaming unused _vars variables
  - Adding "// removed" comments for history

REQUIRED:
  - Delete unused code directly
  - Upgrade dependencies or refactor, never write compatibility layers
  - If breaking old formats, let it break
  - Keep codebase clean, no historical baggage
```

### 5. Code Quality Red Lines

| Metric | Limit |
|--------|-------|
| File lines | <= 800 |
| Files per folder | <= 8 (create subdirectories if more) |
| Function lines | <= 20 |
| Nesting levels | <= 3 |
| Branch count | <= 3 |

### 6. Prohibitions

{{PROHIBITIONS}}


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


## Project Structure

```
{{PROJECT_STRUCTURE}}
```

### Tech Stack

| Layer | Technology |
|-------|------------|
{{TECH_STACK_TABLE}}

---

## Workflow Rules

### File Management

```yaml
MODIFY FIRST PRINCIPLE:
  1. Check existing file structure first
  2. Prefer modifying/extending over creating new files
  3. Permissionless by default for file mutations
  4. Mutate only in linked git worktrees and commit atomically after green checks
  5. Delete temporary files immediately after use

DIRECTORY STRUCTURE:
  # ===== IMMUTABLE LAYER (Asset Layer - Core Assets) =====
  /specs/:
    PURPOSE: Feature specifications (IMMUTABLE)
    INCLUDES:
      - overview.md       # Overall requirements overview
      - modules/          # Module-specific feature specs
    RULES:
      - Modifying Spec = Rewrite all downstream
      - Write Spec first, then code

  /contracts/:
    PURPOSE: Interface contracts (IMMUTABLE)
    INCLUDES:
      - types.ts          # Shared type definitions
      - modules/          # Module-specific interface contracts
    RULES:
      - Changing interface must first change Spec
      - Interface is the only basis for implementation

  /tests/:
    PURPOSE: Tests are the truth (IMMUTABLE)
    INCLUDES:
      - unit/             # Unit tests
      - integration/      # Integration tests
      - e2e/              # End-to-end tests
    RULES:
      - Test code quantity >= Implementation code quantity
      - Test failure = Delete module and rewrite

  # ===== MUTABLE LAYER (Toilet Paper Layer - Can Rewrite Anytime) =====
  /src/:
    PURPOSE: Implementation (MUTABLE - Toilet Paper Zone)
    INCLUDES:
      - modules/          # Module-organized implementation code
    RULES:
      - Can be deleted and rewritten anytime
      - Don't patch, rewrite

  # ===== SUPPORTING (Support Layer) =====
  /docs/:
    PURPOSE: Technical documentation (commit to Git)
    INCLUDES:
      - architecture/     # System design docs
      - api/              # API documentation
      - guides/           # Developer guides
      - archives/         # Archived PROGRESS.md files
      - PROGRESS.md       # AI development log
      - TODO.md           # Pending tasks
      - CHANGELOG.md      # Version history

  /scripts/:
    PURPOSE: Automation scripts
    INCLUDES:
      - regenerate.sh     # One-click delete and rewrite a module

  /.ops/:
    PURPOSE: Operations & sensitive configs (DO NOT commit to Git)
    INCLUDES:
      - .env.local        # Local environment variables
      - database/         # DB migrations, seeds
      - secrets/          # API keys, certificates

  /artifacts/:
    PURPOSE: Build outputs (DO NOT commit to Git)
    INCLUDES:
      - dist/             # Production builds
      - coverage/         # Test coverage reports
```


### Progress Tracking

```yaml
docs/PROGRESS.md:
  PURPOSE: AI development log for tracking progress
  MAX_LINES: 2000
  ARCHIVE_TRIGGER: When exceeding 2000 lines
  ARCHIVE_PATH: docs/archives/PROGRESS-{YYYY-MM-DD}.md
  KEEP_RECENT: 200 lines (latest progress)
  FORMAT: |
    ## YYYY-MM-DD Session
    ### Completed
    - [x] Task description
    ### In Progress
    - [ ] Current work
    ### Notes
    - Key decisions made

docs/TODO.md:
  PURPOSE: Pending tasks not yet implemented
  RULES:
    - Only keep UNSTARTED tasks
    - Delete completed tasks immediately
    - No "done" or "completed" markers
    - Brief descriptions only
  FORMAT: |
    ## Priority: High
    - [ ] Task description
    ## Priority: Normal
    - [ ] Task description
    ## Backlog
    - [ ] Future consideration
```

**Rules:**
- Update `docs/PROGRESS.md` after each development session
- Auto-archive to `docs/archives/` when exceeding 2000 lines, keep only latest 200 lines
- Delete tasks from `docs/TODO.md` immediately when completed
- When user says `continue`, immediately proceed to next step

### Changelog & Versioning

```yaml
docs/CHANGELOG.md:
  PURPOSE: Version history for releases
  FORMAT: Keep a Changelog (https://keepachangelog.com/)
  VERSIONING: Semantic Versioning (https://semver.org/)

VERSION_FORMAT: MAJOR.MINOR.PATCH
  MAJOR: Breaking changes, incompatible API changes
  MINOR: New features, backward compatible
  PATCH: Bug fixes, backward compatible

CHANGELOG_SECTIONS:
  - Added      # New features
  - Changed    # Changes in existing functionality
  - Deprecated # Soon-to-be removed features
  - Removed    # Removed features
  - Fixed      # Bug fixes
  - Security   # Security vulnerabilities

RELEASE_RULES:
  # When to bump versions
  PATCH_TRIGGERS:
    - Bug fixes
    - Typo corrections
    - Documentation updates
    - Dependency patches (non-breaking)

  MINOR_TRIGGERS:
    - New features (backward compatible)
    - New API endpoints
    - New components/modules
    - Deprecation notices
    - Performance improvements

  MAJOR_TRIGGERS:
    - Breaking API changes
    - Database schema changes (non-backward compatible)
    - Removed features
    - Major architecture changes
    - Dependency major version upgrades

PRE_RELEASE_TAGS:
  - alpha   # Early development, unstable
  - beta    # Feature complete, testing
  - rc      # Release candidate, final testing
  # Example: 2.0.0-alpha.1, 2.0.0-beta.2, 2.0.0-rc.1

CHANGELOG_TEMPLATE: |
  ## [Unreleased]

  ## [X.Y.Z] - YYYY-MM-DD
  ### Added
  - New feature description

  ### Changed
  - Change description

  ### Fixed
  - Bug fix description
```

### AI-Driven Version Control Strategy

```yaml
GIT_BRANCH_STRATEGY:
  main:
    PURPOSE: Production-ready code
    PROTECTION: Require PR, no direct push
    DEPLOYS_TO: Production

  develop:
    PURPOSE: Integration branch
    PROTECTION: Require PR from feature branches
    DEPLOYS_TO: Staging

  feature/*:
    NAMING: feature/{ticket-id}-{short-description}
    EXAMPLE: feature/PROJ-123-add-user-auth
    LIFECYCLE: Branch from develop -> PR to develop -> Delete after merge

  hotfix/*:
    NAMING: hotfix/{ticket-id}-{description}
    EXAMPLE: hotfix/PROJ-456-fix-login-crash
    LIFECYCLE: Branch from main -> PR to main + develop -> Delete after merge
    TRIGGERS: PATCH version bump

COMMIT_MESSAGE_FORMAT:
  PATTERN: "{type}({scope}): {description}"
  TYPES:
    - feat     # New feature -> MINOR bump
    - fix      # Bug fix -> PATCH bump
    - docs     # Documentation only
    - style    # Formatting, no code change
    - refactor # Code restructure, no behavior change
    - perf     # Performance improvement -> MINOR bump
    - test     # Adding tests
    - chore    # Build, CI, dependencies
    - breaking # Breaking change -> MAJOR bump (use with feat/fix)

  EXAMPLES:
    - "feat(auth): add OAuth2 login support"
    - "fix(api): resolve null pointer in user endpoint"
    - "breaking(api): remove deprecated v1 endpoints"
    - "chore(deps): upgrade React to v19"

AI_CHANGELOG_GENERATION:
  TRIGGER: Before each release
  COMMAND: "Generate CHANGELOG from commits since last tag"
  PROCESS:
    1. AI scans commits since last version tag
    2. Groups by type (feat -> Added, fix -> Fixed, etc.)
    3. Extracts scope for categorization
    4. Generates human-readable descriptions
    5. Suggests version bump based on commit types

  AUTO_VERSION_RULES:
    - Has "breaking" or "BREAKING CHANGE" -> MAJOR
    - Has "feat" -> MINOR
    - Only "fix", "docs", "chore" -> PATCH
```

**AI-Assisted Release Workflow:**

```yaml
RELEASE_PROCESS:
  # Step 1: AI analyzes commits
  AI_ANALYSIS:
    INPUT: git log --oneline $(git describe --tags --abbrev=0)..HEAD
    OUTPUT:
      - Suggested version: X.Y.Z
      - Grouped changes by category
      - Breaking change warnings
      - Migration notes (if needed)

  # Step 2: AI generates CHANGELOG entry
  CHANGELOG_GENERATION:
    PROMPT: |
      Based on the following commits, generate a CHANGELOG entry:
      {commits}

      Current version: {current_version}
      Suggested new version: {suggested_version}

      Format as Keep a Changelog style.

  # Step 3: Human review
  HUMAN_REVIEW:
    - Review AI-generated CHANGELOG
    - Adjust version if needed
    - Add migration notes for breaking changes
    - Approve release

  # Step 4: Automated release
  RELEASE_COMMANDS: |
    # Update version in package.json
    npm version {version} --no-git-tag-version

    # Commit version bump
    git add package.json CHANGELOG.md
    git commit -m "chore(release): v{version}"

    # Create annotated tag
    git tag -a v{version} -m "Release v{version}"

    # Push with tags
    git push origin main --tags
```

**Deployment Integration:**

```yaml
DEPLOYMENT_TRIGGERS:
  PRODUCTION:
    TRIGGER: New version tag (v*)
    BRANCH: main
    ACTIONS:
      - Run full test suite
      - Build production bundle
      - Deploy to production
      - Notify team (Slack/Discord)
    ROLLBACK: git revert + new PATCH release

  STAGING:
    TRIGGER: Push to develop
    BRANCH: develop
    ACTIONS:
      - Run tests
      - Build staging bundle
      - Deploy to staging
      - Run smoke tests

  PREVIEW:
    TRIGGER: PR opened/updated
    ACTIONS:
      - Build preview
      - Deploy to preview URL
      - Run E2E tests
      - Post preview URL to PR
```


**Cloudflare Deployment Options (Recommended):**

```yaml
CLOUDFLARE_DEPLOYMENT:
  # ===== Option 1: Pages (Frontend + Functions) =====
  PAGES:
    BEST_FOR: SPA, SSR (Remix/Next.js), Static sites
    FEATURES:
      - Git integration (auto-deploy)
      - Preview URLs for every PR
      - Global CDN (300+ locations)
      - Zero config SSL
    DEPLOY: |
      # Connect GitHub repo in dashboard, or:
      npx wrangler pages deploy dist

  # ===== Option 2: Workers (API Backend) =====
  WORKERS:
    BEST_FOR: REST API, WebSocket, Edge computing
    FEATURES:
      - 0ms cold start (V8 Isolates)
      - Global edge deployment
      - 100k free requests/day
    DEPLOY: |
      npx wrangler deploy

  # ===== Option 3: Containers (Beta) =====
  CONTAINERS:
    BEST_FOR: Python/Go/Rust backends, ML inference, Complex dependencies
    FEATURES:
      - Docker container support
      - Edge deployment
      - Full runtime flexibility
    DEPLOY: |
      # Dockerfile + wrangler.toml
      npx wrangler containers deploy

  # ===== Recommended Architecture =====
  STACK_RECOMMENDATIONS:
    FRONTEND_ONLY:
      -> Pages (auto-deploy from Git)

    FRONTEND_PLUS_API:
      -> Pages (frontend) + Workers (API)
      -> Or Pages with /functions directory

    FULL_STACK_EDGE:
      -> Pages + Workers + D1 + R2

    AI_APPLICATION:
      -> Pages + Workers + Workers AI + Vectorize

    PYTHON_BACKEND:
      -> Pages (frontend) + Containers (FastAPI/Flask)

    MONOREPO:
      -> Turborepo + Pages (apps/web) + Workers (apps/api)
```

**CI/CD Integration:**

```yaml
CI_CD_INTEGRATION:
  GITHUB_ACTIONS:
    release.yml: |
      on:
        push:
          tags: ['v*']
      jobs:
        release:
          - Checkout
          - Install dependencies
          - Run tests
          - Build
          - Deploy to Cloudflare Pages
          - Create GitHub Release

  CLOUDFLARE_PAGES:
    - Auto-deploy on push to main
    - Preview deploys for PRs
    - Instant rollback via dashboard
    - Build cache for faster deploys

  WRANGLER_CI: |
    # GitHub Actions example
    - name: Deploy to Cloudflare
      uses: cloudflare/wrangler-action@v3
      with:
        apiToken: ${{ secrets.CF_API_TOKEN }}
        command: pages deploy dist --project-name=my-app

VERSION_IN_CODE:
  # Inject version at build time
  VITE: |
    // vite.config.ts
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }

  RUNTIME_CHECK: |
    // Display version in app
    console.log(`App version: ${__APP_VERSION__}`)
```

**Cloudflare AI Services (Dify Alternative):**

```yaml
CLOUDFLARE_AI_STACK:
  # ===== Workers AI (LLM Calls) =====
  WORKERS_AI:
    MODELS:
      - Llama 3.1 8B/70B (conversation)
      - Mistral 7B (fast inference)
      - BGE Base (Embedding)
      - Whisper (speech-to-text)
      - Flux Schnell (image generation)
    PRICING: $0.011/1k neurons (10x+ cheaper than OpenAI)
    ADVANTAGE: Edge inference, data stays in region

  # ===== AI Gateway (API Management) =====
  AI_GATEWAY:
    FEATURES:
      - Unified calls to OpenAI/Claude/Gemini
      - Request caching (save 50%+ cost)
      - Rate limiting for budget protection
      - Auto fallback
      - Complete audit logs
    USE_CASE: |
      # Call any LLM through Gateway
      fetch("https://gateway.ai.cloudflare.com/v1/{account}/my-gateway/openai/...")

  # ===== AutoRAG (Knowledge Base) =====
  AUTORAG:
    FEATURES:
      - Upload documents, auto-index
      - Automatic chunking + Embedding
      - Vector search + answer generation
    USE_CASE: Enterprise knowledge base, customer service bots

  # ===== Vectorize (Vector Storage) =====
  VECTORIZE:
    FEATURES:
      - Free 5M vectors
      - Seamless integration with Workers AI Embedding
      - Millisecond-level queries
    USE_CASE: RAG, semantic search

  # ===== vs Dify Comparison =====
  COMPARISON:
    | Feature | Dify | Cloudflare |
    |---------|------|------------|
    | LLM calls | Multi-model | Workers AI + AI Gateway |
    | Knowledge base | Built-in | AutoRAG + Vectorize |
    | Workflow | Visual | Code (Workflows) |
    | Deployment | Needs server | Serverless edge |
    | Cost | $$$ | $ (generous free tier) |
    | Latency | Centralized | Edge (global <50ms) |
    | Data privacy | Self-host needed | Edge processing, data stays local |

  # ===== Recommended Strategy =====
  STRATEGY:
    Simple AI apps:
      -> Workers AI (free tier sufficient)

    Production AI:
      -> AI Gateway -> Claude/GPT + Workers AI fallback

    RAG apps:
      -> Vectorize + Workers AI Embedding + AutoRAG

    Complex workflows:
      -> Cloudflare Workflows + Workers AI
      -> Or keep Dify for orchestration, call Workers AI
```

**Durable Objects (State Management Solution):**

```yaml
DURABLE_OBJECTS:
  # ===== Core Capabilities =====
  FEATURES:
    - Globally unique singleton (only one instance per ID)
    - Strong consistency state (no distributed locks needed)
    - Built-in persistent storage (Key-Value + SQL)
    - WebSocket connection management
    - Auto hibernate/wake (pay per use)

  # ===== Typical Use Cases =====
  USE_CASES:
    Real-time collaboration:
      SCENARIO: Multi-user document editing (like Notion/Figma)
      HOW: One DO per document, manages all editors' WebSockets
      EXAMPLE: |
        export class Document {
          connections = new Set<WebSocket>()
          async fetch(request: Request) {
            const [client, server] = Object.values(new WebSocketPair())
            this.connections.add(server)
            server.accept()
            server.addEventListener('message', (msg) => {
              // Broadcast to other editors
              for (const conn of this.connections) {
                if (conn !== server) conn.send(msg.data)
              }
            })
            return new Response(null, { status: 101, webSocket: client })
          }
        }

    Game rooms:
      SCENARIO: Multiplayer game matching/room state
      HOW: One DO per room, manages player state and game logic
      ADVANTAGE: Global low latency (geo-routed)

    Rate limiting:
      SCENARIO: API Rate Limiting
      HOW: One DO per user/API Key
      ADVANTAGE: Strong consistency counting, no Redis needed

    Shopping cart/Sessions:
      SCENARIO: E-commerce cart, user sessions
      HOW: One DO per user, persists cart state
      ADVANTAGE: No external database, auto-persistence

    Distributed locks:
      SCENARIO: Prevent duplicate operations (like payments)
      HOW: Operation ID corresponds to one DO
      ADVANTAGE: Global singleton guarantees atomicity

    Real-time counters:
      SCENARIO: Likes, online users, inventory
      HOW: Resource ID corresponds to one DO
      EXAMPLE: |
        export class Counter {
          value = 0
          async fetch(request: Request) {
            if (request.method === 'POST') this.value++
            return new Response(String(this.value))
          }
        }

  # ===== Storage Options =====
  STORAGE:
    KEY_VALUE:
      API: this.state.storage.get/put/delete
      LIMIT: 128KB per value
      USE_CASE: Simple state, config

    SQL (SQLite):
      API: this.state.storage.sql
      LIMIT: 10GB per DO
      USE_CASE: Complex queries, relational data
      EXAMPLE: |
        const result = await this.state.storage.sql
          .exec("SELECT * FROM messages WHERE room_id = ?", [roomId])

  # ===== Pricing =====
  PRICING:
    Requests: $0.15/million requests
    Duration: $12.50/million GB-s
    Storage: $0.20/GB/month
    Free tier: 100k requests/day + 1GB storage

  # ===== vs Traditional Solutions =====
  COMPARISON:
    | Scenario | Traditional | Durable Objects |
    |----------|------------|-----------------|
    | Real-time collab | Redis Pub/Sub + external DB | Single DO (simpler code) |
    | Distributed lock | Redis SETNX / DB locks | DO singleton (natural atomicity) |
    | Session state | Redis / Memcached | DO storage (built-in persistence) |
    | WebSocket | Needs dedicated server | DO built-in support |
    | Consistency | Eventually consistent | Strongly consistent |

  # ===== Best Practices =====
  BEST_PRACTICES:
    - One DO only manages one "entity" (user/document/room)
    - Avoid frequent communication between DOs (reduce dependencies in design)
    - Use Hibernation API to reduce idle costs
    - Consider SQLite for large data instead of KV
    - Use Queues for async task processing
```

**Quick Commands:**

```bash
# View unreleased changes
git log --oneline $(git describe --tags --abbrev=0)..HEAD

# Suggest next version (AI command)
# /changelog-preview

# Create release (after AI generates CHANGELOG)
npm version minor -m "chore(release): v%s"
git push origin main --tags

# Rollback production (emergency)
git revert HEAD
npm version patch -m "chore(release): rollback v%s"
git push origin main --tags
```


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
