# Plugin Defaults

> Default `data.json` seeds for community plugins. These are **copied in** on first vault clone, then users override freely. The actual live `data.json` files at `.obsidian/plugins/*/data.json` are gitignored.

## Why

Each plugin stores its settings in `.obsidian/plugins/<id>/data.json`. We gitignore those because:

- They often contain **per-user secrets** (Local REST API key, tokens)
- They often contain **caches** that would cause merge churn
- Users should be free to tweak without fighting `git pull`

To still give the team sensible defaults, we keep seed copies here. The bootstrap script copies them into the live plugin folders on first clone.

## Files here

- `<plugin-id>.data.json` — starter config to copy into `.obsidian/plugins/<plugin-id>/data.json`

## Bootstrap

From the vault root:

```bash
./scripts/bootstrap.sh
```

Or manually: `cp meta/plugin-defaults/<id>.data.json .obsidian/plugins/<id>/data.json` for each.

## Updating defaults

If you want a new default to apply to the whole team:
1. Change your own `.obsidian/plugins/<id>/data.json`
2. Copy it to `meta/plugin-defaults/<id>.data.json`
3. Commit the `meta/plugin-defaults/` change
4. Tell the team to re-run the bootstrap script if they want the new defaults (won't overwrite unless they choose)
