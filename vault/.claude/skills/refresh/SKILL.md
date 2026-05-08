---
name: refresh
description: Sync the Active Work note with daily notes, GitHub Issues, and active worktrees. Run anytime for an up-to-date dashboard. Reads path bindings from CLAUDE.local.md (`<active-work>`, `<daily-today>`, `<project-repo>`).
user-invocable: true
---

# Refresh Active Work Dashboard

Sync the Active Work note by reconciling all sources of truth.

> **Path resolution.** This skill uses placeholders (`<active-work>`, `<daily-today>`, `<daily-dir>`, `<project-repo>`) that `CLAUDE.local.md` resolves to absolute paths. If you don't see them resolved, check your `CLAUDE.local.md` "Path Bindings" table.

## Procedure

1. **Read daily notes** — today's and yesterday's (to catch spillover):
   ```bash
   # Linux + macOS portable (today)
   cat "<daily-dir>/$(date +%Y-%m-%d).md"

   # Yesterday — pick the matching command for your OS
   # Linux (GNU date):
   cat "<daily-dir>/$(date -d 'yesterday' +%Y-%m-%d).md"
   # macOS (BSD date):
   cat "<daily-dir>/$(date -v-1d +%Y-%m-%d).md"
   ```

2. **List active worktrees**:
   ```bash
   cd "<project-repo>" && git worktree list
   ```

3. **Query GitHub Issues** for current state. Cover open + recently-closed:
   ```bash
   # Open issues assigned to you
   gh issue list --assignee @me --state open --json number,title,labels,state,createdAt --limit 50

   # Recently closed (last 7 days, for "Recently Completed" section)
   gh issue list --assignee @me --state closed --json number,title,labels,closedAt --limit 30 \
     --search "closed:>=$(date -d '7 days ago' +%Y-%m-%d 2>/dev/null || date -v-7d +%Y-%m-%d)"
   ```

   For each open issue not already in Active Work, **stop and confirm with the user via `AskUserQuestion`** before placing it. Don't auto-bucket into Backlog. Ask which section it belongs to:
   - **In Progress** — work starts now
   - **Backlog (this cycle)** — queued for this cycle, do later
   - **Up Next** — queued for later
   - **Skip** — user wants it ignored on the dashboard for now

   Pay special attention to `createdAt` within the last 48h: those are the highest-risk-of-missing items. Always surface them in the question, never silently file them.

4. **Read current Active Work note**:
   ```bash
   cat "<active-work>"
   ```

5. **Reconcile all sources**:
   - Items checked off / moved to `## Shipped today` in daily note → move to "Recently Completed" in Active Work
   - New items in daily note not in Active Work → add to appropriate section
   - Active Work items with no worktree and no `in-progress` label → mark as stale or completed
   - Open GitHub Issues with `in-progress` label not in Active Work → add them
   - "Recently Completed" items older than 3 days → remove
   - Daily notes with frontmatter `status: complete` → trust as final for that date

6. **Auto-cleanup stale worktrees**:
   For each worktree (besides the main app repo), check if its work is done:
   - Cross-reference the branch's GitHub Issue (extract from branch name like `42-foo`) — if the issue is closed, or if the work appears in `## Shipped today` of recent daily notes, the worktree is stale
   - Also stale: worktrees whose branch has been merged into the default branch (`git branch --merged $(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)` from `<project-repo>`)
   - **Cleanup procedure**:
     a. Check for uncommitted changes: `git -C <worktree-path> status --short`
     b. If only untracked throwaway files (plan.md, notes.md, .claude/ artifacts, CLAUDE.local.md) → safe to force-remove
     c. If real uncommitted source changes exist → flag in Active Work as "has uncommitted changes" and skip removal
     d. **Sync worktree `context/` → vault BEFORE removal** (preserves `proposal.md` + `design.md` + `tasks.md` + `progress-tracker.md` + any `sub-tasks/` the coding agent generated during build):
        ```bash
        if [ -d "<worktree-path>/context" ]; then
          mkdir -p "<vault>/Tickets/<repo>-<num>/context"
          cp -r "<worktree-path>/context/"* "<vault>/Tickets/<repo>-<num>/context/"
        fi
        ```
     e. Remove: `cd "<project-repo>" && git worktree remove --force <path> && git worktree prune`
     f. Delete local branch if merged: `git branch -d <branch-name>`
     g. Archive vault ticket folder: `mv "<vault>/Tickets/<repo>-<num>" "<vault>/Archive/Tickets/<repo>-<num>"` (now holds the synced final state)
   - Report all cleanups in the turn-end summary

7. **Write updated Active Work note** preserving the dashboard format:
   - In Progress (priority-ordered)
   - Up Next
   - Blocked (with reason and date)
   - Active Stacks (ASCII diagram if you use Graphite)
   - Recently Completed
   - Spillover (carried-over items with original start date)

8. **End-of-turn summary**: one line — what changed (items added, moved, removed, worktrees cleaned up).

## Guardrails

- NEVER force-remove a worktree with uncommitted source changes — flag in Active Work, ask the user.
- NEVER delete a branch that hasn't been merged into the default branch.
- This skill is read-mostly + Active-Work-write only. It does NOT modify app source, it does NOT push, it does NOT create GitHub Issues.
