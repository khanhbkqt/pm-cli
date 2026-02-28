---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Agent Onboarding Flow

## Objective

Create a step-by-step onboarding document that a brand-new AI agent follows to bootstrap itself in a `pm`-managed project — from first command to productive work.

## Context

- `docs/agent-guide/cli-reference.md` — Command reference (from Phase 1)
- `docs/agent-guide/identity-setup.md` — Identity setup (from Phase 1)
- `docs/agent-guide/workflows/task-lifecycle.md` — Task lifecycle (from Phase 2)
- `src/core/init.ts` — Project initialization
- `src/core/identity.ts` — Identity resolution

## Tasks

<task type="auto">
  <name>Create Agent Onboarding Guide</name>
  <files>docs/agent-guide/onboarding.md</files>
  <action>
    Create `docs/agent-guide/onboarding.md` with:

    1. **Prerequisites** — What the agent needs before starting:
       - `pm` CLI installed and on PATH
       - Access to a project directory
       - A chosen agent name and role

    2. **Step 1: Check Project Status**
       ```bash
       pm status --json
       ```
       If this fails with "Not a PM project", run `pm init`.

    3. **Step 2: Register as Agent**
       ```bash
       pm agent register <name> --role developer --type ai --json
       ```
       Parse the response to get agent ID.

    4. **Step 3: Set Identity**
       ```bash
       export PM_AGENT=<name>
       ```

    5. **Step 4: Verify Setup**
       ```bash
       pm agent whoami --json
       ```
       Confirm name and role match expectations.

    6. **Step 5: Explore Project**
       ```bash
       pm status --json        # Project overview
       pm task list --json      # See all tasks
       pm agent list --json     # See who else is working
       pm context list --json   # Read shared context
       ```

    7. **Step 6: Pick First Task**
       ```bash
       pm task list --status todo --json
       pm task assign <id> --to <name> --agent <name> --json
       pm task update <id> --status in-progress --agent <name> --json
       ```

    8. **Quick Start Script** — Complete onboarding in one block:
       ```bash
       pm agent register my-agent --role developer --type ai --json
       export PM_AGENT=my-agent
       pm agent whoami --json
       pm status --json
       ```

    Format as a linear, numbered checklist. An agent should be productive within 5 minutes.
  </action>
  <verify>test -f docs/agent-guide/onboarding.md && grep -c "Step" docs/agent-guide/onboarding.md | awk '{if ($1 >= 6) print "OK"; else print "FAIL"}'</verify>
  <done>File exists with 6+ sequential onboarding steps and a quick-start script</done>
</task>

<task type="auto">
  <name>Create Error Handling Guide</name>
  <files>docs/agent-guide/error-handling.md</files>
  <action>
    Create `docs/agent-guide/error-handling.md` with:

    1. **Error Format** — All errors go to stderr, exit code 1. Format: `Error: <message>`.

    2. **Common Errors Table**:

       | Error Message | Cause | Recovery |
       |--------------|-------|----------|
       | `Agent identity required` | Missing --agent or PM_AGENT | Set PM_AGENT or use --agent |
       | `Agent '<name>' not registered` | Agent not in DB | Run `pm agent register` |
       | `Agent '<name>' already exists` | Duplicate registration | Use existing agent |
       | `Task #<id> not found` | Invalid task ID | Run `pm task list` to find valid IDs |
       | `Not a PM project` | No .pm/ directory | Run `pm init` |
       | `Invalid agent type` | type not 'human' or 'ai' | Use --type ai or --type human |
       | `Creator/Assignee agent not found` | Referenced agent doesn't exist | Register agent first |

    3. **Error Detection Pattern** for agents:
       ```bash
       result=$(pm task list --json 2>&1)
       if [ $? -ne 0 ]; then
         # Handle error
       fi
       ```

    4. **Recovery Strategies**:
       - Identity errors → Register + set PM_AGENT
       - "Not found" errors → List resources to discover valid IDs
       - Constraint errors → Check existing data before writing

    5. **Defensive Coding Patterns**:
       - Always check exit code
       - Parse JSON with error handling
       - Verify identity before starting work session
       - Use `pm status --json` as a health check

    Derive ALL error messages from actual source code in `src/cli/commands/` and `src/core/`.
    Do NOT invent error messages that don't exist in the codebase.
  </action>
  <verify>test -f docs/agent-guide/error-handling.md && grep -c "Error" docs/agent-guide/error-handling.md | awk '{if ($1 >= 7) print "OK"; else print "FAIL"}'</verify>
  <done>File exists with 7+ documented errors, each with cause and recovery action</done>
</task>

## Success Criteria

- [ ] Onboarding guide with linear steps from zero to productive
- [ ] Error handling guide with all real error messages from codebase
- [ ] Both documents are agent-parseable (clear structure, no ambiguity)
