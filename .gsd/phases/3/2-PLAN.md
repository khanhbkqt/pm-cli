---
phase: 3
plan: 2
wave: 2
---

# Plan 3.2: CLI Integration — Route Status Changes Through Workflow Engine

## Objective

Modify existing CLI commands (`milestone update --status`, `phase update --status`) to route status changes through the workflow engine instead of direct CRUD. Add `--force` flag to bypass validation. Also add `plan update` CLI command for plan status transitions.

## Context

- src/core/workflow.ts (created in Plan 3.1)
- src/cli/commands/milestone.ts (existing — `milestone update` uses `updateMilestone` directly)
- src/cli/commands/phase.ts (existing — `phase update` uses `updatePhase` directly)
- src/cli/commands/plan.ts (may need to create if not exists)
- tests/milestone-cli.test.ts (existing CLI tests)
- tests/phase-cli.test.ts (existing CLI tests)

## Tasks

<task type="auto">
  <name>Modify milestone CLI to use workflow transitions</name>
  <files>src/cli/commands/milestone.ts</files>
  <action>
    In `registerMilestoneCommands`:

    1. Import `transitionMilestone` from `../../core/workflow.js`
    2. In `milestone update` action:
       - If `opts.status` is provided:
         - Call `transitionMilestone(db, id, opts.status, { force: opts.force })` instead of passing status to `updateMilestone`
         - Remove status from the `updateMilestone` call (keep name/goal updates there)
       - If `opts.status` is NOT provided: keep existing behavior (direct `updateMilestone`)
    3. Add `--force` option to `milestone update`: `.option('--force', 'Skip transition validation')`
    4. Catch transition errors and display helpful message

    **Important:**
    - Non-status fields (name, goal) still go through direct `updateMilestone`
    - Only status changes route through workflow
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>milestone update routes status through transitionMilestone, keeps name/goal through direct CRUD</done>
</task>

<task type="auto">
  <name>Modify phase CLI to use workflow transitions</name>
  <files>src/cli/commands/phase.ts</files>
  <action>
    Same pattern as milestone:

    1. Import `transitionPhase` from `../../core/workflow.js`
    2. In `phase update` action:
       - If `opts.status`: call `transitionPhase(db, id, opts.status, { force: opts.force })`
       - Remove status from `updatePhase` call
    3. Add `--force` option
    4. Catch transition errors

    **Important:**
    - Same separation: status → workflow, other fields → direct CRUD
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>phase update routes status through transitionPhase</done>
</task>

<task type="auto">
  <name>Write CLI integration tests for workflow transitions</name>
  <files>tests/workflow-cli.test.ts</files>
  <action>
    Create `tests/workflow-cli.test.ts` following the pattern in `tests/milestone-cli.test.ts`:

    Test cases:

    **Milestone transitions via CLI:**
    - `pm milestone update ms1 --status active` succeeds (planned→active)
    - `pm milestone update ms1 --status completed` fails with helpful transition error
    - `pm milestone update ms1 --status completed --force` succeeds (bypass)

    **Phase transitions via CLI:**
    - `pm phase update 1 --status in_progress` succeeds
    - `pm phase update 1 --status completed` returns invalid transition error (from not_started)
    - `pm phase update 1 --status completed --force` succeeds

    **Cascading via CLI:**
    - Create milestone + phase + plans. Transition plan to completed via plan update. Check phase auto-completed.

    Use same `execSync` pattern as existing CLI tests: `run()` and `runExpectFail()` helpers.
  </action>
  <verify>npx vitest run tests/workflow-cli.test.ts</verify>
  <done>All workflow CLI tests pass, transition errors display correctly</done>
</task>

## Success Criteria

- [ ] `pm milestone update --status` routes through workflow engine
- [ ] `pm phase update --status` routes through workflow engine
- [ ] `--force` flag bypasses transition validation
- [ ] Invalid transitions produce helpful error messages
- [ ] All existing tests still pass: `npx vitest run`
- [ ] All new CLI tests pass
