# Changelog

All notable changes to this template are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning follows [SemVer](https://semver.org/spec/v2.0.0.html).

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
