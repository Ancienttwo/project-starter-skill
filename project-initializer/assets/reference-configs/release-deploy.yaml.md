# Release Process & Deployment Reference

> Extracted from `05-workflow.partial.md` — detailed release workflow and deployment triggers.

## AI-Assisted Release Workflow

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

## Deployment Triggers

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
