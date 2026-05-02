---
owner: <your-name>
---
# Features — per-domain docs

## Purpose

One folder per product domain. Each holds feature docs, investigations, and pointers to related code, GitHub Issues, and external design docs.

Boilerplate ships with no pre-defined domains — fill them in as your project grows. Common patterns include `Auth/`, `Billing/`, `Onboarding/`, `Integrations/`, `Notifications/`, etc.

## Per-folder structure

When you create a new domain folder, give it:

- `MOC.md` — curated index. Start here for a domain. Sections: "Start here", "Active work", "Relevant code", "External links"
- `CLAUDE.md` — routing notes for agents ("what code maps here, what GitHub issues, what Notion/Figma page")
- Feature docs — free-form, title-case filenames

## Where to put a new note

| I'm writing about… | Goes in |
|---|---|
| A specific ticket's deep dive | `Tickets/<repo>-<num>/notes.md` (not here) |
| A feature's architecture / behavior | `Features/<Domain>/<Title>.md` |
| A decision affecting this domain | `Engineering/ADRs/` + link from the domain MOC |
| A runbook for a service in this domain | `Engineering/Runbooks/` + link from the domain MOC |

## Rules

- Don't create sub-sub-folders inside a domain. Flat > deep. Use tags/frontmatter for sub-grouping.
- Every note should have a "Related code" section with an absolute path into the app repo.
- "Active work" sections in MOCs can link to relevant rows in `<active-work>`.
