# Dev Control Workflow Procedures

> **User-agnostic.** Paths use placeholders (`<project-repo>`, `<vault>`, `<your-name>`, `<active-work>`, `<daily-today>`) which `CLAUDE.local.md` resolves to absolute paths on your machine. Don't hardcode user-specific paths here.

## Spec-Driven Flow — start here

Every Dev Control session that opens a new piece of work runs the **Spec-Driven Development (SDD) flow** before provisioning a worktree. The flow has 6 phases:

1. **Source detection + parallel read** — GitHub Issue, screenshot, or pure chat. Vault hits read in parallel via fork agents.
2. **Combined interview to 95% confidence** — AskUserQuestion only. First question includes a spike short-circuit.
3. **Propose context files** — agent picks 0-7 of `project-overview.md`, `architecture.md`, `code-standards.md`, `ai-workflow-rules.md`, `ui-context.md`, `bugfix-spec.md`, `progress-tracker.md`. User confirms via AskUserQuestion.
4. **Generate context + build plan** — write to `<vault>/Tickets/<repo>-<num>/context/` (or `Tickets/draft-<slug>/` if no issue yet).
5. **GitHub Issue materialization** — skip if issue already exists. Else `gh issue create --repo <repo> --title "..." --body "..." --assignee @me` using interview output.
6. **Worktree provisioning** — `/new-worktree` copies `context/` into the worktree and writes `CLAUDE.local.md` as a JSM-style entry-point.

Full flow content (source detection rules, file-generation prompts, GitHub field mapping, draft mode, sub-step contracts) lives in `dev-control-spec-driven.md`. This file is the orchestration layer (worktree, Active Work, GitHub Issue lifecycle, handoff).

### Short-circuit path (spike / one-line tweak)

If Phase 2's first question reveals the work is a spike or one-line config bump:
- Skip Phases 3-4 (no context files generated)
- Phase 5 still creates a lightweight GitHub Issue if none exists
- Phase 6 provisions the worktree using the **legacy per-task block** (template below) instead of the SDD entry-point

This preserves a fast path for trivial work without forcing the full SDD machinery.

---

## Creating a Worktree for a GitHub Issue

### Prerequisites
- GitHub Issue exists (`<repo>#<num>`) — created either in Phase 5 of SDD flow, or previously
- SDD flow's context files exist at `<vault>/Tickets/<repo>-<num>/context/` — OR the work is on the short-circuit path (no context files)
- You know which modules/areas are affected

### Preferred path: use `/new-worktree`

The `/new-worktree <repo>#<num>` skill is canonical — it copies env files + MCP servers + creates the branch + worktree, **and** copies `<vault>/Tickets/<repo>-<num>/context/` into the worktree, **and** writes `CLAUDE.local.md` as the SDD entry-point. Use it unless there's a reason not to.

### Manual fallback

```bash
# 1. Ensure app repo is up to date
cd "<project-repo>"
git fetch origin
DEFAULT_BRANCH=$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)
git checkout "$DEFAULT_BRANCH"
git pull origin "$DEFAULT_BRANCH"

# 2. Create the branch
git checkout -b 123-short-description

# 3. Create the worktree
git worktree add "../<project-name>-123-short-description" 123-short-description

# 4. Copy environment files
cp .env "../<project-name>-123-short-description/" 2>/dev/null
cp .env.local "../<project-name>-123-short-description/" 2>/dev/null

# 5. Copy SDD context files (if they exist)
if [ -d "<vault>/Tickets/<repo>-123/context" ]; then
  cp -r "<vault>/Tickets/<repo>-123/context" "../<project-name>-123-short-description/"
fi

# 6. Install dependencies (use whatever your project uses)
cd "../<project-name>-123-short-description"
pnpm install   # or npm install, yarn, bun

# 7. Return to main app repo
cd "<project-repo>"
git checkout "$DEFAULT_BRANCH"
```

### Post-Creation: Update Active Work Note
**IMMEDIATELY** after creating a worktree, update `<active-work>`:
1. Add the new issue to the **In Progress** table with issue ID, branch, worktree path, and status
2. Add the new worktree to the **Active Worktrees** table
3. This is non-negotiable — Active Work must always reflect current state

### Post-Creation: Write Worktree CLAUDE.local.md

**ALWAYS replace. Never append. Never let a duplicate-app-repo copy survive.**

