---
type: runbook
service: {{service}}
severity: p0 | p1 | p2 | p3
owner: <your-name>
updated: {{date:YYYY-MM-DD}}
---
# Runbook — {{title}}

## Symptom
<!-- What the user / monitor / alert sees. Copy the exact alert text if there is one. -->

## Impact
<!-- Who is affected? What's broken? -->

## Triage
1. Check …
2. Check …

## Fix
```bash
# Concrete commands
```

## Verify
1. …

## Rollback
```bash
# If the fix made it worse
```

## Post-incident
- Update status page (if applicable)
- Write a postmortem in `Engineering/Runbooks/Postmortems/`
- File a GitHub Issue for root-cause work

## Related
- Code: `<project-repo>/<path>`
- Dashboards: …
- Recent incidents: …
