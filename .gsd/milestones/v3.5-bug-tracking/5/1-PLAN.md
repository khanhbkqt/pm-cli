---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Update Execute & Debug Workflows

## Objective
Update the execute-phase workflow to check for blocking bugs before execution, and update the debug workflow to integrate with the new bug system.

## Context
- docs/agent-guide/workflows/pm-execute-phase.md
- docs/agent-guide/workflows/pm-debug.md

## Tasks

<task type="auto">
  <name>Add blocking bug check to execute-phase</name>
  <files>docs/agent-guide/workflows/pm-execute-phase.md</files>
  <action>
    Add a new "Step 0.5: Check Blocking Bugs" section between Step 0 (Quick Trace) and Step 1 (Review Plans):

    ## Step 0.5: Check Blocking Bugs

    Before executing plans, check for unresolved blocking bugs:

    ```bash
    pm bug list --blocking --status open
    ```

    **If blocking bugs exist:**
    1. Display the blocking bugs to the user
    2. Recommend fixing them first → [Fix Bug](pm-fix-bug.md)
    3. Do NOT proceed with plan execution until blocking bugs are resolved

    **If no blocking bugs:** Proceed to Step 1.

    Also add "Fix Bug" to the Related Workflows table.
  </action>
  <verify>grep -c "blocking" docs/agent-guide/workflows/pm-execute-phase.md</verify>
  <done>Execute-phase workflow includes blocking bug check step</done>
</task>

<task type="auto">
  <name>Update debug workflow to use bug system</name>
  <files>docs/agent-guide/workflows/pm-debug.md</files>
  <action>
    Update Step 1 (Record the Bug) to use `pm bug report` instead of `pm context set`:

    ```bash
    pm bug report "<description>" --priority <level> --blocking
    ```

    Add guidance before Step 2:
    - Check if bug was already reported: `pm bug list --status open`
    - If existing bug found, note the ID and skip to investigation

    Update Step 4 (Record Resolution) to use:
    ```bash
    pm bug update <id> --status resolved --description "<root cause and fix>"
    ```

    Update Related section to include Fix Bug workflow.
  </action>
  <verify>grep -c "pm bug" docs/agent-guide/workflows/pm-debug.md</verify>
  <done>Debug workflow uses pm bug commands instead of pm context set</done>
</task>

## Success Criteria
- [ ] Execute-phase has blocking bug gate between Step 0 and Step 1
- [ ] Debug workflow uses `pm bug report` and `pm bug update`