Create `CLAUDE.local.md` at the **repo root** of the new worktree (NOT in `.claude/` — that path won't be discovered). Use `CLAUDE.local.md` (NOT `CLAUDE.md`) so it stays gitignored.

#### Pre-write check (mandatory — every session)

`/new-worktree` and similar init paths sometimes leave a worktree-root `CLAUDE.local.md` that is a **verbatim duplicate of the app repo's `CLAUDE.md`**. That duplicate is dead weight:

- The app repo's checked-in `CLAUDE.md` auto-loads in every Claude session running in the worktree.
- Duplicating it inside the gitignored `CLAUDE.local.md` adds noise on top of the auto-loaded copy and crowds out the per-task signal.
- The coding agent's task context (objective, plan reference, affected files, daily-note path) gets buried.

**Rule:** Before writing, READ the existing `CLAUDE.local.md` (if any):

- **Matches app repo `CLAUDE.md` content** (project overview, general code style, generic working-style rules) → **OVERWRITE in full** with the per-task content (SDD entry-point or short-circuit block — see templates below). Do NOT preserve any of the duplicate.
- **Empty or missing** → write the per-task content fresh.
- **Has prior task-specific content** (rare — would only happen if a previous session started one) → confirm with the user before overwriting.

The per-task content is the **entire content** of `CLAUDE.local.md`. Nothing else lives in this file.

#### Template A — SDD entry-point (full SDD flow)

Use this template when context files exist at `<vault>/Tickets/<repo>-<num>/context/`. The skill copies the folder into the worktree, then writes this file pointing at it.

```markdown
# Task: <repo>#<num> — [Title from GitHub Issue]

## Application Building Context

Read the following files in order before implementing or making any architectural decision:

1. `context/project-overview.md` — product definition, goals, features, scope
2. `context/architecture.md` — system structure, boundaries, storage model, invariants
3. `context/ui-context.md` — theme, colors, typography, component conventions
4. `context/code-standards.md` — implementation rules and conventions
5. `context/ai-workflow-rules.md` — development workflow, scoping rules, delivery approach
6. `context/progress-tracker.md` — current phase, completed work, open questions, next steps
7. `context/specs/00-build-plan.md` — unit decomposition + ordering
8. `context/specs/NN-<unit-name>.md` — generate just-in-time before each unit

Skip files that don't exist for this ticket — Dev Control only generated the relevant ones.

Update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, scope, or standards documented in the context files, update the relevant file before continuing.

## Daily Note Logging
**IMPORTANT**: Log your work in today's daily note as you go.
- Path: <daily-today>
- Add an entry under `## In progress`: `- [ ] <repo>#<num>: [description]`
- When finished: move it to `## Shipped today` (checked off) with detail bullets proportional to scope
- When closing the day: flip frontmatter `status: in-progress` → `status: complete`
- Do NOT update <active-work> — that's managed by Dev Control
```

#### Template B — Legacy per-task block (short-circuit only)

Use this template when SDD short-circuited at Phase 2 (spike, one-line tweak). No context files exist for this ticket.

```markdown
# Task: <repo>#<num> — [Title from GitHub Issue]

## Objective
[What needs to be done, in 2-3 sentences]

## Affected Areas
- `<module>` — [what changes here]
- `<module>` — [what changes here]

## Acceptance Criteria
- [ ] [Criterion from GitHub Issue]
- [ ] [Criterion from GitHub Issue]

## Key Files
- `path/to/relevant/file.ts` — [why it's relevant]

## Notes
- [Any gotchas, constraints, or design decisions]
- This task short-circuited the SDD flow (spike / one-line tweak). No context files generated.

## Daily Note Logging
**IMPORTANT**: Log your work in today's daily note as you go.
- Path: <daily-today>
- Add an entry under `## In progress`: `- [ ] <repo>#<num>: [description]`
- When finished: move it to `## Shipped today` (checked off) with detail bullets proportional to scope
- When closing the day: flip frontmatter `status: in-progress` → `status: complete`
- Do NOT update <active-work> — that's managed by Dev Control
```

#### Post-write verification

After writing, run a sanity check:

```bash
head -1 "<worktree-path>/CLAUDE.local.md"
```

The first line MUST be `# Task: <repo>#<num> — [...]`. If it shows the app repo's `CLAUDE.md` opening instead, the overwrite didn't take — re-run the write.

### Post-Creation: HAND OFF — Dev Control does NOT implement

**Dev Control's job ends here.** Implementation runs in a SEPARATE Claude session inside the worktree. Once worktree + CLAUDE.local.md + Active Work + GitHub Issue state are set, hand off:

1. **Tell the user:** "Worktree ready at `<worktree-path>`. `cd` into it and start a fresh Claude session — the `CLAUDE.local.md` there points at `context/*.md` files (full SDD context) OR holds the short-circuit per-task block."
2. **DO NOT write code yourself.** No `Edit`/`Write` on app/package source. No typecheck/lint from Dev Control. Those belong to the coding agent in the worktree.
3. **DO NOT cd into the worktree from your Dev Control session and start coding.** A fresh session = clean context = better code agent. Dev Control's context is stuffed with orchestration noise (Active Work, GitHub Issues, daily-note refresh) — not the right starting point for implementation.
4. **Coding-agent verification is non-negotiable.** The coding agent (in the worktree) must run, in this order: typecheck → lint → fix any failures. Then stage the diff for your review. No auto-commit.

**Why the split matters:** Dev Control orchestrates (GitHub Issues, Active Work, worktrees, plans, handoff context). Coding agents implement (read worktree CLAUDE.local.md, write code, gate with typecheck + lint, stage). Two distinct roles, two distinct sessions. Mixing them produces noisy context, dropped verification steps, and incomplete handoffs.

## Cleaning Up After Merge

**Order matters.** Sync the worktree's `context/` back to the vault BEFORE destroying the worktree. The coding agent updates `progress-tracker.md` (and sometimes other context files when build decisions shift) DURING implementation. Those updates only exist in the worktree until we copy them back. Skip this step and you lose the build history.

```bash
# 1. Sync worktree context/ → vault Tickets/<repo>-<num>/context/
WORKTREE="../<project-name>-123-short-description"
VAULT_TICKET="<vault>/Tickets/<repo>-123"

if [ -d "$WORKTREE/context" ] && [ -d "$VAULT_TICKET/context" ]; then
  # Copy each file individually so we don't drop vault-only files (e.g., notes.md
  # at the parent level, or files the worktree never touched).
  cp -r "$WORKTREE/context/"* "$VAULT_TICKET/context/"
fi

# 2. Remove the worktree
cd "<project-repo>"
git worktree remove "../<project-name>-123-short-description"

# 3. Delete the local branch (if merged)
git branch -d 123-short-description

# 4. Prune stale worktree refs
git worktree prune

# 5. Archive the vault ticket folder (now contains the synced final state)
mv "<vault>/Tickets/<repo>-123" "<vault>/Archive/Tickets/<repo>-123"
```

The archive holds the final snapshot — synced `progress-tracker.md` shows the unit-by-unit ship order, `architecture.md` reflects any invariants that shifted during build, `bugfix-spec.md` shows the actual root cause vs the original hypothesis. Read-only history for future tickets in the same area.

## Stack Workflow (optional — Graphite or git-native)

If you use Graphite, prefer the `/gt-*` skills (`/gt-ship`, `/gt-stack`, `/gt-next`, `/gt-review`) — they wrap the conventions for stacked PRs. Raw `gt` for inspection only.

```bash
# Inspect
gt stack
gt log

# Ship a stack — use /gt-ship
# Stack a new branch on current — use /gt-next
# Scaffold a stack from a plan — use /gt-stack
# Review a stack — use /gt-review

# Sync after merges (manual fallback)
gt sync

# Restack after upstream changes (manual fallback)
gt restack
```

If you don't use Graphite, plain `git` works the same — just open separate PRs from each branch and rebase as the parent merges.

### Stack Decision Framework

**When to stack (multiple PRs in a chain):**
- Changes build on each other logically (e.g., schema migration → API endpoint → UI)
- Large feature that's easier to review in smaller pieces
- Multiple modules change but in a clear dependency order
- Total diff would exceed ~500 lines in a single PR
- SDD build plan has ≥3 units with natural boundary splits

**When to use a single PR:**
- Self-contained change touching ≤ 3 files
- Bug fix, config change, or small feature
- Changes don't have a natural splitting point
- Quick iteration where review speed matters more than granularity

**Stacking patterns:**
```
# Pattern 1: Layer stack (most common — matches SDD build plan ordering)
main
 └─ 123-db-schema             # db changes
     └─ 123-api               # api changes
         └─ 123-ui            # ui changes

# Pattern 2: Feature stack (one issue, multiple PRs)
main
 └─ 123-part-1                # core logic
     └─ 123-part-2            # integration + tests

# Pattern 3: Multi-issue stack (related issues)
main
 └─ 90-ui-polish              # UI fixes
     └─ 91-tool-audit         # depends on UI changes
```

**Stack naming**: Use the GitHub Issue number in every branch: `<num>-description`

## GitHub Issue Lifecycle

### Creation timing — SDD vs legacy

Under SDD, **the GitHub Issue is materialized at Phase 5** (after the interview + context files), not at the start of the conversation. This is a change from any prior flow that created the ticket first.

Exception: if the user starts with `"let's work on <repo>#42"` (existing issue), Phase 5 is skipped — issue already exists.

### After Creating Any GitHub Issue
**IMMEDIATELY** update `<active-work>`:
1. Read the current Active Work note
2. Add the new issue to the appropriate section:
   - **In Progress** table — if work is starting now or a worktree exists
   - **Up Next** — if it's queued but not started yet
3. This is non-negotiable — Active Work must always reflect current state

### After Moving a GitHub Issue
Update `<active-work>` to reflect the state change:
- Labeled `in-progress` → add to In Progress table (if not already there)
- Closed → move from In Progress to Recently Completed
- Labeled `blocked` → move to Blocked section

## GitHub Issue Template

When SDD's Phase 5 creates a GitHub Issue, use this structure (also valid when creating issues manually outside SDD):

**Title**: `[Action verb] [what] [where]` (e.g., "Add calendar sync to dashboard")

**Description**:
```
## Context
[Why this work is needed — 2-3 sentences. Pull from project-overview.md Overview section.]

## Scope
- [Module / area]: [What changes]
- [Module / area]: [What changes]

## Acceptance Criteria
- [ ] [Testable criterion]
- [ ] [Testable criterion]

## Technical Notes
- [Architecture considerations — high level only, no file paths]
- [Dependencies or prerequisites]
- [Related issues: #<num>]
```

> Per `.claude/rules/issue-tracking.md`: NEVER include code, file paths, or function names in GitHub Issue descriptions. Audience is the future-you (or a contributor) reviewing the issue cold. Technical notes stay high-level. Detailed technical content lives in `<vault>/Tickets/<repo>-<num>/context/` instead.

## Active Work Note Procedures

`<active-work>` is a living dashboard of current work.

**Dev Control is the SOLE updater of this note.** No other agent should modify it.

### How to update Active Work:
1. Read today's daily note `<daily-today>` (and yesterday's for spillover)
2. List active worktrees: `cd "<project-repo>" && git worktree list`
3. Query GitHub Issues: `gh issue list --assignee @me --state open --json number,title,labels,state`
4. Read current `<active-work>`
5. Reconcile:
   - Items checked off / moved to "Shipped today" in daily note → move to "Recently Completed"
   - New daily-note items not in Active Work → add to appropriate section
   - Active Work items with no worktree → check if completed or stale
   - Open GitHub Issues not tracked → add them
   - **Drafts**: scan `<vault>/Tickets/draft-*/` folders → list under a "Drafts" sub-section if any exist
6. Auto-cleanup stale worktrees (see below)
7. Write updated note
8. Clean "Recently Completed" items older than 3 days
9. Move drafts older than 30 days to `<vault>/Archive/Tickets/draft-<slug>/`

### Auto-cleanup stale worktrees
During every refresh, check each worktree (besides the main app repo) for staleness:

**A worktree is stale if any of these are true:**
- Its GitHub Issue (extracted from branch name) is closed
- Its work appears checked off / shipped in recent daily notes
- Its branch has been merged into the default branch (`git branch --merged $(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)`)

**Cleanup procedure:**
1. Check for uncommitted changes: `git -C <worktree-path> status --short`
2. If only throwaway files (plan.md, notes.md, .claude/ artifacts, CLAUDE.local.md) → safe to force-remove
3. If real uncommitted source changes → skip removal, flag in Active Work as "has uncommitted changes"
4. **Sync worktree `context/` → vault BEFORE removal** (same step as "Cleaning Up After Merge" #1):
   ```bash
   if [ -d "<worktree-path>/context" ] && [ -d "<vault>/Tickets/<repo>-<num>/context" ]; then
     cp -r "<worktree-path>/context/"* "<vault>/Tickets/<repo>-<num>/context/"
   fi
   ```
   This preserves `progress-tracker.md` (live unit checklist), updated `architecture.md`, and any other context file the coding agent edited during build.
5. Remove: `cd "<project-repo>" && git worktree remove --force <path> && git worktree prune`
6. Delete local branch if merged: `git branch -d <branch-name>`
7. Archive vault ticket folder: `mv "<vault>/Tickets/<repo>-<num>" "<vault>/Archive/Tickets/<repo>-<num>"` (now holds the synced final state)
8. Report all cleanups in the turn-end summary

### When to update Active Work:
- **After creating a GitHub Issue** (add to Up Next or In Progress depending on state)
- **After moving a GitHub Issue** to a different state (in-progress label, closed, etc.)
- After creating/removing a worktree
- After a `/refresh` invocation
- When the user asks for status
- At the start of a new session (quick reconciliation)
- **Rule: If your turn created, moved, or completed a GitHub Issue, you MUST update Active Work before the turn ends.**

## Status Check Procedure

When the user asks for status, gather from these sources:

1. **Active Work note**: Read `<active-work>` — primary dashboard
2. **Active worktrees**: `cd "<project-repo>" && git worktree list`
3. **GitHub Issues**: `gh issue list --assignee @me --state open --json number,title,labels`
4. **Daily note**: Read `<daily-today>` for what's been logged
5. **Drafts**: scan `<vault>/Tickets/draft-*/` for in-flight SDD work without a GitHub Issue
6. **Reconcile** any discrepancies and update Active Work if needed
