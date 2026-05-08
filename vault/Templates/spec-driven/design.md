# Design — <repo>#NN [Title]

> High-level architecture only. No code, no UI / component-level detail, no code-style rules.

## System boundaries
Which areas of the app own which responsibility for this work (e.g. `auth module`, `dashboard route`, `db schema`, `background worker`).

## Storage model
DB tables, cache keys, blob storage, queues. Plain-English, no code.

## Auth / access scoping
How user / role / org scoping applies for this work (skip if the feature doesn't touch auth).

## Background tasks (if relevant)
Cron jobs, queue workers, webhooks, async pipelines.

## Hard rules (≥4)
Rules the code must never break for this feature. Things that must always be true. The coding agent reads these and won't introduce code that violates them. Examples:
- Every read filters out soft-deleted rows.
- Every mutation checks the caller's user/role matches the resource's owner.
- Long-running AI work runs in a background worker, never inside a request handler.
- Auth is enforced at every mutation, no exceptions.

Pull from `~/.claude/rules/` and `<project-claude>` (your project's own `CLAUDE.md`) where they apply, plus add ticket-specific ones.

---

> For bugs, add a **Root cause** section before Hard rules and a **Fix flow** section after Hard rules. Keep both high-level — no code, no line numbers.
>
> ## Root cause
> What's happening and why. The mechanism that produces the bug. Cite the hard rule it violates.
>
> ## Fix flow
> How the fix works. One paragraph + a short numbered list of steps. Plain English.
