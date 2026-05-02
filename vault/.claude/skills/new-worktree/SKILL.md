---
name: new-worktree
description: Create a new git worktree and branch from a GitHub issue identifier, then copy config files. Use when the user wants to create a new worktree, start work on a GitHub issue in a new worktree, or says "new worktree".
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
  - ToolSearch
---

# New Worktree Skill

Create a new git worktree with a branch named after a GitHub issue identifier, then set it up with project config files.

**Input**: `/new-worktree <repo>#<num>` (e.g. `dodycode/my-saas#42`) or `/new-worktree <num>` if a default repo is set in your `CLAUDE.local.md`.

## Step 1: Parse the Issue Input

Parse the input to extract owner, repo, and issue number:

- `<owner>/<repo>#<num>` → split on `#`, then on `/` for the repo part
- `<num>` alone → use the default repo from `CLAUDE.local.md` Path Bindings (`<project-repo-slug>`)
- `https://github.com/<owner>/<repo>/issues/<num>` URL → parse out the three parts
- Run `gh issue view <num> --repo <owner>/<repo> --json number,title,body,state` to verify it exists
- If no input provided, use **AskUserQuestion** to ask for the issue identifier or URL

## Step 2: Determine Paths

- Branch name: `<num>-<slug>` where `<slug>` is a kebab-case version of the issue title (lowercase, hyphenated, max 40 chars)
- Worktree path: `<worktree-parent>/<project-name>-<num>-<slug>` — i.e. sibling of `<project-repo>`. `<worktree-parent>`, `<project-name>`, and `<project-repo>` resolve from `CLAUDE.local.md` Path Bindings.

## Step 3: Create the Worktree

```bash
git fetch origin
DEFAULT_BRANCH=$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)
git worktree add -b <branch-name> <worktree-path> "origin/$DEFAULT_BRANCH"
```

If the branch already exists, ask the user whether to use the existing branch or pick a new name.
If the worktree path already exists, warn the user and stop.

## Step 4: Copy Config Files

Copy these from the main repo to the new worktree, skipping any that don't exist:

```bash
mkdir -p <target>/.claude

cp <source>/.env <target>/ 2>/dev/null
cp <source>/.env.local <target>/ 2>/dev/null
cp <source>/AGENTS.md <target>/ 2>/dev/null
cp <source>/AGENT.md <target>/ 2>/dev/null
cp <source>/GEMINI.md <target>/ 2>/dev/null
cp <source>/.mcp.json <target>/ 2>/dev/null
cp -r <source>/.claude/skills <target>/.claude/ 2>/dev/null
cp -r <source>/.claude/commands <target>/.claude/ 2>/dev/null
cp <source>/.claude/settings.local.json <target>/.claude/ 2>/dev/null

# Vault-canonical: /qa-fix lives in <vault>/.claude/skills/, not in the app repo.
# Copy it explicitly so the worktree-side coding agent can run /qa-fix.
# <vault> resolves per-machine via CLAUDE.local.md "Path Bindings".
mkdir -p <target>/.claude/skills
cp -r <vault>/.claude/skills/qa-fix <target>/.claude/skills/qa-fix 2>/dev/null
```

**Note on `<source>/CLAUDE.local.md`**: this file is NOT copied from source. The worktree's `CLAUDE.local.md` is written explicitly in Step 6.5 below — either as the SDD entry-point or the legacy per-task block. Copying the app overlay would dump the project-overview + working-style rules on top of the per-task content (the auto-loaded app `CLAUDE.md` already covers all of it). See `<vault>/.claude/rules/dev-control-workflows.md` "Pre-write check" for the rationale.

## Step 5: Sync git exclude

Worktrees do NOT share `.git/info/exclude` with the main repo — each worktree has its own. Copy the main repo's exclude rules so locally-ignored files stay untracked in the worktree:

