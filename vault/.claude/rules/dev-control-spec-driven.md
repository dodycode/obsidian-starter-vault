# Dev Control — Spec-Driven Flow (Orchestrator Side)

> **User-agnostic.** Paths use placeholders (`<vault>`, `<project-repo>`, `<your-name>`, `<active-work>`, `<daily-today>`) which `CLAUDE.local.md` resolves.

This rule defines what **Dev Control (the orchestrator) does** when a new piece of work opens. The orchestrator stays lean: collect sources, create a GitHub Issue stub, provision a worktree with empty spec stubs, hand off. The actual SDD spec phase (interview + writing `proposal.md`/`design.md`/`tasks.md`) happens in the worktree's first session — that lives in `~/.claude/rules/spec-driven-development.md`.

`dev-control-workflows.md` is the orchestration layer (worktree, Active Work, GitHub Issue lifecycle, handoff template). This file is the **content layer** for the orchestrator's intake.

## Why this split exists

Specs used to be written in the vault by Dev Control before the worktree existed. Problem: the user reviewed prose without the codebase tree open in VS Code, so review was shallow. Industry default (Kiro, GitHub Spec-Kit, BMAD) keeps specs IN the workspace, next to the code. This template now matches that — the worktree is the spec's home during the build, vault `Tickets/<repo>-<num>/` is the historical archive after merge.

---

## When orchestrator intake runs

**Always**, on any of these entry points:

- "let's work on `<repo>#NN`" — existing GitHub Issue
- "let's add feature X" — chat-only idea, no source
- pasted GitHub Issue URL
- pasted GitLab Issue URL
- dropped screenshot(s) of bugs / mockups / specs

**Every ticket goes through orchestrator intake.** The orchestrator's job is light: detect the source, capture it, create a GitHub Issue stub if needed, create a worktree with empty spec stubs, hand off.

No short-circuit. Tiny tickets just produce tiny `proposal.md` / `design.md` / `tasks.md` files. The shape is the same; the content is smaller.

---

## Phase 1 — Source detection + parallel read

Detect the source type from the user's message. Dispatch **parallel fork agents** (per `~/.claude/rules/agent-dispatch.md`) to read every applicable source. Children share parent cache, so reading multiple sources in parallel is cheap.

### Source detection rules

| Signal in user message | Source type | Reader |
|---|---|---|
| `<repo>#NN` mentioned | GitHub Issue | `gh issue view NN --repo <owner>/<repo> --json number,title,body,labels,state` |
| `github.com/.../issues/NN` URL | GitHub Issue | `gh api repos/<owner>/<repo>/issues/<NN>` |
| `gitlab.com/.../-/issues/NN` URL | GitLab Issue | `glab api projects/<id>/issues/<NN>` |
| Image attachment | Screenshot | Read image directly (vision) |
| None of the above | Chat-only | Skip external read, use chat content |

### Vault read (always, regardless of source)

Run these in parallel as fork-agents. Each fork returns a short summary back to the parent — keep raw content out of parent context.

1. **Existing ticket folder**: if `<vault>/Tickets/<repo>-<num>/` exists, read it. Picks up prior session notes, prior `/qa` runs, prior `/qa-fix` audits, prior synced spec files from earlier work.
2. **Recent daily notes**: last 7 days under `<vault>/People/<your-name>/Daily/`. Catches sibling tickets that touched the same area, blockers, hand-offs.
3. **Feature MOC**: if the source content clearly maps to a feature domain in `<vault>/Features/`, read `<vault>/Features/<Domain>/MOC.md`. Skip if domain unclear or no Features subfolders exist yet.

### Output of Phase 1

A short structured summary used in Phase 2 (GitHub Issue stub) and passed to the worktree's `CLAUDE.local.md` (so the coding agent has context without re-fetching):

```
Source type: <GitHub / GitLab / screenshot / chat-only>
Source URLs / paths: <list>
Source content (1-paragraph summary): ...
Existing vault hits:
  - Tickets/<repo>-<num>/notes.md: <summary>
  - Recent dailies: <related work, if any>
  - Features/<Domain>/MOC.md: <relevant context, if any>
Inferred ticket class (rough): <bug / refactor / feature / new-component>
Inferred branch slug: <40-char lowercase slug for branch naming>
```

This lives in conversation memory for the rest of the session.

---

## Phase 2 — GitHub Issue materialization (stub at intake)

The orchestrator creates a GitHub Issue stub ONLY — title + 1-line context. The rich description gets enriched in Phase 5b after the coding agent writes `proposal.md`.

### Path A — no issue yet

1. Render proposed stub in chat:

   ```
   Title: <one-line title from source content>
   Body: <1-2 sentences capturing the ask>
   Labels: <bug / enhancement / refactor — from inferred class>
   Assignee: @me
   ```

2. AskUserQuestion: confirm post / revise / cancel.
3. On confirm:

   ```bash
   gh issue create \
     --repo <owner>/<repo> \
     --title "<title>" \
     --body "<1-2 sentence stub>" \
     --label "<label>" \
     --assignee "@me"
   ```

   Capture the new issue number from the output.
4. Continue to Phase 3 (worktree).

### Path B — issue already exists

