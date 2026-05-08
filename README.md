# obsidian-starter-vault

An Obsidian starter vault for AI-assisted coding. Gives coding agents (like Claude Code) stable structured context across sessions — daily logs, GitHub-issue ticket folders, Architecture Decision Records, runbooks, and a worktree-friendly project layout.

## What this is

A starter Obsidian vault wired up for AI coding agents. Drop it next to any new project and you get structured ticket folders, daily logs, an Active Work dashboard, and skills the agent uses to spin up worktrees, run QA, and follow Spec-Driven Development out of the box.

## Why it exists

- **Context loss between AI coding sessions** — coding agents start fresh every session. Without a structured place for active work, daily logs, decisions, and tickets, agents lose context and you end up repeating yourself. This vault gives them a stable home that survives across chats.
- **Repeatable scaffold for every project** — every new project + every new chat session needs the same scaffolding (worktrees, daily notes, ticket folders, agent skills). Cloning a template beats setting it up from scratch each time.
- **Spec-Driven Development built in** — most starter templates skip the planning layer. This one ships the full SDD interview → context-files → GitHub-issue → worktree flow out of the box, so the agent has a real spec to work from instead of vibes.

## Recommended project layout

Your workspace holds the vault, your app repo, and your worktrees as siblings:

```
~/Projects/<project>/
└── <project>-workspace/        ← workspace folder
    ├── vault/                  ← Obsidian opens this; Claude Code Dev Control sessions cd here
    ├── <project>/              ← your app repo, sibling of vault/
    └── <project>-<branch>/     ← worktrees, siblings of vault/
```

Concrete example:

```
~/Projects/my-saas/
└── my-saas-workspace/
    ├── vault/
    ├── my-saas/
    ├── my-saas-feat-auth/
    └── my-saas-fix-login/
```

## Quick start

The easiest way to set up your workspace is with the interactive setup script. It handles both **new projects** and **existing projects**.

**Quick start** (no install needed):

```bash
curl -sL -o setup-workspace.sh https://raw.githubusercontent.com/dodycode/obsidian-starter-vault/main/scripts/setup-workspace.sh
bash setup-workspace.sh
```

**Non-interactive** (for automation / CI/CD):

```bash
curl -sL -o setup-workspace.sh https://raw.githubusercontent.com/dodycode/obsidian-starter-vault/main/scripts/setup-workspace.sh
PROJECT_PATH=/path/to/project WORKSPACE=/path/to/workspace PROJECT_NAME=my-project USER_NAME=YourName bash setup-workspace.sh
```

The script will guide you through:
1. Whether you have an existing project folder or are starting fresh
2. Workspace location
3. Project name (used for worktree naming)
4. Your short name
5. Preview and confirmation

### What it does

**Existing project** (you already have one):
```
Before: ~/Projects/my-app/
        └── my-app/          ← your existing project

After:  ~/Projects/my-app-workspace/
        ├── vault/           ← exported from GitHub
        └── my-app/          ← moved from original location
```

**New project** (starting from scratch):
```
~/Projects/my-app-workspace/
├── vault/                   ← exported from GitHub
└── my-app/                  ← clone your app repo here later
```

### Where to start Claude sessions

| Session type | cwd | Auto-loads |
|---|---|---|
| Dev Control / vault work | `<workspace>/vault/` | `vault/CLAUDE.md` + `vault/.claude/skills/` + `vault/.claude/rules/` |
| Coding session | `<workspace>/<app-repo>` or `<workspace>/<app-repo>-<branch>` | App repo's own `CLAUDE.md` (if any), plus the `/qa-fix` skill copied into each worktree |
| Workspace root | `<workspace>/` | Only your global `~/.claude/CLAUDE.md` — not for actual work |

### Path bindings (filled by bootstrap)

`bootstrap.sh` writes `vault/CLAUDE.local.md` (gitignored) with these absolute paths:

| Placeholder | Resolves to |
|---|---|
| `<your-name>` | Your short name (you pick at bootstrap, default `dody`) |
| `<vault>` | `<workspace>/vault` |
| `<workspace>` | The workspace folder (parent of `vault/`) |
| `<project-repo>` | `<workspace>/<project-name>` |
| `<project-name>` | Your app repo folder name (used in worktree pattern `<project-name>-<branch>`) |
| `<worktree-parent>` | `<workspace>` (worktrees land as siblings of `vault/`) |
| `<active-work>` | `<vault>/People/<your-name>/Active Work.md` |
| `<daily-today>` | `<vault>/People/<your-name>/Daily/$(date +%Y-%m-%d).md` |
| `<project-claude>` | `<project-repo>/CLAUDE.md` |

