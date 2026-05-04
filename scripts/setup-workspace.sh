#!/usr/bin/env bash
# One-liner setup script for obsidian-starter-vault
# Usage: curl -sL https://raw.githubusercontent.com/dodycode/obsidian-starter-vault/main/scripts/setup-workspace.sh | bash

set -euo pipefail

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Downloading setup script..."
curl -sL -o "$TMP_DIR/setup-workspace.js" \
  "https://raw.githubusercontent.com/dodycode/obsidian-starter-vault/main/dist/setup-workspace.js"

echo "Running setup..."
node "$TMP_DIR/setup-workspace.js"
