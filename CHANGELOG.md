# Changelog

All notable changes to this template are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning follows [SemVer](https://semver.org/spec/v2.0.0.html).

## [2.0.0] — 2026-05-08

### Breaking

- **SDD flow rewritten from JSM 7-file Six-File Context Methodology to a 3-file shape** (`proposal.md` + `design.md` + `tasks.md`, plus optional `sub-tasks/` folder + auto-generated `progress-tracker.md`). Mirrors the redesign Sophiie's vault shipped on 2026-05-04 — keeps specs IN the workspace next to the code (matches Kiro / GitHub Spec-Kit / BMAD industry default).
- **Spec phase moved from vault orchestrator → worktree coding agent.** Dev Control now does light intake only: source detection, GitHub Issue stub, worktree provisioning with empty spec stubs, hand off. The interview + writing of `proposal.md` / `design.md` / `tasks.md` happens inside the worktree's first Claude session, where the user can review files in VS Code with the codebase tree open.
- **GitHub Issue is now stub-then-enrich.** Dev Control creates the issue at intake (Phase 2) with title + 1-line context only. After the coding agent's spec phase produces `proposal.md`, Phase 5b enriches the issue body via `gh issue edit`. Earlier flows wrote a full body up front from the interview output.
- **`Templates/Six-File-Context-Methodology/` removed entirely.** The 1000-line JSM playbook + 6 blank-context scaffolds are no longer shipped. The new shape doesn't need them.
- **`draft-<slug>/` pattern dropped.** Issue is always created at the Phase 2 stub, so there's no "scope without committing to an issue" anymore. `/refresh` no longer scans for `Tickets/draft-*/`.

### Added

- **`Templates/spec-driven/`** — 4 new scaffolds matching the Sophiie shape, indie-phrased (no monorepo / no Linear): `proposal.md`, `design.md`, `tasks.md`, `sub-task.md`. The `/new-worktree` skill copies these (empty) into each worktree's `context/`.
- **Phase 5b GitHub Issue enrichment** — vault-side orchestrator step that reads `<worktree>/context/proposal.md` after the coding agent's spec phase and runs `gh issue edit` to fill in the issue body. Triggered by user saying "enrich `<repo>#NN`" or by `/refresh` detecting the gap.
- **Template A (dual-mode worktree CLAUDE.local.md)** in `dev-control-workflows.md` — written by `/new-worktree`. The agent reads `context/proposal.md`: empty → Session 1 spec phase, populated → implementation phase. Same file, two modes.

### Changed

- `vault/.claude/rules/dev-control-spec-driven.md` — full rewrite. Now ~150 lines (was ~566). Covers Phase 1 source detection, Phase 2 GitHub Issue stub, Phase 3 worktree handoff, Phase 5b enrichment. Drops Phase 3 (file-menu proposal) + Phase 4 (file generation) + Phase 5 (full-body issue creation) + Draft mode + Worktree-side coding-agent contract — those either move to the worktree side (`~/.claude/rules/spec-driven-development.md`) or get deleted entirely.
- `vault/.claude/rules/dev-control-workflows.md` — full rewrite. Drops Template B (legacy short-circuit per-task block). Single Template A is dual-mode. Active Work cleanup procedure no longer scans for drafts. Cleanup-after-merge procedure preserves the new 3-file shape.
- `vault/CLAUDE.md` — full rewrite mirroring Sophiie's vault router. Folder map, where-to-WRITE table, search recipes, ownership rules, Claude session rules. Active SDD spec files listed as living in `<worktree>/context/` during build (was: vault `Tickets/<repo>-<num>/context/`).
- `vault/Templates/CLAUDE.md` — drops Six-File reference, points at `spec-driven/`.
- `vault/Tickets/CLAUDE.md` — drops Drafts subsection. SDD context-files list shows the new 3-file shape and notes that active files live in the worktree, not the vault.
- `vault/.claude/skills/new-worktree/SKILL.md` — Step 6.5 rewritten: scaffold empty 3-file `context/` from `Templates/spec-driven/` + write Template-A dual-mode `CLAUDE.local.md`. Drops Template B branch entirely.
- `vault/.claude/skills/refresh/SKILL.md` — drops Drafts scanning. Cleanup procedure preserves the new 3-file shape (was: `architecture.md` / `ai-workflow-rules.md`).
- `vault/scripts/bootstrap.sh` — `CLAUDE.local.md` heredoc updated. Section 1 is now "Idea → GitHub Issue STUB → Worktree (Light Intake)". New section 1b for Phase 5b enrichment. Guardrails add "NEVER write proposal/design/tasks files yourself".
- `README.md` (root) — SDD section rewritten to describe the split (vault orchestrator light intake + worktree coding agent does the spec). Vault structure tree mentions `spec-driven/` and post-merge SDD archive in `Tickets/`.

### Why

The JSM 7-file shape was thorough but inverted the review surface: the vault orchestrator wrote `project-overview.md` / `architecture.md` / `code-standards.md` / `ai-workflow-rules.md` / etc. before the worktree existed, so the user had to review prose without the codebase tree. The new shape keeps the same depth (`design.md` carries Hard rules / Storage / Auth / Background tasks, equivalent to architecture.md + invariants from ai-workflow-rules) but moves authorship into the worktree, where review happens with the code visible. Also: 3 files beat 7 files for cognitive load, and the orchestrator stays lightweight.

## [1.3.0] — 2026-05-04

### Changed

- **Setup script now downloads only the `vault/` folder** — replaced `git clone` with `curl` + `unzip` via GitHub zipball. No more cloning the entire repo with `.git/`, `README.md`, `LICENSE`, etc.
- **Vault path simplified** — vault now lands at `<workspace>/vault/` instead of `<workspace>/<project>-vault/vault/`. One less nesting level.
- **Removed "Pulling template updates" section from README** — since the workspace no longer contains a cloned git repo, there's nothing to pull updates into.
- **Removed "Or clone first" quick-start option** — the curl one-liner is the only supported path now.
- **Updated all README diagrams** — trees and examples now show `vault/` directly inside the workspace, without the `<project>-vault/` wrapper.

### Fixed

- Tests updated to match new vault download path (`curl` instead of `git clone` / `svn export`).

## [1.2.0] — 2026-05-04

### Added

- Auto-detect project folder (`findProjectFolder()`) — walks up directory tree from cwd looking for `.git/`, `package.json`, `Cargo.toml`, `go.mod`, `pom.xml`, `pyproject.toml`, `composer.json`, or `Gemfile`
- Interactive prompt on detection: `Detected project folder: <path>\nUse this folder? [Y/n]`
- One confirmation triggers full workspace creation: create workspace → move project → clone vault → bootstrap
- System directory guard (`isSystemDir`) — prevents false positives on `~`, `/tmp`, `/`
- Vault clones as `<project>-vault/` instead of generic `vault/` (multiple projects can share a parent without collision)
- Existing vault overwrite — deletes and reclones if `<project>-vault/` already exists
- Existing workspace reuse — does not fail if `<project>-workspace/` already exists

### Changed

- `scripts/setup-workspace.ts` — added `isProjectFolder()`, `findProjectFolder()`, updated `executeSetup()` vault naming, updated interactive flow with auto-detect
- `__tests__/setup-workspace.test.ts` — added 12 tests for project detection logic, updated existing tests for new vault naming

## [1.1.0] — 2026-05-04

### Added

- Interactive setup script (`scripts/setup-workspace.ts`) with `@clack/prompts`
- Bundled distribution (`dist/setup-workspace.js`) via esbuild — self-contained, no dependencies
- Bash wrapper (`scripts/setup-workspace.sh`) for `curl | bash` one-liner
- Support for both existing projects (moves into workspace) and new projects
- Non-interactive mode via environment variables (`PROJECT_PATH`, `WORKSPACE`, `PROJECT_NAME`, `USER_NAME`)
- 53 unit tests with vitest in `__tests__/setup-workspace.test.ts`
- `package.json` with `pnpm run build` (esbuild), `pnpm test` (vitest), `pnpm run setup` (tsx)

### Changed

- `vault/scripts/bootstrap.sh` — accepts `BOILERPLATE_USER`, `PROJECT_NAME`, and `INSTALL_HOOKS` env vars for headless operation
- `README.md` quickstart — replaced manual clone steps with `curl | bash` one-liner
- Removed manual setup section from README (setup script handles everything)

## [1.0.0] — 2026-05-03

Initial public release.

### Added

- `vault/` subfolder layout — Obsidian opens `vault/`; app repo + worktrees live as siblings inside the cloned workspace
- Vault router (`vault/CLAUDE.md`) with folder map, write/search recipes, ownership rules, Claude session rules
- Spec-Driven Development flow (6 phases) wired to GitHub Issues
- Skills under `vault/.claude/skills/`:
  - `/refresh` — sync Active Work from daily notes + GitHub issues + worktree state
  - `/qa` — generate QA checklist from a GitHub issue
  - `/qa-feedback` — browser-driven QA testing with inline triage
  - `/qa-fix` — apply fixes from a QA audit doc inside a worktree
  - `/new-worktree` — create worktree + branch from `<repo>#<num>`
  - `/sync-worktree` — sync skills/rules/env between app repo and a worktree
  - `/sync-worktrees` — pull default branch + restack all child worktrees
- Rules under `vault/.claude/rules/`:
  - `dev-control-workflows` — worktree creation, GitHub Issue lifecycle, Active Work
  - `dev-control-spec-driven` — full SDD interview + context-files + ticket flow
  - `dev-control-daily-notes` — daily-note structure + ownership
  - `dev-control-handoff` — orchestrator hands off to coding-agent sessions
  - `issue-tracking` — issue body quality bar, no code/file paths in descriptions
  - `gh-hygiene` — GitHub + git conventions (issues, branches, commits, PRs, hooks)
- Hooks under `vault/.claude/hooks/`:
  - `guard-conventional-commits.sh` — blocks non-Conventional-Commits messages
  - `guard-pr-description.sh` — strips AI attribution from `gh pr create / edit` bodies
  - `strip-coauthored-by.sh` — drops `Co-Authored-By:` trailers from commits
- `vault/scripts/bootstrap.sh`:
  - Prompts for short name (default `dody`) + project name
  - Renames `People/__YOUR_NAME__/` → `People/<your-name>/`
  - Substitutes `<your-name>` across vault files
  - Writes `vault/CLAUDE.local.md` directly with your real paths (gitignored)
  - Optionally wires hooks into `vault/.claude/settings.local.json`
  - Seeds Obsidian plugin defaults from `vault/meta/plugin-defaults/`
- `vault/scripts/lint-vault.sh` — vault rot detector (orphan ownership, stale paths)
- Templates under `vault/Templates/`: `daily.md`, `adr.md`, `runbook.md`, `feature-moc.md`
- Folder placeholders: `vault/People/__YOUR_NAME__/`, `vault/Tickets/`, `vault/Engineering/{ADRs,Architecture,Runbooks}/`, `vault/Features/`
- Plugin defaults: Calendar, Excalidraw, Local REST API, Templater seed configs

[1.0.0]: https://github.com/dodycode/obsidian-starter-vault/releases/tag/v1.0.0
