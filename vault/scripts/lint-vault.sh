#!/usr/bin/env bash
# lint-vault.sh — scan the vault for rot signals.
#
# Catches the common KB-rot patterns before they ship:
# - Placeholder URLs that never got filled in
# - MOCs that don't list every real file in their folder
# - Tickets with no cross-link from any Features MOC
# - Empty ADR directory
# - Secrets accidentally committable
# - Files missing owner: frontmatter
# - Unsubstituted <your-name> placeholders left in place after bootstrap
#
# Usage:
#   ./scripts/lint-vault.sh          # run all checks
#   ./scripts/lint-vault.sh --quick  # skip the heavy MOC/ticket cross-link scan
#
# Exits non-zero if any issue is found, so you can run it in a pre-commit hook
# or a cron job.

set -uo pipefail

VAULT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$VAULT_ROOT"

FAIL=0
QUICK=0
[[ "${1:-}" == "--quick" ]] && QUICK=1

red()    { printf '\033[31m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
green()  { printf '\033[32m%s\033[0m\n' "$*"; }
bold()   { printf '\033[1m%s\033[0m\n' "$*"; }

fail()   { red "  ✗ $*"; FAIL=1; }
warn()   { yellow "  ! $*"; }
pass()   { green "  ✓ $*"; }

section() { echo; bold "== $* =="; }

# --- 1. Unsubstituted <your-name> placeholders -----------------------------
section "1. Unsubstituted placeholders"

# After bootstrap.sh runs, <your-name> should be replaced everywhere.
# If it's still around, bootstrap.sh probably wasn't run yet.
placeholder_hits=$(grep -RlF --exclude-dir=.git --exclude-dir=.obsidian \
  --exclude-dir=Archive \
  --exclude="lint-vault.sh" --exclude="bootstrap.sh" \
  "<your-name>" . 2>/dev/null | head -20 || true)

if [[ -n "$placeholder_hits" ]]; then
  warn "<your-name> placeholder still present — did you run scripts/bootstrap.sh?"
  echo "$placeholder_hits" | sed 's/^/      /'
else
  pass "no <your-name> placeholders left in live content"
fi

# Also surface the placeholder People folder if bootstrap hasn't renamed it
if [[ -d "People/__YOUR_NAME__" ]]; then
  warn "People/__YOUR_NAME__/ still present — bootstrap.sh hasn't renamed it"
fi

# --- 2. Placeholder URLs / TODOs in MOCs -----------------------------------
section "2. Placeholder URLs in MOCs"

if [[ -d "Features" ]]; then
  placeholders=$(grep -RlE --include="MOC.md" \
    "\(update URL\)|\(add URL when available\)|TODO: add URL|TBD" \
    Features/ 2>/dev/null || true)

  if [[ -n "$placeholders" ]]; then
    fail "MOCs with placeholder URLs:"
    echo "$placeholders" | sed 's/^/      /'
  else
    pass "no MOC placeholder URLs"
  fi
else
  pass "no Features/ folder yet — skipping"
fi

# --- 3. Empty ADR directory -------------------------------------------------
section "3. ADRs present"

adr_count=$(find Engineering/ADRs -maxdepth 1 -name 'ADR-*.md' 2>/dev/null | wc -l | tr -d ' ')
if [[ "$adr_count" -eq 0 ]]; then
  warn "no ADRs written yet — Engineering/ADRs/ is empty"
else
  pass "$adr_count ADR(s) present"
fi

# --- 4. Secrets check -------------------------------------------------------
section "4. Secret scan (committable files only)"

secret_hits=$(git ls-files 2>/dev/null \
  | grep -v '^scripts/lint-vault.sh$' \
  | xargs grep -l \
  -E "BEGIN RSA|BEGIN PRIVATE|apiKey.{0,5}[\"'][0-9a-f]{40,}" 2>/dev/null || true)
if [[ -n "$secret_hits" ]]; then
  fail "possible secrets in tracked files:"
  echo "$secret_hits" | sed 's/^/      /'
else
  pass "no obvious secrets in tracked content"
fi

# --- 5. MOC ↔ folder consistency (skippable with --quick) ------------------
if [[ "$QUICK" -eq 0 ]] && [[ -d "Features" ]]; then
  section "5. MOC ↔ folder consistency"

  for moc in Features/*/MOC.md; do
    [[ -f "$moc" ]] || continue
    dir=$(dirname "$moc")
    # Real notes in the folder (excluding MOC + CLAUDE)
    real_notes=$(find "$dir" -maxdepth 1 -name '*.md' \
      ! -name 'MOC.md' ! -name 'CLAUDE.md' -exec basename {} \; | sort)
    missing=0
    while IFS= read -r note; do
      [[ -z "$note" ]] && continue
      stem="${note%.md}"
      if ! grep -qF "$stem" "$moc"; then
        warn "$moc does not reference '$stem'"
        missing=1
      fi
    done <<< "$real_notes"
    [[ "$missing" -eq 0 ]] && pass "$moc covers its folder"
  done
fi

# --- 6. Orphan tickets (no MOC backlink) -----------------------------------
if [[ "$QUICK" -eq 0 ]] && [[ -d "Tickets" ]] && [[ -d "Features" ]]; then
  section "6. Ticket ↔ MOC backlinks"

  # Tickets can be either flat <slug>.md or folder <slug>/notes.md
  for ticket in Tickets/*-*.md Tickets/*-*/notes.md; do
    [[ -f "$ticket" ]] || continue
    # Derive the ticket slug
    if [[ "$ticket" == *"/notes.md" ]]; then
      stem=$(basename "$(dirname "$ticket")")
    else
      stem=$(basename "$ticket" .md)
    fi
    # Skip obvious non-ticket things
    [[ "$stem" == "QA" ]] && continue
    [[ "$stem" == "draft-"* ]] && continue
    if ! grep -qF "$stem" Features/*/MOC.md 2>/dev/null; then
      warn "$stem has no Features MOC backlink"
    fi
  done
  pass "ticket scan complete"
fi

# --- 7. Ownership frontmatter -----------------------------------------------
section "7. Ownership tags"

missing_owner=0
for dir in Features Engineering Tickets; do
  [[ -d "$dir" ]] || continue
  while IFS= read -r -d '' f; do
    # Skip CLAUDE.md routing files already covered by schema default
    if ! head -20 "$f" | grep -qE "^owner:"; then
      warn "$f has no owner: frontmatter"
      missing_owner=$((missing_owner+1))
    fi
  done < <(find "$dir" -name "*.md" -print0 2>/dev/null)
done
if [[ "$missing_owner" -eq 0 ]]; then
  pass "all content files have owner: frontmatter"
fi

# Count unowned MOCs as a soft signal
if [[ -d "Features" ]]; then
  unowned_mocs=$(grep -lE "^owner: unowned" Features/*/MOC.md 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$unowned_mocs" -gt 0 ]]; then
    warn "$unowned_mocs Feature MOCs still marked owner: unowned — candidates to claim"
  fi
fi

# --- summary ---------------------------------------------------------------
echo
if [[ "$FAIL" -eq 0 ]]; then
  green "lint-vault: PASS"
  exit 0
else
  red "lint-vault: FAIL"
  exit 1
fi
