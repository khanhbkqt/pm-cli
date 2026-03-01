---
phase: 4
plan: 3
wave: 2
---

# Plan 4.3: Plan CLI Integration Tests

## Objective
Create comprehensive CLI integration tests for `pm plan` commands and workflow-routed status updates. Follows the `milestone-cli.test.ts` pattern exactly (execSync, temp dir, `run`/`runExpectFail` helpers).

## Context
- tests/milestone-cli.test.ts (pattern to follow exactly)
- tests/phase-cli.test.ts (for reference)
- src/cli/commands/plan.ts (Plan 4.1 output)
- src/cli/commands/milestone.ts (Plan 4.2 output — workflow routing)
- src/core/workflow.ts (transition rules for assertions)

## Tasks

<task type="auto">
  <name>Create plan-cli.test.ts</name>
  <files>tests/plan-cli.test.ts</files>
  <action>
    Create `tests/plan-cli.test.ts` following `milestone-cli.test.ts` pattern.

    **Setup (beforeEach):**
    ```
    tempDir = mkdtempSync(...)
    run('init test-project', tempDir)
    run('agent register alice --role developer --type human', tempDir)
    run('--agent alice milestone create v1 "Version 1"', tempDir)
    run('--agent alice milestone update v1 --status active', tempDir)  // or --force
    run('--agent alice phase add "Setup" --number 1', tempDir)
    ```

    **Test cases (all with `{ timeout: 15000 }`):**
    1. `pm plan create` — creates a plan, output contains `✓ Plan`
    2. `pm plan create` without `--agent` — identity error
    3. `pm plan list --phase <id>` — shows created plan name
    4. `pm plan list --json` — valid JSON array
    5. `pm plan show <id>` — shows plan details (name, wave, status)
    6. `pm plan show` nonexistent — error message
    7. `pm plan update --name` — changes name
    8. `pm plan update --status in_progress` — transitions via workflow
    9. `pm plan update --status completed` (from pending, invalid) — error about transition
    10. `pm plan update --status completed --force` — bypasses validation
    11. `pm plan list --status <filter>` — filters correctly
    12. `pm phase show` — shows associated plans section

    Use `run()` and `runExpectFail()` helpers identical to milestone-cli.test.ts.

    **Phase ID note:** The phase DB auto-increment `id` is typically `1` since it's the first phase created. Use `--phase 1` for plan commands. If this becomes fragile, use `--json phase list` to extract the actual id.
  </action>
  <verify>npx vitest run tests/plan-cli.test.ts --reporter=verbose</verify>
  <done>All plan CLI tests pass</done>
</task>

<task type="auto">
  <name>Verify workflow routing in milestone/phase CLI tests</name>
  <files>tests/milestone-cli.test.ts, tests/phase-cli.test.ts</files>
  <action>
    Add 2-3 targeted tests to verify the workflow retrofit from Plan 4.2:

    **In milestone-cli.test.ts:**
    - Test: `pm milestone update --status completed` on a milestone with pending phases → should fail with workflow error about incomplete phases
    - Test: `pm milestone update --status completed --force` → should succeed despite pending phases

    **In phase-cli.test.ts:**
    - Test: `pm phase update --status completed` from `not_started` → should fail with workflow transition error
    - Test: `pm phase update --status in_progress --force` from `not_started` → should succeed (transition allowed anyway, but tests --force path)

    Use `runExpectFail()` for expected failures. Keep tests focused — don't redundantly test what workflow.test.ts already covers.
  </action>
  <verify>npx vitest run tests/milestone-cli.test.ts tests/phase-cli.test.ts --reporter=verbose</verify>
  <done>New workflow routing tests pass in both test files</done>
</task>

## Success Criteria
- [ ] `tests/plan-cli.test.ts` passes all cases
- [ ] Workflow routing tests in `milestone-cli.test.ts` pass
- [ ] Workflow routing tests in `phase-cli.test.ts` pass
- [ ] `npx vitest run` (full suite) passes without regressions
