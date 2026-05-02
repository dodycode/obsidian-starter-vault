# GitHub Hygiene — Issues, PRs, Commits, Branches

> Single source of truth for GitHub + git conventions in this vault. Covers issue bodies, branch naming, commit messages, PR descriptions, the hooks shipped at `.claude/hooks/`, and the cross-link pattern between vault `Tickets/` and the GitHub repo.

## Issue descriptions

**Audience: future-you (or a contributor) reading the issue cold weeks later, NOT the agent that's about to implement it.**

- Title: `[Action verb] [what] [where]`. e.g. "Add calendar sync to dashboard", "Fix login redirect on mobile Safari", "Refactor auth middleware for sub-domains".
- Body sections (in this order):
  - `## Context` — why this work is needed, in 2-3 sentences. The motivation, the user problem, the why.
  - `## Scope` — bullet list of what areas/modules change.
  - `## Acceptance Criteria` — testable checkbox list. Each item asserts ONE observable outcome.
  - `## Technical Notes` (optional) — high-level architecture hints, dependencies, related issues.

### What does NOT belong in an issue body

- Code blocks (no `function foo() { ... }`)
- File paths (no `apps/dashboard/src/routes/+page.svelte`)
- Function names (no `handleSubmit`, no `useAuthStore`)
- Internal jargon (versioned schemas, "the legacy thing", "phase 2 sweep")
- Plan-mode artifacts (no "see [[Tickets/...context...]]" — those live in the vault, not on GitHub)

If the implementing agent needs technical detail, it reads `<vault>/Tickets/<repo>-<num>/context/` (the SDD output), NOT the GitHub issue body. The issue body is the **product / future-self** description.

## Branch naming

- `<num>-<short-description>` — e.g. `42-calendar-sync`, `101-fix-login-redirect`
- Lowercase, kebab-case, max 40 chars after the number
- One issue → one branch. Stack additional branches with the same `<num>` prefix (`42-schema`, `42-api`, `42-ui`).

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject
```

Allowed types:

- `feat` — new user-facing capability
- `fix` — bug fix
- `refactor` — internal rework, no behavior change
- `chore` — tooling, deps, ops
- `docs` — docs only
- `test` — tests only
- `perf` — performance only
- `style` — formatting / whitespace only
- `build` — build system, package manager
- `ci` — CI config / scripts
- `revert` — revert a prior commit

`scope` is optional but encouraged when relevant — pick the affected app/package/module (`auth`, `dashboard`, `db`, etc.).

Subject line ≤ 72 characters. Body explains the **why**, not the what — the diff already shows the what.

Reference the issue: include `Closes #<num>` in the commit body or PR description so GitHub auto-closes the issue when the PR merges.

### Enforcement

The vault ships `.claude/hooks/guard-conventional-commits.sh` which `bootstrap.sh` can wire into your `.claude/settings.local.json`. Once wired, Claude Code will block any `git commit -m "<message>"` that doesn't match the format. Bypass with explicit user override; don't bypass silently.

The vault also ships:

- `.claude/hooks/guard-pr-description.sh` — strips AI-attribution footers ("Generated with Claude Code", "Co-Authored-By: Claude") from `gh pr create` / `gh pr edit` body args.
- `.claude/hooks/strip-coauthored-by.sh` — safety net that drops `Co-Authored-By: Claude` / `Co-Authored-By: Anthropic` trailers from a commit message after the commit lands.

If you skipped wiring during `bootstrap.sh`, re-run it or edit `.claude/settings.local.json` manually.

## PR descriptions

For non-trivial PRs (anything beyond a typo / dependency bump / one-line config), use this shape:

```markdown
## Problem
<what the user-visible bug or need was, in plain English. Include reporter + timestamp + scope when available.>

## Summary
<how the fix works, in plain English. One sentence stating the new behaviour, then a short numbered list of WHAT changed.>

## Sources
<official docs, RFCs, prior incidents, library issues that justify the approach. Markdown links only.>
```

### Tone + content rules

