---
name: sync-worktree
description: Sync config files and MCP servers between a git worktree and the main worktree (either direction). Use when the user wants to sync worktree config, refresh worktree settings, or push config changes back to main.
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

# Sync Worktree Skill

Sync project configuration files between a git worktree and the main worktree. Supports both directions: main-to-worktree (initial setup / refresh) and worktree-to-main (push changes back).

**Input**: `/sync-worktree [worktree-path-or-name]`

## Step 1: Detect Worktree Layout

```bash
git worktree list
```

Identify the main worktree (first entry) and all other worktrees.
If no worktrees exist besides the main one, tell the user and stop.

## Step 2: Determine the Target Worktree

- If the user provided a path or name, match it against the worktree list.
- If there's only one non-main worktree, use that automatically.
- If there are multiple worktrees and no input was given, use **AskUserQuestion** to let the user pick which worktree to sync.
- The "other" worktree is the one that is NOT the main worktree.

## Step 3: Ask for Sync Direction

Use **AskUserQuestion** to ask:

> Which direction should we sync?

Options:
- **Main to Worktree** — Copy config from main into the worktree (initial setup / refresh)
- **Worktree to Main** — Copy changes from the worktree back to main

Based on the answer, set SOURCE and TARGET accordingly.

## Step 4: Identify Changes

Compare all syncable files/directories between SOURCE and TARGET:

**Files to sync:**
- `AGENTS.md`
- `AGENT.md`
- `CLAUDE.local.md`
- `GEMINI.md`
- `.mcp.json`
- `openspec/` (recursive)
- `.code-review-graph/` (recursive)
- `.claude/commands/` (recursive)
- `.claude/rules/` (recursive — coding-agent rules; canonical in the app repo)
- `.claude/settings.local.json`
- `.git/info/exclude` (per-worktree git ignore rules)

**Vault-canonical sync (separate flow — vault is the source of truth, NOT main app repo):**
- `.claude/skills/qa-fix/` — flows between `<vault>/.claude/skills/qa-fix/` and `<TARGET>` worktree

```bash
# For individual files
diff <SOURCE>/AGENTS.md <TARGET>/AGENTS.md 2>/dev/null

# For directories
diff -rq <SOURCE>/openspec/ <TARGET>/openspec/ 2>/dev/null
diff -rq <SOURCE>/.code-review-graph/ <TARGET>/.code-review-graph/ 2>/dev/null
diff -rq <SOURCE>/.claude/commands/ <TARGET>/.claude/commands/ 2>/dev/null
diff -rq <SOURCE>/.claude/rules/ <TARGET>/.claude/rules/ 2>/dev/null

# Vault-canonical /qa-fix (vault is the source of truth, not main app repo)
# Direction main-to-worktree: compare <vault>/.claude/skills/qa-fix vs <TARGET>/.claude/skills/qa-fix
# Direction worktree-to-main: compare <SOURCE>/.claude/skills/qa-fix vs <vault>/.claude/skills/qa-fix
# (The "main" side never holds /qa-fix; it always lives in vault.)

# For git exclude (resolve each worktree's gitdir first)
SOURCE_GITDIR=$(git -C <SOURCE> rev-parse --git-dir)
TARGET_GITDIR=$(git -C <TARGET> rev-parse --git-dir)
diff "$SOURCE_GITDIR/info/exclude" "$TARGET_GITDIR/info/exclude" 2>/dev/null
```

Note: worktrees do NOT share `.git/info/exclude` with the main repo — each has its own. Use `git rev-parse --git-dir` from inside each worktree to resolve the correct path.

Also check MCP server config:
```bash
jq --arg src "<SOURCE_PATH>" --arg tgt "<TARGET_PATH>" '
  { source: (.projects[$src].mcpServers // {}), target: (.projects[$tgt].mcpServers // {}) }
' ~/.claude.json
```

## Step 5: Show Preview

