# Dev Control — Spec-Driven Flow Reference

> **User-agnostic.** Paths use placeholders (`<vault>`, `<project-repo>`, `<your-name>`, `<active-work>`, `<daily-today>`) which `CLAUDE.local.md` resolves on your machine.

This rule defines the **Spec-Driven Development (SDD)** flow Dev Control runs before handing off to a coding agent. It adapts the [JavaScript Mastery Six-File Context Methodology](../../Templates/Six-File-Context-Methodology/README.md) to a GitHub-Issues + worktree setup. The seven file shapes (project-overview, architecture, code-standards, ai-workflow-rules, ui-context, bugfix-spec, progress-tracker) are described inline below; ready-to-copy scaffolds live at `Templates/Six-File-Context-Methodology/templates/context/`.

`dev-control-workflows.md` is the orchestration layer (worktree creation, Active Work, GitHub Issue lifecycle). This file is the **content layer** — what to read, what to ask, which files to generate, how to fill them in.

---

## When SDD runs

**Always**, on any of these entry points:

- "let's work on `<repo>#NN`" — existing GitHub Issue
- "let's add feature X" — chat-only idea, no source
- pasted GitHub Issue URL
- pasted GitLab Issue URL
- dropped screenshot(s) of bugs / mockups / specs

**With one short-circuit**: if the first interview question reveals the work is a spike or one-line tweak, SDD skips file generation and falls back to the legacy per-task block (see `dev-control-workflows.md` "Legacy short-circuit path").

**Never** silently bypass SDD. If the user says "just create a ticket and a worktree, no spec", that's an explicit override — proceed but log it in the daily note so future-you knows what shipped without context files.

---

## Phase 1 — Source detection + parallel read

Detect the source type by looking at the user's message. Then dispatch **parallel fork agents** (Agent calls without a `subagent_type`) to read every applicable source. Children share parent cache, so the cost of reading multiple sources in parallel is roughly 1 source plus a small overhead.

### Source detection rules

| Signal in user message | Source type | Reader |
|---|---|---|
| `<repo>#NN` mentioned | GitHub Issue | `gh issue view NN --repo <repo> --json number,title,body,labels,state` |
| `github.com/.../issues/NN` URL | GitHub Issue | `gh api repos/<owner>/<repo>/issues/<NN>` |
| `gitlab.com/.../-/issues/NN` URL | GitLab Issue | `glab api projects/<id>/issues/<NN>` |
| Image attachment | Screenshot | Read image directly (vision) |
| None of the above | Chat-only | Skip external read, vault-only |

### Vault read (always, regardless of source)

Run these in parallel as fork-agents. Each fork returns a short summary back to the parent — keep raw content out of parent context.

1. **Existing ticket folder/file**: if `<vault>/Tickets/<repo>-<num>/` (or legacy `<vault>/Tickets/<repo>-<num>.md`) exists, read it. Picks up prior session notes, prior `/qa` runs, prior `/qa-fix` audits, prior context files if SDD ran before.
2. **Recent daily notes**: last 7 days under `<vault>/People/<your-name>/Daily/`. Catches sibling tickets that touched the same area, blockers, hand-offs.
3. **Feature MOC**: if the source content clearly maps to a feature domain in `<vault>/Features/`, read `<vault>/Features/<Domain>/MOC.md`. Skip if domain unclear or no Features subfolders exist yet.

### Output of Phase 1

A short structured summary fed into Phase 2:

```
Source type: <GitHub / GitLab / screenshot / chat-only>
Source content (1-paragraph summary): ...
Existing vault hits:
  - Tickets/<repo>-<num>/notes.md: <summary>
  - Recent dailies: <related work, if any>
  - Features/<Domain>/MOC.md: <relevant context, if any>
Inferred ticket class (rough): <bug / refactor / feature / new-component / spike>
```

This lives in conversation memory, not on disk.

---

## Phase 2 — Combined interview to 95% confidence

Interview rules:

- **AskUserQuestion only.** No free-form text questions.
- **95% confidence is claimed by the user, not the agent.** Keep going until the user says "go", "proceed", "ship it", or equivalent.
- **1-4 questions per round, multi-round.** No fixed total.

### What to cover (one combined interview, not separate rounds per area)

Pull from the JSM playbook's "Questions to Answer Before Opening Any Coding Tool":

**Product**
- What does this work do in one sentence? (one user-facing outcome)
- Who is the primary user / which segment is affected?
- What does done look like — testable acceptance criteria?
- What is explicitly out of scope?

