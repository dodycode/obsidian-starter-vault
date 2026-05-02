# Daily Note Rules

> **User-agnostic.** Paths use placeholders (`<vault>`, `<your-name>`, `<daily-today>`) which `CLAUDE.local.md` resolves. Daily-note STRUCTURE matches `<vault>/Templates/daily.md`. Don't drift from it.

## Location
`<daily-today>` — i.e. `<vault>/People/<your-name>/Daily/$(date +%Y-%m-%d).md`

## Structure (matches `<vault>/Templates/daily.md`)

```markdown
---
type: daily
date: YYYY-MM-DD
status: in-progress
tags: [daily]
---
# YYYY-MM-DD — work log

> Keep it lean. One summary block per ticket. Overflow lives in `[[Tickets/<repo>-<num>]]` or `[[Features/<Domain>/<Title>]]`, not here.

## In progress
- [ ] <repo>#<num> — <short description>

## Shipped today
<!-- Move checked items here. Detail proportional to scope:
     Small (≤ 2 files): one outcome bullet.
     Medium (3–8 files): 3–5 bullets — what changed and why.
     Large (8+ files / new system): link to [[Tickets/<repo>-<num>]]; keep this terse. -->

## Blocked / waiting
<!-- What's stuck and on whom. Dev Control surfaces this in Active Work. -->

## Notes
<!-- Rabbit-holes, gotchas, links worth saving. Prose is fine — this section doesn't need bullets. -->

## End of day
<!-- Two minutes of reflection before you close. Optional but recommended.
     - **Worked**: what went well or surprised you
     - **Didn't**: what cost more time than it should have
     - **Left off at**: where the next session should pick up -->
```

## Rules
1. ALWAYS read `<daily-today>` before modifying it
2. If today's note doesn't exist, create it from `<vault>/Templates/daily.md` (or the structure above)
3. Add work under `## In progress` when starting; move to `## Shipped today` when done. NEVER under other sections.
4. NEVER overwrite existing content — append/move only
5. Use Obsidian wikilinks: `[[Folder/Note Name]]`
6. Keep frontmatter `status: in-progress` until the day is closed; flip to `status: complete` when wrapping up

## When Starting Work
Add an unchecked item under `## In progress`:
```markdown
- [ ] <repo>#42: Short description of the task
```

## When Finishing Work
1. Check the box (`- [x]`)
2. **Move it to `## Shipped today`**
3. Add detail bullets proportional to scope:

**Small** (≤ 2 files, quick fix):
```markdown
- [x] <repo>#42: Fix login redirect
	- Resolved — missing `await` in `auth.service.ts`
```

**Medium** (3–8 files, feature):
```markdown
- [x] <repo>#42: Update onboarding module
	- Added welcome step with org name
	- Refactored `OnboardingFlow` for conditional steps
	- Updated tests in `onboarding.spec.ts`
```

**Large** (8+ files, new system):
```markdown
- [x] <repo>#42: Implement auto-disconnect
	- See [[Tickets/<repo>-42]]
```

For large scope, create the linked note in `<vault>/Tickets/<repo>-42/notes.md` with the full breakdown.

## When Closing the Day
- Flip frontmatter `status: in-progress` → `status: complete`
- Optionally fill `## End of day` (worked / didn't / left off at)
- Dev Control reads `status: complete` to know the day is final and items can be moved into Active Work's "Recently Completed"

## Relationship to Active Work Note

- **Daily note** = historical changelog. Permanent record of what was done each day.
- **Active Work note** (`<active-work>`) = living dashboard. Shows what's in flight *right now*, owned solely by Dev Control.
- Coding agents write to the daily note.
- Only Dev Control updates `<active-work>` (by reading daily notes, GitHub Issues, and worktree state).

## For Coding Agents in Worktrees

If you are a coding agent working in a project worktree:

1. **At the start of your session**, add an unchecked item under `## In progress` in today's daily note:
   ```markdown
   - [ ] <repo>#42: Short description of what you're working on
   ```
2. **When you finish**, check it off, **move it to `## Shipped today`**, and add detail bullets proportional to scope (see above).
3. **Do NOT update `<active-work>`** — that's managed exclusively by Dev Control.
4. If today's note doesn't exist, create it from `<vault>/Templates/daily.md`.
5. When closing the day, flip frontmatter `status` to `complete`.
