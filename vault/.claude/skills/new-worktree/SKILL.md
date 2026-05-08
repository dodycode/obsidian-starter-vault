---
name: new-worktree
description: Create a new git worktree and branch from a GitHub issue identifier, then scaffold the SDD context/ folder + dual-mode CLAUDE.local.md. Use when the user wants to create a new worktree, start work on a GitHub issue in a new worktree, or says "new worktree".
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
  - ToolSearch
---

# New Worktree Skill

Create a new git worktree with a branch named after a GitHub issue identifier, scaffold the SDD `context/` folder with empty stubs, write a dual-mode `CLAUDE.local.md`, then copy env files + MCP + the `/qa-fix` skill.

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
cd "<project-repo>"
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

**Note on `<source>/CLAUDE.local.md`**: this file is NOT copied from source. The worktree's `CLAUDE.local.md` is written explicitly in Step 6.5 below as the SDD dual-mode entry-point. Copying the app overlay would dump the project-overview + working-style rules on top of the per-task content (the auto-loaded app `CLAUDE.md` already covers all of it). See `<vault>/.claude/rules/dev-control-workflows.md` "Pre-write check" for the rationale.

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

## Step 6.5: Scaffold context/ + write dual-mode CLAUDE.local.md

This is the SDD scaffolding step. The orchestrator never authors specs in the vault — the coding agent does, inside this worktree. So the scaffold here is empty stubs: the agent fills them in during Session 1.

### 6.5a — Scaffold empty context/ stubs

Create `<target>/context/` with three empty stubs (frontmatter + section headers, no body content):

```bash
mkdir -p <target>/context
```

Write each stub from the corresponding template at `<vault>/Templates/spec-driven/`:

- `<target>/context/proposal.md` — copy `<vault>/Templates/spec-driven/proposal.md` content. Substitute `<repo>#NN [Title]` in the H1 with the real `<repo>#<num>` and the GitHub issue title (no body filling — the user/agent fills it in Session 1).
- `<target>/context/design.md` — same, from `Templates/spec-driven/design.md`.
- `<target>/context/tasks.md` — same, from `Templates/spec-driven/tasks.md`.

Do NOT create `progress-tracker.md` here. The coding agent generates it at the end of Session 1's spec phase.

Do NOT create `sub-tasks/`. The coding agent creates that folder in Session 1 only if the user opts into sub-task expansion.

### 6.5b — Write CLAUDE.local.md from Template A

Fetch the GitHub issue title (the user already verified the issue exists in Step 1):

```bash
TITLE=$(gh issue view <num> --repo <owner>/<repo> --json title -q .title)
ISSUE_URL=$(gh issue view <num> --repo <owner>/<repo> --json url -q .url)
```

Write `<target>/CLAUDE.local.md` (overwrite, not append) using **Template A** from `<vault>/.claude/rules/dev-control-workflows.md` ("Template A — Dual-mode SDD entry-point"). Substitute:

- `<repo>#<num>` and `[Title from GitHub Issue]` in the H1
- The GitHub URL into the `## Source material` section (under `GitHub: <url>`)
- Any other source URLs the orchestrator gathered at intake (paste them under "## Source material")
- `<daily-today>` with the resolved daily-note path from the user's `CLAUDE.local.md` Path Bindings

Template A is dual-mode: the agent reads `context/proposal.md`. Empty → spec phase (Session 1). Populated → implementation phase (Session 2+).

### 6.5c — Sanity check

```bash
head -1 <target>/CLAUDE.local.md
ls <target>/context/
```

The first line MUST be `# Task: <repo>#<num> — ...`. The `context/` listing MUST include `proposal.md`, `design.md`, `tasks.md` (no `progress-tracker.md`, no `sub-tasks/`). If either check fails, re-run Step 6.5.

## Step 7: Report the Result

Summarize:
- Branch name + worktree path
- Files copied (env, MCP, /qa-fix)
- Empty SDD stubs scaffolded: `context/proposal.md`, `context/design.md`, `context/tasks.md`
- Dual-mode `CLAUDE.local.md` written

Hand off:

> Worktree ready at `<worktree-path>`. Open it in VS Code, then start a fresh Claude session there. Session 1 is the SDD spec phase — the coding agent will read source material from `CLAUDE.local.md`, grep the codebase, run the spec interview with you, and fill in `context/proposal.md` + `context/design.md` + `context/tasks.md`. After approval, fresh session per task.

## Guardrails

- Always `git fetch origin` before creating
- Base branch is the GitHub repo's default branch (`gh repo view --json defaultBranchRef`)
- Do NOT push the branch
- Only fetch `gh issue view --json number,title,body,state` to verify the issue exists — do NOT fetch extra details (comments, reactions, timeline) by default
- NEVER fill in proposal.md / design.md / tasks.md content from this skill. The orchestrator scaffolds empty stubs only. The coding agent in the worktree fills them in during Session 1.
