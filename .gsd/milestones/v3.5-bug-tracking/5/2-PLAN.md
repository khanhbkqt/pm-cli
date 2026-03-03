---
phase: 5
plan: 2
wave: 1
---

# Plan 5.2: Create Fix-Bug Workflow

## Objective
Create a new dedicated workflow for fixing reported bugs, and update the help command.

## Context
- docs/agent-guide/workflows/pm-debug.md (reference style)
- docs/agent-guide/workflows/pm-help.md (add new command)

## Tasks

<task type="auto">
  <name>Create pm-fix-bug workflow</name>
  <files>docs/agent-guide/workflows/pm-fix-bug.md</files>
  <action>
    Create docs/agent-guide/workflows/pm-fix-bug.md with frontmatter:
    ```
    ---
    description: Fix a reported bug with systematic tracking
    ---
    ```

    Workflow steps:
    1. Quick Trace — read ROADMAP.md and STATE.md
    2. Read Bug Details — `pm bug show <id>`, understand reproduction steps
    3. Set Status — `pm bug update <id> --status investigating`
    4. Investigate — search codebase, identify root cause
    5. Fix — `pm bug update <id> --status fixing`, implement the fix
    6. Verify — run tests, reproduce the scenario, confirm fix with empirical evidence
    7. Resolve — `pm bug update <id> --status resolved --description "<root cause and fix>"`
    8. Commit — `git add -A && git commit -m "fix: <description>"`

    Include 3-Strike Rule (link to pause workflow).
    Include success criteria checklist.
    Include Related Workflows table.
  </action>
  <verify>test -f docs/agent-guide/workflows/pm-fix-bug.md</verify>
  <done>pm-fix-bug.md workflow created with all steps</done>
</task>

<task type="auto">
  <name>Update help and related docs</name>
  <files>docs/agent-guide/workflows/pm-help.md</files>
  <action>
    Add fix-bug to the help command's workflow table:
    | fix-bug | Fix a reported bug with systematic tracking |

    Also add it to the CLI reference if one exists in docs/agent-guide/.
  </action>
  <verify>grep "fix-bug" docs/agent-guide/workflows/pm-help.md</verify>
  <done>fix-bug listed in help output</done>
</task>

## Success Criteria
- [ ] `pm-fix-bug.md` workflow created with 8 steps
- [ ] Workflow listed in help command
- [ ] Clear status transitions: open → investigating → fixing → resolved
