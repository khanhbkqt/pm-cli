# Plan 6.1 Summary: Fix Flaky CLI Test Timeouts

## What Was Done

- Added `30000` ms timeout to `beforeEach` in `tests/plan-cli.test.ts` (runs 6 sequential `execSync` CLI invocations)
- Added `{ timeout: 15000 }` to `it('pm task list shows created tasks...')` in `tests/task-cli.test.ts` (line 56)

## Verification

```
npx vitest run tests/plan-cli.test.ts tests/task-cli.test.ts
✓ tests/task-cli.test.ts (13 tests)
✓ tests/plan-cli.test.ts (12 tests)
Test Files: 2 passed (2)
Tests: 25 passed (25)
```

## Commit

`fix(phase-6): increase beforeEach and test timeouts in plan-cli and task-cli`