```bash
SOURCE_GITDIR=$(git -C <source> rev-parse --git-common-dir)
TARGET_GITDIR=$(git -C <target> rev-parse --git-dir)
mkdir -p "$TARGET_GITDIR/info"
cp "$SOURCE_GITDIR/info/exclude" "$TARGET_GITDIR/info/exclude" 2>/dev/null
```

## Step 6: Copy MCP Server Config

Copy the `mcpServers` from the source project's entry in `~/.claude.json` to the new worktree's project entry:

```bash
SOURCE_PATH="<source-worktree-path>"
TARGET_PATH="<target-worktree-path>"
jq --arg src "$SOURCE_PATH" --arg tgt "$TARGET_PATH" '
  .projects[$tgt].mcpServers = (.projects[$src].mcpServers // {})
' ~/.claude.json > /tmp/claude.json.tmp && mv /tmp/claude.json.tmp ~/.claude.json
```

If the source project entry has no `mcpServers` or it's empty, skip this step.

## Step 6.5: Copy SDD context + write CLAUDE.local.md

This step replaces the per-task block writer that previously lived in `dev-control-workflows.md`.

### 6.5a — Detect SDD context files

Check whether Dev Control's SDD flow generated context files for this ticket:

```bash
SDD_CONTEXT_DIR="<vault>/Tickets/<repo>-<num>/context"
```

Where `<vault>` resolves per-machine via `CLAUDE.local.md` "Path Bindings".

If `$SDD_CONTEXT_DIR` exists → **SDD path** (Template A entry-point).
If it does NOT exist → **Short-circuit path** (Template B legacy block) — Dev Control either short-circuited at Phase 2 (spike/one-line tweak) or you're invoking `/new-worktree` outside of SDD.

### 6.5b — SDD path (context files exist)

Copy the context folder, then write the entry-point:

```bash
cp -r "$SDD_CONTEXT_DIR" <target>/context
```

Fetch the GitHub issue title (the user already verified the issue exists in Step 1):

```bash
TITLE=$(gh issue view <num> --repo <owner>/<repo> --json title -q .title)
```

Write `<target>/CLAUDE.local.md` (overwrite, not append) using **Template A** from `<vault>/.claude/rules/dev-control-workflows.md`. Substitute `<repo>#<num>` and `<Title from GitHub Issue>`. Replace `<daily-today>` with the resolved daily-note path from the user's `CLAUDE.local.md` Path Bindings.

### 6.5c — Short-circuit path (no context files)

Use **Template B** from `<vault>/.claude/rules/dev-control-workflows.md` (legacy per-task block — Objective / Affected Areas / Acceptance Criteria / Key Files / Notes / Daily Note Logging).

Pull Objective + Acceptance Criteria from the GitHub issue body. If the user invoked `/new-worktree` outside SDD (no interview happened), fill in placeholder values and ask the user to fill them in before starting the coding session.

Write `<target>/CLAUDE.local.md` (overwrite, not append).

### 6.5d — Sanity check

```bash
head -1 <target>/CLAUDE.local.md
```

The first line MUST be `# Task: <repo>#<num> — ...`. If it shows the app repo `CLAUDE.md` opening line instead, the overwrite didn't take — re-run Step 6.5b or 6.5c.

## Step 7: Report the Result

Summarize: branch name, worktree path, files copied, MCP servers copied, **whether SDD context files were copied (Step 6.5b path) or short-circuit block written (Step 6.5c path)**.
Suggest: `cd <worktree-path>` and start a fresh Claude session — the worktree's `CLAUDE.local.md` will guide the coding agent through `context/*.md` (SDD path) or the per-task block (short-circuit path).

## Guardrails

- Always `git fetch origin` before creating
- Base branch is the GitHub repo's default branch (`gh repo view --json defaultBranchRef`)
- Do NOT push the branch
- Only fetch from `gh issue view --json number,title,body,state` to verify the issue exists — do NOT fetch extra details (comments, reactions, timeline) by default
