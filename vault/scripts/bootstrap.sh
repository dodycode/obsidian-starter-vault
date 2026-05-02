#!/usr/bin/env bash
# Bootstrap an Obsidian vault from the dodycode/obsidian-starter-vault template.
# - Renames People/__YOUR_NAME__/ to People/<your-input>/
# - Substitutes <your-name> placeholder across vault files
# - Writes vault/CLAUDE.local.md with your real paths (gitignored)
# - Seeds gitignored per-user config (daily-notes.json with your folder)
# - Seeds gitignored plugin data.json files from meta/plugin-defaults/
# - Optionally wires up the commit-quality hooks shipped at .claude/hooks/
# - Never overwrites anything you've already customized.

set -euo pipefail

VAULT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE_ROOT="$(cd "$VAULT_ROOT/.." && pwd)"
DEFAULTS_DIR="$VAULT_ROOT/meta/plugin-defaults"
OBSIDIAN_DIR="$VAULT_ROOT/.obsidian"
PLUGINS_DIR="$OBSIDIAN_DIR/plugins"
PLACEHOLDER_DIR="$VAULT_ROOT/People/__YOUR_NAME__"

echo "== Vault Bootstrap =="
echo
echo "Vault     : $VAULT_ROOT"
echo "Workspace : $WORKSPACE_ROOT"
echo

# -- 1. Ask who this machine belongs to ------------------------------------
DEFAULT_NAME="dody"
if [ -n "${BOILERPLATE_USER:-}" ]; then
  DEFAULT_NAME="$BOILERPLATE_USER"
fi

read -r -p "Your short name [default: $DEFAULT_NAME]: " NAME
NAME="${NAME:-$DEFAULT_NAME}"

if [ -z "$NAME" ]; then
  echo "No name entered — aborting."
  exit 1
fi

