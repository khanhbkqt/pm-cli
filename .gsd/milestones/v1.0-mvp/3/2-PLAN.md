---
phase: 3
plan: 2
wave: 2
---

# Plan 3.2: Task CLI Commands

## Objective
Wire up all task management CLI commands under `pm task`, following the `pm agent` pattern. This plan depends on Plan 3.1 (core logic + formatters).

## Context
- .gsd/SPEC.md
- src/cli/commands/agent.ts — Reference pattern for CLI command registration
- src/core/task.ts — Core functions from Plan 3.1
- src/output/formatter.ts — Formatters from Plan 3.1
- src/core/identity.ts — resolveIdentity() for --agent enforcement
- src/index.ts — Entry point to wire new commands

## Tasks

<task type="auto">
  <name>Create cli/commands/task.ts — all task subcommands</name>
  <files>src/cli/commands/task.ts</files>
  <action>
    Create `src/cli/commands/task.ts` following `cli/commands/agent.ts` pattern:

    Export `registerTaskCommands(program: Command): void`

    Subcommands:

    1. `pm task add <title>` — Create a new task
       - Options: `--description <desc>`, `--priority <priority>`, `--parent <id>`
       - Identity: resolveIdentity() → created_by
       - Output: `✓ Task #<id> created: "<title>"` or JSON
    
    2. `pm task list` — List tasks with filters
       - Options: `--status <status>`, `--assigned <agent>`, `--parent <id>`
       - No identity required for read-only
       - Output: formatTaskList table or JSON

    3. `pm task show <id>` — Show task details with comments
       - No identity required for read-only
       - Show task details + comments below
       - Output: formatTask + formatCommentList or JSON (combined object)

    4. `pm task update <id>` — Update task fields
       - Options: `--title <title>`, `--description <desc>`, `--status <status>`, `--priority <priority>`
       - Identity: resolveIdentity() → for audit trail (updated_by conceptual)
       - Output: `✓ Task #<id> updated` or JSON

    5. `pm task assign <id>` — Assign task to agent
       - Required: `--to <agent-name>`
       - Identity: resolveIdentity() → who assigned it
       - Output: `✓ Task #<id> assigned to '<agent>'` or JSON

    6. `pm task comment <id> <message>` — Add comment
       - Identity: resolveIdentity() → comment agent_id
       - Output: `✓ Comment added to task #<id>` or JSON

    **Pattern to follow (from agent.ts):**
    - `const db = getProjectDb()` at command start
    - `const json = program.opts().json` for output toggle
    - try/catch with `error.message` display
    - `process.exit(1)` on error
    - `db.close()` after operation

    **What to avoid and WHY:**
    - Do NOT require identity for read-only commands (list, show) — agents should be able to query status without registering
    - Do NOT validate status values in CLI layer — core layer handles data integrity
  </action>
  <verify>npx tsx src/index.ts task --help</verify>
  <done>
    - `pm task add/list/show/update/assign/comment` all registered
    - Identity enforced on write operations (add, update, assign, comment)
    - Read operations (list, show) work without identity
    - --json output works on all subcommands
  </done>
</task>

<task type="auto">
  <name>Wire registerTaskCommands into src/index.ts</name>
  <files>src/index.ts</files>
  <action>
    Add to `src/index.ts`:
    1. `import { registerTaskCommands } from './cli/commands/task.js';`
    2. `registerTaskCommands(program);` — after registerAgentCommands

    This is a 2-line change.
  </action>
  <verify>npx tsx src/index.ts --help</verify>
  <done>
    - `pm --help` shows `task` as a subcommand
    - `pm task --help` shows all task subcommands
  </done>
</task>

## Success Criteria
- [ ] `pm task add/list/show/update/assign/comment` all work end-to-end
- [ ] Write operations require `--agent` identity
- [ ] `--json` flag produces valid JSON on all subcommands
- [ ] Error messages are clear and actionable
