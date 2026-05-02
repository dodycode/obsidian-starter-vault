---
name: sync-worktrees
description: Pull latest default branch on the main app repo, then rebase every child worktree onto it. Reports per-worktree status (clean / skipped-uncommitted / skipped-conflict). Does NOT push or commit. Use when the user says "sync worktrees", "rebase children", "refresh stack on default branch", or wants to bring the whole worktree fleet up to date.
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

# Sync Worktrees Skill

Refresh every child worktree by pulling the latest default branch into the main app repo and then rebasing each worktree's branch onto the new default-branch tip. This is the orchestrator-side housekeeping that keeps the whole stack from drifting.

**Input**: `/sync-worktrees`

**Distinct from `/sync-worktree`** (singular, file-config sync between main and one worktree). This skill (plural) handles the git rebase of every worktree at once.

## Step 1: Detect App Repo Root

Resolve the app repo path from `<vault>/CLAUDE.local.md` "Path Bindings" (`<project-repo>` placeholder). If not in `CLAUDE.local.md`, ask the user via **AskUserQuestion**.

## Step 2: Detect Default Branch

```bash
DEFAULT_BRANCH=$(gh -R <project-repo-slug> repo view --json defaultBranchRef -q .defaultBranchRef.name)
# Or, if gh isn't available / not in a GitHub repo:
# DEFAULT_BRANCH=$(git -C <project-repo> symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')
```

## Step 3: List Worktrees

```bash
git -C <project-repo> worktree list
```

The first entry is the main worktree; the rest are children. Skip:
- Any worktree under `.git/` (auto-managed)
- The main worktree itself (it gets the pull, not a rebase)

## Step 4: Pull Latest on Main

```bash
git -C <project-repo> fetch origin
git -C <project-repo> checkout "$DEFAULT_BRANCH"
git -C <project-repo> pull origin "$DEFAULT_BRANCH"
```

If main has uncommitted changes, abort the entire skill and tell the user — don't try to rebase children on a stale base.

## Step 5: Rebase Each Child Worktree

For each child worktree path, run this sequence INSIDE that worktree:

```bash
cd <worktree-path>

# Skip if dirty
if [ -n "$(git status --short)" ]; then
  echo "SKIPPED: $worktree (uncommitted changes)"
  continue
fi

# Detect Graphite tracking — if the branch appears in the cache, use gt
GRAPHITE_CACHE="<project-repo>/.git/.graphite_cache_persist"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ -f "$GRAPHITE_CACHE" ] && grep -q "\"$BRANCH\"" "$GRAPHITE_CACHE"; then
  # Graphite-tracked: restack onto fresh default branch
  if gt restack 2>&1 | tee /tmp/gt-restack-$$.log | grep -q -i conflict; then
    gt restack --abort 2>/dev/null || git rebase --abort 2>/dev/null
    echo "SKIPPED: $worktree (gt restack conflict — needs manual resolve)"
  else
    echo "OK: $worktree (gt restack)"
  fi
else
  # Plain rebase onto default branch
  if ! git rebase "origin/$DEFAULT_BRANCH"; then
    git rebase --abort
    echo "SKIPPED: $worktree (rebase conflict — needs manual resolve)"
  else
    echo "OK: $worktree (git rebase)"
  fi
fi
```

## Step 6: Report Summary

Print a concise per-worktree table:

```
Worktree                             | Branch              | Status
-------------------------------------+---------------------+-----------------
my-saas-42-feat-auth                 | 42-feat-auth        | OK (git rebase)
my-saas-50-fix-login                 | 50-fix-login        | OK (gt restack)
my-saas-77-refactor                  | 77-refactor         | SKIPPED (uncommitted)
my-saas-101-experiment               | 101-experiment      | SKIPPED (conflict)
```

Then list any worktrees that need manual attention with the conflict file paths printed.

## Guardrails

- NEVER push, NEVER commit, NEVER force anything. Pure local-rebase housekeeping.
- NEVER touch the main app repo's branch besides the default-branch pull.
- If the user has a worktree with a non-default base branch (rare — stack on top of another feature branch), leave it alone — only rebase worktrees whose base is the default branch (Graphite knows; plain rebase logic uses `origin/$DEFAULT_BRANCH` blindly, so document this caveat).
- Always abort a failing rebase before moving on — never leave a worktree in mid-rebase state.
- If `gt` is not installed and a Graphite-tracked branch is encountered, fall through to plain `git rebase origin/$DEFAULT_BRANCH` (Graphite metadata may degrade until next `gt sync`, but the local refs stay correct).

## When to Use

- After a PR merges into the default branch and you want every in-progress branch to pick up the new base.
- Periodic stack-hygiene check (e.g. start of week, after a long absence).
- Before opening a stack of PRs to ensure the stack is on top of the latest base.

## Why Vault Scope

This skill sits in vault `.claude/skills/` because it's orchestrator housekeeping — invoked from your Dev Control session, not from inside any individual worktree. Mirrors the vault home of `/new-worktree` and `/sync-worktree`.
