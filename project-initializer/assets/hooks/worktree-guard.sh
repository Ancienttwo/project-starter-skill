#!/bin/bash
# Worktree Guard — PreToolUse on Edit|Write
# Hard-blocks mutations unless running inside a linked git worktree.

set -u

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Mutation blocked: this directory is not a git repository."
  echo "   Required policy: write operations must run in a linked git worktree."
  echo "   Fix:"
  echo "   1) git init && git commit --allow-empty -m \"chore: init\""
  echo "   2) git worktree add ../<repo>-wt-<branch> -b <branch>"
  echo "   3) cd ../<repo>-wt-<branch>"
  exit 1
fi

GIT_DIR="$(git rev-parse --git-dir 2>/dev/null || true)"
if [[ "$GIT_DIR" != *".git/worktrees/"* ]]; then
  echo "❌ Mutation blocked: primary working tree detected ($GIT_DIR)."
  echo "   Required policy: write operations are allowed only in linked worktrees."
  echo "   Fix:"
  echo "   1) git worktree add ../<repo>-wt-<branch> -b <branch>"
  echo "   2) cd ../<repo>-wt-<branch>"
  exit 1
fi

exit 0
