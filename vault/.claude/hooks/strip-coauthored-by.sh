#!/bin/bash
# Safety-net hook for Claude Code PostToolUse:Bash
# After a `git commit`, amends the commit message to drop any
# `Co-Authored-By: Claude / Anthropic` trailer that may have slipped in.
# Silent no-op if not a commit command or no attribution found.
#
# Generic — works in any repo.
# Wired in via .claude/settings.local.json by scripts/bootstrap.sh (or manually).

if ! command -v jq &>/dev/null; then
  exit 0
fi

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

if [ -z "$CMD" ]; then
  exit 0
fi

# Only act on git commit commands
echo "$CMD" | grep -qE '(^|[;&|]+[[:space:]]*)git[[:space:]]+commit' || exit 0

# Must be in a git repo
git rev-parse --git-dir &>/dev/null || exit 0

# Get last commit message
msg=$(git log -1 --format='%B' 2>/dev/null)

# Check for AI-attribution lines
echo "$msg" | grep -qi 'Co-Authored-By:.*Claude\|Co-Authored-By:.*Anthropic' || exit 0

# Strip the attribution lines + collapse trailing blank lines
clean_msg=$(echo "$msg" | grep -vi 'Co-Authored-By:.*Claude\|Co-Authored-By:.*Anthropic' | sed -e :a -e '/^[[:space:]]*$/{$d;N;ba;}')

# Amend the commit. --no-verify prevents recursive hook triggers.
git commit --amend --no-verify -m "$clean_msg" &>/dev/null

exit 0
