---
phase: 4
plan: 3
wave: 2
---

# Plan 4.3: Context Tests + Status Dashboard + npm Polish

## Objective
Write unit tests for context core and CLI, add `pm status` dashboard command, and finalize the npm package for publishing readiness.

## Context
- .gsd/SPEC.md — success criteria: status command, all tests pass, npm ready
- tests/task.test.ts — unit test pattern (tempDir, getDatabase, beforeEach/afterEach cleanup)
- tests/task-cli.test.ts — CLI test pattern (if exists)
- src/core/context.ts — from Plan 4.1
- src/cli/commands/context.ts — from Plan 4.2
- package.json — current npm config
- tsup.config.ts — build config (if exists)

## Tasks

<task type="auto">
  <name>Write tests for context core + CLI</name>
  <files>tests/context.test.ts, tests/context-cli.test.ts</files>
  <action>
    **tests/context.test.ts** — Follow `tests/task.test.ts` pattern exactly:
    - beforeEach: create tempDir, getDatabase, registerAgent
    - afterEach: db.close(), rmSync tempDir
    - Tests for setContext: basic set, upsert (same key overwrites), category default, invalid agent throws
    - Tests for getContext: found, not found returns undefined
    - Tests for listContext: all entries, category filter, empty
    - Tests for searchContext: matches key, matches value, no match returns empty

    **tests/context-cli.test.ts** — Follow `tests/task-cli.test.ts` pattern:
    - Test `pm context set`, `pm context get`, `pm context list`, `pm context search`
    - Test `--json` output
    - Test error cases (get nonexistent key)
  </action>
  <verify>npx vitest run tests/context.test.ts tests/context-cli.test.ts</verify>
  <done>
    - All context core tests pass
    - All context CLI tests pass
    - Test coverage matches the pattern set by task tests
  </done>
</task>

<task type="auto">
  <name>Add pm status dashboard + npm polish</name>
  <files>src/cli/commands/status.ts, src/index.ts, package.json</files>
  <action>
    **src/cli/commands/status.ts:**
    Create `registerStatusCommand(program)` with `pm status`:
    - Query counts: total agents, total tasks (by status: todo/in-progress/done), total context entries
    - Display a summary dashboard:
      ```
      📋 Project Status
      ─────────────────
      Agents:  3 registered
      Tasks:   5 total (2 todo, 1 in-progress, 2 done)
      Context: 4 entries
      ```
    - Support `--json` for machine-readable output
    - Does NOT require agent identity (read-only)

    **src/index.ts:**
    Register the status command.

    **package.json polish:**
    - Ensure `"bin"` field is correct (`"pm": "./dist/index.js"`)
    - Add npm `"files"` field: `["dist"]` to limit published files
    - Add `"repository"` and `"engines"` fields if missing
    - Bump version to `"1.0.0"` (this is the MVP milestone)
  </action>
  <verify>
    npx tsc --noEmit && npx vitest run
    npx tsx src/index.ts status --help
  </verify>
  <done>
    - `pm status` shows project overview with agent/task/context counts
    - `pm status --json` outputs JSON summary
    - package.json has version 1.0.0, files field, correct bin
    - All existing + new tests pass
  </done>
</task>

## Success Criteria
- [ ] `npx vitest run` — all tests pass (existing + new context tests)
- [ ] `pm status` displays dashboard with counts
- [ ] `pm status --json` outputs JSON
- [ ] `npx tsc --noEmit` passes
- [ ] package.json ready for `npm publish`
