# obsidian-starter-vault

An Obsidian starter vault for AI-assisted coding. Gives coding agents (like Claude Code) stable structured context across sessions — daily logs, GitHub-issue ticket folders, Architecture Decision Records, runbooks, and a worktree-friendly project layout.

## What this is

A starter Obsidian vault wired up for AI coding agents. Drop it next to any new project and you get structured ticket folders, daily logs, an Active Work dashboard, and skills the agent uses to spin up worktrees, run QA, and follow Spec-Driven Development out of the box.

## Why it exists

- **Context loss between AI coding sessions** — coding agents start fresh every session. Without a structured place for active work, daily logs, decisions, and tickets, agents lose context and you end up repeating yourself. This vault gives them a stable home that survives across chats.
- **Repeatable scaffold for every project** — every new project + every new chat session needs the same scaffolding (worktrees, daily notes, ticket folders, agent skills). Cloning a template beats setting it up from scratch each time.
- **Spec-Driven Development built in** — most starter templates skip the planning layer. This one ships the full SDD interview → context-files → GitHub-issue → worktree flow out of the box, so the agent has a real spec to work from instead of vibes.

## Recommended project layout

The cloned repo wraps your vault, your app repo, and your worktrees as siblings:

```
~/Projects/<project>/
└── <project>-workspace/        ← cloned template (rename freely)
    ├── README.md, LICENSE, CHANGELOG.md
    ├── vault/                  ← Obsidian opens this; Claude Code Dev Control sessions cd here
    ├── <project>/              ← your app repo, sibling of vault/
    └── <project>-<branch>/     ← worktrees, siblings of vault/
```

Concrete example:

```
~/Projects/my-saas/
└── my-saas-workspace/
    ├── README.md, LICENSE, CHANGELOG.md
    ├── vault/
    ├── my-saas/
    ├── my-saas-feat-auth/
    └── my-saas-fix-login/
```

## Quick start

```bash
# 1. Clone the template into a project-named workspace folder
mkdir -p ~/Projects/my-saas
git clone https://github.com/dodycode/obsidian-starter-vault.git \
  ~/Projects/my-saas/my-saas-workspace

# (Or use the template feature:)
# gh repo create <your-account>/my-saas-workspace \
#   --template dodycode/obsidian-starter-vault --private
# git clone https://github.com/<your-account>/my-saas-workspace.git \
#   ~/Projects/my-saas/my-saas-workspace

cd ~/Projects/my-saas/my-saas-workspace/vault

# 2. Run bootstrap from inside vault/
#    Prompts for: your short name + project name
#    Writes vault/CLAUDE.local.md directly (your real paths, gitignored)
#    Optionally wires the commit-quality hooks
./scripts/bootstrap.sh

# 3. Clone your app repo as a sibling of vault/
cd ..
git clone <app-repo-url> my-saas
```

That's it. New worktrees land at `~/Projects/my-saas/my-saas-workspace/my-saas-<branch>/` (siblings of `vault/`) when you use the `/new-worktree` skill from a Dev Control session.

### Where to start Claude sessions

| Session type | cwd | Auto-loads |
|---|---|---|
| Dev Control / vault work | `<workspace>/vault/` | `vault/CLAUDE.md` + `vault/.claude/skills/` + `vault/.claude/rules/` |
| Coding session | `<workspace>/<app-repo>` or `<workspace>/<app-repo>-<branch>` | App repo's own `CLAUDE.md` (if any), plus the `/qa-fix` skill copied into each worktree |
| Workspace root | `<workspace>/` | Only your global `~/.claude/CLAUDE.md` — used for git ops on the template repo, not for actual work |

### Path bindings (filled by bootstrap)

`bootstrap.sh` writes `vault/CLAUDE.local.md` (gitignored) with these absolute paths:

| Placeholder | Resolves to |
|---|---|
| `<your-name>` | Your short name (you pick at bootstrap, default `dody`) |
| `<vault>` | `<workspace>/vault` |
| `<workspace>` | The cloned repo root (parent of `vault/`) |
| `<project-repo>` | `<workspace>/<project-name>` |
| `<project-name>` | Your app repo folder name (used in worktree pattern `<project-name>-<branch>`) |
| `<worktree-parent>` | `<workspace>` (worktrees land as siblings of `vault/`) |
| `<active-work>` | `<vault>/People/<your-name>/Active Work.md` |
| `<daily-today>` | `<vault>/People/<your-name>/Daily/$(date +%Y-%m-%d).md` |
| `<project-claude>` | `<project-repo>/CLAUDE.md` |

These are referenced by the auto-loading rules under `vault/.claude/rules/dev-control-*.md`. Re-run `./scripts/bootstrap.sh` if any path changes.

## Vault structure

```
<workspace>/                     (= cloned template repo)
├── README.md                     (you are reading this)
├── LICENSE
├── CHANGELOG.md
├── .gitignore
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
    ├── Templates/                ← starter scaffolds (daily, adr, runbook, feature-moc)
    └── Tickets/                  ← per-issue notes (mirrors GitHub Issues)
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

**Spec-Driven Development flow** (6 phases):

1. Source detect (chat / screenshot / GitHub issue)
2. Interview to 95% confidence
3. Propose context files
4. Generate context files into `Tickets/<repo>-<num>/context/`
5. Materialize GitHub issue (`gh issue create`)
6. Provision worktree (via `/new-worktree`)

Run by Dev Control before any new piece of work — turns vague ideas into structured tickets + context-rich worktrees the implementing agent can read cold.

## Pulling template updates

The template is local-only on your machine — your `vault/` is your own. To pull future template improvements:

```bash
cd ~/Projects/my-saas/my-saas-workspace
git remote add upstream https://github.com/dodycode/obsidian-starter-vault.git  # one-time
git fetch upstream
git merge upstream/main
```

Your `vault/CLAUDE.local.md` (personal paths) is gitignored, so upstream merges never touch it. Check `CHANGELOG.md` to see what changed before merging.

## Prerequisites

- [Claude Code](https://claude.com/claude-code) — the CLI / IDE extension that loads `.claude/skills/` and `.claude/rules/`
- [Obsidian](https://obsidian.md) (v1.7+) — for the vault UI (optional; the template works without it, since agents read raw `.md` files)
- `gh` (GitHub CLI) — used by the worktree + refresh skills
- `git` (any modern version) and bash 4+

## License

MIT. See [LICENSE](./LICENSE).
