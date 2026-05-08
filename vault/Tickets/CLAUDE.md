---
owner: <your-name>
---
# Tickets — long-form ticket notes + post-merge SDD archive

## When to add a file here

Use `Tickets/<repo>-<num>/notes.md` for tickets that warrant a dedicated note — typically "large scope" work where the daily-note detail would be too cramped.

Folder name = `<repo>-<num>` where:
- `<repo>` is the GitHub repo (or shortened slug) the issue lives in
- `<num>` is the GitHub issue number

Examples: `Tickets/my-saas-42/notes.md`, `Tickets/my-saas-101/notes.md`. For single-repo projects, `Tickets/gh-42/notes.md` is also fine.

## Contents (notes.md)

```markdown
---
ticket: <repo>-42
github: https://github.com/<owner>/<repo>/issues/42
status: in-progress | shipped | blocked | abandoned
owner: <your-name>
---
# <repo>-42 — <title>

## Context
[Why this work is needed]

## Design
[Decisions, architecture choices, trade-offs]

## Scope
- [Module / area]: [what changes]

## Acceptance Criteria
- [ ] …

## Implementation notes
[Running log of decisions, gotchas, rabbit-holes]

## Links
- GitHub Issue: …
- Related code: `<project-repo>/...`
- Feature MOC: [[Features/Auth/MOC]]
```

## Lifecycle

- Create when scope feels larger than a daily-note bullet
- Update as work progresses
- When shipped: set `status: shipped`, keep the file (it's the historical record)
- If superseded: move to `Archive/Tickets/`

## Spec-Driven Development context files

Under the new SDD shape, **active spec files live in the worktree, not in the vault during the build**. The coding agent generates and edits them in `<worktree>/context/`:

- `proposal.md` — functional analysis (Summary / What / Why / Scope / Not in scope / Success criteria)
- `design.md` — high-level architecture (System boundaries / Storage model / Auth scoping / Background tasks / Hard rules)
- `tasks.md` — build plan (Task 01..NN with Builds / Boundary / Depends on / Verify)
- `sub-tasks/NN-<name>.md` — optional, lean per-task expansion (Goal / References / Verify)
- `progress-tracker.md` — live checklist; coding agent checks off after each task

When the worktree is cleaned up after merge, the orchestrator (per `dev-control-workflows.md` "Cleaning Up After Merge") syncs `<worktree>/context/` → `<vault>/Tickets/<repo>-<num>/context/` BEFORE removing the worktree, then archives the whole ticket folder to `Archive/Tickets/<repo>-<num>/`.

So inside this `Tickets/` folder you'll see two states:
- **In-flight tickets**: only `notes.md` (if any) — the live spec is in the worktree.
- **Post-merge tickets**: `notes.md` + `context/` folder with the synced final spec.

The folder is read-only history once archived. Future tickets in the same area can read past archives for context.

## Subfolders

- **`QA/`** — QA checklists + failure/pass screenshots produced by `/qa` and `/qa-feedback`. One QA file per ticket (`QA-{IDENTIFIER}.md`), with `*-fail-*.png` / `*-pass-*.png` screenshots alongside it. See `QA/CLAUDE.md` for the naming + archive workflow.
- **`QA/Archive/`** — stale failure screenshots moved here when a bug is fixed (preserves regression history; never overwrite a fail screenshot).
