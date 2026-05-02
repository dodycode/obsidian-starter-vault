---
owner: <your-name>
---
# Runbooks

> Operational procedures — what to do when X breaks, how to deploy Y, how to roll back Z. Terse, actionable, bash-ready.

## Filename convention

`<service-or-topic>.md`, lowercase-hyphen. Examples:
- `service-outage.md`
- `background-job-stuck.md`
- `database-migration-rollback.md`

## Writing a runbook

Copy `Templates/runbook.md`. Sections: symptom, impact, triage, fix (with commands), verify, rollback, post-incident.

## Index

<!-- Add entries as you create runbooks -->

## Related

- On-call rotation: (link when set up)
- Status page: (link when set up)
- Alerts / monitors: (link your error tracker / observability stack)
