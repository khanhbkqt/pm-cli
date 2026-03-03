# Summary: Plan 5.2 — Create Fix-Bug Workflow

## What Was Done
- Created `docs/agent-guide/workflows/pm-fix-bug.md` with 8 steps:
  1. Quick Trace — read ROADMAP.md and STATE.md for context
  2. Read Bug Details — `pm bug show <id>`
  3. Set Status to Investigating — `pm bug update <id> --status investigating`
  4. Investigate — grep codebase, reproduce issue, find root cause
  5. Set Status to Fixing — `pm bug update <id> --status fixing`
  6. Verify — run tests with empirical evidence required
  7. Resolve — `pm bug update <id> --status resolved --description "..."`
  8. Commit — `git add -A && git commit -m "fix: <description>"`
  - Includes 3-Strike Rule linking to pm-pause.md
  - Clear status transitions: `open → investigating → fixing → resolved`
  - Related Workflows table linking back to debug, execute-phase, pause, resume
- Added `fix-bug` row to pm-help.md workflow table under Utilities section

## Verification
- `test -f docs/agent-guide/workflows/pm-fix-bug.md` → exists ✅
- `grep "fix-bug" docs/agent-guide/workflows/pm-help.md` → found ✅
