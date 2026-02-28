---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Identity Resolution System

## Objective
Create the identity resolution layer that enforces mandatory agent identity on every command. This resolves the `--agent` flag or `PM_AGENT` env var into a validated Agent record. Phase 3+ commands will use this as a prerequisite.

## Context
- .gsd/SPEC.md — "Identity required: `--agent` flag / `PM_AGENT` env var"
- .gsd/DECISIONS.md — DECISION-005 (Mandatory Agent Identity)
- src/core/agent.ts — getAgentByName function (from Plan 2.1)
- src/cli/program.ts — Commander program setup
- src/cli/commands/init.ts — reference for command registration pattern

## Tasks

<task type="auto">
  <name>Create identity resolution module</name>
  <files>src/core/identity.ts</files>
  <action>
    Create `src/core/identity.ts` with:

    1. `resolveIdentity(db, options: { agent?: string })` — Resolution logic:
       - Priority 1: `options.agent` (from --agent flag)
       - Priority 2: `process.env.PM_AGENT`
       - If neither provided: throw Error with message "Agent identity required. Use --agent <name> or set PM_AGENT env var."
       - Look up agent name via `getAgentByName(db, name)`
       - If agent not found: throw Error with message "Agent '<name>' not registered. Run: pm agent register <name>"
       - Return the validated Agent object

    2. `findProjectRoot(startDir?: string)` — Walk up from startDir (default: cwd) looking for `.pm/` directory
       - Return the directory containing `.pm/` or throw if not found
       - Error message: "Not a PM project. Run: pm init"
       - This is needed by all commands that access the database

    3. `getProjectDb(startDir?: string)` — Convenience function
       - Uses findProjectRoot() to locate .pm/
       - Returns Database instance from getDatabase(path.join(root, '.pm', 'data.db'))

    Do NOT modify existing files in this task.
  </action>
  <verify>npx tsx -e "import { resolveIdentity, findProjectRoot, getProjectDb } from './src/core/identity.js'; console.log('✓ identity module compiles')"</verify>
  <done>src/core/identity.ts exists with 3 exported functions: resolveIdentity, findProjectRoot, getProjectDb</done>
</task>

<task type="auto">
  <name>Create identity resolution tests</name>
  <files>tests/identity.test.ts</files>
  <action>
    Create `tests/identity.test.ts`:
    - Setup: temp dir with pm init + register a test agent

    Test cases:
    1. `resolveIdentity` with --agent flag resolves correct agent
    2. `resolveIdentity` with PM_AGENT env var resolves correct agent
    3. `resolveIdentity` with --agent flag takes priority over PM_AGENT
    4. `resolveIdentity` throws when neither flag nor env var set
    5. `resolveIdentity` throws when agent name not registered
    6. `findProjectRoot` finds .pm/ in current directory
    7. `findProjectRoot` finds .pm/ in parent directory
    8. `findProjectRoot` throws when no .pm/ found
  </action>
  <verify>npx vitest run tests/identity.test.ts</verify>
  <done>All 8 test cases pass with `npx vitest run tests/identity.test.ts`</done>
</task>

## Success Criteria
- [ ] `src/core/identity.ts` exports 3 functions
- [ ] 8 tests pass in `tests/identity.test.ts`
- [ ] --agent flag has priority over PM_AGENT env var
