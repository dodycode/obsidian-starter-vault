---
owner: <your-name>
type: routing
tags: [routing, qa]
---
# Tickets / QA — QA artifacts routing

## What lives here

This folder is the canonical home for **QA artifacts produced by the `/qa` and `/qa-feedback` skills**. Two artifact types:

1. **QA checklists** — `QA-{IDENTIFIER}.md` (one per ticket / PR). Markdown checklist with prerequisites, acceptance criteria from the source ticket, and numbered tasks. Each task item is `- [ ] **Action** → Expected result`. Test results land inline: `[x]` = pass, `[-]` = fail (with verdict + root-cause hint + screenshot wikilink), `[ ]` = not tested.
2. **Screenshots** — `QA-{IDENTIFIER}-{fail|pass}-{short-slug}.png`. Captured during browser-driven testing (Chrome DevTools MCP) and referenced from the QA checklist via Obsidian wikilinks (`[[QA-{IDENTIFIER}-{fail|pass}-{short-slug}.png]]`).

## Identifiers

The `{IDENTIFIER}` segment matches the source-ticket convention used by `/qa`:

| Source | Identifier shape | Example |
|---|---|---|
| GitHub Issue | `GH-{N}` (or `<repo>-{N}` for multi-repo) | `QA-GH-123.md` |
| GitLab Issue | `GL-{N}` | `QA-GL-123.md` |
| Standalone PR(s) | `PR-{first-N}` | `QA-PR-3266.md` |

Slug examples for screenshots: `fail-update-banner`, `fail-rename-card-shows-id`, `pass-create-card-clean`.

## Workflow

1. **`/qa {identifier}`** generates the empty checklist here. A sub-agent reads the source ticket + PR diff, produces the checklist body. The skill writes `QA-{IDENTIFIER}.md`.
2. **`/qa-feedback {identifier}`** runs the interactive testing loop. For each issue the user reports:
   - The triage agent decides (real-bug / not-bug / unsure) and pinpoints the root-cause file:line.
   - Claude writes the verdict back into the QA file under the matching `- [-]` line.
   - When testing in the browser via Chrome DevTools MCP, capture a screenshot for the failure (and for critical pass items where visual confirmation matters). Save directly to this folder — never to `/tmp`. Reference via Obsidian wikilink in the QA file.
3. **`/qa-fix {identifier}`** (next session, fresh context) reads `QA-{IDENTIFIER}.md`, processes every `[-]` item with its embedded root-cause hint, plans the fix (plan mode + web search for non-obvious cases), and executes after user approval. After re-verification: MOVE the old fail screenshot to `Archive/` (preserve filename), capture a new pass screenshot, flip `[-]` → `[x]` in the QA file, and add both wikilinks (pass + archived-fail).

## Hard rules

- **Never overwrite a `*-fail-*.png`.** When a bug is fixed, MOVE the failure screenshot to `Archive/` and capture a new `*-pass-*.png`. Regression history matters — six months from now, when the same surface breaks again, the archived fail screenshot tells future-you exactly what the old bug looked like.
- **Never delete a QA file.** Even after every item is `[x]` and the PR is merged, the QA file stays — it's the historical record of what was tested + how. If it goes stale (ticket abandoned, scope changed), update the frontmatter status and leave the file.
- **Never reference `/tmp` paths in the QA checklist.** Screenshots must live in this folder (or `Archive/` once stale). `/tmp` wipes on reboot — references die before bugs get fixed.

## Search recipes

```bash
# Find all QA files for a ticket
ls "<vault>/Tickets/QA/" | grep -E "GH-123"

# Count failures vs passes in a QA file
grep -c "^- \[-\]" "<vault>/Tickets/QA/QA-GH-123.md"
grep -c "^- \[x\]" "<vault>/Tickets/QA/QA-GH-123.md"

# Find QA files with open failures (any `[-]` line)
rg -l "^- \[-\]" "<vault>/Tickets/QA/"

# Find archived failures for a slug
ls "<vault>/Tickets/QA/Archive/" | grep -i "banner"
```

## Related

- [[../CLAUDE]] — Tickets folder routing
- [[../../CLAUDE]] — root vault routing (Where to WRITE table)
- `/qa` skill — generates the checklist
- `/qa-feedback` skill — drives the testing loop + writes screenshots + saves recall handoff to memory at session end
- `/qa-fix` skill — fixes the failed items + manages the archive workflow
