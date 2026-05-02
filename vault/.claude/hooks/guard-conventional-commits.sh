#!/bin/bash
# Guard hook for Claude Code PreToolUse:Bash
# Blocks `git commit -m "..."` commands whose message does not match the
# Conventional Commits format (feat / fix / chore / docs / style / refactor /
# perf / test / build / ci / revert).
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

block() {
  local reason="$1"
  jq -n --arg reason "$reason" '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "block",
      "permissionDecisionReason": $reason
    }
  }'
  exit 0
}

# Only act on git commit invocations
if echo "$CMD" | grep -qE '(^|[;&|]+[[:space:]]*)git[[:space:]]+commit[[:space:]]'; then
  # Extract -m "<msg>" or -m '<msg>'
  commit_msg=$(echo "$CMD" | grep -oP '(?<=-m\s)["\x27]([^"\x27]*)["\x27]' | head -1 | sed -E "s/^[\"']|[\"']$//g")

  # Heredoc form: -m "$(cat <<'EOF' ... EOF)" — let it pass; the heredoc-body
  # is harder to inspect cleanly here, and a stricter check would over-block.
  if [ -z "$commit_msg" ]; then
    exit 0
  fi

  if ! echo "$commit_msg" | grep -qE '^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)(\(.+\))?!?:'; then
    block "Commit message must use Conventional Commits format (feat:, fix:, chore:, docs:, style:, refactor:, perf:, test:, build:, ci:, revert:). Got: \"${commit_msg}\""
  fi
fi

exit 0