- **Audience: future-you / a contributor reading cold.** Should make sense without opening a single file. No internal jargon, no acronyms without expansion.
- **Plain English.** Translate technical terms when describing root cause: "race condition" → "two things happening at once, stepping on each other"; "TOCTOU" → "checked once, but it changed before we acted on it".
- **No "review round" narration.** Don't write "Round 4 fix", "addressed reviewer feedback", "rewrote helper twice". The diff is the deliverable, not the review-cycle journal.
- **No `### Files changed` section.** GitHub's "Files changed" tab already shows that — duplicating in the description adds noise.
- **One ASCII diagram per section, max.** For non-trivial bugs (timing, races, multi-writer state, OAuth handoffs, retries), include ONE timeline diagram in `## Problem` showing the moment the invariant broke. ASCII inside fenced code blocks — no Mermaid (renders inconsistently across GitHub UIs), no image uploads. Cap at ~50-60 cols wide so it doesn't horizontal-scroll. Mirror the BEFORE diagram with an AFTER diagram in `## Summary` showing the same actors, fixed.
- **Skip the structure for trivial PRs** — typo fix, dep bump, lint-only change, single-line copy edit. For anything else (bugs, features, refactors, infra), the three sections are mandatory.
- **Always target the default branch.** `gh pr create --base main` (or `--base dev` if your project uses `dev`). Detect via `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`.

### Test Plan section

The PR's `## Test Plan` section follows this hard shape:

- **Clean run** (no failures): one bullet — `- Tested by browser agent.` Nothing else. No counts, no QA-file links, no surface lists.
- **Open-failure run** (≥1 known broken edge): one `- Tested by browser agent.` bullet PLUS one `- Open: <problem>` bullet per known issue.

Don't include test counts, sub-headings, screenshot links inside the Test Plan section — that bloat belongs in the vault QA file (`<vault>/Tickets/QA/`), not the PR description.

### Replying to PR review comments

- Respond AFTER the fix is committed + pushed, not before. The reply should reference the fixing commit SHA.
- For human reviewers: draft the reply in chat for the user to post manually.
- For automated reviewers (GitHub Actions, code-review bots): reply directly via `gh api` or the GitHub UI.

## "Shipped" status — what it means

A ticket is **Shipped** when:

- The PR is merged into the default branch, AND
- The change is deployed (or auto-deploys via CI)

A ticket is NOT shipped when:

- The PR is open / draft
- The PR is "approved but not merged"
- Code is on a feature branch but not merged

Use this exact bar in `<active-work>` "Recently Shipped" and in daily-note `## Shipped today`. Don't optimistically file in-flight work as shipped.

## Linking between vault and GitHub

When the GitHub Issue is created via Dev Control's SDD flow, the vault folder `Tickets/<repo>-<num>/` is the source of technical truth. The issue body should NOT link to `Tickets/...` paths (those are local to your machine). Cross-link the OTHER direction:

- Vault `Tickets/<repo>-<num>/notes.md` includes the GitHub Issue URL in its frontmatter (`github: https://github.com/...`)
- Vault context files reference issue number when needed (`see #42 for the user report`)
- The GitHub Issue body stays free of vault references — it's read by people who don't have your vault

## Quick reference

| Action | Command |
|---|---|
| Create issue | `gh issue create --title "..." --body "..." --assignee @me --label <label>` |
| List your open issues | `gh issue list --assignee @me --state open` |
| View an issue | `gh issue view <num>` |
| Close an issue | `gh issue close <num>` |
| Add label | `gh issue edit <num> --add-label <label>` |
| Detect default branch | `gh repo view --json defaultBranchRef -q .defaultBranchRef.name` |
| Create PR | `gh pr create --base $(gh repo view --json defaultBranchRef -q .defaultBranchRef.name) --assignee @me` |
| List your PRs | `gh pr list --author @me` |
| View PR checks | `gh pr checks <num>` |
| Merge PR | `gh pr merge <num> --squash` (or `--merge` / `--rebase`) |
