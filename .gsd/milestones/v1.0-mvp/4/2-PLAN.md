---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: Context CLI Commands + Registration

## Objective
Create the `pm context` CLI command group and register it in `src/index.ts`, following the exact pattern used by `src/cli/commands/task.ts` and `src/cli/commands/agent.ts`.

## Context
- .gsd/SPEC.md — context commands: set, get, list, search
- src/cli/commands/task.ts — pattern to follow (registerTaskCommands, resolveIdentity, getProjectDb, formatters)
- src/cli/commands/agent.ts — simpler pattern reference
- src/core/context.ts — functions from Plan 4.1
- src/output/formatter.ts — formatContext, formatContextList from Plan 4.1
- src/index.ts — registration pattern (import + register call)

## Tasks

<task type="auto">
  <name>Create src/cli/commands/context.ts</name>
  <files>src/cli/commands/context.ts</files>
  <action>
    Create `src/cli/commands/context.ts` with `registerContextCommands(program: Command)` following the task.ts pattern:

    1. `pm context set <key> <value>` — requires --agent identity
       - Options: `--category <category>` (default: 'note', choices: 'decision', 'spec', 'note', 'constraint')
       - Call setContext from core
       - Output via formatContext

    2. `pm context get <key>` — no identity required (read-only)
       - Call getContext from core
       - If not found: print error "Context key '<key>' not found." and exit(1)
       - Output via formatContext

    3. `pm context list` — no identity required
       - Options: `--category <category>` to filter
       - Call listContext from core
       - Output via formatContextList

    4. `pm context search <query>` — no identity required
       - Call searchContext from core
       - Output via formatContextList

    For all commands:
    - Get --json from parent program options: `program.opts().json`
    - Use try/catch with console.error + process.exit(1) for errors
    - Do NOT require agent identity for read operations (get, list, search)
    - DO require agent identity for write operations (set)
  </action>
  <verify>npx tsc --noEmit — should pass</verify>
  <done>
    - src/cli/commands/context.ts exists
    - Exports `registerContextCommands`
    - Has 4 subcommands: set, get, list, search
    - Identity required only for `set`
  </done>
</task>

<task type="auto">
  <name>Register context commands in src/index.ts</name>
  <files>src/index.ts</files>
  <action>
    Add to `src/index.ts`:
    1. Import: `import { registerContextCommands } from './cli/commands/context.js';`
    2. Call: `registerContextCommands(program);` — after the existing registerTaskCommands line
    
    Follow the exact pattern of the existing imports and registrations.
  </action>
  <verify>npx tsx src/index.ts context --help — should show context subcommands</verify>
  <done>
    - `pm context set`, `pm context get`, `pm context list`, `pm context search` all appear in help output
    - Context commands registered in the CLI program
  </done>
</task>

## Success Criteria
- [ ] `pm context set mykey myvalue --agent tester` stores a context entry
- [ ] `pm context get mykey --agent tester` retrieves it
- [ ] `pm context list` shows all entries
- [ ] `pm context search my` finds matching entries
- [ ] `--json` flag outputs JSON for all context commands
