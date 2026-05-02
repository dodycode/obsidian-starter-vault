---
name: qa
description: Use when someone asks to generate a QA checklist, create a test plan, figure out what to test, verify a feature, or says "qa ENG-xxx". Also triggers on "what should I test" or "testing checklist". Supports Linear, GitHub, and GitLab issues. Delegates checklist generation to a forked Agent (Claude subagent).
argument-hint: <ENG-xxx | owner/repo#123 | namespace/project!123 | PR numbers>
user_invocable: true
---

## What This Skill Does

Generates a single artifact for a feature:

**QA Checklist** — small numbered tasks (5-10 items each) testable in the browser, ordered so earlier tasks create data needed by later tasks. Capped at **30-40 items max**.

**Delegation: this skill ALWAYS runs the checklist generator via a forked `Agent` call (omit `subagent_type` → fork; child inherits parent context byte-identical, runs the analysis in an isolated turn, returns the delimited checklist).** Fork keeps the heavy file-reads off the main conversation while reusing the parent's gathered context.

**Why not main-Claude inline?** The generator reads every changed file + every relevant rule file. That's a context-heavy operation; running it in the main turn bloats the conversation w/ tool-result chatter that's irrelevant after the file is written. Fork = context isolation.

**Output paths** (all under the vault, resolved via `<vault>` placeholder from `CLAUDE.local.md`):

- QA checklist → `<vault>/Tickets/QA/QA-{identifier}.md`
- QA screenshots (failures + passes) → `<vault>/Tickets/QA/QA-{identifier}-{fail|pass}-{slug}.png`
- Stale failure screenshots (post-fix) → `<vault>/Tickets/QA/Archive/QA-{identifier}-fail-{slug}.png`
- Feature-doc lookup (if a long-form ticket note exists) → `<vault>/Tickets/<repo>-{number}/notes.md` (folder shape) or `<vault>/Tickets/<repo>-{number}.md` (legacy flat)

**Vault layout:** the `QA/` subfolder is the canonical home for QA artifacts. Inside it, `QA/Archive/` holds stale failure screenshots — when a bug is fixed, MOVE the failed screenshot there and capture a new pass-screenshot at `QA/QA-{identifier}-pass-{slug}.png`. Never overwrite a failure screenshot — Archive preserves the historical bug for regression context.

---

## Steps

### Step 1: Parse Arguments (Claude)

- `$ARGS` can be one of:
  - A **GitHub** issue: `owner/repo#123` (matches `[\w-]+/[\w-]+#\d+`)
  - A **GitLab** issue: `namespace/project!123` (matches `[\w-]+/[\w-]+!\d+`)
  - **PR numbers**: space-separated numbers (e.g., `3266 3267 3268`)

If no arguments provided, ask the user.

### Step 2: Gather Context (Claude)

Pre-fetch GitHub/GitLab data so the forked Agent has everything it needs without re-running tool calls the parent has already used. Bundling context up-front also keeps the child's tool-call count low.

Derive project name from cwd (strip worktree suffix from the workspace dir name; fallback to git repo root name). Resolve `{REPO_DIR}` to the absolute path of the current working directory (or the worktree containing the changed code if cwd is the vault).

**If GitHub issue (e.g., `owner/repo#123`):**
1. Fetch the issue via `gh api repos/{owner}/{repo}/issues/{number}` — capture title, body, labels, comments
2. Find related PRs: `gh pr list --repo {owner}/{repo} --search "{number}" --state all --json number,title,state,body,url,headRefName`
3. Check for an existing feature doc — `<vault>/Tickets/<repo>-{number}/notes.md` (folder shape) or `<vault>/Tickets/<repo>-{number}.md` (legacy flat)
4. If feature doc exists, read it — this is the primary source of truth for expected behavior

**If GitLab issue (e.g., `namespace/project!123`):**
1. Fetch the issue via `glab api projects/{namespace}%2F{project}/issues/{number}` — capture title, description, labels
2. Fetch comments via `glab api projects/{namespace}%2F{project}/issues/{number}/notes`
3. Check for an existing feature doc — `<vault>/Tickets/GL-{number}/notes.md` (folder shape) or `<vault>/Tickets/GL-{number}.md` (legacy flat)
4. If feature doc exists, read it

**If PR numbers:**
1. For each PR number, fetch via `gh api repos/{owner}/{repo}/pulls/{number}` — capture title, body, headRefName, and changed files
2. Infer the issue ID from PR titles (look for `#123` or `!123` patterns, or a `Closes #N` line in the body)
3. If issue ID found, fetch the issue and feature doc using the matching platform logic above

