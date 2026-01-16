# {{PROJECT_NAME}} Development Guide

> **Developer**: {{USER_NAME}}
> **Service Target**: {{SERVICE_TARGET}}
> **Interaction Style**: {{INTERACTION_STYLE}}
> **Thinking Mode**: ultrathink — Three-layer traversal (Phenomenon → Essence → Philosophy → Output)

---

## Iron Rules

### 1. Good Taste
- Eliminate special cases instead of adding if/else
- More than 3 branches → Stop, refactor data structure
- More than 3 levels of nesting → Design error, must refactor
- More than 20 lines per function → Ask if you're doing it wrong

### 2. Pragmatism
- Solve real problems, not hypothetical threats
- Write the simplest working implementation first, then optimize

### 3. Stand on Giants' Shoulders

**New feature development flow:**
1. **Search for mature solutions** — Use Context7 / GitHub / npm for best practices
2. **Analyze project constraints** — Evaluate against existing codebase and tech stack
3. **Propose integration plan** — Don't reinvent wheels, but don't blindly copy either

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
| File lines | ≤ 800 |
| Files per folder | ≤ 8 (create subdirectories if more) |
| Function lines | ≤ 20 |
| Nesting levels | ≤ 3 |
| Branch count | ≤ 3 |

### 6. Prohibitions

{{PROHIBITIONS}}

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
  3. Get permission before creating files
  4. Delete temporary files immediately after use

