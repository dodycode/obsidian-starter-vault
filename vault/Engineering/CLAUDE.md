---
owner: <your-name>
---
# Engineering — cross-cutting docs

## Subfolders

- **ADRs/** — Architecture Decision Records. One file per decision, numbered `ADR-NNNN-slug.md`. Append-only; supersede via a new ADR that references the old one. Template: `Templates/adr.md`.
- **Runbooks/** — On-call, incident response, manual procedures. Template: `Templates/runbook.md`.
- **Architecture/** — System diagrams (Excalidraw encouraged), high-level architecture docs.

## For agents

When you write a new engineering doc, ask yourself:
1. Is this a decision? → ADR
2. Is this how to respond when X breaks? → Runbook
3. Is this "how the system is shaped"? → Architecture

If it's feature-specific, it doesn't belong here — use `Features/<Domain>/` instead.

## Links out

- App repo's `CLAUDE.md` owns code-level conventions (per-app/package). Don't duplicate them here.
