# Issue Tracking

Applies to all issue trackers: GitHub Issues, GitLab Issues, Linear, ClickUp, Jira, etc.

- **Never mention code, file paths, function names, or implementation details** in issue descriptions or comments. The audience is non-developers (or future-you reading the issue cold weeks later).
- Keep issue updates focused on **user-facing behavior**: what changed, how to test it, acceptance criteria.
- Technical details belong in PR descriptions, code comments, and the vault's `Tickets/<repo>-<num>/context/` files — not in the issue tracker.

## Ready for QA — mandatory bar

Before moving a ticket to *Ready for QA* (or closing as ready-to-test, etc.), the description/comments MUST include all three:

1. **Steps to reproduce/test** — high-level, numbered, written so someone without implementation context can follow. No code, no file paths, no internal API/function names.
2. **Acceptance criteria** — concrete, verifiable statements of what "done" looks like. Each criterion is a pass/fail check the QA owner (or you) can run in the product.
3. **Edge cases / expected behavior notes** — boundary conditions, empty/error states, permission variants, mobile vs desktop differences, anything that should be verified.

If a ticket doesn't meet all three, it is NOT ready for QA — fill the gaps before moving the state, or leave it *In Review*.
