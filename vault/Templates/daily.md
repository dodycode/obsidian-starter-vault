---
type: daily
date: {{date:YYYY-MM-DD}}
status: in-progress
tags: [daily]
---
# {{date:YYYY-MM-DD}} — work log

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

<!--
When you're done, flip frontmatter: status: in-progress → complete
Dev Control (or your personal orchestrator) reads that to move items into
Active Work's Recently Completed.
-->
