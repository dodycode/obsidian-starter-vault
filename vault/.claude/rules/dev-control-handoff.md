# Dev Control Handoff — Orchestrator Does Not Implement

Applies whenever a Claude session is acting as **Dev Control** (the orchestration layer that creates worktrees, writes task-context CLAUDE.local.md files, updates Active Work, manages GitHub Issue states). Detected by: working directory is the vault, `CLAUDE.local.md` identifies the session as the Dev Control orchestrator, or rules under `<vault>/.claude/rules/dev-control-*.md` are loaded.

## Rule

Dev Control's job ends after **all four** of these are done:

1. Worktree created (via `/new-worktree <repo>#<num>` or manual fallback)
2. Worktree-root `CLAUDE.local.md` written with full task context (objective, affected areas, acceptance criteria, key files, plan reference, daily-note logging instructions)
3. Active Work note updated (Branch + Worktree columns populated, Active Worktrees row added)
4. GitHub Issue marked in-progress (`gh issue edit <num> --add-label in-progress`) — or whatever state is appropriate

After that, **HAND OFF** — do not implement.

## What "do not implement" means

- **No `Edit` / `Write` on app/package source files** (anything under `apps/`, `packages/`, `src/`, `services/`, etc. of the target repo)
- **No typecheck / lint / test from the Dev Control session** — those belong to the coding agent in the worktree
- **No `cd <worktree-path>` from the Dev Control session** to start coding there. Tell the user to start a **fresh Claude session** inside the worktree. The coding agent's CLAUDE.local.md will load there with clean context.
- **No staging / committing app code from Dev Control.** Vault-side artifacts (Active Work, daily notes, plan files, your personal `CLAUDE.local.md`) are fine to edit; app source code is not.

## Why

- **Clean context for coding work.** Dev Control's session is stuffed with orchestration noise (GitHub API calls, worktree filesystem operations, vault edits, plan iterations). That's the wrong starting context for implementation. A fresh session in the worktree starts with only the task context the orchestrator hand-built into `CLAUDE.local.md` — which is exactly the brief the coding agent should read.
- **Two distinct roles, two distinct skill sets.** Dev Control specializes in: planning conversations, scope discipline, GitHub Issue grooming, plan-mode rigor, multi-source status aggregation. Coding agents specialize in: codebase navigation, type-safe refactors, test writing, typecheck + lint iteration. Mixing them produces noisy context, dropped verification steps, and incomplete handoffs.
- **Avoids accidental cross-worktree edits.** When Dev Control is in the vault and accidentally implements in the worktree, the diff lands somewhere the orchestrator never opened — easy to miss in review.

## How to apply

When the user has approved a plan and Dev Control has finished steps 1–4 above, the next message MUST be a handoff, not implementation. Template:

```
Worktree ready at <worktree-path>. CLAUDE.local.md has the full task
context: objective, affected files, acceptance criteria, key existing
patterns to reuse. Cd into the worktree and start a fresh Claude session
to implement — that session will pick up CLAUDE.local.md automatically.

Coding-agent gates (from <worktree>/CLAUDE.local.md): typecheck → lint →
stage the diff for your review. No auto-commit.
```

## Exception

User explicitly overrides ("just implement it from here", "you're already in context, finish it"). Even then, log the override in the session and propose adding the user's request as a permanent change to `<vault>/.claude/rules/dev-control-workflows.md` if they want orchestrator-implements-too to become the default — don't silently drift.
