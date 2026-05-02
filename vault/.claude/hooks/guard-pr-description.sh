#!/bin/bash
# Guard hook for Claude Code PreToolUse:Bash
# Strips AI-attribution footers ("Generated with Claude Code",
# "Co-Authored-By: Claude", "Co-Authored-By: Anthropic", the robot emoji
# block) from `gh pr create` / `gh pr edit` body args.
#
# Generic — works in any repo.
# Wired in via .claude/settings.local.json by scripts/bootstrap.sh (or manually).

set -euo pipefail

if ! command -v jq &>/dev/null; then
  exit 0
fi

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$CMD" ]; then
  exit 0
fi

# Only act on gh pr create / gh pr edit
echo "$CMD" | grep -qE '(^|[;&|]+[[:space:]]*)gh[[:space:]]+pr[[:space:]]+(create|edit)' || exit 0

# Look for AI attribution patterns
if echo "$CMD" | grep -qiE 'Generated (with|by) Claude|Claude Code|Co-Authored-By.*Claude|Co-Authored-By.*Anthropic'; then
  CLEANED=$(echo "$CMD" | sed -E \
    -e 's/[[:space:]]*🤖[[:space:]]*Generated with \[Claude Code\]\(https:\/\/claude\.com\/claude-code\)[[:space:]]*//gi' \
    -e 's/[[:space:]]*Generated (with|by) \[?Claude( Code)?\]?(\([^)]*\))?[[:space:]]*//gi' \
    -e 's/[[:space:]]*Co-Authored-By:.*Claude.*//gi' \
    -e 's/[[:space:]]*Co-Authored-By:.*Anthropic.*//gi')

  ORIGINAL_INPUT=$(echo "$INPUT" | jq -c '.tool_input')
  UPDATED_INPUT=$(echo "$ORIGINAL_INPUT" | jq --arg cmd "$CLEANED" '.command = $cmd')

  jq -n \
    --argjson updated "$UPDATED_INPUT" \
    '{
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "allow",
        "permissionDecisionReason": "Stripped AI attribution from PR description",
        "updatedInput": $updated
      }
    }'
  exit 0
fi

exit 0
