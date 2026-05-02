---
owner: <your-name>
---
# Tickets — long-form ticket notes

## When to add a file here

Use `Tickets/<repo>-<num>/notes.md` for tickets that warrant a dedicated note — typically "large scope" work where the daily-note detail would be too cramped.

Folder name = `<repo>-<num>` where:
- `<repo>` is the GitHub repo (or shortened slug) the issue lives in
- `<num>` is the GitHub issue number

Examples: `Tickets/my-saas-42/notes.md`, `Tickets/my-saas-101/notes.md`. For single-repo projects, `Tickets/gh-42/notes.md` is also fine.

## Contents

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

If the Dev Control SDD flow runs for a ticket, additional files land at `Tickets/<repo>-<num>/context/`:

- `project-overview.md` — product definition, goals, features, scope
- `architecture.md` — system structure, boundaries, storage model, invariants
- `code-standards.md` — implementation rules and conventions
- `ai-workflow-rules.md` — development workflow, scoping rules, delivery approach
- `ui-context.md` — theme, colors, typography, component conventions
- `bugfix-spec.md` — root cause + fix design (for bug tickets)
- `progress-tracker.md` — current phase, completed work, open questions, next steps
- `specs/00-build-plan.md` — unit decomposition + ordering
- `specs/NN-<unit-name>.md` — per-unit specs, generated just-in-time before each unit

Coding agents in the worktree update `progress-tracker.md` after each meaningful change. The worktree's `context/` syncs back to the vault at the end of work (see `dev-control-workflows.md` cleanup section).

## Drafts (no GitHub Issue yet)

If you start the SDD flow before creating the GitHub Issue, files land at `Tickets/draft-<slug>/`. When the GitHub Issue is created in Phase 5, the folder is renamed to `Tickets/<repo>-<num>/`.

## Subfolders

- **`QA/`** — QA checklists + failure/pass screenshots produced by `/qa` and `/qa-feedback`. One QA file per ticket (`QA-{IDENTIFIER}.md`), with `*-fail-*.png` / `*-pass-*.png` screenshots alongside it. See `QA/CLAUDE.md` for the naming + archive workflow.
- **`QA/Archive/`** — stale failure screenshots moved here when a bug is fixed (preserves regression history; never overwrite a fail screenshot).
