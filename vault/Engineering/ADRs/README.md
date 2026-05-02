---
owner: team
---
# Architecture Decision Records

> One file per decision, numbered, append-only. Never rewrite an accepted ADR — supersede it with a new one that references the old.

## Filename convention

`ADR-NNNN-short-slug.md`, zero-padded to 4 digits.

- `ADR-0001-use-drizzle-for-orm.md`
- `ADR-0042-split-external-agent-from-internal.md`

## Writing an ADR

Copy `Templates/adr.md`. Fill in context (the forces at play), the decision (specific enough to act on), consequences (good and bad), and alternatives you considered.

## When to write one

Write an ADR when a decision:
- Is hard or costly to reverse
- Crosses multiple apps/packages
- Would surprise a future contributor if they didn't know the history
- Was made after real debate

Don't write one for trivial choices — use your daily note or a code comment.

## Status values

- `proposed` — drafted, not yet adopted
- `accepted` — in force
- `superseded-by-ADR-XXXX` — no longer in force, replaced
- `deprecated` — no longer in force, no replacement

## Index

- [[ADR-0001-active-work-is-per-person|ADR-0001 — Active Work is per-person]] (accepted 2026-04-19)
