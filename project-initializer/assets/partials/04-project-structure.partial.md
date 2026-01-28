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

  /ops/:
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