Bundle the gathered context as a single inlined block (markdown, headed `# Source Context`) ready to paste into the Agent prompt.

### Step 3: Build the Agent Prompt

Use this exact template, substituting `{REPO_DIR}`, `{IDENTIFIER}`, `{SOURCE_CONTEXT}`, `{PR_LIST}`:

```
You are a senior QA lead generating a manual test plan for the feature at {REPO_DIR}.

Identifier: {IDENTIFIER}
PRs in scope: {PR_LIST}

Steps:
1. Read the project's relevant rule files (the project's `CLAUDE.md`, anything under the project's `.claude/rules/`, and the vault's `.claude/rules/*.md`) so the checklist's expected-behavior bullets reference the correct conventions.
2. Resolve the diff:
   - If any of the listed PRs are local branches in the repo, run `git diff $(git merge-base HEAD dev)..HEAD` on each branch (or `main` if no `dev`).
   - For PRs not present locally, treat the source-context PR bodies as the diff summary and read changed file paths from the PR data.
   - Read every changed file fully for context.
3. Generate the QA Checklist following the rules below.
4. Output the checklist in the exact delimited format at the bottom of this prompt. No preamble, no postscript outside the delimiters.

--- QA Checklist Rules ---

Structure as **numbered tasks**, not flat sections. Each task is a focused testing session with 5-10 items. Total items capped at **30-40**.

Task ordering: tasks that create data come FIRST, tasks that verify data come AFTER. A tester should be able to go through tasks sequentially.

Mirror the source ticket's Acceptance Criteria at the top of the checklist verbatim — pull the AC bullet list from the source context. QA needs an explicit "done" definition.

Mirror Edge Cases / Expected Behavior Notes from the ticket into a dedicated section before the numbered tasks.

Format each item as:
```
- [ ] **[Action]** → [Expected result]
```

Task structure (skip any that don't apply):
1. Data creation tasks first — modal/form testing that seeds data needed for later tasks
2. List/table verification — verify created data displays correctly
3. Detail page tasks — one task per major detail page
4. Cross-entity workflows — promotion flows, linking, unlinking
5. Regression — Flag off — existing behavior unchanged when feature flag is disabled

Include (high-risk):
- Happy path for each major flow (create, view, edit, delete)
- Validation error readability — error messages must be human-readable, not raw Zod errors
- Toggle/state clearing behavior (data leaking between states)
- Search/filter with new data types
- Empty states that could crash the page
- Feature flag regression

Exclude (low-risk):
- Items covered by automated tests
- Standard framework behavior (routing, browser back button)
- Reused V1 components on new pages
- Every permutation of optional fields
- Navigation edge cases

Hard cap: 30-40 items. If over 40, cut lowest-risk items.

--- Source Context ---

{SOURCE_CONTEXT}

--- Output Format (mandatory, exact delimiters) ---

===== QA CHECKLIST START =====
# QA Checklist: {feature title}

**Source:** {IDENTIFIER} | PRs: {PR_LIST}
**Feature doc:** {feature doc path or "n/a"}
**Date:** {today's date YYYY-MM-DD}

> **Legend:** `[x]` = pass | `[-]` = fail | `[ ]` = not tested
> **Log feedback:** Run `/qa-feedback {IDENTIFIER}` to interactively log issues from the CLI

## Prerequisites
- [ ] {prereq 1}
- [ ] {prereq 2}

## Acceptance Criteria (from {IDENTIFIER})
- [ ] {criterion 1}
- [ ] {criterion 2}

## Edge Cases / Expected Behavior Notes
- {edge case 1 → expected behavior}

## Task 1: {Name} ({N} items)
> Goal: {what this task tests}

- [ ] **{action}** → {expected result}

(continue with Task 2..N, ending with Regression — Flag Off if applicable)

===== QA CHECKLIST END =====
```

### Step 4: Dispatch Forked Agent (Claude)

Call the `Agent` tool with `subagent_type` **omitted** → fork. The child inherits the parent's full conversation context (so all the data gathered in Step 2 is already there) and runs the analysis in an isolated turn. Set `description` to a 3-5 word summary like "Generate QA checklist".

The child has the same tools the parent does (Bash, Read, Grep, etc.), so it can run the `git diff`, read changed files, and read project + vault rule files directly inside its turn.

Dispatch synchronously (no `run_in_background=true`) — the parent needs the delimited output back to write the file. The agent returns a single message containing the entire delimited block.

If the agent returns malformed output (delimiters missing, body empty), surface the raw text to the user and stop — do NOT silently write a partial file.

### Step 5: Parse Output and Save Artifact (Claude)

1. Extract the body between `===== QA CHECKLIST START =====` and `===== QA CHECKLIST END =====` from the agent's response.
2. Determine the identifier:
   - GitHub issue: `GH-123` (or `<repo>-123` if multi-repo workspace)
   - GitLab issue: `GL-123`
   - PR numbers only: `PR-{first-number}`
3. Ensure target directory exists at `<vault>/Tickets/QA/` (and `Tickets/QA/Archive/` for stale fail screenshots). Create both if missing.
4. Write the QA checklist to `QA/QA-{identifier}.md`.
5. If a delimiter is missing or the section is empty, surface the raw agent output to the user and stop — do not silently write a partial file.

### Step 6: Report Path + Auto-Continue to /qa-feedback (Claude)

Briefly tell the user where the file was saved (one line, w/ the markdown link), then **immediately invoke `/qa-feedback {identifier}`** via the `Skill` tool to start the manual browser session. Don't pause for confirmation — the chained flow is the default. The user can interrupt mid-`/qa-feedback` if they want to defer testing.

If `/qa-feedback` cannot start (e.g. Chrome DevTools MCP isn't connected, no browser available), surface the error and stop — do not fall back to a self-driven checklist run.

After the `/qa-feedback` session ends and any findings are addressed, the user opens a fresh Claude session in the worktree and runs `/qa-fix QA-{identifier}` to apply the fixes.

---

## Notes

- The feature doc (this vault `Tickets/<repo>-{number}/notes.md`) is the primary source of truth for expected behavior. If no doc exists, rely on PR descriptions and the GitHub/GitLab/Linear issue itself (the forked Agent receives both via the source-context block).
- 30-40 items max. The agent prompt instructs the child to cut lowest-risk items if over 40.
- The agent's response is the source of truth for the checklist — Claude does not edit, summarize, or re-judge the output. Re-running the analysis in the parent turn would defeat the context-isolation purpose of the fork.
- If the agent misses the delimiters or returns malformed markdown, do not patch it locally — re-dispatch with a tightened prompt or hand the raw output to the user.
- **Auto-continue to `/qa-feedback`.** After Step 5 writes the file, Step 6 immediately invokes `/qa-feedback {identifier}` via the `Skill` tool. The chained flow is the default — the user does not have to ask.

## What `/qa-feedback` does that `/qa` does not

When the user runs `/qa-feedback` on the checklist this skill produces, two cross-cutting effects fire that this skill does NOT do (and should NOT replicate):

- **PR Test Plan sync** (`/qa-feedback` Step 7, runs every loop). After each meaningful checklist update, `/qa-feedback` rewrites the EXISTING `## Test Plan` section in every PR the QA file covers, using GitHub-Flavored Markdown's only two supported task-list states (`- [x]` and `- [ ]`; **never `- [-]`** — GFM doesn't render it). Semantic: checkbox = **"is this resolved"** (passes + fixes get `[x]`; failures + skipped + untested get `[ ]` because they're open work), leading icon in the inline note (`✅` / `❌` / `⏭`) = **"result"**. Failures NEVER get `[x]` even with `❌` in the note — the team scans `[x]` as solved and would skip the bug. Appends sub-sections for surfaces the QA exercised that the original plan missed. **Never creates a parallel "QA status" section** — the team already watches the existing Test Plan. `/qa` deliberately skips this — there's nothing to sync when the checklist is fresh and untested.
- **Recall handoff to auto-memory** (`/qa-feedback` Step 8, runs only when failures landed). When the user closes a `/qa-feedback` session with at least one `[-]` item present, the skill writes `project_qa_{identifier}_handoff.md` to auto-memory with the bug-class clustering + root-cause file:lines + deferred user asks. That handoff is the single source of truth for the next session — typically a fresh-context `/qa-fix` run — so the new conversation can pick up without re-running QA.

**Don't** sync the PR body or write a handoff from `/qa` itself. The checklist is empty / untested at this point — there's no signal to broadcast. Both effects belong downstream in `/qa-feedback` where the data exists.

If the user invokes `/qa` again on the same identifier later (e.g. to regenerate the checklist after a redesign), the existing recall handoff at `project_qa_{identifier}_handoff.md` is still load-bearing for any in-flight `/qa-fix` work — don't delete it. Stale handoffs (more than 2 weeks old AND the underlying ticket is shipped/closed) can be removed when noticed.