These are referenced by the auto-loading rules under `vault/.claude/rules/dev-control-*.md`. Re-run `./scripts/bootstrap.sh` if any path changes.

## Vault structure

```
<workspace>/                     (= workspace folder)
└── vault/                        (Obsidian opens this; Dev Control sessions cd here)
    ├── .obsidian/                (Obsidian app config + per-machine workspace state)
    ├── .claude/
    │   ├── skills/               ← user-invocable Claude Code skills
    │   ├── rules/                ← auto-loading rules for agent behavior
    │   └── hooks/                ← commit-quality hooks (opt-in via bootstrap)
    ├── scripts/
    │   ├── bootstrap.sh          ← one-time setup; prompts + writes CLAUDE.local.md
    │   └── lint-vault.sh         ← vault rot detector
    ├── meta/
    │   └── plugin-defaults/      ← Obsidian plugin seed configs
    ├── CLAUDE.md                 ← agent routing: where to write, how to search
    ├── Archive/                  ← superseded content (archived tickets, etc.)
    ├── Engineering/
    │   ├── ADRs/                 ← architecture decision records
    │   ├── Architecture/         ← system docs + diagrams
    │   └── Runbooks/             ← operational runbooks
    ├── Features/                 ← per-feature notes (one folder per domain)
    ├── People/
    │   └── __YOUR_NAME__/        ← bootstrap renames this to your name
    │       ├── Active Work.md    ← live dashboard
    │       ├── Daily/            ← per-day work logs
    │       └── README.md         ← your profile
    ├── Templates/                ← starter scaffolds (daily, adr, runbook, feature-moc, spec-driven/)
    └── Tickets/                  ← per-issue notes + post-merge SDD archive (mirrors GitHub Issues)
```

## What you get out of the box

**Skills** (invoke with `/<name>` in Claude Code):

- `/qa` — generate QA checklist from a GitHub issue
- `/qa-feedback` — browser-driven QA testing with inline triage
- `/qa-fix` — apply fixes from a QA audit doc inside a worktree
- `/new-worktree` — create a worktree + branch from a GitHub issue (`<repo>#<num>`)
- `/sync-worktree` — sync skills/rules/env between the app repo and a worktree
- `/sync-worktrees` — pull latest default branch + restack all child worktrees
- `/refresh` — sync the Active Work dashboard from daily notes + GitHub issues + worktree state

**Spec-Driven Development flow** (split between vault orchestrator + worktree coding agent):

Vault-side orchestrator (Dev Control — light intake only):
1. Source detect (chat / screenshot / GitHub issue / GitLab issue)
2. Create GitHub Issue **stub** (title + 1-line context) — not a full body yet
3. `/new-worktree` provisions the worktree with empty `context/proposal.md` + `context/design.md` + `context/tasks.md` stubs and a dual-mode `CLAUDE.local.md`
4. Hand off — orchestrator does NOT write the spec

Worktree-side coding agent (in a fresh Claude session):
- **Session 1 (spec phase)**: read source material, grep relevant code, interview the user to 95% confidence, write `proposal.md` + `design.md` + `tasks.md` (and optionally `sub-tasks/`), generate `progress-tracker.md`, end. You review the files in VS Code with the codebase tree open.
- **Sessions 2..N (implementation)**: one task per fresh session, in numerical order. After the final task, the agent auto-pushes the branch + opens a PR.

Phase 5b — back on the vault side, after the coding agent has populated `proposal.md`, Dev Control can enrich the GitHub Issue body via `gh issue edit` (triggered by "enrich `<repo>#NN`" or by `/refresh` detecting the gap).

This shape mirrors industry default (Kiro / GitHub Spec-Kit / BMAD) — keep the spec IN the workspace next to the code, not in a separate doc the user reviews without context.

## Prerequisites

- [Claude Code](https://claude.com/claude-code) — the CLI / IDE extension that loads `.claude/skills/` and `.claude/rules/`
- [Obsidian](https://obsidian.md) (v1.7+) — for the vault UI (optional; the template works without it, since agents read raw `.md` files)
- `gh` (GitHub CLI) — used by the worktree + refresh skills
- `git` (any modern version) and bash 4+

## License

MIT. See [LICENSE](./LICENSE).
