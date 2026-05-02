---
owner: <your-name>
---
# People

## Structure

```
People/
└── <your-name>/
    ├── README.md          ← role, focus areas, contact
    ├── Active Work.md     ← live dashboard (in-flight tickets, worktrees, blocked, recently shipped)
    └── Daily/
        └── YYYY-MM-DD.md  ← daily work log
```

`<your-name>` is the short lowercase form (filled by `bootstrap.sh` from the placeholder `__YOUR_NAME__`).

## Active Work

`<your-name>` (or their personal Dev Control agent) is the sole writer of `Active Work.md`. Coding agents do NOT write to it — they write to the daily log instead.

If you ever invite a collaborator and they want their own dashboard, add a sibling folder (`People/<their-name>/`) with the same shape. Each person's `Active Work.md` stays personal.

## Daily notes

The daily log is the canonical record of what was worked on each day. Dev Control reads these to reconcile Active Work.

- Start of session: add `- [ ] <repo>#<num>: description` under `## In progress`
- End of session: check it off, move to `## Shipped today`, add detail bullets proportional to scope:
  - Small: one bullet with outcome
  - Medium: 3–5 bullets of what changed
  - Large: link a dedicated note (`[[Tickets/<repo>-<num>]]` or `[[Features/<Domain>/<Title>]]`)

Template: `Templates/daily.md`.

## For agents

If you are a coding agent in a project worktree, your daily log goes to `People/<your-name>/Daily/YYYY-MM-DD.md`. **Do NOT update `Active Work.md`** — that is the owning person's (or their personal Dev Control agent's) job.

See `.claude/rules/dev-control-daily-notes.md` for the full protocol.

## Privacy

This folder is work-only. Don't put personal journal, private notes, or non-work content here. The vault is git-backed.
