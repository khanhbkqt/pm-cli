---
phase: 5
plan: 2
wave: 2
---

# Plan 5.2: Integration Tests

## Objective

Write integration tests for the `pm progress` CLI command and the `GET /api/progress` API route. Ensures both human and JSON output are correct, edge cases are handled, and the dashboard route works end-to-end.

## Context

- `.gsd/phases/5/1-PLAN.md` — Plan 5.1 must be complete (files to test exist)
- `src/cli/commands/progress.ts` — what we're testing
- `src/server/routes/progress.ts` — API route under test
- `tests/plan-cli.test.ts` — reference for CLI test pattern (execSync + tempDir)
- `tests/api.test.ts` — reference for API test pattern (in-memory DB + fetch)

## Tasks

<task type="auto">
  <name>Create tests/progress-cli.test.ts</name>
  <files>tests/progress-cli.test.ts</files>
  <action>
    Create file following the exact pattern of `tests/plan-cli.test.ts`:
    - `import { describe, it, expect, beforeEach, afterEach } from 'vitest'`
    - `import { execSync } from 'child_process'`
    - Same `run()` and `runExpectFail()` helpers

    Test suite `describe('progress CLI command', ...)`:

    Setup `beforeEach`: create tempDir, `pm init test-project`, `pm agent register alice --role developer --type human`

    Tests (each with `{ timeout: 15000 }`):

    1. **No active milestone** — run `pm progress` without creating a milestone → expect output contains "No active milestone"

    2. **Active milestone shows progress** — create milestone v1, activate it, add 2 phases → run `pm progress` → output contains milestone name "v1", contains both phase names

    3. **JSON output** — same setup → run `pm progress --json` → parse JSON → verify `milestone`, `phases` (array), `summary` keys exist; `summary.phases_total === 2`

    4. **--milestone flag** — create non-active milestone v2, add a phase → run `pm progress --milestone v2` → output contains "v2"; does NOT require milestone to be active

    5. **Completed phase shown correctly** — create milestone, activate, add phase, transition it to in_progress then completed → run `pm progress --json` → verify `summary.phases_complete === 1` and `summary.phases_pct === 100`

    Cleanup `afterEach`: `fs.rmSync(tempDir, { recursive: true, force: true })`
  </action>
  <verify>npm test -- --reporter=verbose tests/progress-cli.test.ts 2>&1 | tail -30</verify>
  <done>All 5 progress CLI tests pass (no failures, no skips)</done>
</task>

<task type="auto">
  <name>Add Progress API tests to tests/api.test.ts</name>
  <files>tests/api.test.ts</files>
  <action>
    Append a new describe block at the end of the file (before the file ends):

    ```ts
    describe('Progress Endpoint', () => {
        it('GET /api/progress — no active milestone returns 404', async () => {
            const res = await fetch(`${baseUrl}/api/progress`);
            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body.error).toBeDefined();
        });

        it('GET /api/progress — with active milestone returns 200', async () => {
            // Seed: create milestone and activate it
            const { createMilestone, updateMilestone } = await import('../src/core/milestone.js');
            createMilestone(db, { id: 'v-progress-test', name: 'Progress Test', created_by: testAgentId });
            updateMilestone(db, 'v-progress-test', { status: 'active' }, testAgentId);

            const res = await fetch(`${baseUrl}/api/progress`);
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.milestone).toBeDefined();
            expect(body.milestone.id).toBe('v-progress-test');
            expect(body.phases).toBeInstanceOf(Array);
            expect(body.summary).toBeDefined();
            expect(typeof body.summary.phases_total).toBe('number');
            expect(typeof body.summary.phases_complete).toBe('number');
            expect(typeof body.summary.phases_pct).toBe('number');
        });
    });
    ```

    Note: the "no active milestone" test runs first (db starts with no milestone). The API tests share the same in-memory db from the outer beforeAll.
    Be careful about test ordering — if other tests create active milestones, add a resetActive step. Check the existing data seeding in the outer `beforeAll` — if `testAgentId` is from a `registerAgent` call, the milestone `created_by` must use `testAgentId`.
  </action>
  <verify>npm test -- --reporter=verbose tests/api.test.ts 2>&1 | tail -30</verify>
  <done>All api.test.ts tests pass including the new Progress Endpoint suite (2 tests)</done>
</task>

## Success Criteria

- [ ] `tests/progress-cli.test.ts` — 5 tests all pass
- [ ] `tests/api.test.ts` — existing tests unchanged + 2 new Progress tests pass
- [ ] `npm test` runs full suite with no regressions
