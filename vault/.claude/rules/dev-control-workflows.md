# Dev Control Workflow Procedures

> **User-agnostic.** Paths use placeholders (`<vault>`, `<project-repo>`, `<project-name>`, `<workspace>`, `<your-name>`, `<active-work>`, `<daily-today>`) which `CLAUDE.local.md` resolves to absolute paths. Don't hardcode user-specific paths here.

## Spec-Driven Flow — start here

The SDD flow is split between the orchestrator (this file's audience) and the coding agent inside the worktree. Specs are written in the worktree, where the user has the codebase tree open in VS Code for proper review — matching industry default (Kiro / GitHub Spec-Kit / BMAD all keep specs IN the workspace).

### Orchestrator side (Dev Control in vault)

Light intake only. Three steps:

1. **Source detection + parallel read** — GitHub Issue, GitLab Issue, screenshot, or pure chat. Vault hits read in parallel via fork agents. Output: structured summary + source URLs/paths to pass into the worktree.
2. **GitHub Issue stub** — Path A (no issue): create stub with title + 1-line context. Path B (issue exists): no-op. Rich body gets enriched in Phase 5b after the coding agent's spec phase.
3. **Worktree provisioning** — `/new-worktree` creates the worktree with EMPTY spec stubs in `context/`, writes dual-mode `CLAUDE.local.md` containing the source URLs/paths from Step 1 in the "Source material" section.

Then HAND OFF. Dev Control's job ends here. No interview, no proposal/design/tasks authoring.

### Coding-agent side (worktree)

Session 1 = spec phase. Coding agent reads source material, greps code, runs interview, writes `context/proposal.md` + `context/design.md` + `context/tasks.md`, optionally generates `context/sub-tasks/`, then generates `context/progress-tracker.md` and ends. User reviews real files in VS Code with the codebase tree visible. Full content for the spec phase: `~/.claude/rules/spec-driven-development.md`.

Sessions 2..N = implementation phase. One task per fresh session, in numerical order. Final session auto-pushes + opens PR. Full content: `~/.claude/rules/session-per-task.md` and Template A in this file.

### Phase 5b (orchestrator side, after spec phase)

Once the coding agent has populated `<worktree>/context/proposal.md`, the orchestrator (in a follow-up vault session) reads that file and enriches the GitHub Issue body from it. Triggered by user saying "enrich `<repo>#NN`" or by `/refresh` detecting the gap.

Full orchestrator-side intake content (source detection, GitHub Issue stub, Phase 5b template) lives in `dev-control-spec-driven.md`.

**Every ticket runs the full flow.** No short-circuit for spike / one-line tweaks — tiny tickets just produce tiny files.

---

## Creating a Worktree for a GitHub Issue

### Prerequisites
- GitHub Issue exists (`<repo>#<num>`) — orchestrator stub created in Phase 2, or pre-existing
- Source URLs/paths captured in conversation memory (from Phase 1)
- You know roughly which area of the codebase this affects (for branch naming)

### Preferred path: use `/new-worktree`

The `/new-worktree <repo>#<num>` skill is canonical — it copies env files + MCP servers + creates the branch + worktree, **and** scaffolds empty spec stubs in `<worktree>/context/`, **and** writes the dual-mode `CLAUDE.local.md` (Template A below). Use it unless there's a reason not to.

### Manual fallback

```bash
# 1. Ensure app repo is up to date
cd "<project-repo>"
git fetch origin
DEFAULT_BRANCH=$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)
git checkout "$DEFAULT_BRANCH"
git pull origin "$DEFAULT_BRANCH"

# 2. Create the branch
git checkout -b 123-short-description

# 3. Create the worktree (sibling of <project-repo>)
git worktree add "../<project-name>-123-short-description" 123-short-description

# 4. Copy environment files
cp .env "../<project-name>-123-short-description/" 2>/dev/null
cp .env.local "../<project-name>-123-short-description/" 2>/dev/null

# 5. Scaffold empty spec stubs in worktree's context/
mkdir -p "../<project-name>-123-short-description/context"
# Each stub has frontmatter + section headers, all sections empty.
# Coding agent's Session 1 fills them in. progress-tracker.md is NOT created
# here — coding agent generates it at end of Session 1.

# 6. Install dependencies (use whatever your project uses)
cd "../<project-name>-123-short-description"
pnpm install   # or npm install, yarn, bun

# 7. Return to main app repo
cd "<project-repo>"
git checkout "$DEFAULT_BRANCH"
```

### Post-Creation: Update Active Work Note
**IMMEDIATELY** after creating a worktree, update `<active-work>`:
1. Add the new issue to the **In Progress** table with issue ID, branch, worktree path, and status
2. Add the new worktree to the **Active Worktrees** table
3. This is non-negotiable — Active Work must always reflect current state

### Post-Creation: Write Worktree CLAUDE.local.md

**ALWAYS replace. Never append. Never let a duplicate-app-repo copy survive.**

Create `CLAUDE.local.md` at the **repo root** of the new worktree (NOT in `.claude/` — that path won't be discovered). Use `CLAUDE.local.md` (NOT `CLAUDE.md`) so it stays gitignored.

#### Pre-write check (mandatory — every session)

`/new-worktree` and similar init paths can leave a worktree-root `CLAUDE.local.md` that is a **verbatim duplicate of the app repo's `CLAUDE.md`**. That duplicate is dead weight:

- The app repo's checked-in `CLAUDE.md` auto-loads in every Claude session running in the worktree.
- Duplicating it inside the gitignored `CLAUDE.local.md` adds noise on top of the auto-loaded copy and crowds out the per-task signal.
- The coding agent's task context (objective, source URLs, daily-note path) gets buried.

**Rule:** Before writing, READ the existing `CLAUDE.local.md` (if any):

- **Matches app repo `CLAUDE.md` content** (project overview, general code style, generic working-style rules) → **OVERWRITE in full** with the SDD entry-point template below. Do NOT preserve any of the duplicate.
- **Empty or missing** → write the template fresh.
- **Has prior task-specific content** (rare — would only happen if a previous session started one) → confirm with the user before overwriting.

The SDD entry-point template is the **entire content** of `CLAUDE.local.md`. Nothing else lives in this file.

#### Template A — Dual-mode SDD entry-point

Use this template for every worktree provisioned by `/new-worktree`. The skill scaffolds empty spec stubs in `<worktree>/context/`, then writes this file pointing at them. The first session detects empty stubs and runs the spec phase; subsequent sessions detect populated stubs and run implementation.

> **Audience: the coding agent that opens this worktree.** This file auto-loads into the agent's context — write it as instructions to the agent in second person. Do NOT include a "starter prompt to copy/paste" — the agent reads this file directly, no separate paste step.

````markdown
# Task: <repo>#<num> — [Title from GitHub Issue]

## Source material
[GitHub URL / GitLab URL / screenshot path / raw chat snippet
 — orchestrator pastes whatever sources it had at intake]

GitHub: <url>

## Mode detection (do this first every session)

Read `context/proposal.md`. If it's empty (only frontmatter + headers), this is
**Session 1: SDD spec phase**. Skip to "Spec phase" below.

If `context/proposal.md` is populated, this is an **implementation session**.
Skip to "Implementation phase" below.

---

## Spec phase (Session 1 only)

Goal: produce approved `context/proposal.md`, `context/design.md`, `context/tasks.md`
(and optionally `context/sub-tasks/`) plus `context/progress-tracker.md` that
future sessions implement against.

Follow `~/.claude/rules/spec-driven-development.md` end-to-end:
1. Phase 1 — Read source material above + grep relevant code in this worktree
2. Phase 2 — Combined interview to 95% confidence (AskUserQuestion)
3. Phase 3 — Write proposal/design/tasks all-at-once + revise loop
4. Phase 4 — Optional sub-tasks (ask user if tasks.md is big)
5. Phase 5 — Generate `context/progress-tracker.md` from approved tasks/sub-tasks
6. End session. Tell user: "Spec ready. Open files in VS Code, then start a fresh
   session for task 01."

Do NOT implement in this session. Do NOT pick a task. Spec only.

---

## Implementation phase (Session 2+)

Tasks are done in fixed numerical order. You cannot skip, reorder, or
parallelize. One task per fresh session. Agent never auto-advances.

At session start:

1. Read `context/progress-tracker.md` ONCE. Identify the lowest-numbered
   un-checked task (or sub-task if `sub-tasks/` exists). That's THE task
   for this session. No other.
2. Tell the user "I'll work on task NN — <name>. Confirm to proceed."
   Wait for "go" / "yes" / "proceed". This catches cases where the user
   wants to override (e.g. they fixed something out-of-band, want to skip).
3. Read `context/proposal.md` + `context/design.md` only for the sections
   that task touches. Skim, don't dump.
4. If `context/sub-tasks/` exists, read the matching `NN-<name>.md` file.
   Otherwise read just that task's entry in `context/tasks.md`.
5. Execute the task. No plan mode by default.
6. If anything in the spec is unclear or contradicts the code you see —
   STOP. Use AskUserQuestion. Don't half-implement, don't guess.
7. Run typecheck + lint (use whatever the project provides — `pnpm typecheck`,
   `npm run typecheck`, `cargo check`, etc.). Fix everything.
8. Update `context/progress-tracker.md` — check off ONLY this one task.
9. Update today's daily note per `~/.claude/rules/dev-control-daily-notes.md`
   (or `<vault>/.claude/rules/dev-control-daily-notes.md` if vault-scope).
10. Show the diff to user. Wait for user to say "approve" / "go" / equivalent.
11. On approval: stage + commit with a Conventional Commits message (per
    `<vault>/.claude/rules/gh-hygiene.md`). This clears the staged list.
12. Check `context/progress-tracker.md`. Two paths:
    - **NOT the last task** (any un-checked task remains): session ends here.
      Do NOT push. Do NOT advance to next task.
    - **THIS WAS the last task** (every task now checked off): auto-push the
      branch + open a new PR. PR title from GitHub Issue title, description
      built from `proposal.md` per `<vault>/.claude/rules/gh-hygiene.md`. Then end.

## Daily note logging

- Path: <daily-today>
- At session start: add `- [ ] <repo>#<num>: [task NN description]` under `## In progress`.
- When finished: move to `## Shipped today` (checked off) with detail bullets
  proportional to scope.
- At end of day: flip frontmatter `status: in-progress` → `status: complete`.
- Do NOT update <active-work> — that's Dev Control's job.

## Hard "do not"

- Do not loop multiple tasks in one session. One task per session, end of session
  is end of session.
- Do not auto-advance. After commit + tracker check (and PR if last task),
  session is OVER.
- Do not push mid-stack. Push happens automatically ONLY when the tracker
  shows zero un-checked tasks.
- Do not auto-run `/tech-lead-review`. Opt-in only — see `~/.claude/rules/code-review-workflow.md`.
- Do not update <active-work> — Dev Control owns it.

## Note on commit gate (SDD-specific override)

For SDD implementation sessions, the user's "approve" on the diff IS the commit
signal — no separate "say commit" step. This overrides the per-session
"wait for user to say 'commit'" gate in `~/.claude/rules/commit-batching.md`.
The commit-batching rule still applies to non-SDD sessions (small fixes, ad-hoc
work).
````

#### Post-write verification

After writing, run a sanity check:

```bash
head -1 "<worktree-path>/CLAUDE.local.md"
```

The first line MUST be `# Task: <repo>#<num> — [...]`. If it shows the app repo's `CLAUDE.md` opening instead, the overwrite didn't take — re-run the write.

### Post-Creation: HAND OFF — Dev Control does NOT implement OR write the spec

**Dev Control's job ends here.** Implementation AND spec authoring both run in SEPARATE Claude sessions inside the worktree. Once worktree + CLAUDE.local.md + Active Work + GitHub Issue stub are set, hand off:

1. **Tell the user:** "Worktree ready at `<worktree-path>`. Open it in VS Code, then start a fresh Claude session there. Session 1 is the spec phase — agent reads source material, greps code, runs interview with you, and writes `context/proposal.md` + `context/design.md` + `context/tasks.md`. You review files in VS Code with the codebase tree open. After approval, fresh session per task — one task at a time, in numerical order. Final task auto-pushes + opens PR."
2. **DO NOT write code yourself.** No `Edit`/`Write` on app source. No typecheck/lint from Dev Control. Those belong to the coding agent in the worktree.
3. **DO NOT write proposal/design/tasks yourself.** Spec authorship lives in the worktree, where the codebase tree is open in VS Code for proper review. The orchestrator no longer interviews or generates spec files.
4. **DO NOT cd into the worktree from your Dev Control session and start coding.** A fresh session = clean context = better agent. Dev Control's context is stuffed with orchestration noise (Active Work, GitHub Issues, daily-note refresh) — not the right starting point for spec authoring or implementation.
5. **Coding-agent contracts per session:**
   - Session 1 (spec phase): runs `~/.claude/rules/spec-driven-development.md` — read sources, grep code, interview, write proposal/design/tasks/sub-tasks, generate progress-tracker, end. Does NOT pick a task or implement.
   - Sessions 2..N (implementation): one user-confirmed task per session, no plan mode by default, execute → typecheck → lint → update tracker → daily note → stage → user approves → commit → end. Final session auto-pushes + opens PR. `/tech-lead-review` opt-in.

**Why the split matters:** Dev Control orchestrates (GitHub Issues, Active Work, worktrees, source intake, post-spec issue enrichment). Coding agents author specs (with code tree visible) and implement (with code access). Two distinct roles, two distinct workspaces. Mixing them puts the spec review gate at the wrong moment (no codebase tree visible) and degrades review quality.

## Cleaning Up After Merge

**Order matters.** Sync the worktree's `context/` back to the vault BEFORE destroying the worktree. The coding agent updates `progress-tracker.md` (and sometimes other context files when build decisions shift) DURING implementation. Those updates only exist in the worktree until we copy them back. Skip this step and you lose the build history.

```bash
# 1. Sync worktree context/ → vault Tickets/<repo>-<num>/context/
WORKTREE="../<project-name>-123-short-description"
VAULT_TICKET="<vault>/Tickets/<repo>-123"

if [ -d "$WORKTREE/context" ]; then
  # Vault context/ may not exist yet — orchestrator no longer creates it at intake
  # (spec authorship moved into the worktree). Create it here, then copy.
  mkdir -p "$VAULT_TICKET/context"
  cp -r "$WORKTREE/context/"* "$VAULT_TICKET/context/"
fi

# 2. Remove the worktree
cd "<project-repo>"
git worktree remove "../<project-name>-123-short-description"

# 3. Delete the local branch (if merged)
git branch -d 123-short-description

# 4. Prune stale worktree refs
git worktree prune

# 5. Archive the vault ticket folder (now contains the synced final state)
mv "<vault>/Tickets/<repo>-123" "<vault>/Archive/Tickets/<repo>-123"
```

The archive holds the final snapshot — synced `progress-tracker.md` shows the task-by-task ship order, `design.md` reflects any hard rules that shifted during build, `proposal.md` and `tasks.md` show the original product framing and decomposition. Read-only history for future tickets in the same area.

## Stack Workflow (optional — Graphite or git-native)

If you use Graphite, prefer the `/gt-*` skills (`/gt-ship`, `/gt-stack`, `/gt-next`, `/gt-review`) — they wrap the conventions for stacked PRs. Raw `gt` for inspection only.

```bash
# Inspect
gt stack
gt log

# Ship a stack — use /gt-ship
# Stack a new branch on current — use /gt-next
# Scaffold a stack from a plan — use /gt-stack
# Review a stack — use /gt-review

# Sync after merges (manual fallback)
gt sync

# Restack after upstream changes (manual fallback)
gt restack
```

If you don't use Graphite, plain `git` works the same — just open separate PRs from each branch and rebase as the parent merges.

### Stack Decision Framework

**When to stack (multiple PRs in a chain):**
- Changes build on each other logically (e.g., schema migration → API endpoint → UI)
- Large feature that's easier to review in smaller pieces
- Multiple modules change but in a clear dependency order
- Total diff would exceed ~500 lines in a single PR
- SDD `tasks.md` has ≥3 tasks with natural boundary splits

**When to use a single PR:**
- Self-contained change touching ≤ 3 files
- Bug fix, config change, or small feature
- Changes don't have a natural splitting point
- Quick iteration where review speed matters more than granularity

**Stacking patterns:**
```
# Pattern 1: Layer stack (most common — matches SDD tasks.md ordering)
main
 └─ 123-db-schema             # db changes
     └─ 123-api               # api changes
         └─ 123-ui            # ui changes

# Pattern 2: Feature stack (one issue, multiple PRs)
main
 └─ 123-part-1                # core logic
     └─ 123-part-2            # integration + tests

# Pattern 3: Multi-issue stack (related issues)
main
 └─ 90-ui-polish              # UI fixes
     └─ 91-tool-audit         # depends on UI changes
```

**Stack naming**: Use the GitHub Issue number in every branch: `<num>-description`

## GitHub Issue Lifecycle

### Creation timing

Under SDD, **the GitHub Issue is materialized at orchestrator Phase 2 as a stub** (title + 1-line context from sources), then **enriched at Phase 5b** after the coding agent's spec phase produces `proposal.md`. This is a change from earlier shapes that created the rich ticket up front OR after interview.

Exception: if the user starts with `"let's work on <repo>#42"` (existing issue), Phase 2 is skipped — issue already exists. Phase 5b still runs (or doesn't, depending on whether the user wants the body rewritten from the new spec).

### After Creating Any GitHub Issue
**IMMEDIATELY** update `<active-work>`:
1. Read the current Active Work note
2. Add the new issue to the appropriate section:
   - **In Progress** table — if work is starting now or a worktree exists
   - **Up Next** — if it's queued but not started yet
3. This is non-negotiable — Active Work must always reflect current state

### After Moving a GitHub Issue
Update `<active-work>` to reflect the state change:
- Labeled `in-progress` → add to In Progress table (if not already there)
- Closed → move from In Progress to Recently Completed
- Labeled `blocked` → move to Blocked section

## GitHub Issue Template

When SDD's Phase 5b enriches the GitHub Issue body, build it directly from `proposal.md` sections. Each section maps:

| GitHub field / section | Source from `proposal.md` |
|---|---|
| Title | Summary section, condensed to one line |
| Context | Why section |
| Scope | Scope section + Not in scope section |
| Acceptance Criteria | Success criteria section (checklist preserved) |
| Technical Notes | Optional — pull a high-level paragraph from `design.md` System boundaries / Storage model only if relevant for product/QA. Skip otherwise. |

**Body template**:
```
## Context
[Why this work is needed — pulled from proposal.md Why section.]

## Scope
- [What changes] (from proposal.md Scope)
- Out of scope: [what we're NOT doing] (from proposal.md Not in scope)

## Acceptance Criteria
- [ ] [Testable criterion from proposal.md Success criteria]
- [ ] [Testable criterion from proposal.md Success criteria]

## Technical Notes (optional)
- [High-level architecture note from design.md if relevant for QA]
- [Related issues: #<num>]
```

For bugs, swap Context → Symptom + Impact (from proposal.md What + Why) and add Steps to Reproduce.

> Per `<vault>/.claude/rules/issue-tracking.md`: NEVER include code, file paths, or function names in GitHub Issue bodies. Audience is future-you / a contributor reading the issue cold. Technical notes stay high-level. Detailed technical content lives in `<vault>/Tickets/<repo>-<num>/context/` (`proposal.md`, `design.md`, `tasks.md`, optional `sub-tasks/`) instead.

## Active Work Note Procedures

`<active-work>` is a living dashboard of current work.

**Dev Control is the SOLE updater of this note.** No other agent should modify it. Coding agents write to daily notes; Dev Control reads daily notes and updates Active Work.

### How to update Active Work:
1. Read today's daily note `<daily-today>` (and yesterday's for spillover)
2. List active worktrees: `cd "<project-repo>" && git worktree list`
3. Query GitHub Issues: `gh issue list --assignee @me --state open --json number,title,labels,state`
4. Read current `<active-work>`
5. Reconcile:
   - Items checked off / moved to "Shipped today" in daily note → move to "Recently Completed"
   - New daily-note items not in Active Work → add to appropriate section
   - Active Work items with no worktree → check if completed or stale
   - Open GitHub Issues not tracked → add them
6. Auto-cleanup stale worktrees (see below)
7. Write updated note
8. Clean "Recently Completed" items older than 3 days

### Auto-cleanup stale worktrees
During every refresh, check each worktree (besides the main app repo) for staleness:

**A worktree is stale if any of these are true:**
- Its GitHub Issue (extracted from branch name like `42-foo`) is closed
- Its work appears checked off / shipped in recent daily notes
- Its branch has been merged into the default branch (`git branch --merged $(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)`)

**Cleanup procedure:**
1. Check for uncommitted changes: `git -C <worktree-path> status --short`
2. If only throwaway files (plan.md, notes.md, .claude/ artifacts, CLAUDE.local.md) → safe to force-remove
3. If real uncommitted source changes → skip removal, flag in Active Work as "has uncommitted changes"
4. **Sync worktree `context/` → vault BEFORE removal** (same step as "Cleaning Up After Merge" #1):
   ```bash
   if [ -d "<worktree-path>/context" ]; then
     mkdir -p "<vault>/Tickets/<repo>-<num>/context"
     cp -r "<worktree-path>/context/"* "<vault>/Tickets/<repo>-<num>/context/"
   fi
   ```
   This preserves `proposal.md` + `design.md` + `tasks.md` (the spec authored in Session 1), `progress-tracker.md` (the task ship order), and any context file the coding agent edited mid-build.
5. Remove: `cd "<project-repo>" && git worktree remove --force <path> && git worktree prune`
6. Delete local branch if merged: `git branch -d <branch-name>`
7. Archive vault ticket folder: `mv "<vault>/Tickets/<repo>-<num>" "<vault>/Archive/Tickets/<repo>-<num>"` (now holds the synced final state)
8. Report all cleanups in the turn-end summary

### When to update Active Work:
- **After creating a GitHub Issue** (add to Up Next or In Progress depending on state)
- **After moving a GitHub Issue** to a different state (in-progress label, closed, etc.)
- After creating/removing a worktree
- After a `/refresh` invocation
- When the user asks for status
- At the start of a new session (quick reconciliation)
- **Rule: If your turn created, moved, or completed a GitHub Issue, you MUST update Active Work before the turn ends.**

## Status Check Procedure

When the user asks for status, gather from these sources:

1. **Active Work note**: Read `<active-work>` — primary dashboard
2. **Active worktrees**: `cd "<project-repo>" && git worktree list`
3. **GitHub Issues**: `gh issue list --assignee @me --state open --json number,title,labels`
4. **Daily note**: Read `<daily-today>` for what's been logged
5. **Reconcile** any discrepancies and update Active Work if needed