Present a clear summary:
```
## Sync Preview

Direction: Main → Worktree  (or Worktree → Main)
Source: /path/to/source
Target: /path/to/target

### Files
- New: AGENTS.md
- Modified: openspec/some-file.md
- Unchanged: CLAUDE.local.md (skipping)

### MCP Servers
- Will copy 3 server configs

Ready to sync?
```

If there are no differences, inform the user that everything is already in sync and stop.

## Step 6: Ask for Confirmation

**CRITICAL: Always show the preview and wait for user approval before syncing.**

Ask: "Ready to sync, or would you like to adjust?"

## Step 7: Sync Files

After user approval, copy files from SOURCE to TARGET:

```bash
# Ensure .claude directory exists in target
mkdir -p <TARGET>/.claude

# Individual files (only copy if they exist in source)
cp <SOURCE>/AGENTS.md <TARGET>/ 2>/dev/null
cp <SOURCE>/AGENT.md <TARGET>/ 2>/dev/null
cp <SOURCE>/CLAUDE.local.md <TARGET>/ 2>/dev/null
cp <SOURCE>/GEMINI.md <TARGET>/ 2>/dev/null
cp <SOURCE>/.mcp.json <TARGET>/ 2>/dev/null
cp <SOURCE>/.claude/settings.local.json <TARGET>/.claude/ 2>/dev/null

# Directories (use rsync with --delete to keep in sync)
rsync -av --delete <SOURCE>/openspec/ <TARGET>/openspec/ 2>/dev/null
rsync -av --delete <SOURCE>/.code-review-graph/ <TARGET>/.code-review-graph/ 2>/dev/null
rsync -av --delete <SOURCE>/.claude/commands/ <TARGET>/.claude/commands/ 2>/dev/null
rsync -av --delete <SOURCE>/.claude/rules/ <TARGET>/.claude/rules/ 2>/dev/null

# Vault-canonical /qa-fix (vault is source of truth — bypasses main app repo)
# main-to-worktree direction: vault -> worktree
# worktree-to-main direction: worktree -> vault
mkdir -p <TARGET>/.claude/skills
if [ "$DIRECTION" = "main-to-worktree" ]; then
  rsync -av --delete <vault>/.claude/skills/qa-fix/ <TARGET>/.claude/skills/qa-fix/ 2>/dev/null
else
  rsync -av --delete <SOURCE>/.claude/skills/qa-fix/ <vault>/.claude/skills/qa-fix/ 2>/dev/null
fi

# Git exclude file (per-worktree, resolve via rev-parse)
SOURCE_GITDIR=$(git -C <SOURCE> rev-parse --git-dir)
TARGET_GITDIR=$(git -C <TARGET> rev-parse --git-dir)
mkdir -p "$TARGET_GITDIR/info"
cp "$SOURCE_GITDIR/info/exclude" "$TARGET_GITDIR/info/exclude" 2>/dev/null
```

## Step 8: Sync MCP Server Config

```bash
SOURCE_PATH="<source-worktree-path>"
TARGET_PATH="<target-worktree-path>"
jq --arg src "$SOURCE_PATH" --arg tgt "$TARGET_PATH" '
  .projects[$tgt].mcpServers = (.projects[$src].mcpServers // {})
' ~/.claude.json > /tmp/claude.json.tmp && mv /tmp/claude.json.tmp ~/.claude.json
```

If the source project entry has no `mcpServers` or it's empty, skip this step.

## Step 9: Report Results

Summarize:
- Sync direction
- Source and target paths
- Which files were copied
- Which MCP servers were copied
- Any files that were skipped (didn't exist in source)

## Guardrails

- Never overwrite without showing the preview and getting confirmation
- If the target already has these files, mention they'll be overwritten before proceeding
- Do NOT create worktrees — this skill only syncs config between existing ones
- Does NOT commit anything — only copies files. The user must commit separately.
- Uses `--delete` for directory syncs to keep directories truly in sync
