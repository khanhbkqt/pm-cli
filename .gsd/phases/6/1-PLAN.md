---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: Fix Flaky CLI Test Timeouts

## Objective
Fix timeout failures in `plan-cli.test.ts`, `task-cli.test.ts`, and `server.test.ts`. The `plan-cli.test.ts` `beforeEach` runs 6 sequential `execSync` calls that consistently exceed the default 10s hook timeout. The fix is to increase the `beforeEach`/`it` timeouts for heavy CLI integration tests.

## Context
- tests/plan-cli.test.ts (beforeEach timeout at default 10s)
- tests/task-cli.test.ts (individual test timeout)
- tests/server.test.ts (known flaky — port-related)

## Tasks

<task type="auto">
  <name>Increase beforeEach timeout for plan-cli tests</name>
  <files>tests/plan-cli.test.ts</files>
  <action>
    Add `{ timeout: 30000 }` to the `beforeEach` call (line 35) since it runs 6 CLI invocations:
    ```ts
    beforeEach(() => { ... }, 30000);
    ```
    The individual `it` blocks already have `{ timeout: 15000 }` which should be sufficient.
  </action>
  <verify>npx vitest run tests/plan-cli.test.ts</verify>
  <done>All 10 plan-cli tests pass without timeout</done>
</task>

<task type="auto">
  <name>Increase timeout for slow task-cli tests</name>
  <files>tests/task-cli.test.ts</files>
  <action>
    The test "pm task list shows created tasks" at line 56 has no explicit timeout.
    Add `{ timeout: 15000 }` to this test since it calls multiple CLI commands.
  </action>
  <verify>npx vitest run tests/task-cli.test.ts</verify>
  <done>All task-cli tests pass without timeout</done>
</task>

## Success Criteria
- [ ] `npx vitest run tests/plan-cli.test.ts` — all pass
- [ ] `npx vitest run tests/task-cli.test.ts` — all pass
- [ ] Total test suite: 0 test failures (server.test.ts excluded if port-flaky)
