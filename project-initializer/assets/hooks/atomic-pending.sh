#!/bin/bash
# Atomic Pending Marker — PostToolUse on Edit|Write
# Marks repo state as pending for atomic checkpoint commit.

set -u

MARKER=".claude/.atomic_pending"
mkdir -p ".claude" >/dev/null 2>&1 || true
date "+%Y-%m-%d %H:%M:%S" > "$MARKER" 2>/dev/null || true

exit 0
