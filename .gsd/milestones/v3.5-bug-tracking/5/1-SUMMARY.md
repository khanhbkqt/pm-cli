# Summary: Plan 5.1 — Update Execute & Debug Workflows

## What Was Done
- Added **Step 0.5: Check Blocking Bugs** to `pm-execute-phase.md` between Step 0 (Quick Trace) and Step 1 (Review Plans)
  - Uses `pm bug list --blocking --status open` before any plan execution
  - Blocks execution if unresolved blocking bugs exist, linking to `pm-fix-bug.md`
- Added "Fix Bug" entry to the Related Workflows table in execute-phase
- Rewrote `pm-debug.md` to use `pm bug` commands throughout:
  - Step 1 now uses `pm bug report` instead of `pm context set`
  - Added pre-check: `pm bug list --status open` before reporting to avoid duplicates
  - Step 2 uses `pm bug update <id> --status investigating`
  - Step 3 uses `pm bug update <id> --status fixing`
  - Step 4 uses `pm bug update <id> --status resolved --description "..."`
  - 3-Strike Rule updated to use `pm bug update` for recording attempts
  - Related Workflows table updated with Fix Bug and Pause links

## Verification
- `grep -c "blocking" docs/agent-guide/workflows/pm-execute-phase.md` → 7 ✅
- `grep -c "pm bug" docs/agent-guide/workflows/pm-debug.md` → 10 ✅