1. Read existing issue. Surface its current state in chat (one-line summary, current labels, state).
2. No description rewrite at intake. The rewrite happens after the coding agent's spec phase (Phase 5b).
3. Continue to Phase 3 (worktree).

### Audience reminder

GitHub Issue body is for the future-you (or a contributor) reading the issue cold, NOT for the implementing agent. Per `<vault>/.claude/rules/issue-tracking.md`:

- No code, no file paths, no function names
- No internal scope/rollout notes
- Technical investigation lives in worktree `context/` files, not the GitHub issue

---

## Phase 3 — Worktree provisioning

Hand off to `/new-worktree <repo>#<num>`. Updated skill behavior (see `<vault>/.claude/skills/new-worktree/SKILL.md`):

1. Create branch + worktree from the repo's default branch.
2. Copy env files / MCP / `/qa-fix` skill.
3. Create `<worktree>/context/` with empty stubs:
   - `proposal.md` — frontmatter + section headers, all sections empty
   - `design.md` — frontmatter + section headers, all sections empty
   - `tasks.md` — frontmatter + section headers, all sections empty
   - `progress-tracker.md` — NOT created here. Coding agent generates it at end of Session 1.
4. Write `<worktree>/CLAUDE.local.md` from the dual-mode template in `dev-control-workflows.md` Template A. Include the Phase 1 source URLs / paths in the "Source material" section so the coding agent has the same context the orchestrator gathered.
5. Sanity check: `head -1 <worktree>/CLAUDE.local.md` returns `# Task: <repo>#<num> — ...`.

Then announce the handoff:

> Worktree ready at `<worktree-path>`. Open it in VS Code, then start a fresh Claude session there. The session-1 agent will read the source material, grep relevant code, run the spec interview with you, and write `context/proposal.md` + `context/design.md` + `context/tasks.md`. You review those files in VS Code with the codebase tree open. After approval, start a fresh session per task.

Per `dev-control-workflows.md` "HAND OFF" rules: **Dev Control does NOT implement and does NOT write the spec**. No `Edit`/`Write` on app source from this session. No interview, no proposal/design/tasks authoring — that's the coding agent's job.

---

## Phase 5b — GitHub Issue enrichment (after coding agent's spec phase)

Triggered by:
- User saying "spec done, enrich `<repo>#NN`"
- A `/refresh` finding the worktree has populated `context/proposal.md` while the GitHub Issue body is still the stub

Steps:

1. Read `<worktree>/context/proposal.md`.
2. Build a richer GitHub Issue body per the template in `dev-control-workflows.md` "GitHub Issue Template" section.
3. AskUserQuestion: confirm update / revise / skip.
4. On confirm:

   ```bash
   gh issue edit <num> --repo <owner>/<repo> --body "$(cat <<'EOF'
   ## Context
   ...
   ## Scope
   ...
   ## Acceptance Criteria
   - [ ] ...
   EOF
   )"
   ```

The orchestrator never reads `design.md` or `tasks.md` for this. GitHub Issue body is product/QA-facing (or future-you-cold-reading), only `proposal.md` content belongs there. Technical content stays in worktree `context/`.

---

## Anti-patterns

- **Orchestrator running the interview.** That's the coding agent's job in the worktree. Orchestrator does NOT call AskUserQuestion to gather product/technical/design/process answers. Only intake-level questions ("create GitHub Issue stub now?", "which sources to attach?").
- **Orchestrator writing proposal/design/tasks.** Same reason. Spec authorship lives where the codebase tree is.
- **Orchestrator copying populated `context/` from vault to worktree.** Vault no longer holds the spec during the build — only after merge. Worktree starts with empty stubs.
- **Treating the GitHub Issue as the source of truth for technical detail.** It's not — the issue body is for the future-you / a contributor. Worktree `context/` is the technical source. Vault archive after merge is read-only history.
- **Dev Control writing code or running typecheck/lint.** Implementation belongs in fresh worktree sessions. Orchestrator stays orchestration.

---

## See also

- `~/.claude/rules/spec-driven-development.md` — coding-agent-side spec phase (interview, file shapes, sub-tasks)
- `dev-control-workflows.md` — orchestration (worktree, Active Work, GitHub Issue lifecycle, handoff rules, dual-mode CLAUDE.local.md template)
- `dev-control-daily-notes.md` — daily-note structure
- `dev-control-handoff.md` — coding-agent split-of-roles
- `~/.claude/rules/interview.md` — 95%-confidence rule, AskUserQuestion mandate
- `~/.claude/rules/agent-dispatch.md` — fork pattern for parallel reads
- `~/.claude/rules/session-per-task.md` — one-task-per-fresh-session rule for the implementation phase
- `~/.claude/rules/commit-batching.md` — never auto-commit mid-session (with SDD-implementation override documented in `dev-control-workflows.md` Template A)
- `~/.claude/rules/code-review-workflow.md` — `/tech-lead-review` is opt-in / user-invoked only
- `issue-tracking.md` — GitHub Issue body audience (future-you / contributor, not implementing agent)
- `gh-hygiene.md` — GitHub + git conventions (issue title shape, branch naming, commit messages, PR descriptions)