**Technical**
- Which modules/areas are affected? (cross-reference `<project-claude>` — your project's own `CLAUDE.md`)
- Where does data live (DB tables, cache keys, blob storage, queues)?
- Auth/access boundary — does this work cross orgs, roles, or scopes?
- Any external APIs involved? Webhooks?
- Invariants the codebase must NOT violate?

**Design** (only if UI is touched)
- New component or extending existing?
- Reference Figma / design doc?
- Any new tokens needed (colors, spacing) — or strictly using existing?

**Process**
- One PR or stacked? If stacked, what's the natural split (schema → API → UI, etc.)?
- Roughly how many units? (Inform Phase 3 file proposal — single-unit work doesn't need a build plan.)

### First-question short-circuit

The first AskUserQuestion ALWAYS includes a triage option:

```
Question: "Quick triage — what kind of work is this?"
Options:
  - "Spike / one-line tweak / config bump" → short-circuit to legacy per-task block
  - "Bug fix" → continue interview, expect bugfix-spec.md
  - "Refactor" → continue interview, expect architecture + standards
  - "Feature / new component" → continue interview, full SDD
```

If the user picks short-circuit, skip Phases 3-4 entirely, jump to Phase 5 (GitHub Issue creation if needed) using a minimal template, then Phase 6 (worktree provisioning) with the legacy per-task `CLAUDE.local.md` block.

### Output of Phase 2

A structured answer set covering Product / Technical / Design / Process. Lives in conversation memory until Phase 4 writes it to disk.

---

## Phase 3 — Propose context files

Agent proposes which of the 7 possible files apply. User confirms via AskUserQuestion (multiSelect = true so they can adjust the list).

### File menu (7 possible)

| File | When to propose |
|---|---|
| `project-overview.md` | Almost always (skip only for tiny bug fixes) |
| `architecture.md` | Cross-cutting work — touches >1 layer (DB + API + UI), new external integration, new background job, new auth boundary |
| `code-standards.md` | New patterns the agent might invent on its own (new validator shape, new handler convention, new test layout) |
| `ai-workflow-rules.md` | Always — defines verification gates (typecheck, lint) for the coding agent |
| `ui-context.md` | New component (NOT extending an existing one). Cite the existing tokens from your project's UI package, don't redefine them |
| `bugfix-spec.md` | Bug class only — Symptom / Root Cause / Fix Approach / Regression Test |
| `progress-tracker.md` | Always when build plan has ≥2 units |

### Heuristics by ticket class

```
Bug (small, isolated)        → bugfix-spec.md + ai-workflow-rules.md
Bug (cross-cutting)          → bugfix-spec.md + architecture.md + ai-workflow-rules.md
Refactor                     → architecture.md + code-standards.md + ai-workflow-rules.md
Feature (extends existing)   → project-overview.md + architecture.md + ai-workflow-rules.md + progress-tracker.md
Feature (greenfield)         → all of the above + code-standards.md
New component (UI)           → above + ui-context.md
Spike / one-line tweak       → none (short-circuit)
```

### Confirmation pattern

```
Question: "Based on the ticket, I propose generating these context files. Adjust if you want."
multiSelect: true
Options:
  - "project-overview.md" (recommended)
  - "architecture.md" (recommended)
  - "code-standards.md"
  - "ai-workflow-rules.md" (recommended)
  - "ui-context.md"
  - "bugfix-spec.md"
  - "progress-tracker.md" (recommended — build plan has 3 units)
```

User can deselect or add. Proceed to Phase 4 with the confirmed list.

---

## Phase 4 — Generate context + build plan

### Folder shape

```
<vault>/Tickets/<folder>/
├── notes.md              ← free-form ticket notes, existing convention
└── context/
    ├── project-overview.md
    ├── architecture.md
    ├── code-standards.md
    ├── ai-workflow-rules.md
    ├── ui-context.md
    ├── bugfix-spec.md
    ├── progress-tracker.md
    └── specs/
        ├── 00-build-plan.md
        └── NN-<unit-name>.md  ← one per unit, written just-in-time before each unit ships
```

### Folder name resolution

| State | Folder |
|---|---|
| GitHub Issue exists (Phase 1 detected `<repo>#NN`) | `<vault>/Tickets/<repo>-NN/` |
| No GitHub Issue yet | `<vault>/Tickets/draft-<slug>/` |

### Slug derivation (no-issue-yet case)

From the interview's Product Q1 answer ("what does this work do in one sentence?"):

- Lowercase
- Strip articles (`the`, `a`, `an`)
- Replace spaces and punctuation with `-`
- Collapse consecutive hyphens
- Strip leading/trailing hyphens
- Cap at 40 characters

Examples:
- "Add bulk-export to the dashboard" → `add-bulk-export-to-dashboard`
- "Fix calendar sync when user has multiple Google accounts" → `fix-calendar-sync-multiple-google-accounts` → cap → `fix-calendar-sync-multiple-google`
- "Investigate why background jobs time out" → `investigate-why-background-jobs-time-out`

### Lazy migration

When Dev Control first touches a ticket that has the legacy flat `<vault>/Tickets/<repo>-NN.md`, move it to `<vault>/Tickets/<repo>-NN/notes.md` before generating the new `context/` folder. Don't bulk-migrate untouched tickets.

### Per-file generation guidelines

The shape of each file is documented below. **Override generic placeholders with project defaults** — never write `[your stack]`, write the actual stack from `<project-claude>`.

#### `project-overview.md`

Sections:
- One-paragraph overview of what this work delivers
- Numbered goals (measurable, not aspirational)
- Step-by-step user flow if user-facing
- Features section grouped by category
- In-scope (explicit list)
- Out-of-scope (explicit list — this prevents the agent from over-reaching)
- Success criteria (verifiable, e.g., "a signed-in user can create and open a project", NOT "looks good")

Source material: GitHub Issue description + interview Product answers + any linked design doc.

#### `architecture.md`

Sections:
- Stack table (only the layers this work touches — don't restate the full stack, that lives in `<project-claude>` aka `<project-repo>/CLAUDE.md`)
- System boundaries (which modules own which responsibility for THIS work)
- Storage model (DB tables, cache keys, blob storage, queues — be specific)
- Auth/access model (how user/org scoping works for THIS work)
- Background-task model if relevant (job queue, cron, webhook)
- **Invariants** (non-negotiable rules — minimum 4):
  - Examples: "request handlers do not run long-lived AI work", "auth is enforced at every mutation boundary", "soft-delete filter required on every read", "scope filter required on every query"
  - Pull from your project's `CLAUDE.md` rules where they apply
  - Add ticket-specific ones

#### `code-standards.md`

Don't restate generic standards that already live in your project's `CLAUDE.md` or shared rules. **Only document patterns specific to THIS work**:
- New validator shape if introducing one
- New handler structure if introducing one
- New test pattern if needed
- File-organization decisions for new code

If nothing in this work is novel, skip this file entirely.

#### `ai-workflow-rules.md`

Imperative rules to the coding agent, not guidelines:

- Work on one unit at a time (cite the build plan)
- Run typecheck before declaring a unit done
- Run lint before declaring a unit done
- Iterate until typecheck + lint pass clean
- Never auto-commit mid-session — stage diff for user review only
- Update `context/progress-tracker.md` after each unit
- Update `<daily-today>` In progress / Shipped today (per `dev-control-daily-notes.md`)
- DO NOT update `<active-work>` — that's Dev Control's job

#### `ui-context.md`

Only if new component(s).

- Reference existing tokens — don't redefine. Point to the canonical token tables in your project's UI package.
- Component library convention (shadcn/ui, Radix, Material, etc.)
- Layout patterns specific to THIS component (sidebar behavior, modal patterns, list density)
- Icon set

If extending an existing component, skip this file — the token system is already in scope and your project's UI conventions cover the styling rules.

#### `bugfix-spec.md`

Bugs only. Sections:

```markdown
# Bugfix Spec — <repo>#NN [Title]

## Symptom

What the user / report describes. Plain language. Include reporter, timestamp, scope when available.

## Root Cause

The specific code / logic that produces the bug. Cite file paths + function names (NOT line numbers — they drift).
Include the invariant that was violated.

## Fix Approach

How the fix works. One paragraph + a short numbered list of steps.
Reference the units in 00-build-plan.md if the fix is multi-step.

## Regression Test

How we verify the bug doesn't come back. Include:
- Test file path + describe block name
- Specific scenario the test asserts
- Whether the test should hit a real DB

## Sources

GitHub Issue / Sentry / monitoring / log links.
```

#### `progress-tracker.md`

Lives in `context/`. Mirrors the build plan as a live checklist. Coding agent updates after each unit:

```markdown
# Progress Tracker — <repo>#NN

Update this file after every meaningful implementation change.

## Current Phase
- [Unit NN — name]

## Current Goal
- [What you're building right now]

## Completed
- [x] Unit 01 — name (PR #NNNN)
- [x] Unit 02 — name (PR #NNNN)

## In Progress
- [ ] Unit 03 — name

## Next Up
- [ ] Unit 04 — name

## Open Questions
- [Any unresolved decisions]

## Architecture Decisions
- [Decisions made during build that affect future work — capture WHY, not WHAT]

## Session Notes
- [Context to resume in the next session — last commit, last failing test, etc.]
```

### Build plan (`specs/00-build-plan.md`)

Required for any work with ≥2 units. Skip for single-unit work.

Decompose into units following these rules (from JSM Part 3):

- One visible / verifiable result per unit
- One system boundary per unit (don't mix UI + DB + background tasks in one unit)
- Has a "Verify when done" checklist
- Buildable in one focused session

Order rules:

- Dependencies first (B needs A → A first)
- Security before functionality (auth before features it protects)
- Backend before frontend wiring (API routes before UI calls them)
- UI shells before real data (component structure with placeholders, then wire data)
- Install dependencies just-in-time (only when first needed)

Format:

```markdown
# Build Plan — <repo>#NN

## Units

### Unit 01 — [Name]
- **Builds**: One visible outcome
- **Boundary**: [module or area]
- **Depends on**: [previous unit ID, if any]
- **Verify when done**:
  - [ ] Concrete check 1
  - [ ] Concrete check 2
  - [ ] No TypeScript errors
  - [ ] No console errors

### Unit 02 — [Name]
...
```

### Per-unit specs (`specs/NN-<unit-name>.md`)

**Just-in-time**, not all at once. Coding agent generates the spec for unit N before starting unit N. Format per JSM Part 3:

```markdown
# Unit NN: [Name]

## Goal
1-2 sentences, specific and concrete (NOT "create the auth pages" — write "create sign-in / sign-up pages using Clerk components with two-panel layout on desktop and form-only on mobile, using middleware.ts for route protection").

## Design
Visual + structural decisions specific to this unit. Reference ui-context.md tokens.

## Implementation
### [Component or sub-section]
What to build, how.

### [Next sub-section]
...

## Dependencies
- package-name (reason)

## Verify when done
- [ ] Condition 1
- [ ] Condition 2
- [ ] No TypeScript errors
- [ ] No console errors
```

---

## Phase 5 — GitHub Issue materialization

### When to skip

- GitHub Issue already exists (Phase 1 detected `<repo>#NN`) → skip Phase 5 entirely, go to Phase 6
- User opts into "draft mode" via AskUserQuestion → leave artifacts in `Tickets/draft-<slug>/`, end the flow here. Resume later by re-invoking SDD on the same slug.

### Field mapping (interview output → GitHub Issue)

| GitHub field | Source |
|---|---|
| Title | One-line goal from `project-overview.md` (or interview Product Q1 if no project-overview) |
| Body | Constructed from `project-overview.md` sections (Overview, Goals, In-scope, Out-of-scope, Success criteria) + Acceptance Criteria from interview |
| Labels | From interview class (Bug → `bug`, Feature → `enhancement`, Refactor → `refactor`, etc.). Add `in-progress` if work starts immediately. |
| Assignee | `@me` (yourself) |
| Milestone | From interview if mentioned, else none |

**Audience reminder**: GitHub Issue body is for the future-you (or a contributor) reviewing the issue cold, NOT for the implementing agent. Per the vault's `issue-tracking.md` rule:
- No code, no file paths, no function names
- No internal scope/rollout notes
- Technical investigation lives in vault `context/` files, not the issue

### Creation command

```bash
gh issue create \
  --repo <owner>/<repo> \
  --title "<title>" \
  --body "$(cat <<'EOF'
## Context
<context>

## Scope
- <scope item 1>

## Acceptance Criteria
- [ ] <criterion 1>

## Technical Notes
- <high-level note>
EOF
)" \
  --label "<label>" \
  --assignee "@me"
```

### After issue creation

1. Capture the new issue number from the `gh issue create` output
2. Rename `<vault>/Tickets/draft-<slug>/` → `<vault>/Tickets/<repo>-<num>/`
3. Update `<active-work>` In Progress section per `dev-control-workflows.md` rules
4. Proceed to Phase 6

---

## Phase 6 — Worktree provisioning

Hand off to `/new-worktree <repo>#<num>`. The skill (per its updated `SKILL.md`) does:

1. Create branch + worktree from the default branch
2. Copy env files / MCP / `/qa-fix` skill
3. Copy `<vault>/Tickets/<repo>-<num>/context/` → `<worktree>/context/`
4. Write `<worktree>/CLAUDE.local.md` as the JSM-style entry-point (template in `dev-control-workflows.md`)
5. Sanity-check `head -1 CLAUDE.local.md` returns `# Task: <repo>#<num> — ...`

Then announce the handoff:

> Worktree ready at `<worktree-path>`. `cd` into it and start a fresh Claude session — `CLAUDE.local.md` points to `context/*.md` files which the coding agent reads before writing code.

Per `dev-control-workflows.md` "HAND OFF" rules: **Dev Control does NOT implement**. No `Edit`/`Write` on app source from this session.

---

## Draft mode

Sometimes you want to shape a spec without committing to a GitHub Issue immediately (exploring an idea, prototyping, "I'm not sure yet").

### Trigger

At Phase 5, before creating the GitHub Issue, AskUserQuestion:

```
Question: "Ready to materialize this as a GitHub Issue and provision the worktree?"
Options:
  - "Yes — create issue + worktree" (Recommended)
  - "Stay as draft — keep artifacts in Tickets/draft-<slug>/, no issue yet"
  - "Stay as draft, but provision a throwaway worktree on a non-issue branch"
```

### Draft state

- All artifacts live in `<vault>/Tickets/draft-<slug>/` (notes.md + context/)
- No GitHub Issue exists, no worktree exists
- Active Work has a "Drafts" sub-section listing slugs (Dev Control adds it during `/refresh`)
- Resume later: user says "let's continue draft `<slug>`" or "let's promote draft `<slug>`" — Dev Control re-reads the folder, re-runs Phase 2-3 (interview adjustments), then proceeds to Phase 5 (with the user's choice of materialize-now or stay-draft).

### Promotion

When ready to commit:
- Re-run Phase 5 with the existing draft folder content
- Rename `Tickets/draft-<slug>/` → `Tickets/<repo>-<num>/`
- Continue Phase 6

### Cleanup

Drafts older than 30 days move to `<vault>/Archive/Tickets/draft-<slug>/` during `/refresh`. Don't delete — keep for reference.

---

## Worktree-side coding agent contract

Once the coding agent starts in the worktree, the entry-point `CLAUDE.local.md` tells it to read `context/*.md` files in order. Then per unit:

1. Read `context/specs/00-build-plan.md` for unit ordering
2. Generate `context/specs/NN-<name>.md` for the current unit (just-in-time)
3. Implement
4. Run typecheck
5. Run lint
6. Iterate fix → re-run gates until clean
7. Update `context/progress-tracker.md` (move unit from In Progress → Completed)
8. Update `<daily-today>` (move from `## In progress` → `## Shipped today`)
9. Stage diff for user review (NEVER auto-commit)
10. Wait for user → user reviews → user commits → next unit

This is the same loop today, with the addition of read-context-first and update-progress-tracker.

---

## Anti-patterns

- **Skipping Phase 1 vault read.** "I'll just interview from scratch" loses prior session continuity. Always read existing artifacts first.
- **Generating all 7 files for every ticket.** Adaptive selection is the whole point — pick the files that match the ticket class, skip the rest.
- **Restating project-wide rules in every `architecture.md`.** Project-wide rules belong in your project's own `CLAUDE.md`. Only document THIS ticket's specifics in `architecture.md`.
- **Writing `code-standards.md` when nothing is novel.** If the ticket follows existing patterns, skip the file. Don't write a wall of "use TypeScript strict mode, named exports, etc."
- **Auto-committing context files mid-session.** Stage and let the user review — never commit without explicit user approval.
- **Treating the GitHub Issue as the source of truth for technical detail.** It's not — the issue body is for the future-you / a contributor. Vault `context/` is the technical source.

---

## See also

- `dev-control-workflows.md` — orchestration (worktree, Active Work, GitHub Issue lifecycle, handoff rules)
- `dev-control-daily-notes.md` — daily-note structure (referenced in `ai-workflow-rules.md` generation)
- `dev-control-handoff.md` — coding-agent split-of-roles
- `gh-hygiene.md` — GitHub Issue / PR description quality, commit message tone, branch naming
- `issue-tracking.md` — GitHub Issue body audience (future-you / contributor, not implementing agent)