DIRECTORY STRUCTURE:
  /docs/:
    PURPOSE: Technical documentation (commit to Git)
    ORGANIZE_BY: Feature / Module
    INCLUDES:
      - architecture/     # System design docs
      - api/              # API documentation
      - guides/           # Developer guides
      - archives/         # Archived PROGRESS.md files
      - PROGRESS.md       # AI development log
      - TODO.md           # Pending tasks
      - CHANGELOG.md      # Version history

  /ops/:
    PURPOSE: Operations & sensitive configs (DO NOT commit to Git)
    INCLUDES:
      - .env.local        # Local environment variables
      - .env.production   # Production env (encrypted or reference)
      - database/         # DB migrations, seeds, backups
      - scripts/          # Deployment & maintenance scripts
      - docker/           # Docker compose, configs
      - secrets/          # API keys, certificates

  /artifacts/:
    PURPOSE: Build outputs (DO NOT commit to Git)
    INCLUDES:
      - dist/             # Production builds
      - coverage/         # Test coverage reports
      - reports/          # Generated reports
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
    LIFECYCLE: Branch from develop → PR to develop → Delete after merge

  hotfix/*:
    NAMING: hotfix/{ticket-id}-{description}
    EXAMPLE: hotfix/PROJ-456-fix-login-crash
    LIFECYCLE: Branch from main → PR to main + develop → Delete after merge
    TRIGGERS: PATCH version bump

COMMIT_MESSAGE_FORMAT:
  PATTERN: "{type}({scope}): {description}"
  TYPES:
    - feat     # New feature → MINOR bump
    - fix      # Bug fix → PATCH bump
    - docs     # Documentation only
    - style    # Formatting, no code change
    - refactor # Code restructure, no behavior change
    - perf     # Performance improvement → MINOR bump
    - test     # Adding tests
    - chore    # Build, CI, dependencies
    - breaking # Breaking change → MAJOR bump (use with feat/fix)

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
    2. Groups by type (feat → Added, fix → Fixed, etc.)
    3. Extracts scope for categorization
    4. Generates human-readable descriptions
    5. Suggests version bump based on commit types

  AUTO_VERSION_RULES:
    - Has "breaking" or "BREAKING CHANGE" → MAJOR
    - Has "feat" → MINOR
    - Only "fix", "docs", "chore" → PATCH
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
      → Pages (auto-deploy from Git)

    FRONTEND_PLUS_API:
      → Pages (frontend) + Workers (API)
      → Or Pages with /functions directory

    FULL_STACK_EDGE:
      → Pages + Workers + D1 + R2

    AI_APPLICATION:
      → Pages + Workers + Workers AI + Vectorize

    PYTHON_BACKEND:
      → Pages (frontend) + Containers (FastAPI/Flask)

    MONOREPO:
      → Turborepo + Pages (apps/web) + Workers (apps/api)
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
  # ===== Workers AI (替代 Dify 的 LLM 调用) =====
  WORKERS_AI:
    MODELS:
      - Llama 3.1 8B/70B (对话)
      - Mistral 7B (快速推理)
      - BGE Base (Embedding)
      - Whisper (语音转文字)
      - Flux Schnell (图像生成)
    PRICING: $0.011/1k neurons (比 OpenAI 便宜 10x+)
    ADVANTAGE: 边缘推理，数据不出境

  # ===== AI Gateway (替代 Dify 的 API 管理) =====
  AI_GATEWAY:
    FEATURES:
      - 统一调用 OpenAI/Claude/Gemini
      - 请求缓存 (节省 50%+ 成本)
      - 限流保护预算
      - 自动 Fallback
      - 完整日志审计
    USE_CASE: |
      # 通过 Gateway 调用任意 LLM
      fetch("https://gateway.ai.cloudflare.com/v1/{account}/my-gateway/openai/...")

  # ===== AutoRAG (替代 Dify 的知识库) =====
  AUTORAG:
    FEATURES:
      - 上传文档自动索引
      - 自动分块 + Embedding
      - 向量搜索 + 答案生成
    USE_CASE: 企业知识库、客服机器人

  # ===== Vectorize (替代 Dify 的向量存储) =====
  VECTORIZE:
    FEATURES:
      - 免费 5M 向量
      - 与 Workers AI Embedding 无缝集成
      - 毫秒级查询
    USE_CASE: RAG、语义搜索

  # ===== vs Dify 对比 =====
  COMPARISON:
    | 功能 | Dify | Cloudflare |
    |------|------|------------|
    | LLM 调用 | ✅ 多模型 | ✅ Workers AI + AI Gateway |
    | 知识库 | ✅ 内置 | ✅ AutoRAG + Vectorize |
    | 工作流 | ✅ 可视化 | ⚠️ 代码 (Workflows) |
    | 部署 | ⚠️ 需服务器 | ✅ Serverless 边缘 |
    | 成本 | $$$ | $ (免费层充足) |
    | 延迟 | 中心化 | 边缘 (全球 <50ms) |
    | 数据隐私 | 需自托管 | 边缘处理不出境 |

  # ===== 推荐策略 =====
  STRATEGY:
    简单 AI 应用:
      → Workers AI (免费层足够)

    生产级 AI:
      → AI Gateway → Claude/GPT + Workers AI fallback

    RAG 应用:
      → Vectorize + Workers AI Embedding + AutoRAG

    复杂工作流:
      → Cloudflare Workflows + Workers AI
      → 或保留 Dify 做编排，调用 Workers AI
```

**Durable Objects (状态管理解决方案):**

```yaml
DURABLE_OBJECTS:
  # ===== 核心能力 =====
  FEATURES:
    - 全局唯一单例 (每个 ID 只有一个实例)
    - 强一致性状态 (无需分布式锁)
    - 内置持久化存储 (Key-Value + SQL)
    - WebSocket 连接管理
    - 自动休眠/唤醒 (按使用付费)

  # ===== 典型用例 =====
  USE_CASES:
    实时协作:
      SCENARIO: 多人文档编辑 (如 Notion/Figma)
      HOW: 每个文档一个 DO，管理所有编辑者 WebSocket
      EXAMPLE: |
        export class Document {
          connections = new Set<WebSocket>()
          async fetch(request: Request) {
            const [client, server] = Object.values(new WebSocketPair())
            this.connections.add(server)
            server.accept()
            server.addEventListener('message', (msg) => {
              // 广播给其他编辑者
              for (const conn of this.connections) {
                if (conn !== server) conn.send(msg.data)
              }
            })
            return new Response(null, { status: 101, webSocket: client })
          }
        }

    游戏房间:
      SCENARIO: 多人游戏匹配/房间状态
      HOW: 每个房间一个 DO，管理玩家状态和游戏逻辑
      ADVANTAGE: 全球低延迟 (就近路由)

    限流计数器:
      SCENARIO: API Rate Limiting
      HOW: 每个用户/API Key 一个 DO
      ADVANTAGE: 强一致性计数，无需 Redis

    购物车/会话:
      SCENARIO: 电商购物车、用户会话
      HOW: 每个用户一个 DO，持久化购物车状态
      ADVANTAGE: 无需外部数据库，自动持久化

    分布式锁:
      SCENARIO: 防止重复操作 (如支付)
      HOW: 操作 ID 对应一个 DO
      ADVANTAGE: 全局单例保证原子性

    实时计数:
      SCENARIO: 点赞数、在线人数、库存
      HOW: 资源 ID 对应一个 DO
      EXAMPLE: |
        export class Counter {
          value = 0
          async fetch(request: Request) {
            if (request.method === 'POST') this.value++
            return new Response(String(this.value))
          }
        }

  # ===== 存储选项 =====
  STORAGE:
    KEY_VALUE:
      API: this.state.storage.get/put/delete
      LIMIT: 128KB per value
      USE_CASE: 简单状态、配置

    SQL (SQLite):
      API: this.state.storage.sql
      LIMIT: 10GB per DO
      USE_CASE: 复杂查询、关系数据
      EXAMPLE: |
        const result = await this.state.storage.sql
          .exec("SELECT * FROM messages WHERE room_id = ?", [roomId])

  # ===== 定价 =====
  PRICING:
    请求: $0.15/百万请求
    持续时间: $12.50/百万 GB-s
    存储: $0.20/GB/月
    免费层: 每日 10万请求 + 1GB 存储

  # ===== vs 传统方案 =====
  COMPARISON:
    | 场景 | 传统方案 | Durable Objects |
    |------|----------|-----------------|
    | 实时协作 | Redis Pub/Sub + 外部 DB | 单一 DO (代码更简单) |
    | 分布式锁 | Redis SETNX / 数据库锁 | DO 单例 (天然原子) |
    | 会话状态 | Redis / Memcached | DO 存储 (持久化内置) |
    | WebSocket | 需要专门服务器 | DO 内置支持 |
    | 一致性 | 最终一致 | 强一致 |

  # ===== 最佳实践 =====
  BEST_PRACTICES:
    - 一个 DO 只管理一个"实体" (用户/文档/房间)
    - 避免 DO 之间频繁通信 (设计时减少依赖)
    - 利用 Hibernation API 减少空闲成本
    - 大数据考虑 SQLite 而非 KV
    - 配合 Queues 处理异步任务
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
    - Key decisions → docs/architecture/decisions/
    - Technical debt → docs/TODO.md (Backlog)
    - Learnings → docs/PROGRESS.md (Notes section)
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
∴ State Count ∝ Bug Count
∴ Minimize State, Maximize Derivation
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
   node.prev.next = node.next  // Sentinel nodes → no special cases
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
  Phenomenon → Collect symptoms, quick fixes
  Essence → Root cause analysis, system diagnosis
  Philosophy → Design principles, architectural aesthetics

Ultimate goal:
  From "How to fix" → "Why it breaks" → "How to design it right"

Good taste example:
  ❌ if (node == head) {...} else if (node == tail) {...} else {...}
  ✅ node->prev->next = node->next; node->next->prev = node->prev;
  → Through sentinel node design, special cases naturally disappear

Remember:
  Simplification is the highest form of complexity
  A branch that can disappear is always more elegant than one written correctly
  True good taste is when someone looks at your code and says: "Damn, this is beautiful"
```

---

*Template Version: 2.0.0*

*Generated by project-initializer skill*
