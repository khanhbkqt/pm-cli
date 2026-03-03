---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Formatter & CLI Commands

## Objective
Add bug formatting functions and create the `pm bug` CLI command group with `report`, `list`, `show`, `update` subcommands.

## Context
- src/output/formatter.ts (add formatBug, formatBugList)
- src/cli/commands/plan.ts (reference CLI pattern)
- src/core/bug.ts (domain functions)
- src/index.ts (command registration)

## Tasks

<task type="auto">
  <name>Add bug formatters</name>
  <files>src/output/formatter.ts</files>
  <action>
    Import Bug type. Add two functions following the existing pattern:

    1. `formatBug(bug, json, content?)` — detailed single-bug display
       JSON mode: JSON.stringify. Text mode: header with title, table with id/priority/status/blocking/reported_by/created_at, then content if provided.

    2. `formatBugList(bugs, json)` — table format
       JSON mode: JSON.stringify. Text mode: ASCII table with columns ID (first 8 chars), Title, Priority, Status, Blocking.
       Priority icons: critical=🔴, high=🟠, medium=🟡, low=🟢
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>formatBug and formatBugList exported, TS compiles</done>
</task>

<task type="auto">
  <name>Create bug CLI commands</name>
  <files>src/cli/commands/bug.ts, src/index.ts</files>
  <action>
    Create src/cli/commands/bug.ts exporting `registerBugCommands(program)`:

    1. `pm bug report <title>` — calls reportBug  
       Options: --priority <level>, --description <text>, --milestone <id>, --phase <id>, --blocking

    2. `pm bug list` — calls listBugs  
       Options: --priority <level>, --status <status>, --blocking

    3. `pm bug show <id>` — calls getBugById + getBugContent  
       Shows full details + filesystem content

    4. `pm bug update <id>` — calls updateBug  
       Options: --status, --priority, --assigned-to, --blocking, --description

    In src/index.ts: import and call registerBugCommands(program).
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>All 4 subcommands registered, TS compiles, pm bug --help shows commands</done>
</task>

## Success Criteria
- [ ] `formatBug` and `formatBugList` with priority icons
- [ ] `pm bug report/list/show/update` commands registered
- [ ] `npx tsc --noEmit` passes
