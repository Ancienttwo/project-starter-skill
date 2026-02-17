### Plan Annotation Protocol

> **Origin**: Inspired by Boris Tane's Research → Plan → Annotate → Implement → Feedback workflow.

The plan file (`docs/plan.md`) is **shared mutable state** between you and the AI. Both read and write it. This enables iterative refinement that binary approve/reject cannot achieve.

```
┌─────────────────────────────────────────────────┐
│  1. AI writes docs/plan.md                       │
│  2. You open docs/plan.md in your editor         │
│  3. You add inline annotations:                  │
│     - "not optional" (2 words)                   │
│     - A paragraph explaining business context    │
│     - Paste a code snippet as reference          │
│     - Delete an entire section                   │
│     - "visibility goes on list, not item"        │
│  4. You tell AI:                                 │
│     "read annotations in docs/plan.md,           │
│      update accordingly.                         │
│      DON'T IMPLEMENT YET."                       │
│  5. AI reads file → interprets → rewrites plan   │
│  6. → Back to step 2 (repeat 1-6 times)         │
│  7. When satisfied: "implement it all"           │
└─────────────────────────────────────────────────┘
```

```yaml
ANNOTATION_RULES:
  FILE: docs/plan.md
  PERSISTENCE: Survives context compression — AI re-reads file each round
  GUARD: AI must NOT implement until user explicitly says "implement"
  TYPICAL_ROUNDS: 1-6 (3 rounds makes a generic plan project-specific)

  AI_BEHAVIOR:
    ON_ANNOTATED_PLAN:
      1. Read docs/plan.md in full
      2. Identify all user annotations (new text, deletions, inline comments)
      3. Rewrite plan incorporating all annotations
      4. Preserve sections user did not touch
      5. Ask clarifying questions if annotations are ambiguous
      6. Do NOT start implementation

    ON_IMPLEMENT_COMMAND:
      1. Read final docs/plan.md
      2. Create TodoWrite checklist from plan sections
      3. Execute in batched phases
      4. Update docs/plan.md with completion status
```

**When to use**: For any non-trivial feature (3+ files, architectural decisions, or unclear scope). Skip for single-file fixes.

---

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
