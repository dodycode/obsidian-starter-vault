---
owner: <your-name>
---
# Templates

Starter scaffolds. Copy, don't edit the originals.

- `daily.md` — daily dev log
- `adr.md` — architecture decision record
- `runbook.md` — operational runbook
- `feature-moc.md` — starter for a new feature domain MOC
- `spec-driven/` — starter scaffolds for the SDD 3-file shape: `proposal.md`, `design.md`, `tasks.md`, `sub-task.md`. Used by the coding agent's SDD spec phase inside the worktree (see `~/.claude/rules/spec-driven-development.md`). The vault-side orchestrator (`<vault>/.claude/rules/dev-control-spec-driven.md`) only ever scaffolds EMPTY copies of these into a worktree's `context/` — the coding agent fills them in.

## For agents

When creating a new doc of a given type, copy the template body and fill in placeholders. Don't leave `<placeholder>` values.