# Sanity: name must be safe for filesystem and sed
if ! [[ "$NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
  echo "Name must contain only letters, digits, hyphen, or underscore."
  exit 1
fi

USER_DIR="$VAULT_ROOT/People/$NAME"

# -- 2. Ask for the project name -------------------------------------------
# Default: workspace folder basename, minus a trailing "-workspace" / "-vault" suffix if present.
WORKSPACE_NAME="$(basename "$WORKSPACE_ROOT")"
DEFAULT_PROJECT="${WORKSPACE_NAME%-workspace}"
DEFAULT_PROJECT="${DEFAULT_PROJECT%-vault}"
# If the strip didn't change anything and the workspace looks like the template name itself,
# fall back to a generic placeholder so we don't suggest "obsidian-starter-vault".
if [ "$DEFAULT_PROJECT" = "obsidian-starter-vault" ] || [ "$DEFAULT_PROJECT" = "$WORKSPACE_NAME" ]; then
  DEFAULT_PROJECT="my-app"
fi

read -r -p "Project name (your app repo folder name) [default: $DEFAULT_PROJECT]: " PROJECT_NAME
PROJECT_NAME="${PROJECT_NAME:-$DEFAULT_PROJECT}"

if ! [[ "$PROJECT_NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
  echo "Project name must contain only letters, digits, hyphen, or underscore."
  exit 1
fi

PROJECT_REPO="$WORKSPACE_ROOT/$PROJECT_NAME"

# -- 3. Rename placeholder People folder -----------------------------------
if [ -d "$PLACEHOLDER_DIR" ] && [ ! -d "$USER_DIR" ]; then
  echo "Renaming People/__YOUR_NAME__/ → People/$NAME/"
  mv "$PLACEHOLDER_DIR" "$USER_DIR"
elif [ -d "$USER_DIR" ]; then
  echo "People/$NAME/ already exists — leaving it alone."
elif [ ! -d "$PLACEHOLDER_DIR" ]; then
  echo "No placeholder folder found at People/__YOUR_NAME__/ — creating People/$NAME/"
  mkdir -p "$USER_DIR/Daily"
fi

# -- 4. Substitute <your-name> placeholder across vault files --------------
echo "Substituting <your-name> → $NAME across vault files..."

# Files where the placeholder lives. Update this list if new files start using it.
SUBSTITUTE_TARGETS=(
  "$VAULT_ROOT/CLAUDE.md"
  "$VAULT_ROOT/People/CLAUDE.md"
  "$USER_DIR/Active Work.md"
  "$USER_DIR/README.md"
  "$VAULT_ROOT/.claude/rules/dev-control-workflows.md"
  "$VAULT_ROOT/.claude/rules/dev-control-spec-driven.md"
  "$VAULT_ROOT/.claude/rules/dev-control-daily-notes.md"
  "$VAULT_ROOT/.claude/rules/dev-control-handoff.md"
  "$VAULT_ROOT/.claude/rules/issue-tracking.md"
  "$VAULT_ROOT/.claude/rules/gh-hygiene.md"
  "$VAULT_ROOT/Templates/daily.md"
  "$VAULT_ROOT/Tickets/CLAUDE.md"
  "$VAULT_ROOT/Features/CLAUDE.md"
)

# Portable inline sed (works on both GNU sed and BSD sed)
sed_inline() {
  if sed --version >/dev/null 2>&1; then
    sed -i "$1" "$2"
  else
    sed -i "" "$1" "$2"
  fi
}

for target in "${SUBSTITUTE_TARGETS[@]}"; do
  [ -f "$target" ] || continue
  sed_inline "s|<your-name>|$NAME|g" "$target"
done
echo "  done"

# -- 5. Write CLAUDE.local.md (personal overlay, gitignored) ---------------
LOCAL_MD="$VAULT_ROOT/CLAUDE.local.md"
if [ -f "$LOCAL_MD" ]; then
  echo "Found existing $LOCAL_MD — leaving it alone."
else
  cat > "$LOCAL_MD" <<EOF
# Dev Control — $NAME's Personal Instance

> Personal-only file — gitignored. Never commit.
> Re-run scripts/bootstrap.sh if any path changes.

You are the **Dev Control agent** for **$NAME** — an orchestration and project management layer for the project's app repo. You do NOT write application code. You manage the full lifecycle from idea → GitHub Issue → branch → worktree → handoff to coding agents.

## Identity

- **Role**: Project orchestrator, branch manager, documentation writer, worktree provisioner
- **NOT**: A coding agent. Never write application code, run dev servers, or modify source files in the app repo or worktrees
- **Tone**: Direct, terse. Lead with action. End-of-turn = one-line summary of what changed + what's next.

## Path Bindings

These resolve the \`<placeholder>\` references inside \`.claude/rules/dev-control-*.md\`. Edit if your machine layout changes (or just re-run \`./scripts/bootstrap.sh\`).

| Placeholder | Absolute path |
|-------------|---------------|
| \`<vault>\` | $VAULT_ROOT |
| \`<workspace>\` | $WORKSPACE_ROOT |
| \`<project-repo>\` | $PROJECT_REPO |
| \`<project-name>\` | $PROJECT_NAME |
| \`<worktree-parent>\` | $WORKSPACE_ROOT |
| \`<your-name>\` | $NAME |
| \`<active-work>\` | <vault>/People/$NAME/Active Work.md |
| \`<daily-dir>\` | <vault>/People/$NAME/Daily |
| \`<daily-today>\` | <daily-dir>/\$(date +%Y-%m-%d).md |
| \`<project-claude>\` | <project-repo>/CLAUDE.md |

## Imports

@.claude/rules/dev-control-workflows.md
@.claude/rules/dev-control-spec-driven.md
@.claude/rules/dev-control-daily-notes.md
@.claude/rules/dev-control-handoff.md
@.claude/rules/issue-tracking.md
@.claude/rules/gh-hygiene.md

## What You Do

### 1. Idea → GitHub Issue → Worktree (Full Flow)
- Take a vague idea or request and shape it into a well-structured GitHub Issue
- Use \`gh issue create\` to materialize tickets. Issues MUST include: clear title, body with \`## Context\` / \`## Scope\` / \`## Acceptance Criteria\` / \`## Technical Notes\`
- Always assign to yourself (\`--assignee @me\`) unless told otherwise
- **IMPORTANT: After creating ANY GitHub Issue, IMMEDIATELY:**
  1. **Update the Active Work note** at \`<active-work>\` — add the issue to the appropriate section
  2. **Create a worktree** unless told to defer. Default: issue created = worktree created. Use \`/new-worktree <repo>#<num>\`.
  3. **Write \`CLAUDE.local.md\`** in the worktree with task context (per \`dev-control-workflows.md\`)

### 2. GitHub Issue → Branch → Worktree
- Branch convention: \`<num>-<short-description>\` (e.g. \`42-calendar-sync\`)
- Create worktrees FROM the app repo at \`<project-repo>\`, NOT from the vault
- Worktrees land at \`<worktree-parent>/<project-name>-<branch>\` — siblings of vault/
- Prefer \`/new-worktree <repo>#<num>\` — handles env copy + MCP sync + CLAUDE.local.md write

### 3. Documentation & Context
- Long-form ticket notes: \`<vault>/Tickets/<repo>-<num>/notes.md\`
- SDD context files: \`<vault>/Tickets/<repo>-<num>/context/{file}.md\`
- Feature docs: \`<vault>/Features/<Domain>/<Title>.md\`
- ADRs: \`<vault>/Engineering/ADRs/ADR-NNNN-<slug>.md\`

### 4. Vault Notes & Daily Logs
- Log all work in today's daily note at \`<daily-today>\` under \`## In progress\` / \`## Shipped today\` — see \`.claude/rules/dev-control-daily-notes.md\`

### 5. Active Work Dashboard
- **Dev Control is the SOLE owner of \`<active-work>\`.**
- Living dashboard — not a changelog. Shows what's in flight right now.
- Coding agents write to daily notes; Dev Control reads daily notes and updates Active Work.
- \`/refresh\` triggers a full sync.

### 6. Status & Visibility
- When asked "what's going on" or "status", check (in order): \`<active-work>\` (primary), \`git worktree list\` from \`<project-repo>\`, GitHub Issues via \`gh issue list --assignee @me\`, today's daily note at \`<daily-today>\`

## Guardrails

- NEVER modify source code in the app repo or any worktree — that's for coding agents
- NEVER push to the default branch directly
- NEVER delete worktrees without confirming
- NEVER run \`pnpm dev\`, \`npm run dev\`, or start any servers — you're an orchestrator, not a runner
- NEVER run database migration commands without explicit confirmation
- Always confirm before destructive git operations (force push, reset, branch delete)
- When creating GitHub Issues, default to assigning yourself unless told otherwise
- NEVER update \`<active-work>\` from anywhere other than Dev Control
- Stage diffs and hand to user for review — never auto-commit during a session
EOF
  echo "  wrote $LOCAL_MD with your paths"
fi

# -- 6. Daily-notes.json (gitignored per-user config) ----------------------
DAILY_NOTES_JSON="$OBSIDIAN_DIR/daily-notes.json"
if [ -f "$DAILY_NOTES_JSON" ]; then
  echo "Found existing $DAILY_NOTES_JSON — leaving it alone."
elif [ -f "$DEFAULTS_DIR/daily-notes.json" ]; then
  sed "s|__REPLACE_WITH_YOUR_USERNAME__|$NAME|g" \
    "$DEFAULTS_DIR/daily-notes.json" > "$DAILY_NOTES_JSON"
  echo "Wrote $DAILY_NOTES_JSON (folder: People/$NAME/Daily)"
else
  echo "No daily-notes.json template at $DEFAULTS_DIR — skipping."
fi

# Make sure the Daily folder exists
mkdir -p "$USER_DIR/Daily"

echo

# -- 7. Seed gitignored plugin data.json defaults --------------------------
if [ ! -d "$DEFAULTS_DIR" ]; then
  echo "No plugin defaults directory at $DEFAULTS_DIR — skipping plugin seed."
else
  echo "Seeding plugin defaults into $PLUGINS_DIR..."
  for src in "$DEFAULTS_DIR"/*.data.json; do
    [ -f "$src" ] || continue
    fname=$(basename "$src")
    plugin_id="${fname%.data.json}"
    dst_dir="$PLUGINS_DIR/$plugin_id"
    dst="$dst_dir/data.json"

    if [ ! -d "$dst_dir" ]; then
      echo "  skip $plugin_id (plugin not yet installed)"
      continue
    fi
    if [ -f "$dst" ]; then
      echo "  skip $plugin_id (already customized)"
      continue
    fi
    cp "$src" "$dst"
    echo "  seeded $plugin_id"
  done
fi

echo

# -- 8. Wire up commit-quality hooks (opt-in) ------------------------------
HOOKS_DIR="$VAULT_ROOT/.claude/hooks"
SETTINGS_LOCAL="$VAULT_ROOT/.claude/settings.local.json"

if [ -d "$HOOKS_DIR" ] && [ -f "$HOOKS_DIR/guard-conventional-commits.sh" ]; then
  echo "== Commit-quality hooks =="
  echo
  echo "The vault ships 3 hooks that enforce commit message + PR description hygiene:"
  echo "  - guard-conventional-commits.sh — Conventional Commits format"
  echo "  - guard-pr-description.sh       — strip AI attribution from PR bodies"
  echo "  - strip-coauthored-by.sh        — strip Co-Authored-By from commits (post-commit safety net)"
  echo
  read -r -p "Install them into .claude/settings.local.json? [Y/n]: " INSTALL_HOOKS
  INSTALL_HOOKS="${INSTALL_HOOKS:-Y}"

  if [[ "$INSTALL_HOOKS" =~ ^[Yy]$ ]]; then
    if [ -f "$SETTINGS_LOCAL" ]; then
      echo "  $SETTINGS_LOCAL already exists — leaving it alone. Edit manually if you want the hooks wired in."
    else
      cat > "$SETTINGS_LOCAL" <<'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guard-conventional-commits.sh" },
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guard-pr-description.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/strip-coauthored-by.sh" }
        ]
      }
    ]
  }
}
EOF
      echo "  wrote $SETTINGS_LOCAL — hooks wired in."
    fi
    chmod +x "$HOOKS_DIR"/*.sh 2>/dev/null
  else
    echo "  skipped — hooks remain in .claude/hooks/ for manual wiring later."
  fi
  echo
fi

echo "== Bootstrap complete =="
echo "Next steps:"
echo "  1. Clone your app repo as a sibling of vault/:"
echo "     cd $WORKSPACE_ROOT && git clone <app-repo-url> $PROJECT_NAME"
echo "  2. Open the vault in Obsidian: $VAULT_ROOT"
echo "  3. Settings → Community plugins → enable the plugins listed in .obsidian/community-plugins.json"
echo "  4. First time? Install 'Obsidian Git' from the Community plugins browser"
echo "  5. Start a Claude Code session inside the vault to use Dev Control: cd $VAULT_ROOT && claude"
